// DIE Geschenkkarte aus dem Entwurf als React-Komponente.
// Server-tauglich: keine Hooks, kein „use client“, funktioniert in Server- und Client-Komponenten.
import type { CSSProperties, ReactNode } from "react";
import { motifById, type Emblem, type Paper, type Shape } from "@/lib/catalog";
import { eur } from "./format";

export type { Paper };
export type CardSide = "front" | "inside";
export type CardEnvelope = "none" | "white" | "gold";
export type CardSize = "sm" | "md" | "lg";

export interface GiftCardProps {
  /** Motiv-ID aus lib/catalog (z. B. „sterne“). Unbekannte IDs fallen auf „sterne“ zurück. */
  motif: string;
  paper: Paper;
  /** Geschenkbetrag in Euro (ganze Euro). */
  amount: number;
  childName: string;
  sender: string;
  /** Eigene Botschaft; leer = Gruß des Motivs. */
  message?: string;
  side?: CardSide;
  envelope?: CardEnvelope;
  size?: CardSize;
  /** Einlösecode für die Innenseite, z. B. „ZG-4KP7-29XM“. */
  code?: string;
  /** Optional: Bank-QR-Code (SVG-Element) für die Innenseite, wenn die IBAN bekannt ist. */
  qr?: ReactNode;
  /** Kleines Schild oben rechts auf der Vorderseite, z. B. „PDF“. */
  badge?: string;
  /** Eigener Alternativtext. Standard: beschreibender Text aus den Props. */
  label?: string;
  /** true = rein dekorativ (aria-hidden), wenn daneben schon Text steht. */
  decorative?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Innenfläche je Motiv (Entwurf: „Mond & Sterne“ dunkel, „Nach oben“ pink, sonst weiß). */
const PANEL: Record<string, "white" | "tinte" | "pink"> = { mond: "tinte", pfeil: "pink" };

export const SHAPE_LABEL: Record<Shape, string> = {
  a6: "Klappkarte A6",
  post: "Postkarte quer",
  square: "Quadrat",
  tag: "Geschenkanhänger",
};

export const PAPER_LABEL: Record<Paper, string> = {
  pink: "Pink",
  gelb: "Gelb",
  rosa: "Zartrosa",
  tinte: "Nacht",
  gold: "Gold",
};

/** CSS-Variablen für eine Papier-Farbfläche (Swatches, Mini-Karten). */
export const paperSwatch = (p: Paper): CSSProperties =>
  ({
    "--dc": p === "rosa" ? "var(--rosa-2)" : `var(--${p})`,
    "--dp": `var(--pat-${p})`,
    "--mc": p === "rosa" ? "var(--rosa-2)" : `var(--${p})`,
    "--mp": `var(--pat-${p})`,
  }) as CSSProperties;

/* ---------- Embleme (48er-Raster, Farben über --e1/--e2 der Innenfläche) ---------- */
const E1 = "var(--e1)";
const E2 = "var(--e2)";

function Star({ cx, cy, r, fill, stroke, sw }: { cx: number; cy: number; r: number; fill: string; stroke?: string; sw?: number }) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.44 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return (
    <polygon
      points={pts.join(" ")}
      style={{ fill, stroke: stroke ?? "none", strokeWidth: sw, strokeLinejoin: "round" }}
    />
  );
}

const f = (c: string): CSSProperties => ({ fill: c });
const s = (c: string, w: number, extra: CSSProperties = {}): CSSProperties => ({ fill: "none", stroke: c, strokeWidth: w, ...extra });
const fs = (fc: string, sc: string, w: number): CSSProperties => ({ fill: fc, stroke: sc, strokeWidth: w });
const round: CSSProperties = { strokeLinecap: "round", strokeLinejoin: "round" };

export function EmblemArt({ emblem }: { emblem: Emblem }) {
  switch (emblem) {
    case "star":
      return <Star cx={24} cy={25} r={21} fill={E2} stroke={E1} sw={2.6} />;
    case "stars":
      return (
        <>
          <Star cx={24} cy={20} r={15} fill={E2} stroke={E1} sw={2.4} />
          <Star cx={9} cy={39} r={6.5} fill={E1} />
          <Star cx={39} cy={40} r={5.5} fill={E1} />
        </>
      );
    case "tree":
      return (
        <>
          <path d="M15 23l9-9 9 9M10 33l14-14 14 14M5 43l19-19 19 19" style={s(E1, 4.4, round)} />
          <Star cx={24} cy={7} r={6} fill={E2} stroke={E1} sw={1.6} />
        </>
      );
    case "mobile":
      return (
        <>
          <path d="M5 5h38" style={s(E1, 3, { strokeLinecap: "round" })} />
          <path d="M11 5v14M24 5v20M37 5v11" style={s(E1, 1.6)} />
          <circle cx="11" cy="24" r="5" style={fs(E2, E1, 2)} />
          <Star cx={24} cy={33} r={8.5} fill={E2} stroke={E1} sw={2} />
          <path d="M38 16a7 7 0 1 0 5.5 11.5A5.5 5.5 0 0 1 38 16z" style={{ ...fs(E2, E1, 2), strokeLinejoin: "round" }} />
        </>
      );
    case "moon":
      return (
        <>
          <path d="M28 5a19 19 0 1 0 15 31A16 16 0 0 1 28 5z" style={f(E1)} />
          <Star cx={38} cy={10} r={4.5} fill={E1} />
          <Star cx={43} cy={22} r={3} fill={E1} />
          <Star cx={8} cy={8} r={3} fill={E1} />
        </>
      );
    case "candle":
      return (
        <>
          <rect x="17" y="20" width="14" height="25" rx="2" style={fs(E2, E1, 2.4)} />
          <path d="M17 29h14M17 36h14" style={s(E1, 1.6)} />
          <path d="M24 3c4.5 5.5 5.5 8.5 5.5 10.5a5.5 5.5 0 0 1-11 0C18.5 11.5 19.5 8.5 24 3z" style={f(E1)} />
          <path d="M24 16v4" style={s(E1, 2)} />
        </>
      );
    case "cake":
      return (
        <>
          <rect x="6" y="26" width="36" height="17" rx="3" style={fs(E2, E1, 2.4)} />
          <path d="M6 33c4 3.5 8-3 12 0s8-3 12 0 8 2 12-1" style={s(E1, 2.4, { strokeLinecap: "round" })} />
          <path d="M15 26v-9M24 26v-9M33 26v-9" style={s(E1, 3, { strokeLinecap: "round" })} />
          <g style={f(E1)}>
            <ellipse cx="15" cy="11" rx="2.6" ry="3.8" />
            <ellipse cx="24" cy="11" rx="2.6" ry="3.8" />
            <ellipse cx="33" cy="11" rx="2.6" ry="3.8" />
          </g>
        </>
      );
    case "chalice":
      return (
        <>
          <circle cx="24" cy="7" r="5.5" style={fs(E2, E1, 2)} />
          <path d="M11 12h26c0 10-5.5 16-13 16S11 22 11 12z" style={f(E1)} />
          <path d="M24 28v9M14 44h20M17 44c0-3.5 3-6.5 7-6.5s7 3 7 6.5" style={s(E1, 2.6, round)} />
        </>
      );
    case "dove":
      return (
        <>
          <path
            d="M5 29c8 1 14-3 18-9 1-6 5-10 10-10 3 0 5 2 6 4l5 1-5 2.5c0 9-7 16-17 17-7 1-13-1-17-5.5z"
            style={{ ...fs(E2, E1, 2.2), strokeLinejoin: "round" }}
          />
          <path d="M15 27c4-7 10-11 17-12" style={s(E1, 2, { strokeLinecap: "round" })} />
          <circle cx="35" cy="14" r="1.6" style={f(E1)} />
          <path d="M20 40l-3 6M26 40l-1 6" style={s(E1, 2.2, { strokeLinecap: "round" })} />
          <Star cx={9} cy={9} r={4.5} fill={E1} />
        </>
      );
    case "arrow":
      return (
        <>
          <path d="M24 3L43 22H31.5v18h-15V22H5z" style={f(E1)} />
          <path d="M13 45h22" style={s(E2, 4, { strokeLinecap: "round" })} />
        </>
      );
    case "confetti":
      return (
        <>
          <g style={f(E1)}>
            <rect x="5" y="9" width="9" height="4.5" rx="1.5" transform="rotate(-28 9 11)" />
            <rect x="33" y="35" width="9" height="4.5" rx="1.5" transform="rotate(24 37 37)" />
            <circle cx="40" cy="10" r="3.4" />
            <circle cx="8" cy="38" r="2.6" />
          </g>
          <g style={fs(E2, E1, 1.4)}>
            <circle cx="24" cy="24" r="7" />
            <rect x="31" y="17" width="8" height="4" rx="1.4" transform="rotate(40 35 19)" />
          </g>
          <Star cx={15} cy={27} r={5} fill={E1} />
          <Star cx={31} cy={6} r={4.5} fill={E2} stroke={E1} sw={1.2} />
        </>
      );
  }
}

export function GiftCard({
  motif,
  paper,
  amount,
  childName,
  sender,
  message,
  side = "front",
  envelope = "none",
  size = "md",
  code,
  qr,
  badge,
  label,
  decorative,
  className,
  style,
}: GiftCardProps) {
  const m = motifById(motif) ?? motifById("sterne")!;
  const panel = PANEL[m.id] ?? "white";
  const inside = side === "inside";
  const name = childName.trim() || "…";
  const line = message?.trim() || m.line;
  const amt = eur(amount);
  const long = amount >= 1000;
  const envText = envelope === "gold" ? ", im Goldkuvert" : envelope === "white" ? ", mit Kuvert" : "";
  const alt =
    label ??
    `${inside ? "Innenseite der " : ""}Geschenkkarte „${m.name}“ (${PAPER_LABEL[paper]}) für ${name} über ${amt}${inside ? "" : envText}`;

  const a11y = decorative ? { "aria-hidden": true as const } : { role: "img", "aria-label": alt };

  return (
    <div
      className={["gc-wrap", `gc-wrap--${m.shape}`, `gc-size-${size}`, className].filter(Boolean).join(" ")}
      style={style}
      {...a11y}
    >
      {envelope !== "none" && !inside && <span className={envelope === "gold" ? "env env--gold" : "env"} />}
      <div className={`gc gc--${m.shape} paper-${paper} panel-${panel}`}>
        {inside ? (
          <div className="gc-in">
            <p className="in-for">Für {name}</p>
            <p className="in-msg">{line}</p>
            <p className="in-from">{sender}</p>
            <div className="in-box">
              {qr ? <span className="in-qr">{qr}</span> : null}
              <p className="in-code">
                Geschenk für die Eltern: <b>{amt}</b>
                {qr ? (
                  "Bank-QR-Code zum Überweisen"
                ) : code ? (
                  <>
                    Einlösecode <b>{code}</b>
                  </>
                ) : (
                  "Den Einlösecode bekommt ihr nach dem Kauf."
                )}
              </p>
            </div>
          </div>
        ) : (
          <>
            {badge ? <span className="gc-badge">{badge}</span> : null}
            <div className="gc-panel">
              <span className="gc-emb">
                <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                  <EmblemArt emblem={m.emblem} />
                </svg>
              </span>
              <div className="gc-txt">
                <p className="gc-for">Für {name}</p>
                <p className={long ? "gc-amt long" : "gc-amt"}>{amt}</p>
                <p className="gc-line">{line}</p>
                <p className="gc-from">{sender}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default GiftCard;
