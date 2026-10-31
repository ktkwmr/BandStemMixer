// Harmony worker (module worker, started by index.html when "Make a harmony" is pressed).
// From the separated parts, with no AI model and no library:
//   1. beats, key, and chords: the beats (quarter notes) and the tempo of the whole song, with Loop
//      Trainer's beat detection. Then one chord per beat: chroma (the strength of the 12 notes) of "bass"
//      and "other", matched against major / minor triads and smoothed over the beats with an HMM (Viterbi).
//      The key is the Krumhansl–Schmuckler profile that fits the whole song best.
//   2. melody and guide tone: the pitch of the vocals (YIN), cut into notes. Each note gets a harmony
//      note a 3rd or a 5th above (or below) in the key, moved to a chord tone where it would clash. Notes
//      close together are joined into phrases, so the harmony is legato. The guide tone plays the
//      harmony notes as a plain synth tone.
//   3. harmony voice: the vocals shifted to the harmony notes with TD-PSOLA (grains cut one pitch
//      period apart and laid down at the new period), which keeps the singer's vibrato and voice. Each
//      phrase is shifted as one piece, consonants included, with the shift gliding between notes. Optional
//      pitch correction pulls the voice toward the exact harmony notes.
// The analysis runs at 11025 Hz (the song decimated by 4); the outputs are 44.1 kHz.
// Everything is in the song's own key; with a key change (semis), only the voice and guide tone are
// rendered that many semitones higher or lower.
//
// Messages from the page:
//   { type: "run", vocals: [L, R], dir: 1 | -1, interval: 3 | 5, semis, correct: 0 | 1 | 2,  (pitch correction: none, weak, strong)
//     bass?, other?, drums?: [L, R],   (Int16Array, 44.1 kHz; only to find the beats and chords)
//     chords?, key?,                   (from an earlier run, maybe edited: used instead of finding them)
//     pitch?, notes? }                 (from an earlier run: the melody is not tracked again)
// Messages to the page:
//   { type: "progress", stage: "chords" | "melody" | "voice", done }  (0–1, a few times a second)
//   { type: "done", key: { tonic, minor }, chords: [{ t0, t1, root, q }], grid: Float64Array | null, bpm,
//     frame, pitch: Float32Array,
//     notes: [{ t0, t1, midi, harm }] (contiguous within a phrase), voice: Int16Array, guide: Int16Array }
//     (grid: the beat cells' edges in seconds, 0 to the end, and bpm (0 = no beat found), only when the chords
//     were found in this run; the chords change only on the grid. root -1 = no chord; q: chord type, a key of
//     CHORD_TYPES; pitch: MIDI note number per frame of
//     `frame` seconds, NaN = no voice; voice / guide: mono at 44.1 kHz, shared memory when the page is
//     cross-origin isolated)
//   { type: "error", message }
// makeFft is also used by keyshift.js.

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

// Chord types (semitones above the root). Found chords are "" (major) or "m"; the others come from editing.
const CHORD_TYPES = {
  "": [0, 4, 7], m: [0, 3, 7], "7": [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], add9: [0, 4, 7, 2],
  dim: [0, 3, 6], dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10], aug: [0, 4, 8], sus4: [0, 5, 7]
};

const mod12 = (n) => ((n % 12) + 12) % 12;
const hzOf = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// ---------- Building blocks ----------
// In-place complex FFT (radix 2, forward)
export function makeFft(n) {
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

// ---------- 1. Beats, key, and chords ----------
// Tempo and beats, from Loop Trainer (ktkwmr/LoopTrainer, detectBeats(), MIT, the same author), without its
// bar-start part: onset strength (spectral flux of the 11025 Hz mono song) → tempo by autocorrelation,
// weighted toward 120 BPM → beats by dynamic programming (D. Ellis, "Beat Tracking by Dynamic Programming",
// 2007) → each beat moved to the nearest onset peak. Returns null when the onsets do not repeat clearly.
// The detected beats sit about 14 ms early (measured in Loop Trainer with test signals of known tempo)
const BEAT_BIAS = 0.014;
function detectBeats(x) {
  const fs = ASR, N = 512, BHOP = 64, fps = fs / BHOP;
  const len = x.length;
  const frames = len >= N ? Math.floor((len - N) / BHOP) + 1 : 0;
  if (frames < fps * 4) return null;
  const fft = makeFft(N);
  const win = new Float64Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N);
  const re = new Float64Array(N), im = new Float64Array(N), prev = new Float32Array(N / 2), env = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    const o = f * BHOP;
    for (let i = 0; i < N; i++) { re[i] = x[o + i] * win[i]; im[i] = 0; }
    fft(re, im);
    let flux = 0;
    for (let k = 1; k < N / 2; k++) {
      const m = Math.log(1 + 100 * Math.sqrt(re[k] * re[k] + im[k] * im[k]));
      if (m > prev[k]) flux += m - prev[k];
      prev[k] = m;
    }
    env[f] = f ? flux : 0;
  }
  // Almost no change at all (a steady tone, silence): no beat
  let mean = 0;
  for (let i = 0; i < frames; i++) mean += env[i];
  if (mean / frames < 1) return null;
  // Remove the slowly changing part (about 0.5 s) and normalize, so loud and quiet parts count alike
  const half = Math.round(fps * 0.25), onset = new Float32Array(frames);
  let acc = 0, sq = 0;
  for (let i = 0; i < Math.min(frames, half); i++) acc += env[i];
  for (let i = 0; i < frames; i++) {
    if (i + half < frames) acc += env[i + half];
    if (i - half - 1 >= 0) acc -= env[i - half - 1];
    const n = Math.min(frames - 1, i + half) - Math.max(0, i - half) + 1;
    onset[i] = Math.max(0, env[i] - acc / n);
    sq += onset[i] * onset[i];
  }
  const sd = Math.sqrt(sq / frames) || 1;
  for (let i = 0; i < frames; i++) onset[i] /= sd;
  // Tempo: autocorrelation between 40 and 240 BPM, weighted by a log-normal around 120 BPM
  const lagMin = Math.floor((fps * 60) / 240), lagMax = Math.min(frames - 1, Math.ceil((fps * 60) / 40));
  const score = new Float32Array(lagMax + 2);
  let bestLag = 0;
  for (let lag = lagMin; lag <= lagMax; lag++) {
    let v = 0;
    for (let i = 0; i + lag < frames; i++) v += onset[i] * onset[i + lag];
    v /= frames - lag;
    const l2 = Math.log2((60 * fps) / lag / 120);
    score[lag] = v * Math.exp(-0.5 * l2 * l2);
    if (!bestLag || score[lag] > score[bestLag]) bestLag = lag;
  }
  if (!bestLag || score[bestLag] <= 0) return null;
  // How clearly the onsets repeat at that period, between 0 (noise) and 1 (steady beats 0.87 or more, noise,
  // pads, and notes at random times 0.26 or less in Loop Trainer's tests)
  const ac = (lag) => { let v = 0; for (let i = 0; i + lag < frames; i++) v += onset[i] * onset[i + lag]; return v / (frames - lag); };
  const acs = [];
  for (let lag = lagMin; lag <= lagMax; lag += 2) acs.push(ac(lag));
  acs.sort((p, q) => p - q);
  const base = acs[acs.length >> 1], zero = ac(0);
  if (zero <= base || (ac(bestLag) - base) / (zero - base) < 0.3) return null;
  let period = bestLag;
  if (bestLag > lagMin && bestLag < lagMax) {
    const a = score[bestLag - 1], b = score[bestLag], c = score[bestLag + 1], den = a - 2 * b + c;
    if (den < 0) period += (0.5 * (a - c)) / den;
  }
  // Beats: each beat is an onset, and the gap to the previous beat stays close to the period
  const sigma = period / 32, kr = Math.ceil(sigma * 3), kern = [];
  for (let k = -kr; k <= kr; k++) kern.push(Math.exp(-0.5 * (k / sigma) * (k / sigma)));
  const local = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    let v = 0;
    for (let k = -kr; k <= kr; k++) { const j = i + k; if (j >= 0 && j < frames) v += onset[j] * kern[k + kr]; }
    local[i] = v;
  }
  const TIGHT = 100, cum = new Float32Array(frames), back = new Int32Array(frames).fill(-1);
  const lo = Math.round(period * 2), hi = Math.round(period / 2);
  for (let t = 0; t < frames; t++) {
    let best = -Infinity, arg = -1;
    for (let p = Math.max(0, t - lo); p <= t - hi; p++) {
      const lr = Math.log((t - p) / period), v = cum[p] - TIGHT * lr * lr;
      if (v > best) { best = v; arg = p; }
    }
    cum[t] = local[t] + (arg >= 0 && best > 0 ? best : 0);
    back[t] = arg >= 0 && best > 0 ? arg : -1;
  }
  let end = Math.max(0, frames - Math.round(period));
  for (let t = end; t < frames; t++) if (cum[t] > cum[end]) end = t;
  const idx = [];
  for (let t = end; t >= 0; t = back[t]) idx.push(t);
  idx.reverse();
  // Drop beats in silence at the start and the end
  const strength = idx.map((i) => local[i]).sort((a, b) => a - b), med = strength[strength.length >> 1] || 0;
  while (idx.length && local[idx[0]] < med * 0.25) idx.shift();
  while (idx.length && local[idx[idx.length - 1]] < med * 0.25) idx.pop();
  if (idx.length < 4) return null;
  // Move each beat to the onset peak within ±20 ms (sub-frame by parabolic interpolation)
  const r = Math.max(1, Math.round(fps * 0.02));
  const beats = new Float64Array(idx.length);
  for (let n = 0; n < idx.length; n++) {
    let m = idx[n];
    for (let i = Math.max(1, idx[n] - r); i <= Math.min(frames - 2, idx[n] + r); i++) if (onset[i] > onset[m]) m = i;
    let fm = m;
    if (m > 0 && m < frames - 1) {
      const a = onset[m - 1], b = onset[m], c = onset[m + 1], den = a - 2 * b + c;
      if (den < 0) fm += (0.5 * (a - c)) / den;
    }
    // The flux of frame f compares the windows starting at f-1 and f: the onset is near the start of the window's second half
    beats[n] = (fm * BHOP + N * 0.5) / fs + BEAT_BIAS;
  }
  return { tempo: (60 * fps) / period, beats: beats };
}

// The chord grid: one cell per beat (quarter note), from 0 to the end of the song. Before the first and after
// the last detected beat, the beats go on at the tempo. Without beats, cells of half a second.
function makeGrid(beat, duration) {
  const step = beat ? 60 / beat.tempo : 0.5;
  const b = beat ? Array.from(beat.beats) : [0];
  const head = [];
  for (let t = b[0] - step; t > step * 0.25; t -= step) head.unshift(t);
  const grid = [0].concat(head, b.filter((t) => t > step * 0.25 && t < duration));
  for (let t = grid[grid.length - 1] + step; t < duration - step * 0.25; t += step) grid.push(t);
  grid.push(duration);
  return Float64Array.from(grid);
}

// States 0–23: root * 2 + (0 major, 1 minor); 24: no chord
const N_STATES = 25;
const BETA = 24;         // how sharply the chroma decides (log-likelihood per unit of score, per 93 ms frame)
const P_CHANGE = 0.12;   // chance of a chord change at a beat
const NO_CHORD = 0.5;    // score of "no chord" when there is sound

// One chord per cell of the grid: the evidence of the frames in a cell is added up, then smoothed over the
// cells with an HMM (Viterbi)
function findChords(other, bass, grid) {
  const frames = Math.min(other.frames, bass.frames);
  const cells = grid.length - 1;
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
  const emit = new Float64Array(cells * N_STATES);
  let cell = 0;
  for (let f = 0; f < frames; f++) {
    const t = (f * HOPC) / ASR;
    while (cell + 1 < cells && grid[cell + 1] <= t) cell++;
    const row = cell * N_STATES;
    if (eAll[f] < gate) {
      emit[row + 24] += BETA;
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
        emit[row + root * 2 + q] += BETA * score;
      }
    }
    emit[row + 24] += BETA * NO_CHORD;
  }
  // Viterbi over the cells
  const stay = Math.log(1 - P_CHANGE), move = Math.log(P_CHANGE / (N_STATES - 1));
  const back = new Uint8Array(cells * N_STATES);
  let prev = new Float64Array(N_STATES), cur = new Float64Array(N_STATES);
  for (let s = 0; s < N_STATES; s++) prev[s] = emit[s];
  for (let i = 1; i < cells; i++) {
    let best = 0;
    for (let s = 1; s < N_STATES; s++) if (prev[s] > prev[best]) best = s;
    for (let s = 0; s < N_STATES; s++) {
      const a = prev[s] + stay, b = prev[best] + move;
      if (a >= b) { cur[s] = a; back[i * N_STATES + s] = s; } else { cur[s] = b; back[i * N_STATES + s] = best; }
      cur[s] += emit[i * N_STATES + s];
    }
    const t = prev; prev = cur; cur = t;
  }
  const path = new Uint8Array(cells);
  let s = 0;
  for (let k = 1; k < N_STATES; k++) if (prev[k] > prev[s]) s = k;
  for (let i = cells - 1; i >= 0; i--) { path[i] = s; if (i) s = back[i * N_STATES + s]; }
  const chords = [];
  for (let i = 0; i < cells; i++) {
    const st = path[i];
    const last = chords[chords.length - 1];
    if (last && last.state === st) last.t1 = grid[i + 1];
    else chords.push({ t0: grid[i], t1: grid[i + 1], state: st, root: st === 24 ? -1 : st >> 1, q: st !== 24 && (st & 1) === 1 ? "m" : "" });
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
    if (c.root === major && c.q === "") dMajor += c.t1 - c.t0;
    if (c.root === minor && c.q === "m") dMinor += c.t1 - c.t0;
  }
  let isMinor = key.minor;
  if (dMinor > dMajor * 1.15) isMinor = true;
  else if (dMajor > dMinor * 1.15) isMinor = false;
  else if (first && first.root === minor && first.q === "m") isMinor = true;
  else if (first && first.root === major && first.q === "") isMinor = false;
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
  return mergeShort(out);
}

// A note shorter than SHORT that touches a neighbour is usually a scoop or the slide between two notes, not a
// note of its own: it joins the touching neighbour closer in pitch (the harmony would otherwise jump for a moment)
const SHORT = 0.1;
function mergeShort(notes) {
  for (let i = 0; i < notes.length; ) {
    const n = notes[i];
    if (n.t1 - n.t0 >= SHORT) { i++; continue; }
    const prev = i > 0 && n.t0 - notes[i - 1].t1 < 0.03 ? notes[i - 1] : null;
    const next = i + 1 < notes.length && notes[i + 1].t0 - n.t1 < 0.03 ? notes[i + 1] : null;
    if (!prev && !next) { i++; continue; }
    const into = !next || (prev && Math.abs(prev.midi - n.midi) <= Math.abs(next.midi - n.midi)) ? prev : next;
    into.t0 = Math.min(into.t0, n.t0);
    into.t1 = Math.max(into.t1, n.t1);
    notes.splice(i, 1);
    // The neighbour may now touch another note with the same pitch
    const j = notes.indexOf(into);
    if (j + 1 < notes.length && notes[j + 1].midi === into.midi && notes[j + 1].t0 - into.t1 < 0.03) {
      into.t1 = notes[j + 1].t1;
      notes.splice(j + 1, 1);
    }
    i = Math.max(0, j);
  }
  return notes;
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

// The harmony note for a melody note, above (dir 1) or below (-1): a 3rd (3 or 4 semitones, or a 4th when
// neither fits) or a 5th (7 semitones, or 6 / 8 when 7 does not fit). Each is scored by being in the key,
// being a chord tone, and not a semitone against a chord tone; the main interval beats the fallback, and
// the last interval wins ties.
const STEPS = { 3: { steps: [3, 4, 5], main: [3, 4] }, 5: { steps: [7, 6, 8], main: [7] } };
function pickHarmony(midi, key, chord, dir, interval, lastIv) {
  const scale = (key.minor ? MINOR : MAJOR).map((s) => (s + key.tonic) % 12);
  const tones = chord ? (CHORD_TYPES[chord.q] || CHORD_TYPES[""]).map((s) => (chord.root + s) % 12) : [];
  const { steps, main } = STEPS[interval] || STEPS[3];
  let best = null, bestScore = -Infinity;
  for (const step of steps) {
    const iv = step * dir;
    const pc = mod12(midi + iv);
    let score = 0;
    if (scale.indexOf(pc) >= 0) score += 2;
    if (tones.indexOf(pc) >= 0) score += 3;
    else if (tones.some((tn) => mod12(pc - tn) === 1 || mod12(tn - pc) === 1)) score -= 1.5;
    if (main.indexOf(step) >= 0) score += 1.5;
    if (iv === lastIv) score += 0.3;
    if (score > bestScore) { bestScore = score; best = iv; }
  }
  return midi + best;
}

function makeArray(n) {
  const shared = typeof self !== "undefined" && self.crossOriginIsolated && typeof SharedArrayBuffer === "function";
  return new Int16Array(shared ? new SharedArrayBuffer(n * 2) : n);
}

// ---------- Phrases ----------
// Notes less than JOIN apart (a consonant, a short breath, a note too short to keep) belong to one phrase:
// they are made contiguous (each gap is split at its middle), and a phrase is made as one continuous sound,
// so the harmony does not stop between notes. The pitch changes glide over GLIDE around each boundary.
const JOIN = 0.3;
const GLIDE = 0.04;

function joinPhrases(notes) {
  const phrases = [];
  let cur = null;
  for (const n of notes) {
    const prev = cur && cur[cur.length - 1];
    if (prev && n.t0 - prev.t1 < JOIN) {
      const mid = (prev.t1 + n.t0) / 2;
      prev.t1 = mid;
      n.t0 = mid;
      cur.push(n);
    } else {
      cur = [n];
      phrases.push(cur);
    }
  }
  return phrases;
}
// The note of a phrase sounding at time t (the first / last note before / after the phrase)
function noteIndex(ph, t) {
  let k = 0;
  while (k + 1 < ph.length && ph[k + 1].t0 <= t) k++;
  return k;
}
// val(note) at time t in note k, gliding linearly into the next note around their boundary
function glideAt(ph, k, val, t) {
  const v = val(ph[k]);
  if (k + 1 < ph.length && t > ph[k + 1].t0 - GLIDE / 2) return v + ((val(ph[k + 1]) - v) * (t - ph[k + 1].t0 + GLIDE / 2)) / GLIDE;
  if (k > 0 && t < ph[k].t0 + GLIDE / 2) { const u = val(ph[k - 1]); return u + ((v - u) * (t - ph[k].t0 + GLIDE / 2)) / GLIDE; }
  return v;
}
const harmOf = (n) => n.harm;
const midiOf = (n) => n.midi;
const shiftOf = (n) => n.harm - n.midi;

// Guide tone: the harmony notes as a soft synth tone, legato within a phrase (one oscillator that glides
// from note to note, with a small accent at each new note so the notes can still be told apart)
function makeGuide(phrases, length, semis) {
  const out = makeArray(length);
  const fadeIn = 0.015 * SR, fadeOut = 0.04 * SR;
  for (const ph of phrases) {
    const a = Math.round(ph[0].t0 * SR), e = Math.min(length, Math.round(ph[ph.length - 1].t1 * SR));
    let phase = 0, k = 0;
    for (let i = a; i < e; i++) {
      const t = i / SR;
      while (k + 1 < ph.length && ph[k + 1].t0 <= t) k++;
      phase += (2 * Math.PI * hzOf(glideAt(ph, k, harmOf, t) + semis)) / SR;
      const accent = k > 0 && ph[k].harm === ph[k - 1].harm ? 0.8 : 0.8 + 0.2 * Math.exp(-(t - ph[k].t0) / 0.12);
      const env = Math.min(1, (i - a) / fadeIn, (e - i) / fadeOut) * accent;
      const v = 0.16 * env * (Math.sin(phase) + 0.3 * Math.sin(2 * phase) + 0.12 * Math.sin(3 * phase));
      out[i] = Math.max(-32768, Math.min(32767, out[i] + Math.round(v * 32767)));
    }
  }
  return out;
}

// ---------- Pitch correction (like Auto-Tune, on the harmony voice only) ----------
// Without it, the harmony voice copies the singer's pitch: a lead that is a little flat, scoops into a note, or
// wobbles makes the harmony do the same. With it, part of how far the sung pitch is from its note is taken
// away, frame by frame. The deviation is split into a slow part (over about 160 ms: being off pitch, scoops) and
// a fast part (vibrato): "weak" corrects most of the slow part and keeps the vibrato, "strong" corrects all of
// the slow part and some of the vibrato. Where the pitch track is missing or more than a semitone away from the
// note (a stray frame, a consonant), nothing is corrected, so a tracking error cannot pull the voice off.
const CORRECT = { 0: null, 1: { slow: 0.7, fast: 0 }, 2: { slow: 1, fast: 0.6 } };
function correction(pitch, notes, level) {
  const k = CORRECT[level];
  if (!k) return null;
  const frames = pitch.length;
  const step = HOP / ASR;
  const dev = new Float32Array(frames).fill(NaN);
  let n = 0;
  for (let f = 0; f < frames; f++) {
    const t = f * step;
    while (n + 1 < notes.length && notes[n + 1].t0 <= t) n++;
    const note = notes[n];
    if (!note || t < note.t0 || t >= note.t1 || isNaN(pitch[f])) continue;
    const d = pitch[f] - note.midi;
    if (Math.abs(d) < 1) dev[f] = d;
  }
  const raw = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0, cnt = 0;
    for (let j = f - 3; j <= f + 3; j++) if (j >= 0 && j < frames && !isNaN(dev[j])) { sum += dev[j]; cnt++; }
    if (cnt < 3) continue;
    const slow = sum / cnt;
    const fast = isNaN(dev[f]) ? 0 : dev[f] - slow;
    raw[f] = -(k.slow * slow + k.fast * fast);
  }
  // Short average, so switching between corrected and not corrected frames does not click
  const out = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0, cnt = 0;
    for (let j = f - 2; j <= f + 2; j++) if (j >= 0 && j < frames) { sum += raw[j]; cnt++; }
    out[f] = sum / cnt;
  }
  return out;
}

// ---------- 3. Harmony voice (TD-PSOLA) ----------
// One phrase at a time, from a little before its first note (to keep the first consonant) to a little after
// its last. Consonants and breaths inside the phrase go through too, so the words stay and nothing drops out.
const PRE = 0.06, POST = 0.06;
function makeVoice(L, R, phrases, pitch, semis, corr, progress) {
  const length = L.length;
  const out = makeArray(length);
  const x = (i) => (i < 0 || i >= length ? 0 : (L[i] + R[i]) / 65536);
  const peak = (from, to) => {
    let best = from, bv = -Infinity;
    for (let i = from; i <= to; i++) { const v = x(i); if (v > bv) { bv = v; best = i; } }
    return best;
  };
  const fade = Math.round(0.025 * SR);
  // The correction at sample i, in semitones (between frames: linear)
  const corrAt = (i) => {
    if (!corr) return 0;
    const fr = i / DEC / HOP, f = Math.floor(fr);
    if (f < 0 || f + 1 >= corr.length) return 0;
    return corr[f] + (corr[f + 1] - corr[f]) * (fr - f);
  };
  phrases.forEach((ph, pi) => {
    if (progress && (pi & 7) === 0) progress(pi / phrases.length);
    const a = Math.max(0, Math.round((ph[0].t0 - PRE) * SR)), e = Math.min(length, Math.round((ph[ph.length - 1].t1 + POST) * SR));
    if (e - a < 2 * fade) return;
    const at = (i, val) => { const t = i / SR; return glideAt(ph, noteIndex(ph, t), val, t); };
    // The sung pitch at sample i (the pitch track), or the notes where the track has a hole or strays
    const periodAt = (i) => {
      const melody = at(i, midiOf);
      const f = Math.round(i / DEC / HOP);
      let m = NaN;
      for (let k = 0; k <= 3 && isNaN(m); k++) {
        if (f - k >= 0 && !isNaN(pitch[f - k])) m = pitch[f - k];
        else if (f + k < pitch.length && !isNaN(pitch[f + k])) m = pitch[f + k];
      }
      if (isNaN(m) || Math.abs(m - melody) > 2) m = melody;
      return SR / hzOf(m);
    };
    // Analysis marks: one per pitch period, each moved to the nearby waveform peak
    const marks = [];
    let T = periodAt(a);
    let m = peak(a, a + Math.round(T));
    while (m < e + T) {
      marks.push(m);
      T = periodAt(m);
      const next = Math.round(m + T), r = Math.max(1, Math.round(T * 0.2));
      m = peak(next - r, next + r);
    }
    // Synthesis: grains (2 periods, Hann) from the nearest analysis mark, every period / ratio
    // (ratio: the harmony interval plus the key change, plus the pitch correction)
    const acc = new Float32Array(e - a);
    let ts = marks[0], k = 0;
    while (ts < e) {
      while (k + 1 < marks.length && Math.abs(marks[k + 1] - ts) <= Math.abs(marks[k] - ts)) k++;
      const ta = marks[k];
      const ratio = Math.pow(2, (at(ts, shiftOf) + semis + corrAt(ts)) / 12);
      const P = periodAt(ta);
      const half = Math.round(P);
      const c = Math.round(ts);
      for (let j = -half; j <= half; j++) {
        const o = c + j - a;
        if (o < 0 || o >= acc.length) continue;
        acc[o] += (x(ta + j) * (0.5 + 0.5 * Math.cos((Math.PI * j) / half))) / ratio;
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
  const [vL, vR] = msg.vocals;
  const dir = msg.dir < 0 ? -1 : 1;
  const interval = msg.interval === 5 ? 5 : 3;
  const semis = msg.semis || 0;
  // 1. Key and chords (or the ones from an earlier run, maybe edited)
  let chords = msg.chords, key = msg.key;
  let grid = null, bpm = 0;
  if (!chords || !key) {
    const [bL, bR] = msg.bass, [oL, oR] = msg.other, [dL, dR] = msg.drums;
    // Beats from the whole song (the sum of the 4 parts, as Loop Trainer reads the mix)
    const oth = decimate(oL, oR, (d) => report("chords", d * 0.15));
    const bas = decimate(bL, bR, (d) => report("chords", 0.15 + d * 0.15));
    const mix = decimate(dL, dR, (d) => report("chords", 0.3 + d * 0.15));
    const vox = decimate(vL, vR, (d) => report("chords", 0.45 + d * 0.15));
    for (let i = 0; i < mix.length; i++) mix[i] = (mix[i] + oth[i] + bas[i] + vox[i]) / 2;
    const beat = detectBeats(mix);
    report("chords", 0.7);
    grid = makeGrid(beat, vL.length / SR);
    bpm = beat ? beat.tempo : 0;
    const other = chroma(oth, 40, 95, (d) => report("chords", 0.7 + d * 0.2));
    const bass = chroma(bas, 28, 64, (d) => report("chords", 0.9 + d * 0.1));
    ({ chords, key } = findChords(other, bass, grid));
  }
  // 2. Melody (or the one from an earlier run), harmony notes, guide tone
  let pitch = msg.pitch, notes;
  if (pitch && msg.notes) {
    notes = msg.notes.map((n) => ({ t0: n.t0, t1: n.t1, midi: n.midi }));
  } else {
    const vox = decimate(vL, vR, (d) => report("melody", d * 0.2));
    pitch = trackPitch(vox, (d) => report("melody", 0.2 + d * 0.8));
    notes = findNotes(pitch);
  }
  let lastIv = (interval === 5 ? 7 : 3) * dir;
  for (const n of notes) {
    const chord = chordAt(chords, (n.t0 + n.t1) / 2);
    n.harm = pickHarmony(n.midi, key, chord, dir, interval, lastIv);
    lastIv = n.harm - n.midi;
  }
  const phrases = joinPhrases(notes);
  const guide = makeGuide(phrases, vL.length, semis);
  // 3. Harmony voice
  const voice = makeVoice(vL, vR, phrases, pitch, semis, correction(pitch, notes, msg.correct), (d) => report("voice", d));
  return { key: key, chords: chords, grid: grid, bpm: bpm, frame: HOP / ASR, pitch: pitch, notes: notes, voice: voice, guide: guide };
}

// Only when started as its own worker (keyshift.js imports makeFft from this file)
if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope && import.meta.url === self.location.href) {
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
