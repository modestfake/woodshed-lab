// Generates the raster icon set (PWA, Apple, favicon.ico) from public/favicon.svg,
// the single source of truth for the mark. Re-run with `pnpm icons` after editing it.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const pub = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");
const rounded = await readFile(resolve(pub, "favicon.svg"), "utf8");

// Square, full-bleed variant: Apple and Android mask their own corners, so handing
// them the rounded mark would leave transparent gaps inside the OS shape.
const square = rounded
  .replace(/<clipPath[\s\S]*?<\/clipPath>/, "")
  .replace(/\s*clip-path="url\(#a\)"/, "");

// Render at an explicit pixel size so sharp rasterises the vector crisply at the
// target rather than upscaling the 120px viewBox.
const render = (svg, size) =>
  sharp(Buffer.from(svg.replace("<svg ", `<svg width="${size}" height="${size}" `)))
    .png()
    .toBuffer();

const targets = [
  ["apple-touch-icon.png", square, 180],
  ["icon-192.png", square, 192],
  ["icon-512.png", square, 512],
  ["icon-maskable-512.png", square, 512],
];
for (const [name, svg, size] of targets) {
  await writeFile(resolve(pub, name), await render(svg, size));
  console.log(`wrote ${name} (${size}x${size})`);
}

// favicon.ico bundles 16/32/48 from the rounded mark for legacy fallbacks.
const ico = [16, 32, 48];
await writeFile(
  resolve(pub, "favicon.ico"),
  await pngToIco(await Promise.all(ico.map((s) => render(rounded, s)))),
);
console.log(`wrote favicon.ico (${ico.join("/")})`);
