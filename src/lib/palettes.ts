// Palette registry. Each palette maps two accent colours onto the fretboard:
// `box` (the dominant note colour) and `root` (the accent pop). The first entry
// is the default — its colours are also baked into index.css for the initial
// paint. Dark-mode variants are derived in darkVariant().

export type Palette = { id: string; name: string; box: string; root: string };

export const PALETTES: Palette[] = [
  { id: "grape-berry", name: "Grape & Berry", box: "#5a189a", root: "#ff4d6d" },
  { id: "ultraviolet", name: "Ultraviolet", box: "#7c3aed", root: "#06b6d4" },
  { id: "terracotta", name: "Terracotta", box: "#2a9d8f", root: "#e76f51" },
  { id: "amber-rose", name: "Amber & Rose", box: "#f59e0b", root: "#e11d48" },
];

// Pick black or white text for readability against a hex background (YIQ).
export function readableFg(hex: string): string {
  const [r, g, b] = hexToRgb255(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#1a1626" : "#ffffff";
}

// Derive a dark-mode pastel of a colour: same hue, lightened and softened in
// OKLCH so the palette reads well on a dark background instead of going muddy.
export function darkVariant(hex: string): string {
  const [, a, b] = rgbToOklab(hexToRgb01(hex));
  const c = Math.hypot(a, b);
  const h = Math.atan2(b, a);
  const cd = Math.min(c * 0.55, 0.105);
  const [r, g, bl] = oklabToRgb255([0.82, cd * Math.cos(h), cd * Math.sin(h)]);
  return rgbToHex(r, g, bl);
}

function hexToRgb255(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function hexToRgb01(hex: string): [number, number, number] {
  return hexToRgb255(hex).map((v) => v / 255) as [number, number, number];
}

function rgbToHex(r: number, g: number, b: number): string {
  const hex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toSrgb = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

function rgbToOklab([r, g, b]: [number, number, number]): [number, number, number] {
  const lr = toLinear(r),
    lg = toLinear(g),
    lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToRgb255([L, a, b]: [number, number, number]): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [lr, lg, lb].map((c) => Math.round(Math.min(1, Math.max(0, toSrgb(c))) * 255)) as [
    number,
    number,
    number,
  ];
}
