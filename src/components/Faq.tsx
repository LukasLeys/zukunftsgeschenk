import type { ReactNode } from "react";
import { Icon } from "./Icon";

export interface FaqItem {
  q: string;
  a: ReactNode;
}

export interface FaqProps {
  items: FaqItem[];
  /** Index, der beim Laden offen sein soll. */
  openIndex?: number;
  className?: string;
}

/** Fragenliste mit details/summary, funktioniert ohne JavaScript. Steht in einem `.faq`-Abschnitt. */
export function Faq({ items, openIndex, className }: FaqProps) {
  return (
    <div className={["faq-list", className].filter(Boolean).join(" ")}>
      {items.map((it, i) => (
        <details key={it.q} open={openIndex === i ? true : undefined}>
          <summary>
            {it.q}
            <Icon name="plus" />
          </summary>
          <div className="a">{it.a}</div>
        </details>
      ))}
    </div>
  );
}

/** Fragen und Antworten aus dem freigegebenen Entwurf (Fakten Stand Nov. 2026). */
export const FAQ_ITEMS: FaqItem[] = [
  { q: "Warum darf Oma nicht selbst einzahlen?", a: "Der Gesetzesentwurf sieht vor, dass nur die Eltern als gesetzliche Vertreter einzahlen. Deshalb schenkst du das Geld den Eltern, mit einer Karte, die man wirklich in die Hand nehmen kann." },
  { q: "Geht das Geld über euch?", a: "Nein. Bei uns bezahlst du nur die Karte. Den Geschenkbetrag überweist du per Bank-QR-Code direkt an die Eltern. Wir sehen und halten dieses Geld nie." },
  { q: "Was, wenn das Depot erst im Juli 2027 startet?", a: "Das ist kein Problem. Das Geld liegt bis dahin bei den Eltern, und sie zahlen es ein, sobald das Depot eröffnet ist. Auf der Karte steht nichts, was einen Termin verspricht." },
  { q: "Wie lange gilt die Karte?", a: "Unbefristet. Die Eltern können den Code auf der Karte jederzeit einlösen." },
  { q: "Was kostet die Karte, was der Betrag?", a: "Die Karte kostet 4,90 € per E-Mail (PDF), 12,90 € gedruckt mit Kuvert inkl. Versand oder 19,90 € als Premium mit Goldkuvert. Preise vorläufig. Der Betrag auf der Karte ist dein Geschenk und geht direkt an die Eltern." },
  { q: "Kann die E-Mail-Karte zu einem bestimmten Zeitpunkt ankommen?", a: "Ja. Wähle beim Gestalten „Wunschtermin“, zum Beispiel den 24. Dezember um 17 Uhr. Oder lass sie sofort verschicken." },
  { q: "Was, wenn die Eltern noch kein Depot haben?", a: "Sie lösen die Karte trotzdem ein und bekommen dein Geschenk. Das Depot können sie ab dem Start eröffnen; vorher ist ein kurzes Erstgespräch zur Finanzbildung vorgesehen. Wird bis zum 3. Geburtstag kein Depot eröffnet, legt der Bund den Startbonus vorübergehend im Bundesschatz an." },
  { q: "Wem gehört das Geld?", a: "Das Depot läuft auf den Namen des Kindes. Bis zum 18. Geburtstag verwalten es die Eltern, danach verfügt das Kind selbst darüber." },
  { q: "Kostet das Depot etwas?", a: "Laut Entwurf bieten Banken das Zukunftsdepot ohne Depotgebühren an. Die Fonds selbst haben laufende Kosten von höchstens 1 % pro Jahr." },
  { q: "Gibt es Karten zur Erstkommunion und Firmung?", a: "Ja. Im Shop findest du eigene Motive für Erstkommunion und Firmung, dazu Weihnachten, Geburt, Taufe, Geburtstag und Karten ganz ohne Anlass." },
];

export default Faq;
