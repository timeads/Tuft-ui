// Tailwind v3 colour scales re-pointed at the Tuft brand, for apps whose code uses Tailwind's stock
// palette (text-gray-500, bg-red-50, border-amber-200 …) rather than shadcn names. Dropping this
// into theme.extend.colors restyles those classes everywhere without touching the markup:
//
//   gray / slate / zinc / neutral / stone → warm stone neutrals
//   red / rose                            → brick (danger only)
//   amber / yellow / orange               → ochre (pending, warnings)
//   green / emerald                       → mint (good)
//   blue / sky / indigo                   → teal (info)
//
// Values are hex (not CSS variables) so opacity modifiers like bg-red-500/20 keep working, which
// also means these follow light mode only. Anchor steps come straight from tokens.json; the steps
// between them are blended from the anchors.
//
//   const tuftPalettes = require("tuft-ui/tailwind/palettes");
//   theme: { extend: { colors: { ...tuftPalettes } } }
const tokens = require("../tokens.json");
const c = tokens.color.light;

function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (p, s) => (p >> s) & 255;
  const m = (s) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t);
  return "#" + [16, 8, 0].map((s) => m(s).toString(16).padStart(2, "0")).join("");
}

const neutral = {
  50: c.panel,
  100: c.sunken,
  200: c["stone-2"],
  300: c.stone,
  400: mix(c.stone, c["text-3"], 0.5),
  500: c["text-3"],
  600: c["text-2"],
  700: mix(c["text-2"], c.text, 0.5),
  800: c.text,
  900: mix(c.text, "#000000", 0.3),
  950: mix(c.text, "#000000", 0.55),
};

const brick = {
  50: c["brick-soft"],
  100: mix(c["brick-soft"], c.brick, 0.12),
  200: mix(c["brick-soft"], c.brick, 0.3),
  300: mix(c["brick-soft"], c.brick, 0.5),
  400: mix(c["brick-soft"], c.brick, 0.75),
  500: c.brick,
  600: c.brick,
  700: mix(c.brick, "#000000", 0.15),
  800: mix(c.brick, "#000000", 0.3),
  900: mix(c.brick, "#000000", 0.45),
  950: mix(c.brick, "#000000", 0.6),
};

const ochre = {
  50: c.note,
  100: c["ochre-soft"],
  200: c["note-border"],
  300: mix(c["note-border"], c.ochre, 0.4),
  400: mix(c["note-border"], c.ochre, 0.7),
  500: c.ochre,
  600: mix(c["ochre-hover"], c["ochre-text"], 0.75), // 600 is mostly used as text; keep it readable
  700: c["ochre-text"],
  800: mix(c["ochre-text"], "#000000", 0.2),
  900: mix(c["ochre-text"], "#000000", 0.38),
  950: mix(c["ochre-text"], "#000000", 0.55),
};

const mint = {
  50: mix(c["mint-soft"], "#ffffff", 0.5),
  100: c["mint-soft"],
  200: c.mint,
  300: mix(c.mint, c["mint-ink"], 0.25),
  400: mix(c.mint, c["mint-ink"], 0.5),
  500: mix(c.mint, c["mint-ink"], 0.7),
  600: mix(c.mint, c["mint-ink"], 0.85),
  700: mix(c.mint, c["mint-ink"], 0.93),
  800: c["mint-ink"],
  900: mix(c["mint-ink"], "#000000", 0.25),
  950: mix(c["mint-ink"], "#000000", 0.45),
};

const teal = {
  50: mix(c["teal-soft"], "#ffffff", 0.5),
  100: c["teal-soft"],
  200: mix(c["teal-soft"], c["teal-3"], 0.2),
  300: mix(c["teal-soft"], c["teal-3"], 0.4),
  400: mix(c["teal-soft"], c["teal-3"], 0.65),
  500: mix(c["teal-soft"], c["teal-3"], 0.85),
  600: c["teal-3"],
  700: c["teal-2"],
  800: c.teal,
  900: c["teal-ink"],
  950: mix(c["teal-ink"], "#000000", 0.3),
};

module.exports = {
  gray: neutral, slate: neutral, zinc: neutral, neutral, stone: neutral,
  red: brick, rose: brick,
  amber: ochre, yellow: ochre, orange: ochre,
  green: mint, emerald: mint,
  blue: teal, sky: teal, indigo: teal,
};
