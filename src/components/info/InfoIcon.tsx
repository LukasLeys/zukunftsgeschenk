// Zusätzliche Strich-Icons für die Info-Seiten, im selben Raster wie components/Icon (24er, 2px, runde Enden).
import type { SVGProps } from "react";

export type InfoIconName =
  | "person" | "home" | "depot" | "card" | "calendar" | "search" | "book" | "scale" | "shield" | "doc" | "euro" | "hourglass";

const S = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const PATHS: Record<InfoIconName, React.ReactNode> = {
  person: <g {...S}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" /></g>,
  home: <g {...S}><path d="M3.5 11L12 4l8.5 7" /><path d="M6 9.5V20h12V9.5" /><path d="M10 20v-5h4v5" /></g>,
  depot: <g {...S}><path d="M4 20h16" /><path d="M6 16.5l4-4 3 2.5 5.5-6" /><path d="M15 9h3.5v3.5" /></g>,
  card: <g {...S}><rect x="4" y="3.5" width="16" height="17" rx="1.5" /><path d="M8 9h8M8 12.5h8M8 16h4.5" /></g>,
  calendar: <g {...S}><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></g>,
  search: <g {...S}><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" /></g>,
  book: <g {...S}><path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" /><path d="M12 6v13.5" /></g>,
  scale: <g {...S}><path d="M12 4v16M7 20h10M5 7h14" /><path d="M5 7l-2.5 6a2.5 2.5 0 0 0 5 0zM19 7l-2.5 6a2.5 2.5 0 0 0 5 0z" /></g>,
  shield: <g {...S}><path d="M12 3.5l7 2.5v5.5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z" /><path d="M9 12l2.2 2.2L15.5 10" /></g>,
  doc: <g {...S}><path d="M6 3.5h8l4 4V20.5H6z" /><path d="M14 3.5V8h4M9 12h6M9 15.5h6" /></g>,
  euro: <g {...S}><path d="M17.5 6.5A6.5 6.5 0 1 0 17.5 17.5" /><path d="M4.5 10.5h8M4.5 13.5h8" /></g>,
  hourglass: <g {...S}><path d="M7 3.5h10M7 20.5h10" /><path d="M8 3.5c0 4.5 8 5 8 8.5s-8 4-8 8.5M16 3.5c0 4.5-8 5-8 8.5s8 4 8 8.5" /></g>,
};

export function InfoIcon({ name, ...rest }: { name: InfoIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      {PATHS[name]}
    </svg>
  );
}

export default InfoIcon;
