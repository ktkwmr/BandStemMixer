// App screenshots in the articles (made by scripts/render-guide-images.mjs)
import { readFileSync } from "node:fs";

const IMAGES = new URL("../../public/bandstemmixer/images/guide/", import.meta.url);
const SRC = "/bandstemmixer/images/guide/";

// Width and height from the PNG header, so the page reserves the right space before the image loads
function size(file) {
  const buf = readFileSync(new URL(file, IMAGES));
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
// A screenshot that opens at full size when tapped. half: a 2x screenshot shown at its real size
export const img = (lang, name, alt, { half } = {}) => {
  const file = `${lang}-${name}.png`;
  const { w, h } = size(file);
  const style = half ? ` style="max-width:${w / 2}px"` : "";
  return `<a href="${SRC}${file}"><img src="${SRC}${file}" alt="${alt}" width="${w}" height="${h}" loading="lazy" decoding="async"${style}></a>`;
};
