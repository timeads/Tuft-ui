import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const root = new URL("..", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
const tokens = JSON.parse(read("tokens.json"));

const defined = new Set(
  [...(read("css/tokens.css") + read("css/shadcn.css")).matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]),
);

test("every var() used by the CSS, presets and rail is defined", () => {
  const sources = ["css/base.css", "css/components.css", "tailwind/v4.css", "rail/tuft-rail.js"];
  const missing = [];
  for (const file of sources) {
    for (const [, name] of read(file).matchAll(/var\((--[\w-]+)/g)) {
      if (!defined.has(name)) missing.push(`${file}: ${name}`);
    }
  }
  // the v3 preset builds names at runtime, so check what it actually produces
  const preset = createRequire(import.meta.url)("../tailwind/preset.cjs");
  const walk = (v) => (typeof v === "string" ? [v] : Object.values(v).flatMap(walk));
  for (const value of walk(preset.theme.extend)) {
    for (const [, name] of value.matchAll(/var\((--[\w-]+)/g)) {
      if (!defined.has(name)) missing.push(`preset: ${name}`);
    }
  }
  assert.deepEqual(missing, []);
});

test("dark mode only overrides tokens that exist in light mode", () => {
  for (const key of Object.keys(tokens.color.dark)) assert.ok(key in tokens.color.light, key);
});

// WCAG 2.1 contrast
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const pairs = [
  // [text, background, minimum]
  ["text", "bg", 4.5],
  ["text-2", "bg", 4.5],
  ["text-3", "bg", 4.5],
  ["text-3", "panel", 4.5],
  ["ochre-text", "bg", 4.5],
  ["ochre-text", "ochre-soft", 4.5],
  ["on-ochre", "ochre", 4.5],
  ["on-teal", "teal", 4.5],
  ["on-teal-2", "teal", 4.5],
  ["teal-soft-ink", "teal-soft", 4.5],
  ["mint-ink", "mint-soft", 4.5],
  ["brick", "brick-soft", 4.5],
  ["brick", "bg", 4.5],
];

for (const scheme of ["light", "dark"]) {
  const c = (k) => (scheme === "dark" && tokens.color.dark[k]) || tokens.color.light[k];
  for (const [fg, bg, min] of pairs) {
    test(`${scheme}: ${fg} on ${bg} meets ${min}:1`, () => {
      const ratio = contrast(c(fg), c(bg));
      assert.ok(ratio >= min, `${ratio.toFixed(2)}:1`);
    });
  }
}
