import { Icon } from "./Icon";

/** Pflichthinweis (gelbe Leiste ganz oben auf jeder Seite). */
export const LEGAL_NOTICE_REST =
  "Kein offizielles Angebot der Republik Österreich oder einer Partei. Die Einzahlung ins Zukunftsdepot erfolgt durch die Eltern. Keine Anlageberatung.";

export function LegalBar() {
  return (
    <div className="notice band" role="note" aria-label="Pflichthinweis">
      <div className="wrap">
        <Icon name="info" />
        <p>
          <strong>Privates Angebot.</strong> {LEGAL_NOTICE_REST}
        </p>
      </div>
    </div>
  );
}

export default LegalBar;
