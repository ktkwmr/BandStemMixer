// Fixed cache name: fetches are network first, so the cache only needs to hold the latest copy.
// Older caches of this app (e.g. "bandstemmixer-<build>") are removed on activate.
const PREFIX = "bandstemmixer-";
const CACHE = PREFIX + "cache";
const CORE = ["./", "index.html", "separator.js", "mixer.js", "ja/", "manifest.json", "THIRD_PARTY_LICENSES.md", "icons/icon.svg"];
// The AI model is kept by separator.js in its own cache (bandstemmixer-model-v2), which activate below leaves alone.
// Older model caches (-v1: the 6-part model used at first) are removed on activate.
const KEEP = ["bandstemmixer-model-v2"];
// Libraries loaded from a CDN with a pinned version (WEBAPP_BASELINE.md §3-10): the content of such a URL
// never changes, so it is cached on first use and served from the cache, which makes it work offline.
// Also add the host to connect-src in public/_headers. Leave empty when no CDN library is used.
const ORT = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/";
const DEMUCS_WEB = "https://cdn.jsdelivr.net/npm/demucs-web@1.0.2/src/";
const CDN = [
  // CPU (WebAssembly) build
  ORT + "ort.wasm.min.mjs", ORT + "ort-wasm-simd-threaded.mjs", ORT + "ort-wasm-simd-threaded.wasm",
  // WebGPU build (used when the browser has WebGPU)
  ORT + "ort.webgpu.min.mjs", ORT + "ort-wasm-simd-threaded.asyncify.mjs", ORT + "ort-wasm-simd-threaded.asyncify.wasm",
  // demucs-web: the STFT and the model's tensor layout (separator.js imports processor.js)
  DEMUCS_WEB + "processor.js", DEMUCS_WEB + "constants.js", DEMUCS_WEB + "fft.js",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        CORE.map((url) =>
          fetch(new Request(url, { cache: "reload" }))
            .then((res) => res.ok && cache.put(url, res))
            .catch(() => {})
        )
      )
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      // Only touch this app's caches (other apps on the same origin share Cache Storage)
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE && !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first (always the latest when online), cache as offline fallback.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Pinned CDN files: cache first
  if (CDN.includes(req.url)) {
    event.respondWith(
      caches.match(req.url).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req.url, copy));
            }
            return res;
          })
      )
    );
    return;
  }
  if (new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(new Request(req.url, { cache: "no-cache" }))
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((r) => r || (req.mode === "navigate" ? caches.match("index.html") : undefined))
      )
  );
});
