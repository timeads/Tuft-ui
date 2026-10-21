// Tailwind v3 preset. In tailwind.config.js:  presets: [require("tuft-ui/tailwind/preset")]
// and import "tuft-ui/css/fonts.css", "tuft-ui/css/tokens.css", "tuft-ui/css/shadcn.css" once in your app.
const hsl = (name) => `hsl(var(--${name}) / <alpha-value>)`;
const tuft = (name) => `var(--tuft-${name})`;

const brand = [
  "teal", "teal-2", "teal-3", "teal-ink", "teal-soft", "teal-soft-ink", "on-teal", "on-teal-2",
  "ochre", "ochre-hover", "ochre-text", "ochre-soft", "on-ochre",
  "brick", "brick-soft", "mint", "mint-soft", "mint-ink", "khaki",
  "stone", "stone-2", "stone-3", "panel", "surface", "sunken", "hover",
  "text", "text-2", "text-3", "border-strong", "out", "out-border", "note", "note-border", "select",
];

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // shadcn/ui names, so existing components restyle with no code changes
        border: hsl("border"),
        input: hsl("input"),
        ring: hsl("ring"),
        background: hsl("background"),
        foreground: hsl("foreground"),
        primary: { DEFAULT: hsl("primary"), foreground: hsl("primary-foreground") },
        secondary: { DEFAULT: hsl("secondary"), foreground: hsl("secondary-foreground") },
        destructive: { DEFAULT: hsl("destructive"), foreground: hsl("destructive-foreground") },
        muted: { DEFAULT: hsl("muted"), foreground: hsl("muted-foreground") },
        accent: { DEFAULT: hsl("accent"), foreground: hsl("accent-foreground") },
        popover: { DEFAULT: hsl("popover"), foreground: hsl("popover-foreground") },
        card: { DEFAULT: hsl("card"), foreground: hsl("card-foreground") },
        sidebar: {
          DEFAULT: hsl("sidebar-background"),
          foreground: hsl("sidebar-foreground"),
          primary: hsl("sidebar-primary"),
          "primary-foreground": hsl("sidebar-primary-foreground"),
          accent: hsl("sidebar-accent"),
          "accent-foreground": hsl("sidebar-accent-foreground"),
          border: hsl("sidebar-border"),
          ring: hsl("sidebar-ring"),
        },
        chart: Object.fromEntries([1, 2, 3, 4, 5].map((n) => [n, hsl(`chart-${n}`)])),
        // brand names for anything shadcn doesn't cover: bg-tuft-ochre-soft, text-tuft-teal ...
        tuft: Object.fromEntries(brand.map((n) => [n, tuft(n)])),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "var(--tuft-radius-sm)",
        xl: "var(--tuft-radius-lg)",
        "2xl": "var(--tuft-radius-xl)",
      },
      fontFamily: {
        sans: [tuft("font-ui")],
        read: [tuft("font-read")],
        display: [tuft("font-display")],
        mono: [tuft("font-mono")],
      },
      boxShadow: {
        sm: tuft("shadow-sm"),
        DEFAULT: tuft("shadow-sm"),
        float: tuft("shadow"),
      },
      transitionTimingFunction: { tuft: tuft("ease") },
    },
  },
};
