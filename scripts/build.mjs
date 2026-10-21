// Generates css/tokens.css and css/shadcn.css from tokens.json.
// `node scripts/build.mjs --check` fails if the committed files are out of date.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const tokens = JSON.parse(readFileSync(root + "tokens.json", "utf8"));
const check = process.argv.includes("--check");

const HEADER = "/* Generated from tokens.json by scripts/build.mjs — do not edit by hand. */\n";

// Dark mode follows the OS unless the page opts out with data-theme="light" (or class "light"),
// and can be forced with data-theme="dark" (or shadcn's class "dark").
const AUTO_DARK = ':root:not([data-theme="light"]):not(.light)';
const FORCED_DARK = ':root[data-theme="dark"], :root.dark';

function block(selector, decls, indent = "") {
  const body = decls.map(([k, v]) => `${indent}  ${k}: ${v};`).join("\n");
  return `${indent}${selector} {\n${body}\n${indent}}`;
}

function themed(lightDecls, darkDecls) {
  return [
    block(":root", lightDecls),
    `@media (prefers-color-scheme: dark) {\n${block(AUTO_DARK, darkDecls, "  ")}\n}`,
    block(FORCED_DARK, darkDecls),
  ].join("\n");
}

// ---- tokens.css: every brand token as --tuft-<name> ----
const t = (name) => `--tuft-${name}`;
const lightTokens = [
  ...Object.entries(tokens.color.light).map(([k, v]) => [t(k), v]),
  ...Object.entries(tokens.shadow.light).map(([k, v]) => [t(k), v]),
  ...Object.entries(tokens.font).map(([k, v]) => [t(`font-${k}`), v]),
  ...Object.entries(tokens.radius).map(([k, v]) => [t(k), v]),
  ...Object.entries(tokens.motion).map(([k, v]) => [t(k), v]),
  ["color-scheme", "light"],
];
const darkTokens = [
  ...Object.entries(tokens.color.dark).map(([k, v]) => [t(k), v]),
  ...Object.entries(tokens.shadow.dark).map(([k, v]) => [t(k), v]),
  ["color-scheme", "dark"],
];
const tokensCss = HEADER + themed(lightTokens, darkTokens) + "\n";

// ---- shadcn.css: shadcn/ui variable names as HSL triplets ----
function hexToHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  const round = (x) => Math.round(x * 10) / 10;
  return `${round(h)} ${round(s * 100)}% ${round(l * 100)}%`;
}

function resolve(ref, scheme) {
  if (ref.startsWith("#")) return ref;
  const value = (scheme === "dark" && tokens.color.dark[ref]) || tokens.color.light[ref];
  if (!value) throw new Error(`shadcn mapping points at unknown token "${ref}"`);
  return value;
}

const shadcnPairs = Object.entries(tokens.shadcn).filter(([k]) => !k.startsWith("$"));
const shadcnDecls = (scheme) => shadcnPairs.map(([k, ref]) => [`--${k}`, hexToHsl(resolve(ref, scheme))]);
const shadcnCss =
  HEADER +
  "/* shadcn/ui theme variables mapped onto the Tuft brand. Import after tokens.css. */\n" +
  themed([...shadcnDecls("light"), ["--radius", tokens.radius.radius]], shadcnDecls("dark")) +
  "\n";

const outputs = { "css/tokens.css": tokensCss, "css/shadcn.css": shadcnCss };
let stale = [];
for (const [file, content] of Object.entries(outputs)) {
  if (check) {
    let current = "";
    try { current = readFileSync(root + file, "utf8"); } catch {}
    if (current !== content) stale.push(file);
  } else {
    writeFileSync(root + file, content);
    console.log("wrote", file);
  }
}
if (stale.length) {
  console.error(`Out of date: ${stale.join(", ")}. Run \`npm run build\` and commit the result.`);
  process.exit(1);
}
