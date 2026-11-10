import type { ReactNode } from "react";
import { COMPANY_FIELDS, companyValue, type CompanyKey } from "@/lib/company";
import { InfoIcon } from "./InfoIcon";
import s from "./info.module.css";

/** Gut sichtbarer Kasten oben auf jeder Rechtsseite. Verschwindet erst mit LEGAL_REVIEWED=1. */
export function DraftBox() {
  if (legalReviewed()) return null;
  return (
    <div className={s.draft} role="note" aria-label="Hinweis zum Entwurf">
      <InfoIcon name="scale" />
      <div>
        <b>Entwurf. Vor dem Start von einer Kanzlei prüfen lassen.</b>
        <p>
          Dieser Text ist eine Vorlage nach österreichischem Recht und noch nicht rechtsverbindlich geprüft. Rosa markierte
          Stellen in eckigen Klammern sind Platzhalter und müssen vor dem Start ausgefüllt werden.
        </p>
      </div>
    </div>
  );
}

/** Platzhalter für noch fehlende Firmendaten, z. B. <Ph>Firmenname</Ph> → [Firmenname]. */
export function Ph({ children }: { children: ReactNode }) {
  return (
    <mark className={s.ph} title="Platzhalter, vor dem Start ausfüllen">
      [{children}]
    </mark>
  );
}

/** Firmenwert aus der Umgebung, sonst der markierte Platzhalter mit der Beschriftung aus COMPANY_FIELDS.
 *  `or`: Ersatzfeld, wenn `k` leer ist. `link`: E-Mail oder Telefon als Link ausgeben. */
export function Co({ k, or, link }: { k: CompanyKey; or?: CompanyKey; link?: "mailto" | "tel" }) {
  const v = companyValue(k) ?? (or ? companyValue(or) : null);
  if (!v) return <Ph>{COMPANY_FIELDS[k].label}</Ph>;
  if (link === "mailto") return <a href={`mailto:${v}`}>{v}</a>;
  if (link === "tel") return <a href={`tel:${v.replace(/[^\d+]/g, "")}`}>{v}</a>;
  return <>{v}</>;
}

/** Firmenname und Anschrift in einer Zeile, für Fließtext in AGB, Widerruf und Datenschutz. */
export function CoNameAddress() {
  return (
    <>
      <Co k="name" />, <Co k="street" />, <Co k="zipCity" />, Österreich
    </>
  );
}

/** Solange noch keine Firmendaten gesetzt sind, zeigen wir auch optionale Felder als Platzhalter.
 *  Sobald der Firmenname gesetzt ist, entfallen optionale Zeilen ohne Wert. */
export function showOptional(k: CompanyKey): boolean {
  return companyValue(k) !== null || companyValue("name") === null;
}

/** true, sobald die Kanzlei die Texte geprüft hat und LEGAL_REVIEWED=1 gesetzt ist. */
export function legalReviewed(): boolean {
  return process.env.LEGAL_REVIEWED?.trim() === "1";
}

/** Anhänger im Seitenkopf der Rechtsseiten: Entwurf bis zur Prüfung, danach das Datum der Fassung. */
export function legalTag() {
  if (!legalReviewed()) return { top: "Stand", big: "Entwurf", line: "vor dem Start prüfen" };
  return { top: "Rechtstext", big: "Stand", line: companyValue("legalDate") ?? "aktuelle Fassung" };
}

/** Zweispaltige Angabenliste (z. B. Impressum). */
export function Dl({ rows }: { rows: { dt: ReactNode; dd: ReactNode }[] }) {
  return (
    <dl className={s.dl}>
      {rows.map((r, i) => (
        <div key={i}>
          <dt>{r.dt}</dt>
          <dd>{r.dd}</dd>
        </div>
      ))}
    </dl>
  );
}
