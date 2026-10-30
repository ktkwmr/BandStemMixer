// Harmony worker (module worker, started by index.html when "Make a harmony" is pressed).
// From the separated parts, with no AI model and no library:
//   1. key and chords: chroma (the strength of the 12 notes) of "bass" and "other", matched against
//      major / minor triads and smoothed with an HMM (Viterbi). The key is the Krumhansl–Schmuckler
//      profile that fits the whole song best.
//   2. melody and guide tone: the pitch of the vocals (YIN), cut into notes. Each note gets a harmony
//      note a 3rd above (or below) in the key, moved to a chord tone where the 3rd would clash. The
//      guide tone plays the harmony notes as a plain synth tone.
//   3. harmony voice: the vocals shifted to the harmony notes with TD-PSOLA (grains cut one pitch
//      period apart and laid down at the new period), which keeps the singer's vibrato and voice.
// The analysis runs at 11025 Hz (the song decimated by 4); the outputs are 44.1 kHz.
//
// Messages from the page:
//   { type: "run", vocals: [L, R], bass: [L, R], other: [L, R], dir: 1 | -1 }  (Int16Array, 44.1 kHz)
// Messages to the page:
//   { type: "progress", stage: "chords" | "melody" | "voice", done }  (0–1, a few times a second)
//   { type: "done", key: { tonic, minor }, chords: [{ t0, t1, root, minor }], frame, pitch: Float32Array,
//     notes: [{ t0, t1, midi, harm }], voice: Int16Array, guide: Int16Array }
//     (root -1 = no chord; pitch: MIDI note number per frame of `frame` seconds, NaN = no voice;
//     voice / guide: mono at 44.1 kHz, shared memory when the page is cross-origin isolated)
//   { type: "error", message }

const SR = 44100;
const DEC = 4;
const ASR = SR / DEC; // analysis rate
// Chords: 4096-point FFT (0.37 s, 2.7 Hz per bin) every 1024 samples (93 ms)
const NFFT = 4096;
const HOPC = 1024;
// Melody: YIN on 384 samples (35 ms) every 256 samples (23 ms), 70–1000 Hz
const HOP = 256;
const W = 384;
const TMIN = Math.floor(ASR / 1000);
const TMAX = Math.ceil(ASR / 70);

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MINOR = [0, 2, 3, 5, 7, 8, 10];
// Krumhansl–Kessler key profiles
const PROFILE_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const PROFILE_MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

const mod12 = (n) => ((n % 12) + 12) % 12;
const hzOf = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// ---------- Building blocks ----------
// In-place complex FFT (radix 2, forward)
function makeFft(n) {
  const bits = Math.round(Math.log2(n));
  const rev = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    let r = 0;
    for (let b = 0, x = i; b < bits; b++, x >>= 1) r = (r << 1) | (x & 1);
    rev[i] = r;
  }
  const cos = new Float64Array(n / 2), sin = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) { cos[i] = Math.cos((2 * Math.PI * i) / n); sin[i] = Math.sin((2 * Math.PI * i) / n); }
  return function (re, im) {
    for (let i = 0; i < n; i++) {
      const j = rev[i];
      if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let size = 2; size <= n; size <<= 1) {
      const half = size >> 1, step = n / size;
      for (let i = 0; i < n; i += size) {
        for (let j = i, k = 0; j < i + half; j++, k += step) {
          const l = j + half;
          const tr = re[l] * cos[k] + im[l] * sin[k];
          const ti = im[l] * cos[k] - re[l] * sin[k];
          re[l] = re[j] - tr; im[l] = im[j] - ti;
          re[j] += tr; im[j] += ti;
        }
      }
    }
  };
}

// Stereo 16-bit at 44.1 kHz → mono float at 11025 Hz (windowed-sinc low-pass, then every 4th sample)
function decimate(L, R, progress) {
  const M = 16, taps = 2 * M + 1, fc = 0.45 / DEC;
  const h = new Float32Array(taps);
  let sum = 0;
  for (let k = 0; k < taps; k++) {
    const x = k - M;
    const sinc = x === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * x) / (Math.PI * x);
    h[k] = sinc * (0.54 + 0.46 * Math.cos((Math.PI * x) / (M + 1)));
    sum += h[k];
  }
  for (let k = 0; k < taps; k++) h[k] /= sum * 65536; // (L + R) / 2 / 32768
  const n = Math.floor(L.length / DEC);
  const out = new Float32Array(n);
  const last = L.length - 1;
  for (let j = 0; j < n; j++) {
    const c = j * DEC - M;
    let v = 0;
    if (c >= 0 && c + taps - 1 <= last) {
      for (let k = 0; k < taps; k++) v += h[k] * (L[c + k] + R[c + k]);
    } else {
      for (let k = 0; k < taps; k++) { const i = c + k; if (i >= 0 && i <= last) v += h[k] * (L[i] + R[i]); }
    }
    out[j] = v;
    if (progress && (j & 0xfffff) === 0) progress(j / n);
  }
  return out;
}

// Chroma of x (11025 Hz): per frame, the strength of the 12 pitch classes from the spectral peaks
// between the MIDI notes lo and hi. Frame f is centered at f * HOPC.
function chroma(x, lo, hi, progress) {
  const frames = Math.ceil(x.length / HOPC);
  const out = new Float32Array(frames * 12);
  const energy = new Float32Array(frames);
  const fft = makeFft(NFFT);
  const re = new Float64Array(NFFT), im = new Float64Array(NFFT), mag = new Float64Array(NFFT / 2);
  const win = new Float64Array(NFFT);
  for (let i = 0; i < NFFT; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / NFFT);
  const pc = new Int8Array(NFFT / 2).fill(-1);
  for (let k = 1; k < NFFT / 2; k++) {
    const m = Math.round(69 + 12 * Math.log2(((k * ASR) / NFFT) / 440));
    if (m >= lo && m <= hi) pc[k] = mod12(m);
  }
  const norm = 4 / NFFT; // a sine of amplitude a peaks at about a
  for (let f = 0; f < frames; f++) {
    const s = f * HOPC - NFFT / 2;
    for (let i = 0; i < NFFT; i++) {
      const j = s + i;
      re[i] = j >= 0 && j < x.length ? x[j] * win[i] : 0;
      im[i] = 0;
    }
    fft(re, im);
    for (let k = 0; k < NFFT / 2; k++) mag[k] = Math.hypot(re[k], im[k]) * norm;
    let e = 0;
    for (let k = 2; k < NFFT / 2 - 1; k++) {
      if (pc[k] < 0) continue;
      const v = mag[k];
      if (v > mag[k - 1] && v >= mag[k + 1]) { out[f * 12 + pc[k]] += v; e += v * v; }
    }
    energy[f] = Math.sqrt(e);
    if (progress && (f & 255) === 0) progress(f / frames);
  }
  return { frames, out, energy };
}

function percentile(arr, p) {
  const a = Float32Array.from(arr).sort();
  return a.length ? a[Math.min(a.length - 1, Math.floor(a.length * p))] : 0;
}

// ---------- 1. Key and chords ----------
// States 0–23: root * 2 + (0 major, 1 minor); 24: no chord
const N_STATES = 25;
const BETA = 24;         // how sharply the chroma decides (log-likelihood per unit of score)
const P_CHANGE = 0.03;   // chance of a chord change per 93 ms frame
const NO_CHORD = 0.5;    // score of "no chord" when there is sound

function findChords(other, bass) {
  const frames = Math.min(other.frames, bass.frames);
  const eAll = new Float32Array(frames);
  for (let f = 0; f < frames; f++) eAll[f] = other.energy[f] + bass.energy[f];
  const gate = percentile(eAll, 0.9) * 0.06;
  const unit = (src, f, dst) => {
    let s = 0;
    for (let k = 0; k < 12; k++) s += src[f * 12 + k] * src[f * 12 + k];
    s = Math.sqrt(s) || 1;
    for (let k = 0; k < 12; k++) dst[k] = src[f * 12 + k] / s;
  };
  const co = new Float64Array(12), cb = new Float64Array(12), c = new Float64Array(12);
  const keySum = new Float64Array(12);
  const emit = new Float32Array(frames * N_STATES);
  for (let f = 0; f < frames; f++) {
    const row = f * N_STATES;
    if (eAll[f] < gate) {
      for (let s = 0; s < 24; s++) emit[row + s] = 0;
      emit[row + 24] = BETA;
      continue;
    }
    unit(other.out, f, co);
    unit(bass.out, f, cb);
    let s2 = 0;
    for (let k = 0; k < 12; k++) { c[k] = co[k] + 0.5 * cb[k]; s2 += c[k] * c[k]; }
    s2 = Math.sqrt(s2) || 1;
    for (let k = 0; k < 12; k++) { c[k] /= s2; keySum[k] += c[k]; }
    for (let root = 0; root < 12; root++) {
      for (let q = 0; q < 2; q++) {
        const score = (c[root] + c[(root + (q ? 3 : 4)) % 12] + c[(root + 7) % 12]) / Math.sqrt(3) + 0.15 * cb[root];
        emit[row + root * 2 + q] = BETA * score;
      }
    }
    emit[row + 24] = BETA * NO_CHORD;
  }
  // Viterbi
  const stay = Math.log(1 - P_CHANGE), move = Math.log(P_CHANGE / (N_STATES - 1));
  const back = new Uint8Array(frames * N_STATES);
  let prev = new Float64Array(N_STATES), cur = new Float64Array(N_STATES);
  for (let s = 0; s < N_STATES; s++) prev[s] = emit[s];
  for (let f = 1; f < frames; f++) {
    let best = 0;
    for (let s = 1; s < N_STATES; s++) if (prev[s] > prev[best]) best = s;
    for (let s = 0; s < N_STATES; s++) {
      const a = prev[s] + stay, b = prev[best] + move;
      if (a >= b) { cur[s] = a; back[f * N_STATES + s] = s; } else { cur[s] = b; back[f * N_STATES + s] = best; }
      cur[s] += emit[f * N_STATES + s];
    }
    const t = prev; prev = cur; cur = t;
  }
  const path = new Uint8Array(frames);
  let s = 0;
  for (let k = 1; k < N_STATES; k++) if (prev[k] > prev[s]) s = k;
  for (let f = frames - 1; f >= 0; f--) { path[f] = s; if (f) s = back[f * N_STATES + s]; }
  const step = HOPC / ASR;
  const chords = [];
  for (let f = 0; f < frames; f++) {
    const st = path[f];
    const t0 = Math.max(0, (f - 0.5) * step), t1 = (f + 0.5) * step;
    const last = chords[chords.length - 1];
    if (last && last.state === st) last.t1 = t1;
    else chords.push({ t0: t0, t1: t1, state: st, root: st === 24 ? -1 : st >> 1, minor: st !== 24 && (st & 1) === 1 });
  }
  chords.forEach((ch) => delete ch.state);
  return { chords: chords, key: majorOrMinor(findKey(keySum), chords) };
}

// The profiles often confuse a key with its relative major / minor (C major and A minor share their notes).
// Decide by which tonic chord sounds longer; when they are close, by the first chord of the song.
function majorOrMinor(key, chords) {
  const major = key.minor ? (key.tonic + 3) % 12 : key.tonic, minor = (major + 9) % 12;
  let dMajor = 0, dMinor = 0, first = null;
  for (const c of chords) {
    if (c.root < 0) continue;
    if (!first) first = c;
    if (c.root === major && !c.minor) dMajor += c.t1 - c.t0;
    if (c.root === minor && c.minor) dMinor += c.t1 - c.t0;
  }
  let isMinor = key.minor;
  if (dMinor > dMajor * 1.15) isMinor = true;
  else if (dMajor > dMinor * 1.15) isMinor = false;
  else if (first && first.root === minor && first.minor) isMinor = true;
  else if (first && first.root === major && !first.minor) isMinor = false;
  return { tonic: isMinor ? minor : major, minor: isMinor };
}

function findKey(sum) {
  const corr = (profile, tonic) => {
    let mx = 0, my = 0;
    for (let k = 0; k < 12; k++) { mx += sum[k]; my += profile[k]; }
    mx /= 12; my /= 12;
    let sxy = 0, sxx = 0, syy = 0;
    for (let k = 0; k < 12; k++) {
      const x = sum[(tonic + k) % 12] - mx, y = profile[k] - my;
      sxy += x * y; sxx += x * x; syy += y * y;
    }
    return sxy / (Math.sqrt(sxx * syy) || 1);
  };
  let best = { tonic: 0, minor: false, r: -2 };
  for (let tonic = 0; tonic < 12; tonic++) {
    const a = corr(PROFILE_MAJOR, tonic), b = corr(PROFILE_MINOR, tonic);
    if (a > best.r) best = { tonic: tonic, minor: false, r: a };
    if (b > best.r) best = { tonic: tonic, minor: true, r: b };
  }
  return { tonic: best.tonic, minor: best.minor };
}

// ---------- 2. Melody ----------
// YIN pitch per frame (frame f centered at f * HOP), as a MIDI note number; NaN where there is no voice
function trackPitch(x, progress) {
  const frames = Math.ceil(x.length / HOP);
  const pitch = new Float32Array(frames).fill(NaN);
  const span = W + TMAX;
  const rms = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    const s = f * HOP - (span >> 1);
    let e = 0;
    for (let j = 0; j < W; j++) { const i = s + (span - W) / 2 + j; if (i >= 0 && i < x.length) e += x[i] * x[i]; }
    rms[f] = Math.sqrt(e / W);
  }
  const gate = Math.max(0.003, percentile(rms, 0.9) * 0.1);
  const d = new Float64Array(TMAX + 1);
  for (let f = 0; f < frames; f++) {
    if (progress && (f & 1023) === 0) progress(f / frames);
    if (rms[f] < gate) continue;
    const s = f * HOP - (span >> 1);
    if (s < 0 || s + span > x.length) continue;
    let run = 0;
    let tau = -1;
    d[0] = 1;
    for (let t = 1; t <= TMAX; t++) {
      let v = 0;
      for (let j = 0; j < W; j++) { const q = x[s + j] - x[s + j + t]; v += q * q; }
      run += v;
      d[t] = run > 0 ? (v * t) / run : 1; // cumulative mean normalized difference
    }
    for (let t = TMIN; t < TMAX; t++) {
      if (d[t] < 0.2) {
        while (t + 1 < TMAX && d[t + 1] < d[t]) t++;
        tau = t;
        break;
      }
    }
    if (tau < 0) {
      let m = TMIN;
      for (let t = TMIN + 1; t < TMAX; t++) if (d[t] < d[m]) m = t;
      if (d[m] < 0.4) tau = m;
    }
    if (tau < 0) continue;
    // Parabolic interpolation around the dip
    const a = d[tau - 1], b = d[tau], c = d[tau + 1];
    const den = a - 2 * b + c;
    const t = den > 0 ? tau + (0.5 * (a - c)) / den : tau;
    pitch[f] = 69 + 12 * Math.log2(ASR / t / 440);
  }
  // Median of 5 voiced frames, and octave jumps folded back to their neighbours
  const out = new Float32Array(frames).fill(NaN);
  const buf = [];
  for (let f = 0; f < frames; f++) {
    if (isNaN(pitch[f])) continue;
    buf.length = 0;
    for (let k = f - 2; k <= f + 2; k++) if (k >= 0 && k < frames && !isNaN(pitch[k])) buf.push(pitch[k]);
    buf.sort((p, q) => p - q);
    const med = buf[buf.length >> 1];
    let v = pitch[f];
    while (v - med > 9) v -= 12;
    while (med - v > 9) v += 12;
    out[f] = v;
  }
  return out;
}

// Cuts the pitch into notes: a new note starts when the pitch (averaged over 160 ms, which flattens
// vibrato) stays more than 0.7 semitones away from the current note for 70 ms; a gap over 70 ms ends it
function findNotes(pitch) {
  const frames = pitch.length;
  const smooth = new Float32Array(frames).fill(NaN);
  for (let f = 0; f < frames; f++) {
    if (isNaN(pitch[f])) continue;
    let s = 0, n = 0;
    for (let k = f - 3; k <= f + 3; k++) if (k >= 0 && k < frames && !isNaN(pitch[k])) { s += pitch[k]; n++; }
    smooth[f] = s / n;
  }
  const notes = [];
  let cur = null, away = 0, gap = 0;
  const close = (end) => {
    if (cur && end - cur.a >= 3) { cur.b = end; notes.push(cur); }
    cur = null;
  };
  for (let f = 0; f < frames; f++) {
    const v = smooth[f];
    if (isNaN(v)) {
      if (cur && ++gap > 3) close(f - gap);
      continue;
    }
    gap = 0;
    if (!cur) { cur = { a: f, center: Math.round(v) }; away = 0; continue; }
    if (Math.abs(v - cur.center) > 0.7) {
      if (++away >= 3) {
        close(f - 3);
        cur = { a: f - 2, center: Math.round(v) };
        away = 0;
      }
    } else away = 0;
  }
  if (cur) close(frames - 1 - gap);
  const step = HOP / ASR;
  const out = [];
  const vals = [];
  for (const n of notes) {
    vals.length = 0;
    for (let f = n.a; f <= n.b; f++) if (!isNaN(pitch[f])) vals.push(pitch[f]);
    if (vals.length < 3) continue;
    vals.sort((p, q) => p - q);
    const midi = Math.round(vals[vals.length >> 1]);
    const t0 = Math.max(0, (n.a - 0.5) * step), t1 = (n.b + 0.5) * step;
    const last = out[out.length - 1];
    if (last && last.midi === midi && t0 - last.t1 < 0.03) last.t1 = t1;
    else out.push({ t0: t0, t1: t1, midi: midi });
  }
  return out;
}

// The chord sounding at time t (the one that covers the middle of a note)
function chordAt(chords, t) {
  let lo = 0, hi = chords.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (chords[mid].t0 <= t) lo = mid; else hi = mid - 1;
  }
  const c = chords[lo];
  return c && c.root >= 0 ? c : null;
}

// The harmony note for a melody note: a 3rd (or 4th) above / below, scored by being in the key, being a
// chord tone, and not a semitone against a chord tone; a 3rd beats a 4th, and the last interval wins ties
function pickHarmony(midi, key, chord, dir, lastIv) {
  const scale = (key.minor ? MINOR : MAJOR).map((s) => (s + key.tonic) % 12);
  const tones = chord ? [chord.root, (chord.root + (chord.minor ? 3 : 4)) % 12, (chord.root + 7) % 12] : [];
  let best = null, bestScore = -Infinity;
  for (const step of [3, 4, 5]) {
    const iv = step * dir;
    const pc = mod12(midi + iv);
    let score = 0;
    if (scale.indexOf(pc) >= 0) score += 2;
    if (tones.indexOf(pc) >= 0) score += 3;
    else if (tones.some((tn) => mod12(pc - tn) === 1 || mod12(tn - pc) === 1)) score -= 1.5;
    if (step !== 5) score += 1.5;
    if (iv === lastIv) score += 0.3;
    if (score > bestScore) { bestScore = score; best = iv; }
  }
  return midi + best;
}

function makeArray(n) {
  const shared = typeof self !== "undefined" && self.crossOriginIsolated && typeof SharedArrayBuffer === "function";
  return new Int16Array(shared ? new SharedArrayBuffer(n * 2) : n);
}

// Guide tone: the harmony notes as a soft synth tone (a few harmonics, short fades)
function makeGuide(notes, length) {
  const out = makeArray(length);
  const fadeIn = 0.015 * SR, fadeOut = 0.04 * SR;
  for (const n of notes) {
    const a = Math.round(n.t0 * SR), e = Math.min(length, Math.round(n.t1 * SR));
    const w = (2 * Math.PI * hzOf(n.harm)) / SR;
    for (let i = a; i < e; i++) {
      const k = i - a;
      const env = Math.min(1, k / fadeIn, (e - i) / fadeOut) * (0.75 + 0.25 * Math.exp(-k / (0.3 * SR)));
      const ph = w * k;
      const v = 0.16 * env * (Math.sin(ph) + 0.3 * Math.sin(2 * ph) + 0.12 * Math.sin(3 * ph));
      out[i] = Math.max(-32768, Math.min(32767, out[i] + Math.round(v * 32767)));
    }
  }
  return out;
}

// ---------- 3. Harmony voice (TD-PSOLA) ----------
function makeVoice(L, R, notes, pitch, progress) {
  const length = L.length;
  const out = makeArray(length);
  const x = (i) => (i < 0 || i >= length ? 0 : (L[i] + R[i]) / 65536);
  // The sung pitch at sample i (from the pitch track), or the note itself where the track has a hole
  const periodAt = (i, midi) => {
    const f = Math.round((i / DEC) / HOP);
    let m = NaN;
    for (let k = 0; k <= 3 && isNaN(m); k++) {
      if (f - k >= 0 && !isNaN(pitch[f - k])) m = pitch[f - k];
      else if (f + k < pitch.length && !isNaN(pitch[f + k])) m = pitch[f + k];
    }
    if (isNaN(m) || Math.abs(m - midi) > 2) m = midi;
    return SR / hzOf(m);
  };
  const peak = (from, to) => {
    let best = from, bv = -Infinity;
    for (let i = from; i <= to; i++) { const v = x(i); if (v > bv) { bv = v; best = i; } }
    return best;
  };
  const fade = Math.round(0.012 * SR);
  notes.forEach((n, ni) => {
    if (progress && (ni & 31) === 0) progress(ni / notes.length);
    const a = Math.round(n.t0 * SR), e = Math.min(length, Math.round(n.t1 * SR));
    if (e - a < 2 * fade) return;
    const ratio = Math.pow(2, (n.harm - n.midi) / 12);
    // Analysis marks: one per pitch period, each moved to the nearby waveform peak
    const marks = [];
    let T = periodAt(a, n.midi);
    let m = peak(a, a + Math.round(T));
    while (m < e + T) {
      marks.push(m);
      T = periodAt(m, n.midi);
      const next = Math.round(m + T), r = Math.max(1, Math.round(T * 0.2));
      m = peak(next - r, next + r);
    }
    // Synthesis: grains (2 periods, Hann) from the nearest analysis mark, every period / ratio
    const acc = new Float32Array(e - a);
    let ts = marks[0], k = 0;
    while (ts < e) {
      while (k + 1 < marks.length && Math.abs(marks[k + 1] - ts) <= Math.abs(marks[k] - ts)) k++;
      const ta = marks[k];
      const P = periodAt(ta, n.midi);
      const half = Math.round(P);
      const c = Math.round(ts);
      for (let j = -half; j <= half; j++) {
        const o = c + j - a;
        if (o < 0 || o >= acc.length) continue;
        acc[o] += x(ta + j) * (0.5 + 0.5 * Math.cos((Math.PI * j) / half)) / ratio;
      }
      ts += P / ratio;
    }
    for (let o = 0; o < acc.length; o++) {
      const env = Math.min(1, o / fade, (acc.length - o) / fade);
      const i = a + o;
      out[i] = Math.max(-32768, Math.min(32767, out[i] + Math.round(acc[o] * env * 32767)));
    }
  });
  return out;
}

// ---------- All three ----------
export function analyze(msg, progress) {
  const report = progress || (() => {});
  const [vL, vR] = msg.vocals, [bL, bR] = msg.bass, [oL, oR] = msg.other;
  const dir = msg.dir < 0 ? -1 : 1;
  // 1. Key and chords
  const other = chroma(decimate(oL, oR, (d) => report("chords", d * 0.3)), 40, 95, (d) => report("chords", 0.3 + d * 0.3));
  const bass = chroma(decimate(bL, bR, (d) => report("chords", 0.6 + d * 0.2)), 28, 64, (d) => report("chords", 0.8 + d * 0.2));
  const { chords, key } = findChords(other, bass);
  // 2. Melody, harmony notes, guide tone
  const vox = decimate(vL, vR, (d) => report("melody", d * 0.2));
  const pitch = trackPitch(vox, (d) => report("melody", 0.2 + d * 0.8));
  const notes = findNotes(pitch);
  let lastIv = 3 * dir;
  for (const n of notes) {
    const chord = chordAt(chords, (n.t0 + n.t1) / 2);
    n.harm = pickHarmony(n.midi, key, chord, dir, lastIv);
    lastIv = n.harm - n.midi;
  }
  const guide = makeGuide(notes, vL.length);
  // 3. Harmony voice
  const voice = makeVoice(vL, vR, notes, pitch, (d) => report("voice", d));
  return { key: key, chords: chords, frame: HOP / ASR, pitch: pitch, notes: notes, voice: voice, guide: guide };
}

if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
  self.onmessage = (e) => {
    const msg = e.data;
    if (!msg || msg.type !== "run") return;
    try {
      let last = 0;
      const res = analyze(msg, (stage, done) => {
        const now = Date.now();
        if (now - last > 150) { last = now; self.postMessage({ type: "progress", stage: stage, done: Math.min(1, done) }); }
      });
      // Shared memory is passed as is; plain arrays are moved
      const transfer = [res.pitch.buffer];
      if (res.voice.buffer instanceof ArrayBuffer) transfer.push(res.voice.buffer, res.guide.buffer);
      self.postMessage(Object.assign({ type: "done" }, res), transfer);
    } catch (err) {
      self.postMessage({ type: "error", message: String((err && err.message) || err) });
    }
  };
}
