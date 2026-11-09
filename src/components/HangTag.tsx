import type { CSSProperties } from "react";

export interface HangTagProps {
  /** Obere Zeile, z. B. „Für Lena“. */
  top: string;
  /** Große Zeile, z. B. der Live-Betrag oder „Eingelöst“. */
  big: string;
  /** Kleine Zeile darunter (optional). */
  line?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Gelber Anhänger mit Lochöse und Faden aus der Geschenkpapier-Welt, als ruhige Dekoration
 * auf Bedienseiten (Konfigurator, Einlösen). Rein dekorativ: Der Inhalt steht immer auch im Text.
 * Positioniert wird er über `className`/`style` vom Elternelement (absolute Lage).
 */
export function HangTag({ top, big, line, className, style }: HangTagProps) {
  const long = big.replace(/[\s.€]/g, "").length >= 4;
  return (
    <div className={["hangtag", className].filter(Boolean).join(" ")} style={style} aria-hidden="true">
      <span className="hangtag-thread" />
      <div className="hangtag-body">
        <p className="hangtag-top">{top}</p>
        <p className={long ? "hangtag-big num long" : "hangtag-big num"}>{big}</p>
        {line ? <p className="hangtag-line">{line}</p> : null}
        <div className="hangtag-foot" />
      </div>
      <span className="hangtag-ring" />
    </div>
  );
}

export default HangTag;
