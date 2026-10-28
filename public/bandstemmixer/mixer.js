// AudioWorklet that plays the 6 separated stems in sync and mixes them with the faders.
// The stems are 16-bit PCM at 44.1 kHz. On a cross-origin isolated page they are SharedArrayBuffers
// shared with the page (no copy); otherwise this worklet gets its own copy. If the device runs at
// another sample rate, they are resampled on the fly with linear interpolation.
//
// Messages from the page:
//   { type: "load", stems: [[Int16Array L, Int16Array R] x 6] }
//   { type: "play" } / { type: "pause" } / { type: "seek", pos }  (pos in 44.1 kHz samples)
//   { type: "gains", left: [6], right: [6] }
// Messages to the page:
//   { type: "pos", pos, playing, peaks: [6] }  (about 20 times a second)
//   { type: "ended" }

const SRC_RATE = 44100;

class StemMixer extends AudioWorkletProcessor {
  constructor() {
    super();
    this.stems = null;
    this.length = 0;
    this.pos = 0;
    this.playing = false;
    this.step = SRC_RATE / sampleRate;
    this.targetL = new Float32Array(6).fill(1);
    this.targetR = new Float32Array(6).fill(1);
    this.curL = new Float32Array(6).fill(1);
    this.curR = new Float32Array(6).fill(1);
    this.peaks = new Float32Array(6);
    this.frames = 0;
    this.port.onmessage = (e) => this.onMessage(e.data);
  }

  onMessage(msg) {
    if (msg.type === "load") {
      this.stems = msg.stems;
      this.length = msg.stems ? msg.stems[0][0].length : 0;
      this.pos = 0;
      this.playing = false;
    } else if (msg.type === "play") {
      if (this.stems) {
        if (this.pos >= this.length - 1) this.pos = 0;
        this.playing = true;
      }
    } else if (msg.type === "pause") {
      this.playing = false;
      this.report();
    } else if (msg.type === "seek") {
      this.pos = Math.max(0, Math.min(this.length - 1, msg.pos));
      this.report();
    } else if (msg.type === "gains") {
      this.targetL.set(msg.left);
      this.targetR.set(msg.right);
    }
  }

  report() {
    this.port.postMessage({ type: "pos", pos: this.pos, playing: this.playing, peaks: Array.from(this.peaks) });
    this.peaks.fill(0);
  }

  process(inputs, outputs) {
    const out = outputs[0];
    const outL = out[0];
    const outR = out[1] || out[0];
    const frames = outL.length;
    if (!this.playing || !this.stems) {
      outL.fill(0);
      if (outR !== outL) outR.fill(0);
      return true;
    }
    // Gains glide to their targets over a few blocks, so muting and fader moves do not click
    for (let s = 0; s < 6; s++) {
      this.curL[s] += (this.targetL[s] - this.curL[s]) * 0.5;
      this.curR[s] += (this.targetR[s] - this.curR[s]) * 0.5;
    }
    const last = this.length - 1;
    for (let i = 0; i < frames; i++) {
      if (this.pos >= last) {
        outL[i] = 0;
        if (outR !== outL) outR[i] = 0;
        continue;
      }
      const p = Math.floor(this.pos);
      const f = this.pos - p;
      let l = 0, r = 0;
      for (let s = 0; s < 6; s++) {
        const L = this.stems[s][0], R = this.stems[s][1];
        const a = (L[p] + (L[p + 1] - L[p]) * f) * (this.curL[s] / 32768);
        const b = (R[p] + (R[p + 1] - R[p]) * f) * (this.curR[s] / 32768);
        const peak = a > 0 ? a : -a;
        const peakR = b > 0 ? b : -b;
        if (peak > this.peaks[s]) this.peaks[s] = peak;
        if (peakR > this.peaks[s]) this.peaks[s] = peakR;
        l += a;
        r += b;
      }
      outL[i] = l;
      if (outR !== outL) outR[i] = r;
      this.pos += this.step;
    }
    if (this.pos >= last) {
      this.playing = false;
      this.pos = last;
      this.report();
      this.port.postMessage({ type: "ended" });
      return true;
    }
    this.frames += frames;
    if (this.frames >= sampleRate / 20) {
      this.frames = 0;
      this.report();
    }
    return true;
  }
}

registerProcessor("stem-mixer", StemMixer);
