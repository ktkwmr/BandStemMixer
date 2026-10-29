// STFT before the model and inverse STFT after it, for one 7.8 s chunk (imported by separator.js).
// Gives the same numbers as demucs-web's prepareModelInput / standaloneMask / standaloneIspec (the FFT itself
// is demucs-web's), but every buffer is allocated once and reused for all chunks. demucs-web allocates
// about 150 MB of new arrays per chunk, which an iPhone could not free fast enough: the tab was closed
// partway through a song.
//
// createDsp({ fft, ifft, getHannWindow }) with the functions of demucs-web's fft.js (passed in, so a test
// can use a local copy) returns:
//   prepare(left, right)  → { waveform: Float32Array(2·N), spec: Float32Array(4·BINS·FRAMES) }
//                           (the model's two inputs; the same arrays every call, overwritten)
//   addFreq(freq, stem, outL, outR)  adds the frequency branch of `stem` (from the model's
//                           [1, 4, 4, BINS, FRAMES] output), turned back into sound, to outL / outR (length N)

export const N = 343980;      // samples per chunk (7.8 s at 44.1 kHz)
export const FFT = 4096;
export const HOP = 1024;
export const BINS = 2048;     // the model uses bins 0..2047 (the Nyquist bin is dropped)
export const FRAMES = 336;    // the model uses STFT frames 2..337

const PAD = Math.floor(HOP / 2) * 3;                      // 1536
const PAD_RIGHT = PAD + Math.ceil(N / HOP) * HOP - N;     // 1620
const CENTER = FFT / 2;                                   // 2048
const PADDED = N + PAD + PAD_RIGHT;                       // after the first reflect padding
const LONG = PADDED + 2 * CENTER;                         // after the second (centering) padding
const ALL_FRAMES = Math.floor((LONG - FFT) / HOP) + 1;    // 340
const ISTFT_LEN = (ALL_FRAMES - 1) * HOP + FFT;           // inverse STFT length before trimming
const OFFSET = CENTER + PAD;                              // first sample of the chunk in the inverse STFT

// demucs-web's reflectPad, into an existing buffer
function reflectPadInto(out, signal, length, padLeft, padRight) {
  for (let i = 0; i < padLeft; i++) out[i] = signal[Math.min(padLeft - i, length - 1)];
  out.set(signal.subarray(0, length), padLeft);
  for (let i = 0; i < padRight; i++) out[padLeft + length + i] = signal[Math.max(0, length - 2 - i)];
}

export function createDsp({ fft, ifft, getHannWindow }) {
  const window = getHannWindow(FFT);
  const waveform = new Float32Array(2 * N);
  const spec = new Float32Array(4 * BINS * FRAMES);
  const padded = new Float32Array(PADDED);
  const long = new Float32Array(LONG);
  const frame = new Float32Array(FFT);
  const re = new Float32Array(FFT);
  const im = new Float32Array(FFT);
  const fullRe = new Float32Array(FFT);
  const fullIm = new Float32Array(FFT);
  const ola = new Float32Array(ISTFT_LEN);
  // The overlap-add window sum depends only on the frame count, so it is computed once
  const windowSum = new Float32Array(ISTFT_LEN);
  for (let f = 0; f < ALL_FRAMES; f++) {
    for (let i = 0; i < FFT && f * HOP + i < ISTFT_LEN; i++) windowSum[f * HOP + i] += window[i] * window[i];
  }
  const fwdScale = 1 / Math.sqrt(FFT);
  const invScale = Math.sqrt(FFT);
  const plane = BINS * FRAMES;

  function stftChannel(signal, reIndex, imIndex) {
    reflectPadInto(padded, signal, N, PAD, PAD_RIGHT);
    reflectPadInto(long, padded, PADDED, CENTER, CENTER);
    for (let f = 0; f < FRAMES; f++) {
      const start = (f + 2) * HOP;
      for (let i = 0; i < FFT; i++) frame[i] = long[start + i] * window[i];
      fft(re, im, frame, FFT);
      for (let b = 0; b < BINS; b++) {
        spec[reIndex * plane + b * FRAMES + f] = re[b] * fwdScale;
        spec[imIndex * plane + b * FRAMES + f] = im[b] * fwdScale;
      }
    }
  }

  function prepare(left, right) {
    waveform.set(left.subarray(0, N), 0);
    waveform.set(right.subarray(0, N), N);
    stftChannel(left, 0, 1);
    stftChannel(right, 2, 3);
    return { waveform, spec };
  }

  // One channel of one stem: freq[base + reIdx·plane + b·FRAMES + f] → sound, added to out
  function istftChannel(freq, base, reIdx, imIdx, out) {
    ola.fill(0);
    for (let f = 2; f < FRAMES + 2; f++) {
      const src = f - 2;
      for (let k = 0; k < BINS; k++) {
        fullRe[k] = freq[base + reIdx * plane + k * FRAMES + src];
        fullIm[k] = freq[base + imIdx * plane + k * FRAMES + src];
      }
      fullRe[BINS] = 0;
      fullIm[BINS] = 0;
      for (let k = 1; k < BINS; k++) {
        fullRe[FFT - k] = fullRe[k];
        fullIm[FFT - k] = -fullIm[k];
      }
      ifft(re, im, fullRe, fullIm, FFT);
      const start = f * HOP;
      for (let i = 0; i < FFT && start + i < ISTFT_LEN; i++) ola[start + i] += re[i] * window[i] * invScale;
    }
    for (let j = 0; j < N; j++) {
      const w = windowSum[OFFSET + j];
      if (w > 1e-8) out[j] += ola[OFFSET + j] / w;
      else out[j] += ola[OFFSET + j];
    }
  }

  function addFreq(freq, stem, outL, outR) {
    const base = stem * 4 * plane;
    istftChannel(freq, base, 0, 1, outL);
    istftChannel(freq, base, 2, 3, outR);
  }

  return { prepare, addFreq };
}
