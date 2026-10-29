// MP3 encoder worker (module worker, started by index.html when a part or the mix is saved).
// Encodes 16-bit stereo PCM at 44.1 kHz to a 192 kbps MP3 with LAME (lamejs, LGPL-3.0, loaded from
// the CDN as a separate file).
//
// Messages from the page:
//   { left: Int16Array, right: Int16Array }  (shared memory or transferred)
// Messages to the page:
//   { type: "progress", done }  (0–1, a few times a second)
//   { type: "done", chunks: [Uint8Array] }  (the MP3 file, in order)
//   { type: "error", message }

// Keep in sync with CDN in sw.js
const LAME_URL = "https://cdn.jsdelivr.net/npm/@breezystack/lamejs@1.2.7/dist/lamejs.js";
const SAMPLE_RATE = 44100;
const KBPS = 192;
const BLOCK = 1152 * 20; // samples per encodeBuffer call (a multiple of the MP3 frame size)

self.onmessage = async (e) => {
  try {
    const { Mp3Encoder } = await import(LAME_URL);
    const { left, right } = e.data;
    const encoder = new Mp3Encoder(2, SAMPLE_RATE, KBPS);
    const chunks = [];
    const total = left.length;
    let last = 0;
    for (let i = 0; i < total; i += BLOCK) {
      const end = Math.min(total, i + BLOCK);
      // lamejs reads plain Int16Arrays; a slice also works for shared memory
      const out = encoder.encodeBuffer(left.slice(i, end), right.slice(i, end));
      if (out.length) chunks.push(new Uint8Array(out));
      const now = Date.now();
      if (now - last > 200) { last = now; self.postMessage({ type: "progress", done: end / total }); }
    }
    const tail = encoder.flush();
    if (tail.length) chunks.push(new Uint8Array(tail));
    self.postMessage({ type: "done", chunks }, chunks.map((c) => c.buffer));
  } catch (err) {
    self.postMessage({ type: "error", message: String(err && err.message || err) });
  }
};
