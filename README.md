# Tuft UI

The shared look for every Tuft Life app: Support desk, Stock, Finance, Social, Bookings and the Home hub.
It's the support desk's design, packaged so every app can wear it:

- **Brand tokens**: colours, fonts, corners, shadows and motion, with light and dark modes (`css/tokens.css`)
- **Self-hosted fonts**: Chivo for the interface, Roboto for reading, Abril Fatface for the wordmark (`css/fonts.css`)
- **shadcn/ui theme**: makes existing shadcn components (Lovable apps, the booking admin) look right with no component changes (`css/shadcn.css`)
- **Tailwind presets** for v3 and v4
- **`<tuft-rail>`**: the shared teal rail with the logo, the app switcher and the signed-in person. Each app adds its own nav items.
- **Plain-HTML components**: buttons, fields, badges, cards and toasts for apps without React (`css/components.css`)

Open `index.html` to see everything in one place. The design rules (one ochre button per screen,
status colours, when to use which font) are in **DESIGN.md**.

## Using it

The CDN links below are pinned to a version tag (`@v0.1.0`). When you bump the version, update the tag in each app.

### Plain HTML (the support desk)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/timeads/tuft-ui@v0.1.0/css/tuft.css">
<script type="module" src="https://cdn.jsdelivr.net/gh/timeads/tuft-ui@v0.1.0/rail/tuft-rail.js"></script>

<div class="tuft-shell">
  <tuft-rail app="help" user-name="Kim Lee" sign-out-href="/logout">
    <a class="tuft-nav-item" href="/inbox" aria-current="page">
      <svg>…</svg><span class="tuft-nav-text">Inbox</span><span class="tuft-count">3</span>
    </a>
    <div class="tuft-nav-label">Store</div>
    <a class="tuft-nav-item" href="/shipping"><svg>…</svg><span class="tuft-nav-text">Shipping</span></a>
  </tuft-rail>
  <main>…</main>
</div>
```

### React + Tailwind v3 + shadcn (Lovable apps, the booking admin)

```bash
npm install github:timeads/tuft-ui#v0.1.0
```

```js
// tailwind.config.js
presets: [require("tuft-ui/tailwind/preset")],
```

```ts
// main.tsx: import once, before your own CSS
import "tuft-ui/css/fonts.css";
import "tuft-ui/css/tokens.css";
import "tuft-ui/css/shadcn.css";
import "tuft-ui/rail";
```

Then delete the app's own `:root { --background: …; --primary: … }` block from `index.css`, because
`shadcn.css` now provides those variables. Use the rail in your layout:

```tsx
<div className="tuft-shell">  {/* or your own grid: rail column + main */}
  <tuft-rail app="booking" user-name={user.name} sign-out-href="/logout">
    <NavLink className="tuft-nav-item" to="/sessions">
      <Calendar /><span className="tuft-nav-text">Sessions</span>
    </NavLink>
  </tuft-rail>
  <main>…</main>
</div>
```

React Router's `NavLink` sets `aria-current="page"` on the active link, and the rail styles it automatically.
`.tuft-shell` comes from `css/components.css`; import that too if you want it, or lay the page out yourself.

**Lovable apps that can't run `npm install`:** paste this into `index.html` instead, then ask
Lovable to "remove the colour variables from index.css and use the ones from tuft-ui":

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/timeads/tuft-ui@v0.1.0/css/fonts.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/timeads/tuft-ui@v0.1.0/css/tokens.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/timeads/tuft-ui@v0.1.0/css/shadcn.css">
<script type="module" src="https://cdn.jsdelivr.net/gh/timeads/tuft-ui@v0.1.0/rail/tuft-rail.js"></script>
```

### Tailwind v4

```css
@import "tailwindcss";
@import "tuft-ui/css/fonts.css";
@import "tuft-ui/css/tokens.css";
@import "tuft-ui/css/shadcn.css";
@import "tuft-ui/tailwind/v4.css";
```

## The rail

| Attribute | What it does |
|---|---|
| `app` | Which app this is: `hub`, `help`, `stock`, `finance`, `social`, `booking`. Sets the label under the logo and marks "You're here" in the switcher. |
| `user-name` | The signed-in person. Shows their initials and name at the bottom. |
| `sign-out-href` | Where "Sign out" goes. Leave it off to hide the link. |
| `domain` | Defaults to `tuftlife.com`. Apps live at `help.tuftlife.com`, `stock.tuftlife.com` and so on. |
| `logo` | Override the logo URL. You only need this if a bundler can't resolve `img/logo.png`. |

Nav items are plain links or buttons with `class="tuft-nav-item"`. Inside each one:
- an `<svg>` icon (17px; it turns ochre when active)
- `<span class="tuft-nav-text">` for the label
- optionally `<span class="tuft-count">` for a count

Mark the active item with `aria-current="page"` or `class="active"`. Add `data-phone="hide"` to an item to
leave it out of the phone tab bar. Group headings use `<div class="tuft-nav-label">`.

At different widths:
- **Wider than 1240px:** a 228px rail with the logo, labels and the signed-in person.
- **1240px and narrower:** a 64px icon rail.
- **760px and narrower:** a bottom tab bar with an **Apps** tab. That tab opens the switcher as a sheet.

To change the app list (add an app, point one at a temporary URL before the domain is live), set it
before the rail loads:

```js
import { TuftRail } from "tuft-ui/rail";
TuftRail.apps = TuftRail.apps.map((a) => (a.id === "help" ? { ...a, href: "https://helpdesk.example.workers.dev/" } : a));
```

## Dark mode

Pages follow the device's light/dark setting by default:
- **Opt out** (always light) with `<html data-theme="light">`. Do this for any app that hasn't been checked in dark yet.
- **Force dark** with `data-theme="dark"`, or shadcn's `class="dark"`.

Tailwind's `dark:` utilities only respond to the forced forms.

## Changing the design

1. Edit `tokens.json`.
2. Run `npm run build`. This regenerates `css/tokens.css` and `css/shadcn.css`; never edit those by hand.
3. Run `npm test`. It checks that every variable used is defined and that text colours meet WCAG AA contrast (4.5:1) in both modes.
4. Look at `index.html` in light and dark.
5. Commit, then tag a new version (`git tag v0.2.0 && git push --tags`) and bump the tag in each app.

Nothing secret ever goes in this repo. It's public, so that apps and the CDN can load it without keys.
