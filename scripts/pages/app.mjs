// Values shared by the articles and the app, read from the app's own files so the articles never
// disagree with it (WEBAPP_BASELINE.md §10-8). The build stops if a value cannot be found.
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(`../../public/bandstemmixer/${file}`, import.meta.url), "utf8");
function num(src, re, file) {
  const m = src.match(re);
  if (!m) throw new Error(`scripts/pages/app.mjs: ${re} not found in ${file}`);
  return Number(m[1]);
}

const html = read("index.html");
const encoder = read("encoder.js");
const separator = read("separator.js");

export const MODEL_MB = num(html, /const MODEL_MB = (\d+);/, "index.html");
const engine = html.match(/const ENGINE_MB = \{ cpu: (\d+), gpu: (\d+) \};/);
if (!engine) throw new Error("scripts/pages/app.mjs: ENGINE_MB not found in index.html");
export const ENGINE_MB = { cpu: Number(engine[1]), gpu: Number(engine[2]) };
export const MAX_MIN = num(html, /const MAX_SEC = (\d+) \* 60;/, "index.html");
export const MAX_MIN_LOW_MEM = num(html, /const MAX_SEC_LOW_MEM = (\d+) \* 60;/, "index.html");
export const FADER_MAX = Math.round(num(html, /range\.max = "([\d.]+)"/, "index.html") * 100);
export const KBPS = num(encoder, /const KBPS = (\d+);/, "encoder.js");
const CHUNK = num(separator, /const N = (\d+);/, "separator.js");
export const SR = 44100;
export const CHUNK_SEC = Math.round((CHUNK / SR) * 10) / 10; // 7.8
// Number of chunks for a song (they overlap by a quarter), as the progress bar counts them
export const chunksFor = (sec) => Math.ceil((sec * SR) / (CHUNK - Math.floor(CHUNK / 4)));
// MP3 size in MB for a song of `sec` seconds
export const mp3Mb = (sec) => (sec * KBPS * 1000) / 8 / 1e6;
