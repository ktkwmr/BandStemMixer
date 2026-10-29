#!/usr/bin/env node
// Builds a copy of the app that runs as a claude.ai Artifact, so a working version can be shown
// before the app is deployed (WEBAPP_BASELINE.md §12-12). Output: .preview/ (not committed).
//
// Changes from public/<slug>/index.html:
// - drops <!DOCTYPE>/<html>/<head>/<body> (the Artifact adds its own) and sets <title> to the app name
// - drops the Service Worker registration, the manifest link, and the analytics beacon
//   (the Artifact frame allows neither service workers nor scripts from other hosts)
// - copies the files the page loads with relative URLs (FILES below); publish them with the page as `files`
//
// Usage: node scripts/build-preview.mjs
// Then publish .preview/index.html as an Artifact, with each of FILES as a supporting file.
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SLUG = "bandstemmixer";
const NAME = "Band Stem Mixer";
// Files the page fetches or starts with a relative URL
const FILES = ["separator.js", "mixer.js", "encoder.js", "THIRD_PARTY_LICENSES.md", "icons/icon.svg"];

const src = new URL(`../public/${SLUG}/`, import.meta.url);
const out = new URL("../.preview/", import.meta.url);
let html = (await readFile(new URL("index.html", src), "utf8")).replace(/\r\n/g, "\n");

function drop(re, label) {
  if (!re.test(html)) throw new Error(`build-preview: ${label} not found in index.html`);
  html = html.replace(re, "");
}
drop(/^<!DOCTYPE html>\n/i, "doctype");
drop(/^<html[^>]*>\n/m, "<html>");
drop(/^<head>\n/m, "<head>");
drop(/^\s*<meta charset="UTF-8" \/>\n/m, "charset");
drop(/^\s*<meta name="viewport"[^>]*>\n/m, "viewport");
drop(/^\s*<link rel="manifest"[^>]*>\n/m, "manifest link");
drop(/^\s*<link rel="apple-touch-icon"[^>]*>\n/m, "apple-touch-icon link");
drop(/^<\/head>\n/m, "</head>");
drop(/^<body>\n/m, "<body>");
drop(/<script>\s*if \("serviceWorker" in navigator\)[\s\S]*?<\/script>\n/, "Service Worker registration");
drop(/<!-- Cloudflare Web Analytics[^\n]*\n<script[^>]*cloudflareinsights[^>]*><\/script>\n/, "analytics beacon");
drop(/^<\/body>\n/m, "</body>");
drop(/^<\/html>\n?/m, "</html>");
html = html.replace(/<title>[^<]*<\/title>/, `<title>${NAME}</title>`);

await mkdir(out, { recursive: true });
await writeFile(new URL("index.html", out), html);
for (const f of FILES) {
  await mkdir(dirname(fileURLToPath(new URL(f, out))), { recursive: true });
  await copyFile(new URL(f, src), new URL(f, out));
}
console.log(`Wrote .preview/index.html and ${FILES.join(", ")}`);
