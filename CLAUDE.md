# CLAUDE.md — Tuft UI

The shared look for the Tuft Life internal apps (Support desk, Stock, Finance, Social, Bookings, Home hub).
It's the support desk's design system, packaged. **Read DESIGN.md before any visual change**; README.md
covers how apps consume it.

## What lives where

- `tokens.json` — the single source of truth for colours (light + dark), fonts, radii, shadows, motion,
  and how shadcn/ui's names map onto them
- `scripts/build.mjs` — generates `css/tokens.css` (`--tuft-*` vars) and `css/shadcn.css` (HSL triplets)
- `css/fonts.css`, `css/base.css`, `css/components.css` — hand-written; `css/tuft.css` bundles them for plain-HTML apps
- `tailwind/preset.cjs` (v3) and `tailwind/v4.css` — Tailwind themes over the same variables
- `rail/tuft-rail.js` — the `<tuft-rail>` web component (shadow DOM for its own parts, a small
  light-DOM stylesheet for the nav items apps pass in); `rail/tuft-rail.d.ts` types it for React
- `index.html` — the preview page; it's also how to eyeball a change
- `fonts/`, `img/logo.png` — brand assets

## Commands

- `npm run build` — regenerate css from tokens.json (commit the output; the CDN serves the repo as-is)
- `npm test` — fails if generated css is stale, a `var(--…)` is undefined, or a text pair misses WCAG AA

## Rules

1. **Never hand-edit `css/tokens.css` or `css/shadcn.css`.** Change `tokens.json` and rebuild.
2. **Public repo: nothing secret, ever** — no keys, customer data, or business numbers.
3. **No dependencies.** Plain CSS and one vanilla JS module, loadable from a CDN with no build step.
   Every app — plain HTML, React, Lovable — must be able to use it.
4. **Stay framework-free.** The rail is a web component so it works everywhere; don't make it React-only.
5. **Brand variables are prefixed `--tuft-`** so they never collide with an app's own or shadcn's names.
6. **Every merge is a release.** Apps follow `@1` (the latest 1.x tag), so tag `vX.Y.Z` after merging, purge jsDelivr
   (README, "Changing the design") and say what changed. Breaking changes need a new major version (`@2`).
7. Keep the support desk (timeads/helpdesk) and this repo in step — if a token changes here, it should change there.

## Conventions

- Copy tone: warm, plain, craft-studio friendly.
- Commits: conventional-ish, present tense ("add tuft-rail phone sheet").
- Test light, dark, and the three rail widths (>1240, ≤1240, ≤760) when touching the rail.
