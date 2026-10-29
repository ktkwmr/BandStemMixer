// A made-up band song for the guide screenshots (scripts/render-guide-images.mjs): drums, bass,
// chords (other), and a sung-like melody (vocals), at 120 BPM in A minor (Am F C G). Every sound is
// generated here, so there is no copyright issue, and the four parts are known exactly: the
// screenshot script plays the sum to the app and hands the parts back in place of the AI model.
// Plain JavaScript with no imports: it also runs in the browser (in the stand-in for separator.js).

export const SR = 44100;
const BPM = 120;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; // Am F C G (MIDI notes)
const ROOTS = [45, 41, 48, 43];                                             // A2 F2 C3 G2
// The melody of one 4-bar phrase: [MIDI note, start beat, length in beats]
const MELODY = [[69, 0, 1.5], [72, 1.5, 0.5], [71, 2, 1], [69, 3, 1], [65, 4, 2], [67, 6, 1], [69, 7, 1],
  [64, 8, 1.5], [67, 9.5, 0.5], [72, 10, 2], [71, 12, 1], [67, 13, 1], [69, 14, 2]];

const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);

// A small deterministic random number generator, so the noise is the same every time
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
}

// Adds a note to out[]: a tone with a few harmonics, a short attack, and a decay
function tone(out, start, dur, f, amp, harm, decay, vibrato) {
  const a = Math.floor(start * SR), n = Math.min(out.length - a, Math.floor(dur * SR));
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.01) * Math.exp(-t * decay) * Math.min(1, (n - i) / (0.02 * SR));
    const ph = 2 * Math.PI * f * t + (vibrato ? 0.004 * f * Math.sin(2 * Math.PI * 5.5 * t) * Math.min(1, t / 0.3) : 0);
    let v = 0;
    for (let h = 0; h < harm.length; h++) v += harm[h] * Math.sin((h + 1) * ph);
    out[a + i] += amp * env * v;
  }
}

// Returns { drums, bass, other, vocals }, each [left, right] Float32Arrays of `length` samples
export function makeParts(length) {
  const mono = () => new Float32Array(length);
  const kick = mono(), snare = mono(), hat = mono(), bass = mono(), padL = mono(), padR = mono(), voice = mono();
  const noise = rng(7);
  const sec = length / SR;
  for (let b = 0; b * BEAT < sec; b++) {
    const t = b * BEAT;
    if (b % 2 === 0) {
      // Kick: a falling sine
      const a = Math.floor(t * SR);
      for (let i = 0; i < 0.25 * SR && a + i < length; i++) {
        const x = i / SR;
        kick[a + i] += 0.9 * Math.exp(-x * 18) * Math.sin(2 * Math.PI * (50 * x + 60 * (1 - Math.exp(-x * 30)) / 30));
      }
    } else {
      // Snare: a noise burst with a little tone
      const a = Math.floor(t * SR);
      for (let i = 0; i < 0.18 * SR && a + i < length; i++) {
        const x = i / SR;
        snare[a + i] += Math.exp(-x * 22) * (0.45 * noise() + 0.25 * Math.sin(2 * Math.PI * 190 * x));
      }
    }
    // Hi-hat on every eighth note: very short noise
    for (const off of [0, BEAT / 2]) {
      const a = Math.floor((t + off) * SR);
      let prev = 0;
      for (let i = 0; i < 0.05 * SR && a + i < length; i++) {
        const w = noise();
        hat[a + i] += 0.18 * Math.exp(-(i / SR) * 70) * (w - prev); // high-passed noise
        prev = w;
      }
    }
  }
  for (let bar = 0; bar * BAR < sec; bar++) {
    const c = bar % 4, t0 = bar * BAR;
    // Bass: the root in eighth notes, an octave up on the last two
    for (let e = 0; e < 8; e++) tone(bass, t0 + e * BEAT / 2, BEAT / 2 * 0.9, hz(ROOTS[c] + (e >= 6 ? 12 : 0)), 0.32, [1, 0.5, 0.25, 0.12], 3, false);
    // Other: the chord, held for the bar, voiced a little differently left and right
    CHORDS[c].forEach((n, k) => {
      tone(padL, t0, BAR, hz(n), 0.07 * (k === 2 ? 0.6 : 1), [1, 0.4, 0.3, 0.15, 0.1], 0.6, false);
      tone(padR, t0, BAR, hz(n + (k === 0 ? 12 : 0)), 0.07 * (k === 0 ? 0.6 : 1), [1, 0.4, 0.3, 0.15, 0.1], 0.6, false);
    });
  }
  // Vocals: the melody, starting from the second phrase, with vibrato
  for (let p = 1; p * 4 * BAR < sec; p++) {
    for (const [n, beat, len] of MELODY) tone(voice, p * 4 * BAR + beat * BEAT, len * BEAT, hz(n), 0.22, [1, 0.35, 0.18, 0.08], 0.4, true);
  }
  const drumsL = mono(), drumsR = mono();
  for (let i = 0; i < length; i++) {
    drumsL[i] = kick[i] * 0.8 + snare[i] * 0.7 + hat[i] * 1.2;
    drumsR[i] = kick[i] * 0.8 + snare[i] * 0.7 + hat[i] * 0.6;
  }
  return { drums: [drumsL, drumsR], bass: [bass, bass.slice()], other: [padL, padR], vocals: [voice, voice.slice()] };
}

// The sum of the parts, as the song file the app opens
export function mixParts(parts) {
  const n = parts.drums[0].length;
  const L = new Float32Array(n), R = new Float32Array(n);
  for (const key of ["drums", "bass", "other", "vocals"]) {
    const [l, r] = parts[key];
    for (let i = 0; i < n; i++) { L[i] += l[i]; R[i] += r[i]; }
  }
  return [L, R];
}
