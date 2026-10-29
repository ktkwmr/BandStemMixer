// Separation worker (module worker, started by index.html).
// Downloads the AI model once (kept in Cache Storage, so later runs need no download), runs
// Demucs (htdemucs, 4 sources) with ONNX Runtime Web, and sends back the 4 stems as 16-bit PCM.
//
// Model: htdemucs (Demucs v4, Meta) exported to ONNX by timcsy (demucs-web-onnx, "htdemucs_embedded").
// The weights are not MIT: Meta provides them for scientific purposes only, so this app must stay
// non-commercial (no ads) while it uses them (facebookresearch/demucs#327).
//   inputs  [0] waveform float32 [1, 2, 343980]  (7.8 s of 44.1 kHz stereo)
//           [1] spectrogram float32 [1, 4, 2048, 336]  (STFT of the waveform, made in JavaScript)
//   outputs time branch float32 [1, 4, 2, 343980] and frequency branch float32 [1, 4, 4, 2048, 336]
//           (sources in the order drums, bass, other, vocals; the frequency branch is turned back into
//           sound with an inverse STFT in JavaScript and added to the time branch)
// The STFT / inverse STFT are in dsp.js: the same numbers as demucs-web (timcsy, MIT; the library the
// first prototype of this app used, whose FFT it imports), with buffers reused for every chunk so memory
// does not pile up on a phone. Longer songs are cut into 7.8 s chunks that overlap by a quarter and are
// cross-faded.
//
// Messages from the page:
//   { type: "run", left: Float32Array, right: Float32Array, gpu: boolean, safe: boolean, threads?: number }  (44.1 kHz)
// Messages to the page:
//   { type: "progress", stage: "lib" | "download" | "init" | "separate", loaded?, total?, done?, chunks?, elapsed? }
//   { type: "backend", name: "webgpu" | "wasm", threads, safe }
//   { type: "done", stems: [[Int16Array L, Int16Array R] x 4] }  (model order; shared memory when isolated)
//   { type: "error", code: "offline" | "download" | "memory" | "run", stage: "download" | "init" | "separate", message }

import { createDsp } from "./dsp.js";

// Keep these in sync with MODEL_URL / MODEL_CACHE in index.html and CDN / KEEP in sw.js
const ORT_BASE = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/";
const DEMUCS_FFT = "https://cdn.jsdelivr.net/npm/demucs-web@1.0.2/src/fft.js";
const MODEL_URL = "https://huggingface.co/timcsy/demucs-web-onnx/resolve/main/htdemucs_embedded.onnx";
const MODEL_CACHE = "bandstemmixer-model-v2";

const N = 343980; // samples per chunk (7.8 s at 44.1 kHz), fixed by the exported graph
const OVERLAP = Math.floor(N / 4);
const STRIDE = N - OVERLAP;
const STEMS = 4;

// Triangular fade-in / fade-out over the overlap
const WINDOW = (function () {
  const w = new Float32Array(N).fill(1);
  for (let i = 0; i < OVERLAP; i++) {
    const f = i / (OVERLAP - 1);
    w[i] = f;
    w[N - 1 - i] = f;
  }
  return w;
})();

const post = (msg, transfer) => self.postMessage(msg, transfer || []);

async function cachedModel() {
  try {
    const cache = await caches.open(MODEL_CACHE);
    const hit = await cache.match(MODEL_URL);
    return hit ? new Uint8Array(await hit.arrayBuffer()) : null;
  } catch (e) {
    return null; // Cache Storage unavailable (private mode etc.): download every time
  }
}

async function downloadModel() {
  let res;
  try {
    res = await fetch(MODEL_URL, { mode: "cors", credentials: "omit" });
  } catch (e) {
    throw Object.assign(new Error(String(e && e.message || e)), { code: navigator.onLine === false ? "offline" : "download" });
  }
  if (!res.ok || !res.body) throw Object.assign(new Error("HTTP " + res.status), { code: "download" });
  const total = Number(res.headers.get("content-length")) || 0;
  const reader = res.body.getReader();
  let bytes = total ? new Uint8Array(total) : new Uint8Array(180 * 1024 * 1024);
  let loaded = 0;
  let last = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (loaded + value.length > bytes.length) {
      const bigger = new Uint8Array(Math.max(bytes.length * 2, loaded + value.length));
      bigger.set(bytes.subarray(0, loaded));
      bytes = bigger;
    }
    bytes.set(value, loaded);
    loaded += value.length;
    const now = Date.now();
    if (now - last > 150) { last = now; post({ type: "progress", stage: "download", loaded, total }); }
  }
  if (total && loaded !== total) throw Object.assign(new Error("incomplete download"), { code: "download" });
  bytes = bytes.subarray(0, loaded);
  post({ type: "progress", stage: "download", loaded, total: loaded });
  try {
    const cache = await caches.open(MODEL_CACHE);
    await cache.put(MODEL_URL, new Response(bytes, { headers: { "content-type": "application/octet-stream", "content-length": String(loaded) } }));
  } catch (e) {
    // Not enough storage, or Cache Storage unavailable: the model is downloaded again next time
  }
  return bytes;
}

// gpu: WebGPU first, then the CPU within the same session (the setup the prototype ran with). On an iPhone
// the GPU's working memory is held by Safari's GPU process, not by the tab, which has a much lower limit.
// safe: at most 2 threads, no memory arena or pre-planned memory pattern (with or without the GPU).
// threads: a fixed number of CPU threads (index.html's last resort on phones: 1).
// index.html picks these per device and moves on to the next setting when one fails or crashes the tab.
// A backend that failed to start cannot be retried in the same worker (ONNX Runtime keeps the failed
// state), so the page starts a fresh worker for the safe attempt instead of falling back here.
async function createSession(modelBytes, gpu, safe, fixedThreads) {
  post({ type: "progress", stage: "lib" });
  const useGpu = gpu && "gpu" in navigator;
  // The WebGPU build includes the CPU (WebAssembly) backend too, but its .wasm file is about twice as large
  const [ort, fftModule] = await Promise.all([
    import(ORT_BASE + (useGpu ? "ort.webgpu.min.mjs" : "ort.wasm.min.mjs")),
    import(DEMUCS_FFT),
  ]);
  ort.env.wasm.wasmPaths = ORT_BASE;
  // Several threads only work on a cross-origin isolated page (COOP / COEP in public/_headers)
  // safe (phones, or a retry): at most 2 threads; threads add little memory but a lot of speed on a phone
  const cores = navigator.hardwareConcurrency || 4;
  const threads = !self.crossOriginIsolated ? 1 : fixedThreads > 0 ? fixedThreads : safe ? Math.min(2, cores) : Math.max(1, Math.min(8, cores));
  ort.env.wasm.numThreads = threads;
  post({ type: "progress", stage: "init" });
  const opts = safe
    ? { graphOptimizationLevel: "basic", enableCpuMemArena: false, enableMemPattern: false }
    : { graphOptimizationLevel: "basic" };
  const session = await ort.InferenceSession.create(modelBytes, { ...opts, executionProviders: useGpu ? ["webgpu", "wasm"] : ["wasm"] });
  post({ type: "backend", name: useGpu ? "webgpu" : "wasm", threads, safe: !!safe });
  return { ort, dsp: createDsp(fftModule), session };
}

const toInt16 = (x) => {
  const v = x < -1 ? -1 : x > 1 ? 1 : x;
  return v < 0 ? Math.round(v * 32768) : Math.round(v * 32767);
};

// One 7.8 s chunk through the model, into out[stem][channel] (Float32Array(N) each, reused):
// time branch + frequency branch turned back into sound
async function runChunk(ort, dsp, session, segLeft, segRight, out) {
  const input = dsp.prepare(segLeft, segRight);
  const feeds = { [session.inputNames[0]]: new ort.Tensor("float32", input.waveform, [1, 2, N]) };
  if (session.inputNames.length > 1) {
    feeds[session.inputNames[1]] = new ort.Tensor("float32", input.spec, [1, 4, 2048, 336]);
  }
  const results = await session.run(feeds);
  let time = null, freq = null;
  for (const name of session.outputNames) {
    const tensor = results[name];
    const data = tensor.location && tensor.location !== "cpu" ? await tensor.getData(true) : tensor.data;
    if (tensor.dims.length === 4 && tensor.dims[2] === 2) time = data;
    else if (tensor.dims.length === 5 && tensor.dims[2] === 4) freq = data;
  }
  if (!time) throw new Error("time-domain output not found");
  for (let s = 0; s < STEMS; s++) {
    out[s][0].set(time.subarray(s * 2 * N, s * 2 * N + N));
    out[s][1].set(time.subarray(s * 2 * N + N, s * 2 * N + 2 * N));
    if (freq) dsp.addFreq(freq, s, out[s][0], out[s][1]);
  }
  for (const name of session.outputNames) { try { results[name].dispose(); } catch (e) {} }
}

async function separate(ort, dsp, session, left, right) {
  const total = left.length;
  const chunks = Math.max(1, Math.ceil(total / STRIDE));
  // On a cross-origin isolated page the stems are shared memory, so the page and the player
  // (mixer.js) use them without copying
  const shared = self.crossOriginIsolated && typeof SharedArrayBuffer === "function";
  const make = () => new Int16Array(shared ? new SharedArrayBuffer(total * 2) : total);
  let out;
  try {
    out = Array.from({ length: STEMS }, () => [make(), make()]);
  } catch (e) {
    throw Object.assign(new Error("out of memory"), { code: "memory" });
  }
  // Weighted sums of the previous chunk's last quarter, waiting for the next chunk to be added
  const tail = Array.from({ length: STEMS * 2 }, () => new Float32Array(OVERLAP));
  const tailW = new Float32Array(OVERLAP);
  let tailLen = 0;
  const segLeft = new Float32Array(N);
  const segRight = new Float32Array(N);
  const res = Array.from({ length: STEMS }, () => [new Float32Array(N), new Float32Array(N)]);
  const t0 = Date.now();
  post({ type: "progress", stage: "separate", done: 0, chunks, elapsed: 0 });

  for (let i = 0; i < chunks; i++) {
    const start = i * STRIDE;
    const len = Math.min(N, total - start);
    const last = i === chunks - 1;
    segLeft.fill(0);
    segRight.fill(0);
    segLeft.set(left.subarray(start, start + len));
    segRight.set(right.subarray(start, start + len));
    await runChunk(ort, dsp, session, segLeft, segRight, res);

    // Samples before `fin` are complete after this chunk; the rest overlap the next chunk
    const fin = last ? len : Math.min(STRIDE, len);
    for (let k = 0; k < STEMS * 2; k++) {
      const src = res[k >> 1][k & 1];
      const dst = out[k >> 1][k & 1];
      const tk = tail[k];
      for (let j = 0; j < fin; j++) {
        let v = src[j] * WINDOW[j];
        let w = WINDOW[j];
        if (j < tailLen) { v += tk[j]; w += tailW[j]; }
        dst[start + j] = w > 1e-8 ? toInt16(v / w) : 0;
      }
      for (let j = fin; j < len; j++) tk[j - fin] = src[j] * WINDOW[j];
    }
    if (!last) {
      for (let j = fin; j < len; j++) tailW[j - fin] = WINDOW[j];
      tailLen = len - fin;
    }
    post({ type: "progress", stage: "separate", done: i + 1, chunks, elapsed: Date.now() - t0 });
    // A short pause between chunks gives the browser a chance to free memory (matters on a phone)
    await new Promise((r) => setTimeout(r, 0));
  }
  return out;
}

self.onmessage = async (e) => {
  const msg = e.data;
  if (!msg || msg.type !== "run") return;
  // Which step failed, for the error message: download / init (loading the model) / separate (running it)
  let stage = "download";
  try {
    let model = await cachedModel();
    if (!model) {
      post({ type: "progress", stage: "download", loaded: 0, total: 0 });
      model = await downloadModel();
    }
    stage = "init";
    let ort, dsp, session;
    try {
      ({ ort, dsp, session } = await createSession(model, !!msg.gpu, !!msg.safe, msg.threads | 0));
    } catch (err) {
      const text = String(err && err.message || err);
      throw Object.assign(new Error(text), { code: /memory|alloc|RangeError/i.test(text) ? "memory" : navigator.onLine === false ? "offline" : "run" });
    }
    model = null;
    stage = "separate";
    const stems = await separate(ort, dsp, session, msg.left, msg.right);
    try { await session.release(); } catch (err) {}
    const transfer = stems.flatMap((s) => [s[0].buffer, s[1].buffer]).filter((b) => b instanceof ArrayBuffer);
    post({ type: "done", stems }, transfer);
  } catch (err) {
    const text = String(err && err.message || err);
    post({ type: "error", code: err.code || (/memory|alloc/i.test(text) ? "memory" : "run"), stage, message: text });
  }
};
