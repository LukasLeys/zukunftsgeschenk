// DIE Geschenkkarte aus dem Entwurf als React-Komponente.
// Server-tauglich: keine Hooks, kein „use client“, funktioniert in Server- und Client-Komponenten.
import type { CSSProperties, ReactNode } from "react";
import { motifById, type Paper, type Shape } from "@/lib/catalog";
import { EmblemArt } from "./emblems";
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

export { EmblemArt };

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
  const panel = m.panel ?? "white";
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
