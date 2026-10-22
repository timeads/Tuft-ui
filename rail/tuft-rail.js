// <tuft-rail> — the shared teal rail every Tuft Life app wears.
//
//   <tuft-rail app="help" user-name="Kim Lee" sign-out-href="/logout">
//     <a class="tuft-nav-item" href="/inbox" aria-current="page">
//       <svg>…</svg><span class="tuft-nav-text">Inbox</span><span class="tuft-count">3</span>
//     </a>
//     <div class="tuft-nav-label">Store</div>
//     …
//   </tuft-rail>
//
// The rail draws the logo, the app switcher and the signed-in person; each app supplies its own
// nav items as children. Desktop: 228px rail. ≤1240px: 64px icon rail. ≤760px: bottom tab bar
// with an "Apps" tab that opens the switcher as a sheet.
//
// Attributes: app (current app id), domain (default tuftlife.com), user-name, sign-out-href, logo.
// To change the app list, set TuftRail.apps before the first rail connects.
//
// Phones: items marked data-phone="hide" leave the tab bar and appear under "More in <app>" in the
// Apps sheet; tapping one clicks the original, so client-side routers keep working.
// Sign out: the link fires a cancelable "tuft-signout" event first; call preventDefault() to handle
// it in JS (e.g. supabase.auth.signOut()) instead of following sign-out-href.

const ICONS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  chart: '<path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
};

const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

const DEFAULT_APPS = [
  { id: "hub", name: "Home", sub: "Tuft Life", subdomain: "", icon: "home" },
  { id: "help", name: "Support desk", subdomain: "help", icon: "chat" },
  { id: "stock", name: "Stock", subdomain: "stock", icon: "package" },
  { id: "finance", name: "Finance", subdomain: "finance", icon: "chart" },
  { id: "social", name: "Social", subdomain: "social", icon: "megaphone" },
  { id: "booking", name: "Bookings", subdomain: "booking", icon: "calendar" },
];

// Light-DOM styles for the nav items apps pass in (::slotted can't reach their icons and counts).
const LIGHT_CSS = `
tuft-rail { display: block; min-height: 0; }
.tuft-nav-item {
  display: flex; align-items: center; gap: 11px; padding: 8px 10px; border-radius: var(--tuft-radius-sm, 7px);
  color: var(--tuft-on-teal-2); text-decoration: none; font: 500 13.5px var(--tuft-font-ui); cursor: pointer;
  background: none; border: 0; width: 100%; text-align: left;
  transition: background .15s var(--tuft-ease), color .15s var(--tuft-ease);
}
.tuft-nav-item:hover { background: var(--tuft-teal-2); color: var(--tuft-on-teal); }
.tuft-nav-item[aria-current="page"], .tuft-nav-item.active {
  background: var(--tuft-teal-3); color: #fff; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .06);
}
.tuft-nav-item[aria-current="page"] svg, .tuft-nav-item.active svg { color: var(--tuft-ochre); }
.tuft-nav-item svg { width: 17px; height: 17px; flex: none; }
.tuft-nav-item:focus-visible { outline: 2px solid var(--tuft-ochre); outline-offset: 2px; }
.tuft-nav-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tuft-count {
  margin-left: auto; min-width: 22px; height: 20px; padding: 0 6px; border-radius: 999px; display: inline-grid; place-items: center;
  font: 700 11.5px var(--tuft-font-ui); color: var(--tuft-on-teal-2); background: rgba(255, 255, 255, .07);
}
.tuft-nav-item[aria-current="page"] .tuft-count, .tuft-nav-item.active .tuft-count { background: var(--tuft-ochre); color: var(--tuft-on-ochre); }
.tuft-nav-label {
  font: 600 10.5px var(--tuft-font-ui); text-transform: uppercase; letter-spacing: .16em;
  color: var(--tuft-on-teal-2); padding: 16px 10px 7px; opacity: .8;
}
@media (max-width: 1240px) {
  .tuft-nav-item { width: 44px; height: 42px; padding: 0; justify-content: center; position: relative; margin: 0 auto 4px; }
  .tuft-nav-text, .tuft-nav-label { display: none; }
  .tuft-count { position: absolute; top: 3px; right: 1px; min-width: 17px; height: 16px; font-size: 10px; padding: 0 4px; margin: 0; }
}
@media (max-width: 760px) {
  .tuft-nav-item {
    flex: 1 1 0; min-width: 0; width: auto; height: auto; margin: 0; flex-direction: column; gap: 3px;
    padding: 6px 2px; font-size: 10.5px; text-align: center;
  }
  .tuft-nav-text { display: block; max-width: 100%; }
  .tuft-count { top: 2px; right: calc(50% - 22px); }
  .tuft-nav-item[data-phone="hide"] { display: none; }
}
`;

const SHADOW_CSS = `
:host { display: block; height: 100%; min-height: 0; }
* { box-sizing: border-box; }
.rail {
  position: relative; height: 100%; width: 228px; display: flex; flex-direction: column; gap: 1px;
  padding: 18px 12px 12px; background: var(--tuft-teal); color: var(--tuft-on-teal); font-family: var(--tuft-font-ui);
}
/* cut-pile texture: a faint grid of yarn loops, like the back of a tufted rug */
.rail::before {
  content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .07;
  background-image: radial-gradient(circle at 50% 50%, var(--tuft-on-teal) 0 1.1px, transparent 1.6px);
  background-size: 7px 7px;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 55%, #000 100%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 55%, #000 100%);
}
.rail > * { position: relative; }
button { font: inherit; color: inherit; }
svg { width: 17px; height: 17px; flex: none; }

.brand {
  display: grid; justify-items: center; gap: 12px; padding: 2px 10px 26px; margin: 0; border: 0; background: none;
  cursor: pointer; text-align: center; border-radius: var(--tuft-radius-sm); width: 100%;
}
.brand:focus-visible { outline: 2px solid var(--tuft-ochre); outline-offset: 2px; }
.logo { width: 112px; height: auto; aspect-ratio: 587 / 580; display: block; filter: drop-shadow(0 2px 6px rgba(0,0,0,.25)); }
.sub {
  display: inline-flex; align-items: center; gap: 8px;
  font: 700 10.5px var(--tuft-font-ui); letter-spacing: .22em; text-transform: uppercase; color: #e3ad55;
}
.sub-text { margin-right: -.22em; } /* cancel the trailing letter-space so the word sits centred */
.sub svg { width: 13px; height: 13px; transition: transform .15s var(--tuft-ease); }
.brand:hover .sub svg { transform: translateY(1px); }

nav { display: flex; flex-direction: column; gap: 1px; overflow-y: auto; min-height: 0; flex: 0 1 auto; margin: 0 -4px; padding: 0 4px;
  scrollbar-width: thin; scrollbar-color: var(--tuft-teal-3) transparent; }
.spacer { flex: 1; }

.me { display: flex; align-items: center; gap: 10px; padding: 12px 8px 4px; border-top: 1px solid rgba(255,255,255,.09); margin-top: 10px; font-size: 13px; }
.me[hidden] { display: none; }
.who { display: grid; min-width: 0; flex: 1; }
.name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.signout { color: var(--tuft-on-teal-2); font-size: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; border-radius: 4px; flex: none; white-space: nowrap; }
.signout svg { width: 13px; height: 13px; }
.signout:hover { color: var(--tuft-ochre); }
.signout:focus-visible { outline: 2px solid var(--tuft-ochre); outline-offset: 2px; }
.avatar {
  width: 30px; height: 30px; border-radius: 50%; background: var(--tuft-ochre); color: var(--tuft-on-ochre);
  display: grid; place-items: center; font-weight: 700; font-size: 11.5px; flex: none; letter-spacing: .02em;
}
.apps-tab { display: none; }

/* ---------- App switcher ---------- */
.switcher {
  margin: 0; inset: auto; position: fixed; width: 244px; padding: 6px; border: 1px solid var(--tuft-border);
  border-radius: var(--tuft-radius-lg); background: var(--tuft-surface); color: var(--tuft-text);
  box-shadow: var(--tuft-shadow); font-family: var(--tuft-font-ui);
}
.switcher:popover-open { animation: pop .18s var(--tuft-ease); }
.switcher.fallback-open { display: block; z-index: 1000; }
.switcher-head { font: 600 11.5px var(--tuft-font-ui); color: var(--tuft-text-3); padding: 8px 10px 6px; }
.app {
  display: flex; align-items: center; gap: 11px; padding: 8px 10px; border-radius: var(--tuft-radius-sm);
  color: var(--tuft-text); text-decoration: none; font-size: 13.5px; font-weight: 500;
}
.app:hover { background: var(--tuft-hover); color: var(--tuft-text); }
.app:focus-visible { outline: 2px solid var(--tuft-ochre); outline-offset: -2px; }
.app .tile {
  width: 30px; height: 30px; border-radius: var(--tuft-radius-sm); display: grid; place-items: center;
  background: var(--tuft-sunken); color: var(--tuft-text-2); flex: none;
}
.app .tile svg { width: 16px; height: 16px; }
.app[aria-current="page"] { font-weight: 700; }
.app[aria-current="page"] .tile { background: var(--tuft-teal); color: var(--tuft-ochre); }
.app .here { margin-left: auto; font-size: 11.5px; font-weight: 600; color: var(--tuft-ochre-text); }
.sheet-me, .more { display: none; }
.more-head { font: 600 11.5px var(--tuft-font-ui); color: var(--tuft-text-3); padding: 12px 10px 6px; border-top: 1px solid var(--tuft-border); margin-top: 6px; }
.more-item {
  display: flex; align-items: center; gap: 11px; width: 100%; padding: 10px; border: 0; border-radius: var(--tuft-radius-sm);
  background: none; color: var(--tuft-text); font: 500 15px var(--tuft-font-ui); text-align: left; cursor: pointer;
}
.more-item:hover { background: var(--tuft-hover); }
.more-item:focus-visible { outline: 2px solid var(--tuft-ochre); outline-offset: -2px; }
.more-item svg { width: 17px; height: 17px; color: var(--tuft-text-2); }
.more-item[aria-current="page"] { font-weight: 700; }
.more-item[aria-current="page"] svg { color: var(--tuft-ochre-text); }
@keyframes pop { from { opacity: 0; transform: translateY(-4px); } }

/* ---------- Laptops: icon rail ---------- */
@media (max-width: 1240px) {
  .rail { width: 64px; padding: 14px 8px 10px; align-items: center; }
  .brand { padding: 0 0 18px; justify-items: center; }
  .logo { width: 40px; }
  .sub, .who, .me .avatar { display: none; }
  .me { border-top: 0; justify-content: center; padding: 8px 0 0; }
  .me .signout { width: 40px; height: 40px; justify-content: center; border-radius: var(--tuft-radius-sm); }
  .me .signout:hover { background: var(--tuft-teal-2); }
  .me .signout svg { width: 17px; height: 17px; }
  .me .signout span { display: none; }
  nav { margin: 0; padding: 0; width: 100%; }
}

/* ---------- Phones: bottom tab bar ---------- */
@media (max-width: 760px) {
  :host { height: auto; }
  .rail {
    width: 100%; height: auto; flex-direction: row; align-items: stretch; gap: 0;
    padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
  }
  .rail::before { display: none; }
  .brand, .spacer, .me { display: none; }
  nav { flex-direction: row; flex: 1 1 auto; overflow: visible; }
  .apps-tab {
    display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 0 0 auto; min-width: 56px;
    padding: 6px 2px; border: 0; background: none; color: var(--tuft-on-teal-2); font: 500 10.5px var(--tuft-font-ui);
    border-radius: var(--tuft-radius-sm); cursor: pointer;
  }
  .apps-tab:hover { background: var(--tuft-teal-2); color: var(--tuft-on-teal); }
  .apps-tab:focus-visible { outline: 2px solid var(--tuft-ochre); outline-offset: 2px; }
  .switcher {
    left: 8px !important; right: 8px; top: auto !important; bottom: calc(8px + env(safe-area-inset-bottom)); width: auto;
    padding: 8px;
  }
  .switcher:popover-open { animation: sheet .25s var(--tuft-ease); }
  .app { padding: 10px; font-size: 15px; }
  .switcher { max-height: calc(100dvh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom)); overflow-y: auto; }
  .more:not(:empty) { display: block; }
  .sheet-me { display: flex; align-items: center; gap: 10px; margin-top: 6px; padding: 12px 10px 6px; border-top: 1px solid var(--tuft-border); font-size: 14px; }
  .sheet-me .name { flex: 1; }
  .sheet-me .signout { color: var(--tuft-text-2); font-size: 13px; padding: 6px 8px; }
  .sheet-me .signout:hover { color: var(--tuft-brick); background: var(--tuft-hover); }
  @keyframes sheet { from { opacity: 0; transform: translateY(16px); } }
}
@media (prefers-reduced-motion: reduce) {
  .switcher:popover-open { animation: none; }
}
`;

function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

let lightStylesAdded = false;
let uid = 0;

export class TuftRail extends HTMLElement {
  static apps = DEFAULT_APPS;
  static observedAttributes = ["app", "domain", "user-name", "sign-out-href", "logo"];

  constructor() {
    super();
    const id = `tuft-switcher-${++uid}`;
    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>${SHADOW_CSS}</style>
      <div class="rail" part="rail">
        <button class="brand" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="${id}">
          <img class="logo" alt="" />
          <span class="sub"><span class="sub-text"></span>${icon("chevron")}</span>
        </button>
        <nav aria-label="Main"><slot></slot></nav>
        <div class="spacer"></div>
        <div class="me" hidden>
          <span class="avatar" aria-hidden="true"></span>
          <span class="who"><span class="name"></span></span>
          <a class="signout" title="Sign out">${icon("logout")}<span>Sign out</span></a>
        </div>
        <button class="apps-tab" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="${id}">${icon("grid")}<span>Apps</span></button>
      </div>
      <div class="switcher" id="${id}" popover="auto" role="dialog" aria-label="Switch app">
        <div class="switcher-head">Tuft Life apps</div>
        <div class="apps"></div>
        <div class="more"></div>
        <div class="sheet-me">
          <span class="avatar" aria-hidden="true"></span>
          <span class="name"></span>
          <a class="signout">${icon("logout")}<span>Sign out</span></a>
        </div>
      </div>`;
    this._switcher = this.shadowRoot.querySelector(".switcher");
    this._triggers = [...this.shadowRoot.querySelectorAll(".brand, .apps-tab")];
    this._supportsPopover = typeof this._switcher.showPopover === "function";
    if (!this._supportsPopover) this._switcher.removeAttribute("popover");
    this._switcher.hidden = !this._supportsPopover;

    for (const trigger of this._triggers) trigger.addEventListener("click", () => this.toggleSwitcher(trigger));
    this._switcher.addEventListener("toggle", (e) => this._setExpanded(e.newState === "open"));
    this._onDocClick = (e) => { if (!e.composedPath().includes(this)) this._closeFallback(); };
    this._onKey = (e) => { if (e.key === "Escape") this._closeFallback(); };
    for (const link of this.shadowRoot.querySelectorAll(".signout")) {
      link.addEventListener("click", (e) => {
        const ev = new CustomEvent("tuft-signout", { bubbles: true, composed: true, cancelable: true });
        if (!this.dispatchEvent(ev)) e.preventDefault();
      });
    }
  }

  connectedCallback() {
    if (!lightStylesAdded) {
      const style = document.createElement("style");
      style.dataset.tuftRail = "";
      style.textContent = LIGHT_CSS;
      document.head.prepend(style); // first, so an app's own CSS can override it
      lightStylesAdded = true;
    }
    if (!this._supportsPopover) {
      document.addEventListener("click", this._onDocClick);
      document.addEventListener("keydown", this._onKey);
    }
    this._render();
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._onDocClick);
    document.removeEventListener("keydown", this._onKey);
  }

  attributeChangedCallback() {
    if (this.isConnected) this._render();
  }

  /** Where an app lives: https://<subdomain>.<domain>, or an app's own `href` if it sets one. */
  appUrl(app) {
    if (app.href) return app.href;
    const domain = this.getAttribute("domain") || "tuftlife.com";
    return `https://${app.subdomain ? app.subdomain + "." : ""}${domain}/`;
  }

  toggleSwitcher(trigger = this._triggers[0]) {
    const open = this._supportsPopover ? this._switcher.matches(":popover-open") : !this._switcher.hidden;
    if (open) return this._supportsPopover ? this._switcher.hidePopover() : this._closeFallback();
    const r = trigger.getBoundingClientRect();
    const wide = window.matchMedia("(min-width: 1241px)").matches;
    this._switcher.style.left = `${wide ? r.left + 8 : r.right + 8}px`;
    this._switcher.style.top = `${wide ? r.bottom - 12 : r.top}px`;
    this._renderMore();
    if (this._supportsPopover) this._switcher.showPopover();
    else { this._switcher.hidden = false; this._switcher.classList.add("fallback-open"); this._setExpanded(true); }
    this._switcher.querySelector('.app[aria-current="page"], .app')?.focus();
  }

  /** Phone sheet: the nav items hidden from the tab bar, rebuilt on each open so they stay current. */
  _renderMore() {
    const more = this.shadowRoot.querySelector(".more");
    const hidden = [...this.querySelectorAll('.tuft-nav-item[data-phone="hide"]')];
    if (!hidden.length) return more.replaceChildren();
    const head = document.createElement("div");
    head.className = "more-head";
    const current = TuftRail.apps.find((a) => a.id === this.getAttribute("app"));
    head.textContent = current ? `More in ${current.name}` : "More";
    more.replaceChildren(
      head,
      ...hidden.map((item) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "more-item";
        const svg = item.querySelector("svg");
        if (svg) b.append(svg.cloneNode(true));
        b.append((item.querySelector(".tuft-nav-text") || item).textContent.trim());
        if (item.getAttribute("aria-current") === "page" || item.classList.contains("active")) b.setAttribute("aria-current", "page");
        b.addEventListener("click", () => {
          if (this._supportsPopover) this._switcher.hidePopover();
          else this._closeFallback();
          item.click();
        });
        return b;
      }),
    );
  }

  _closeFallback() {
    if (this._supportsPopover || this._switcher.hidden) return;
    this._switcher.hidden = true;
    this._switcher.classList.remove("fallback-open");
    this._setExpanded(false);
  }

  _setExpanded(open) {
    for (const t of this._triggers) t.setAttribute("aria-expanded", String(open));
  }

  _render() {
    const root = this.shadowRoot;
    const apps = TuftRail.apps;
    const current = apps.find((a) => a.id === this.getAttribute("app")) || apps[0];

    const logo = root.querySelector(".logo");
    logo.src = this.getAttribute("logo") || new URL("../img/logo.png", import.meta.url).href;
    root.querySelector(".sub-text").textContent = current.sub || current.name;
    root.querySelector(".brand").setAttribute("aria-label", `Tuft the World ${current.name}. Switch app`);

    const list = root.querySelector(".apps");
    list.replaceChildren(
      ...apps.map((app) => {
        const a = document.createElement("a");
        a.className = "app";
        a.href = this.appUrl(app);
        a.innerHTML = `<span class="tile">${icon(app.icon || "grid")}</span>`;
        a.append(app.name);
        if (app === current) {
          a.setAttribute("aria-current", "page");
          const here = document.createElement("span");
          here.className = "here";
          here.textContent = "You're here";
          a.append(here);
        }
        return a;
      }),
    );

    const name = (this.getAttribute("user-name") || "").trim();
    const signOut = this.getAttribute("sign-out-href");
    root.querySelector(".me").hidden = !name && !signOut;
    for (const el of root.querySelectorAll(".name")) el.textContent = name;
    for (const el of root.querySelectorAll(".avatar")) {
      el.textContent = initials(name);
      el.style.visibility = name ? "" : "hidden";
    }
    for (const el of root.querySelectorAll(".signout")) {
      el.hidden = !signOut;
      if (signOut) el.href = signOut;
    }
    root.querySelector(".sheet-me").style.visibility = name || signOut ? "" : "hidden";
  }
}

if (!customElements.get("tuft-rail")) customElements.define("tuft-rail", TuftRail);
