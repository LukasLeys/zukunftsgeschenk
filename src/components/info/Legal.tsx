import type { ReactNode } from "react";
import { InfoIcon } from "./InfoIcon";
import s from "./info.module.css";

/** Gut sichtbarer Kasten oben auf jeder Rechtsseite. */
export function DraftBox() {
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
