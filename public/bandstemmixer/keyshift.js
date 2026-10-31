// Key change worker (module worker, started by index.html: one per part, so the parts run in parallel).
// Shifts a stereo part up or down by whole semitones without changing its length or tempo: a phase vocoder
// stretches it in time by the pitch ratio (identity phase locking: the bins around each spectral peak keep
// their phase relation to the peak, which keeps the sound clearer), and the result is resampled back to
// the original length. Left and right share one complex FFT (left as the real part, right as the
// imaginary part).
//
// Messages from the page:
//   { left: Int16Array, right: Int16Array, semis, size }  (44.1 kHz; size: FFT size, 4096 for the bass)
// Messages to the page:
//   { type: "progress", done }  (0–1, a few times a second)
//   { type: "done", left: Int16Array, right: Int16Array }  (shared memory when the page is cross-origin isolated)
//   { type: "error", message }

import { makeFft } from "./harmony.js";

function makeArray(n) {
  const shared = self.crossOriginIsolated && typeof SharedArrayBuffer === "function";
  return new Int16Array(shared ? new SharedArrayBuffer(n * 2) : n);
}

const TWO_PI = 2 * Math.PI;
const wrap = (p) => p - TWO_PI * Math.round(p / TWO_PI);

export function shiftStereo(L, R, outL, outR, semis, N, progress) {
  const n = L.length;
  const r = Math.pow(2, semis / 12);
  const Hs = N / 4, Ha = Hs / r, half = N / 2;
  const fft = makeFft(N);
  const win = new Float64Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos((TWO_PI * i) / N);
  // Hann analysis and synthesis windows overlapping by 3/4 add up to 1.5; the inverse FFT needs 1 / N
  const gain = 1 / (1.5 * N);
  const re = new Float64Array(N), im = new Float64Array(N);
  const B = half + 1;
  // Per channel: this frame's spectrum (X), the last frame's (prevX), and the last output spectrum (prevY)
  const ch = [0, 1].map(() => ({
    xr: new Float64Array(B), xi: new Float64Array(B), pr: new Float64Array(B), pi: new Float64Array(B),
    yr: new Float64Array(B), yi: new Float64Array(B), qr: new Float64Array(B), qi: new Float64Array(B),
  }));
  const peaks = new Int32Array(B);
  // The stretched signal, added up frame by frame in a ring buffer and read (resampled) behind the frames
  const RB = 4 * N, mask = RB - 1;
  const y = [new Float32Array(RB), new Float32Array(RB)];
  const outs = [outL, outR];
  let out = 0, cleared = 0, lastPos = 0;
  const frames = Math.ceil((n + half) / Ha) + 1;
  for (let m = 0; m < frames; m++) {
    const pos = Math.round(m * Ha), start = pos - half;
    for (let i = 0; i < N; i++) {
      const j = start + i;
      const inside = j >= 0 && j < n;
      re[i] = inside ? L[j] * win[i] : 0;
      im[i] = inside ? R[j] * win[i] : 0;
    }
    fft(re, im);
    // Split the two channels' spectra
    for (let k = 0; k < B; k++) {
      const nk = (N - k) & (N - 1);
      ch[0].xr[k] = (re[k] + re[nk]) / 2; ch[0].xi[k] = (im[k] - im[nk]) / 2;
      ch[1].xr[k] = (im[k] + im[nk]) / 2; ch[1].xi[k] = (re[nk] - re[k]) / 2;
    }
    const dA = m === 0 ? Ha : pos - lastPos;
    for (const c of ch) {
      const { xr, xi, pr, pi, yr, yi, qr, qi } = c;
      let np = 0;
      if (m > 0) {
        for (let k = 1; k < half; k++) {
          const e = xr[k] * xr[k] + xi[k] * xi[k];
          if (e > xr[k - 1] * xr[k - 1] + xi[k - 1] * xi[k - 1] && e >= xr[k + 1] * xr[k + 1] + xi[k + 1] * xi[k + 1]) peaks[np++] = k;
        }
      }
      if (np === 0) {
        yr.set(xr); yi.set(xi);
      } else {
        // Each peak advances its last output phase by its own frequency (measured from the phase change
        // since the last frame); every bin around it is turned by the same angle as the peak
        let p = -1, cr = 1, ci = 0;
        for (let k = 0; k < B; k++) {
          if (p < 0 || (p + 1 < np && peaks[p + 1] - k < k - peaks[p])) {
            p++;
            const pk = peaks[p];
            const omega = (TWO_PI * pk) / N;
            const dphi = Math.atan2(xi[pk] * pr[pk] - xr[pk] * pi[pk], xr[pk] * pr[pk] + xi[pk] * pi[pk]);
            const freq = omega + wrap(dphi - omega * dA) / dA;
            const target = Math.atan2(qi[pk], qr[pk]) + freq * Hs;
            const turn = target - Math.atan2(xi[pk], xr[pk]);
            cr = Math.cos(turn); ci = Math.sin(turn);
          }
          yr[k] = xr[k] * cr - xi[k] * ci;
          yi[k] = xr[k] * ci + xi[k] * cr;
        }
      }
      pr.set(xr); pi.set(xi); qr.set(yr); qi.set(yi);
    }
    lastPos = pos;
    // Join the two channels again: Z = YL + i·YR (YL, YR Hermitian), then the inverse FFT (by conjugation)
    const [a, b] = ch;
    for (let k = 0; k < B; k++) {
      const ylr = a.yr[k], yrr = b.yr[k];
      const yli = k === 0 || k === half ? 0 : a.yi[k], yri = k === 0 || k === half ? 0 : b.yi[k];
      re[k] = ylr - yri; im[k] = -(yli + yrr);
      if (k !== 0 && k !== half) { re[N - k] = ylr + yri; im[N - k] = yli - yrr; }
    }
    fft(re, im);
    // Overlap-add at the synthesis position (left = real part, right = imaginary part)
    const s0 = m * Hs - half;
    for (let i = 0; i < N; i++) {
      const j = s0 + i;
      if (j < 0) continue;
      y[0][j & mask] += re[i] * win[i];
      y[1][j & mask] -= im[i] * win[i];
    }
    // Everything before the next frame's start is final: resample it back to the original length
    const ready = (m + 1) * Hs - half;
    while (out < n && out * r + 1 < ready) {
      const t = out * r, j = Math.floor(t), f = t - j;
      for (let c = 0; c < 2; c++) {
        const v = (y[c][j & mask] * (1 - f) + y[c][(j + 1) & mask] * f) * gain;
        outs[c][out] = v > 32767 ? 32767 : v < -32768 ? -32768 : Math.round(v);
      }
      out++;
    }
    const used = Math.floor(out * r);
    for (; cleared < used; cleared++) { y[0][cleared & mask] = 0; y[1][cleared & mask] = 0; }
    if (progress && (m & 255) === 0) progress(m / frames);
  }
}

if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
  self.onmessage = (e) => {
    const { left, right, semis, size } = e.data;
    try {
      const outL = makeArray(left.length), outR = makeArray(left.length);
      let last = 0;
      shiftStereo(left, right, outL, outR, semis, size || 2048, (done) => {
        const now = Date.now();
        if (now - last > 150) { last = now; self.postMessage({ type: "progress", done: done }); }
      });
      self.postMessage({ type: "done", left: outL, right: outR }, outL.buffer instanceof ArrayBuffer ? [outL.buffer, outR.buffer] : []);
    } catch (err) {
      self.postMessage({ type: "error", message: String((err && err.message) || err) });
    }
  };
}
