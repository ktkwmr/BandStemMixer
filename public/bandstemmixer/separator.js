// Separation worker (module worker, started by index.html).
// Downloads the AI model once (kept in Cache Storage, so later runs need no download), runs
// htdemucs_6s with ONNX Runtime Web, and sends back the 6 stems as 16-bit PCM.
//
// Model: htdemucs_6s (Demucs v4, Meta, MIT) exported to ONNX by StemSplit (demucs-onnx, MIT).
//   input  "mix"   float32 [1, 2, 343980]  (7.8 s of 44.1 kHz stereo)
//   output "stems" float32 [1, 6, 2, 343980] in the order drums, bass, other, vocals, guitar, piano
// Longer songs are cut into 7.8 s chunks that overlap by a quarter and are cross-faded
// (the same overlap-add as demucs-onnx's inference.py).
//
// Messages from the page:
//   { type: "run", left: Float32Array, right: Float32Array, gpu: boolean, safe: boolean }  (44.1 kHz)
// Messages to the page:
//   { type: "progress", stage: "lib" | "download" | "init" | "separate", loaded?, total?, done?, chunks?, elapsed? }
//   { type: "backend", name: "webgpu" | "wasm", threads, safe }
//   { type: "done", stems: [[Int16Array L, Int16Array R] x 6] }  (model order; shared memory when isolated)
//   { type: "error", code: "offline" | "download" | "memory" | "run", stage: "download" | "init" | "separate", message }

// Keep these in sync with MODEL_URL / MODEL_CACHE in index.html and CDN in sw.js
const ORT_BASE = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";
const MODEL_URL = "https://huggingface.co/StemSplitio/htdemucs-6s-onnx/resolve/main/htdemucs_6s_fp16weights.onnx";
const MODEL_CACHE = "bandstemmixer-model-v1";

const N = 343980; // samples per chunk (7.8 s at 44.1 kHz), fixed by the exported graph
const OVERLAP = Math.floor(N / 4);
const STRIDE = N - OVERLAP;
const STEMS = 6;

// Triangular fade-in / fade-out over the overlap (demucs-onnx's _make_transition_window)
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
  let bytes = total ? new Uint8Array(total) : new Uint8Array(160 * 1024 * 1024);
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

// gpu: try WebGPU. safe: settings that need less memory (one thread, no memory arena or pre-planned
// memory pattern, basic graph optimization), used when the normal settings failed.
// A backend that failed to start cannot be retried in the same worker (ONNX Runtime keeps the failed
// state), so the page starts a fresh worker for the safe attempt instead of falling back here.
async function createSession(modelBytes, gpu, safe) {
  post({ type: "progress", stage: "lib" });
  // The WebGPU build includes the CPU (WebAssembly) backend too, but its .wasm file is about twice as large
  const ort = await import(ORT_BASE + (gpu ? "ort.webgpu.min.mjs" : "ort.wasm.min.mjs"));
  ort.env.wasm.wasmPaths = ORT_BASE;
  // Several threads only work on a cross-origin isolated page (COOP / COEP in public/_headers)
  const threads = safe || !self.crossOriginIsolated ? 1 : Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1));
  ort.env.wasm.numThreads = threads;
  post({ type: "progress", stage: "init" });
  const opts = safe
    ? { graphOptimizationLevel: "basic", enableCpuMemArena: false, enableMemPattern: false }
    : { graphOptimizationLevel: "all" };
  const ep = gpu && "gpu" in navigator ? "webgpu" : "wasm";
  const session = await ort.InferenceSession.create(modelBytes, { ...opts, executionProviders: [ep] });
  post({ type: "backend", name: ep, threads, safe: !!safe });
  return { ort, session };
}

const toInt16 = (x) => {
  const v = x < -1 ? -1 : x > 1 ? 1 : x;
  return v < 0 ? Math.round(v * 32768) : Math.round(v * 32767);
};

async function separate(ort, session, left, right) {
  const total = left.length;
  const chunks = Math.max(1, Math.ceil(total / STRIDE));
  const inName = session.inputNames[0];
  const outName = session.outputNames[0];
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
  const input = new Float32Array(2 * N);
  const t0 = Date.now();
  post({ type: "progress", stage: "separate", done: 0, chunks, elapsed: 0 });

  for (let i = 0; i < chunks; i++) {
    const start = i * STRIDE;
    const len = Math.min(N, total - start);
    const last = i === chunks - 1;
    input.fill(0);
    input.set(left.subarray(start, start + len), 0);
    input.set(right.subarray(start, start + len), N);
    const result = await session.run({ [inName]: new ort.Tensor("float32", input, [1, 2, N]) });
    const tensor = result[outName];
    const data = tensor.location && tensor.location !== "cpu" ? await tensor.getData(true) : tensor.data;

    // Samples before `fin` are complete after this chunk; the rest overlap the next chunk
    const fin = last ? len : Math.min(STRIDE, len);
    for (let k = 0; k < STEMS * 2; k++) {
      const src = k * N; // data is [1, 6, 2, N]: stem k >> 1, channel k & 1
      const dst = out[k >> 1][k & 1];
      const tk = tail[k];
      for (let j = 0; j < fin; j++) {
        let v = data[src + j] * WINDOW[j];
        let w = WINDOW[j];
        if (j < tailLen) { v += tk[j]; w += tailW[j]; }
        dst[start + j] = w > 1e-8 ? toInt16(v / w) : 0;
      }
      for (let j = fin; j < len; j++) tk[j - fin] = data[src + j] * WINDOW[j];
    }
    if (!last) {
      for (let j = fin; j < len; j++) tailW[j - fin] = WINDOW[j];
      tailLen = len - fin;
    }
    if (tensor.dispose) tensor.dispose();
    post({ type: "progress", stage: "separate", done: i + 1, chunks, elapsed: Date.now() - t0 });
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
    let ort, session;
    try {
      ({ ort, session } = await createSession(model, !!msg.gpu, !!msg.safe));
    } catch (err) {
      const text = String(err && err.message || err);
      throw Object.assign(new Error(text), { code: /memory|alloc|RangeError/i.test(text) ? "memory" : navigator.onLine === false ? "offline" : "run" });
    }
    model = null;
    stage = "separate";
    const stems = await separate(ort, session, msg.left, msg.right);
    try { await session.release(); } catch (err) {}
    const transfer = stems.flatMap((s) => [s[0].buffer, s[1].buffer]).filter((b) => b instanceof ArrayBuffer);
    post({ type: "done", stems }, transfer);
  } catch (err) {
    const text = String(err && err.message || err);
    post({ type: "error", code: err.code || (/memory|alloc/i.test(text) ? "memory" : "run"), stage, message: text });
  }
};
