// Strich-Icons aus dem Entwurf (24er-Raster, 2px Strich, runde Enden). Server-tauglich.
import type { SVGProps } from "react";

export type IconName =
  | "arrow" | "info" | "bag" | "menu" | "down" | "plus" | "check" | "x" | "qr" | "gift" | "mail" | "env"
  | "seal" | "direct" | "forever" | "truck" | "lock" | "bow" | "scroll";

const S = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const PATHS: Record<IconName, React.ReactNode> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" {...S} strokeWidth={2.2} />,
  info: <g {...S}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.01" /></g>,
  bag: <g {...S}><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" /><path d="M9 10V7a3 3 0 0 1 6 0v3" /></g>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" {...S} strokeWidth={2.2} />,
  down: <path d="M6 9l6 6 6-6" {...S} strokeWidth={2.2} />,
  plus: <path d="M12 5v14M5 12h14" {...S} strokeWidth={2.2} />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" {...S} strokeWidth={2.4} />,
  x: <path d="M6 6l12 12M18 6L6 18" {...S} strokeWidth={2.2} />,
  qr: (
    <g {...S}>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20.5 14v.01M14 20.5h.01M17 17h4v4h-4" />
    </g>
  ),
  gift: (
    <g {...S}>
      <rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" />
      <path d="M12 8c-1.5-3-5-4-5.5-1.5S9.5 8 12 8zM12 8c1.5-3 5-4 5.5-1.5S14.5 8 12 8z" />
    </g>
  ),
  mail: <g {...S}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6.5l8.5 6.5 8.5-6.5" /></g>,
  env: <g {...S}><rect x="3" y="6" width="18" height="13" rx="1.5" /><path d="M3 7l9 7 9-7M3 18l6.5-6M21 18l-6.5-6" /></g>,
  seal: <g {...S}><rect x="3" y="6" width="18" height="13" rx="1.5" /><path d="M3 7l9 7 9-7" /><circle cx="12" cy="14" r="2.6" fill="currentColor" /></g>,
  direct: <g {...S}><path d="M3 12h11M10 8l4 4-4 4" /><path d="M15 6.5l3.5-2.5L22 6.5V19h-7z" /></g>,
  forever: <path d="M7.5 8.5c-2 0-3.5 1.6-3.5 3.5s1.5 3.5 3.5 3.5c3.5 0 5.5-7 9-7 2 0 3.5 1.6 3.5 3.5s-1.5 3.5-3.5 3.5c-3.5 0-5.5-7-9-7z" {...S} />,
  truck: <g {...S}><path d="M2 6h12v10H2zM14 9h4.5l3.5 3.5V16h-8" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="17.5" cy="17.5" r="1.8" /></g>,
  lock: <g {...S}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>,
  bow: <g {...S}><path d="M12 11C9.5 6 5 4 3.5 5.5S4 12 12 12zM12 11c2.5-5 7-7 8.5-5.5S20 12 12 12z" /><path d="M11 12.5l-3.5 7.5 2.5-.6 1 2 2-8.5M13 12.5l3.5 7.5-2.5-.6-1 2" /></g>,
  scroll: <path d="M12 4v15M6 13l6 6 6-6" {...S} strokeWidth={2.2} />,
};

export function Icon({ name, ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      {PATHS[name]}
    </svg>
  );
}

/** Bildzeichen der Wortmarke: Geschenk mit Pfeil nach oben. */
export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" {...props}>
      <rect x="4" y="15" width="32" height="22" rx="4" fill="#d81b6a" />
      <rect x="17" y="15" width="6" height="22" fill="#ffd23f" />
      <rect x="4" y="21" width="32" height="5" fill="#ffd23f" />
      <path d="M11 13l9-8.5 9 8.5" fill="none" stroke="#d81b6a" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
