#!/usr/bin/env node
// Takes the app screenshots used in the guide page:
//   public/bandstemmixer/images/guide/{en,ja}-{song,progress,mixer,network,phone}.png
// The song is made up (scripts/guide-song.mjs), so there is no copyright issue. The AI model is not
// used: a stand-in for separator.js returns the song's four parts, which are known exactly, after a
// short fake progress. Everything else is the real app.
// Requires Playwright and a Chromium browser:
//   npm install --no-save playwright && npx playwright install chromium
// Then:
//   node scripts/render-guide-images.mjs
// Re-run it when the app's look changes.
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { SR, makeParts, mixParts } from "./guide-song.mjs";

const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");
const PUBLIC = fileURLToPath(new URL("../public/", import.meta.url));
const SONG_JS = fileURLToPath(new URL("./guide-song.mjs", import.meta.url));
const OUT = join(PUBLIC, "bandstemmixer/images/guide/");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".md": "text/markdown; charset=utf-8" };
const PATH = { en: "/bandstemmixer/?lang=en", ja: "/bandstemmixer/ja/" };
const SECONDS = 60;

// Stand-in for separator.js: reports the GPU, counts through the chunks like the real worker
// (7.8 s chunks that overlap by a quarter), then returns the parts of the made-up song
const STUB = `import { makeParts } from "/__guide/guide-song.mjs";
self.onmessage = async (e) => {
  const msg = e.data;
  if (!msg || msg.type !== "run") return;
  self.postMessage({ type: "backend", name: "webgpu", threads: 0, safe: false });
  const n = msg.left.length, chunks = Math.ceil(n / 257985);
  for (let i = 0; i < chunks; i++) {
    await new Promise((r) => setTimeout(r, 250));
    self.postMessage({ type: "progress", stage: "separate", done: i + 1, chunks, elapsed: (i + 1) * 6000 });
  }
  const parts = makeParts(n);
  const stems = ["drums", "bass", "other", "vocals"].map((k) => parts[k].map((ch) => {
    const o = new Int16Array(n);
    for (let i = 0; i < n; i++) o[i] = Math.max(-32768, Math.min(32767, Math.round(ch[i] * 32767)));
    return o;
  }));
  self.postMessage({ type: "done", stems }, stems.flatMap((s) => [s[0].buffer, s[1].buffer]));
};
`;

// Minimal static server for public/ (the app needs http:// for its workers), with the stand-in
const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path === "/bandstemmixer/separator.js") return res.writeHead(200, { "Content-Type": "text/javascript" }).end(STUB);
  if (path === "/__guide/guide-song.mjs") return res.writeHead(200, { "Content-Type": "text/javascript" }).end(await readFile(SONG_JS));
  if (path.endsWith("/")) path += "index.html";
  const file = normalize(join(PUBLIC, path));
  if (!file.startsWith(PUBLIC)) return res.writeHead(403).end();
  try {
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" }).end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;

// 16-bit stereo WAV of the mixed song
function wav([L, R]) {
  const n = L.length, buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4);
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), 46 + i * 4);
  }
  return buf;
}
const audio = wav(mixParts(makeParts(SECONDS * SR)));
// Passed as a buffer: a file path with Japanese characters does not reach the page when the system locale is POSIX
const SONG = {
  en: { name: "practice-song.wav", mimeType: "audio/wav", buffer: audio },
  ja: { name: "練習曲.wav", mimeType: "audio/wav", buffer: audio },
};

// Numbered markers drawn next to controls, matching the numbered lists in the guide.
// side: "left" | "right" | "inside" (top-right corner of the element) | "corner" (on the top-right corner)
// | "below" (under the left edge)
async function addMarkers(page, targets) {
  await page.evaluate((targets) => {
    targets.forEach(([sel, n, side]) => {
      const el = [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().width > 0);
      if (!el) throw new Error("marker target not found: " + sel);
      const r = el.getBoundingClientRect();
      const m = document.createElement("div");
      m.textContent = n;
      m.className = "guide-marker";
      const size = 22;
      const x = side === "left" ? r.left - size - 4 : side === "inside" ? r.right - size - 6 : side === "corner" ? r.right - size / 2 - 2 : side === "below" ? r.left : r.right + 4;
      const y = side === "inside" ? r.top + 6 : side === "corner" ? r.top - size / 2 + 2 : side === "below" ? r.bottom + 4 : r.top + r.height / 2 - size / 2;
      Object.assign(m.style, {
        position: "absolute", left: x + scrollX + "px", top: y + scrollY + "px", width: size + "px", height: size + "px", zIndex: 99999,
        borderRadius: "50%", background: "#e11d48", color: "#fff", font: "700 13px/22px system-ui, sans-serif",
        textAlign: "center", boxShadow: "0 0 0 2px #fff", pointerEvents: "none",
      });
      document.body.appendChild(m);
    });
  }, targets);
}

async function open(page, lang) {
  await page.route("https://static.cloudflareinsights.com/**", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
  await page.goto(origin + PATH[lang]);
  await page.setInputFiles("#fileInput", SONG[lang]);
  await page.waitForFunction(() => !document.getElementById("runBtn").disabled);
}
// Separate, then set up the mixer like a bass player's practice: the bass muted, the vocals a little lower
async function separate(page, { progressShot, started } = {}) {
  if (!started) await page.click("#runBtn");
  if (progressShot) {
    await page.waitForFunction(() => /^\s*4\s*\//.test(document.getElementById("detail").textContent));
    await progressShot();
  }
  await page.waitForSelector("#mixer:not([hidden])", { timeout: 60000 });
  await page.waitForFunction(() => !document.getElementById("progress").offsetParent);
  await page.locator(".strip").nth(1).locator(".ms .chip").first().click();
  await page.locator(".strip").nth(0).locator("input[type=range]").fill("0.8");
  // From 0:20, where every part plays (the vocals start at 0:16)
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); });
  for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowRight");
  await page.click("#playBtn");
  await page.waitForTimeout(1500);
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); });
  await page.mouse.move(0, 0);
  // Let the "done" message fade
  await page.waitForFunction(() => document.getElementById("toast").hidden, null, { timeout: 10000 });
}

async function shot(page, selector, file, pad = 30) {
  const b = await page.locator(selector).boundingBox();
  await page.screenshot({ path: join(OUT, file), fullPage: true, clip: { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - 10), width: b.width + pad * 2, height: b.height + 20 } });
  console.log("Wrote images/guide/" + file);
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (const lang of ["en", "ja"]) {
  const locale = lang === "ja" ? "ja-JP" : "en-US";
  // Computer: the song panel, the progress, and the mixer
  const ctx = await browser.newContext({ serviceWorkers: "block", viewport: { width: 1100, height: 900 }, deviceScaleFactor: 2, locale });
  const page = await ctx.newPage();
  await open(page, lang);
  await addMarkers(page, [["#drop", 1, "inside"], ["#songInfo", 2, "inside"], ["#runBtn", 3, "inside"], [".model", 4, "below"]]);
  await shot(page, ".panel:not(.out)", `${lang}-song.png`, 12);
  await page.evaluate(() => document.querySelectorAll(".guide-marker").forEach((m) => m.remove()));
  await separate(page, { progressShot: () => shot(page, ".panel:not(.out)", `${lang}-progress.png`, 12) });
  await addMarkers(page, [
    ["#playBtn", 1, "left"], ["#timeNow", 2, "right"], [".strip .sname", 3, "left"], [".strip:nth-child(2) .ms .chip", 4, "left"],
    [".strip .ms .chip + .chip", 5, "corner"], [".strip .vol input", 6, "below"], [".strip .save-btn", 7, "corner"],
    [".mix-foot .vol > span", 8, "left"], ["#resetMix", 9, "corner"], ["#saveMix", 10, "corner"],
  ]);
  await shot(page, ".panel.out", `${lang}-mixer.png`);
  await ctx.close();

  // Phone: the question before the first download, and the mixer
  const phone = await browser.newContext({ ...devices["Pixel 7"], serviceWorkers: "block", locale });
  const pp = await phone.newPage();
  await open(pp, lang);
  await pp.click("#runBtn");
  await pp.waitForSelector("#netDlg[open]");
  await pp.waitForTimeout(300);
  await pp.screenshot({ path: join(OUT, `${lang}-network.png`) });
  console.log(`Wrote images/guide/${lang}-network.png`);
  await pp.click("#netOk");
  await separate(pp, { started: true });
  await pp.evaluate(() => {
    const top = document.querySelector(".panel.out").getBoundingClientRect().top + scrollY;
    const head = document.querySelector(".topbar").offsetHeight;
    window.scrollTo(0, top - head - 12);
  });
  await pp.waitForTimeout(300);
  // From the top of the screen to the bottom of the mixer
  const bottom = await pp.evaluate(() => document.querySelector(".panel.out").getBoundingClientRect().bottom + 16);
  await pp.screenshot({ path: join(OUT, `${lang}-phone.png`), clip: { x: 0, y: 0, width: pp.viewportSize().width, height: Math.min(bottom, pp.viewportSize().height) } });
  console.log(`Wrote images/guide/${lang}-phone.png`);
  await phone.close();
}
await browser.close();
server.close();
