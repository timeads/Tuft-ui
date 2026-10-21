export interface TuftApp {
  id: string;
  name: string;
  /** Short label under the logo; defaults to `name`. */
  sub?: string;
  /** Subdomain of the rail's `domain` ("" for the hub). Ignored when `href` is set. */
  subdomain?: string;
  href?: string;
  icon?: "home" | "chat" | "package" | "chart" | "megaphone" | "calendar" | "grid";
}

export declare class TuftRail extends HTMLElement {
  static apps: TuftApp[];
  appUrl(app: TuftApp): string;
  toggleSwitcher(trigger?: HTMLElement): void;
}

export interface TuftRailAttributes {
  app?: string;
  domain?: string;
  "user-name"?: string;
  "sign-out-href"?: string;
  logo?: string;
  class?: string;
  className?: string;
  children?: unknown;
}

declare global {
  interface HTMLElementTagNameMap {
    "tuft-rail": TuftRail;
  }
  // React 18 / 19 JSX support for <tuft-rail>
  namespace JSX {
    interface IntrinsicElements {
      "tuft-rail": TuftRailAttributes;
    }
  }
}
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "tuft-rail": TuftRailAttributes;
    }
  }
}
