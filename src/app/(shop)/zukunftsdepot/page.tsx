import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { InfoIcon } from "@/components/info/InfoIcon";
import { CtaBox, InfoBody, List, Note, PageIntro, Section, infoStyles as s } from "@/components/info/InfoPage";
import { Timeline, type TimelineItem } from "@/components/info/Timeline";

export const metadata: Metadata = {
  title: "Was ist das Zukunftsdepot?",
  description:
    "Das Zukunftsdepot für Kinder in Österreich verständlich erklärt: 500 € Startbonus für die Jahrgänge 2027 und 2028, bis 5.000 € pro Jahr, nur Eltern zahlen ein, gesperrt bis 18. Stand: Ministerialentwurf 157/ME, November 2026.",
};

const TOC = [
  { id: "was", label: "Was ist das Zukunftsdepot?" },
  { id: "bonus", label: "Wer bekommt den Startbonus?" },
  { id: "einzahlen", label: "Wer darf einzahlen?" },
  { id: "anlage", label: "Wie wird angelegt?" },
  { id: "steuer", label: "Steuer" },
  { id: "mit-18", label: "Mit 18" },
  { id: "zeitplan", label: "Zeitplan" },
  { id: "offen", label: "Was noch offen ist" },
  { id: "quellen", label: "Quellen" },
];

const TIMELINE: TimelineItem[] = [
  {
    when: "30. Oktober 2026",
    title: "Ministerialentwurf 157/ME geht in Begutachtung",
    text: "Bis 9. November 2026 können Institutionen und Privatpersonen Stellungnahmen abgeben.",
    state: "now",
    badge: "Wir sind hier",
  },
  {
    when: "Ende 2026 / 2027",
    title: "Beschluss im Parlament",
    text: "Nach der Begutachtung kann sich der Text noch ändern. Danach müssen Nationalrat und Bundesrat das Gesetz beschließen. Ein Termin steht noch nicht fest.",
  },
  {
    when: "1. Jänner 2027",
    title: "Erster Jahrgang mit Startbonus",
    text: "Kinder, die ab diesem Tag geboren werden, sollen die 500 € bekommen.",
  },
  {
    when: "Juli 2027",
    title: "Voraussichtlicher Start des Zukunftsdepots",
    text: "Voraussichtlich ab Juli 2027 sollen Banken das Depot anbieten. Laut Entwurf ist der 1. Juli 2027 geplant, eine Verschiebung bis 1. Dezember 2027 ist möglich.",
  },
  {
    when: "31. Dezember 2028",
    title: "Letzter Jahrgang mit Startbonus",
    text: "Laut Entwurf gibt es den Bonus nur für die Geburtsjahrgänge 2027 und 2028.",
  },
  {
    when: "2030",
    title: "Die ersten Kinder werden 3",
    text: "Haben die Eltern bis zum 3. Geburtstag kein Depot eröffnet, legt der Bund den Bonus vorübergehend im Bundesschatz an.",
  },
  {
    when: "2045",
    title: "Die ersten Kinder werden 18",
    text: "Kinder des Jahrgangs 2027 verfügen dann selbst über ihr Depot.",
  },
];

const SOURCES = [
  {
    href: "https://www.parlament.gv.at/gegenstand/XXVIII/ME/157",
    label: "Parlament Österreich: Ministerialentwurf 157/ME",
    note: "Entwurf zum Einkommensteuergesetz und Familienlastenausgleichsgesetz sowie Gesetz über ein staatliches Startguthaben. Mit Gesetzestext und Stellungnahmen.",
  },
  {
    href: "https://orf.at/stories/3446969/",
    label: "ORF.at: Bericht zum Zukunftsdepot",
    note: "Nachrichtenartikel zum Gesetzesentwurf.",
  },
  {
    href: "https://www.broker-test.at/news/zukunftsdepot-gesetzesentwurf-geht-in-begutachtung/",
    label: "broker-test.at: Zukunftsdepot, Gesetzesentwurf geht in Begutachtung",
    note: "Zusammenfassung der Eckpunkte des Entwurfs.",
  },
  {
    href: "https://www.wertpapierrecht.at/zukunftsdepot/",
    label: "wertpapierrecht.at: Zukunftsdepot",
    note: "Rechtliche Einordnung des Entwurfs.",
  },
  {
    href: "https://www.wienerborse.at/en/knowledge/investing-in-securities/zukunftsdepot/",
    label: "Wiener Börse: Zukunftsdepot (englisch)",
    note: "Wissensseite der Wiener Börse.",
  },
];

export default function ZukunftsdepotPage() {
  return (
    <>
      <PageIntro
        title="Was ist das Zukunftsdepot?"
        lead="Ein eigenes Wertpapierdepot für jedes Kind in Österreich. Die Eltern sparen darin bis zum 18. Geburtstag, Kursgewinne bleiben steuerfrei. Hier erklären wir in Ruhe, was der Gesetzesentwurf vorsieht."
        tag={{ top: "Start geplant", big: "2027", line: "ab 1. Juli" }}
        meta={
          <>
            <span>
              <InfoIcon name="doc" />
              Stand: Ministerialentwurf 157/ME, November 2026
            </span>
            <span>
              <InfoIcon name="hourglass" />
              Noch kein beschlossenes Gesetz
            </span>
          </>
        }
      />

      <InfoBody toc={TOC}>
        <Note>
          <p>
            <b>Bitte beachten:</b> Das Zukunftsdepot ist derzeit ein Gesetzesentwurf. Die Begutachtung läuft von 30. Oktober
            bis 9. November 2026. Bis zum Beschluss können sich Details ändern. Wir sind ein privates Angebot und keine
            offizielle Stelle. Diese Seite ist keine Anlage- oder Steuerberatung.
          </p>
        </Note>

        <Section id="was" title="Was ist das Zukunftsdepot?">
          <p>
            Das Zukunftsdepot ist ein Wertpapierdepot mit Verrechnungskonto. Es läuft auf den Namen des Kindes. Statt eines
            Depots können Eltern auch ein Bundesschatz-Zukunftskonto wählen. Jedes Kind bekommt nur ein Zukunftsdepot.
          </p>
          <p>
            Das Geld ist für später gedacht. Zum 18. Geburtstag soll das Kind ein Startkapital haben, zum Beispiel für die
            Ausbildung, die erste Wohnung oder den Einstieg ins Berufsleben.
          </p>
          <dl className={`facts ${s.facts}`}>
            <div>
              <dt>Für wen</dt>
              <dd>Für Kinder unter 18 Jahren. Auch bereits geborene Kinder können ein Depot bekommen, dann ohne Startbonus.</dd>
            </div>
            <div>
              <dt>Eröffnung</dt>
              <dd>
                Bei einer Bank. Vorher ist für die Eltern ein verpflichtendes Erstgespräch zur Finanzbildung vorgesehen.
              </dd>
            </div>
            <div>
              <dt>Kosten</dt>
              <dd>Keine Depotgebühren. Die Fonds selbst haben laufende Kosten von höchstens 1 % pro Jahr.</dd>
            </div>
            <div>
              <dt>Sperre</dt>
              <dd>Das Geld bleibt bis zum 18. Geburtstag im Depot.</dd>
            </div>
          </dl>
        </Section>

        <Section id="bonus" title="Wer bekommt den Startbonus?">
          <p>
            Der Staat zahlt einmalig <b>500 €</b> ins Depot. Im Entwurf heißt das „staatliches Startguthaben“. Es gilt für
            Kinder, die <b>2027 oder 2028</b> geboren werden. Dazu kommen diese Bedingungen:
          </p>
          <List>
            <li>Das Kind hat seinen Wohnsitz in Österreich.</li>
            <li>Das Kind hat die österreichische Staatsbürgerschaft oder einen gleichgestellten Aufenthaltstitel.</li>
            <li>
              Das Kind lebt 15 Jahre bis zur Volljährigkeit in Österreich. Sonst wird der Bonus zurückgefordert.
            </li>
          </List>
          <p>
            Eröffnen die Eltern bis zum 3. Geburtstag kein Depot, legt der Bund den Bonus vorübergehend im Bundesschatz an.
            Der Anspruch geht damit nicht verloren.
          </p>
          <p>
            Kinder, die vor 2027 geboren sind, können ebenfalls ein Zukunftsdepot bekommen. Für sie gibt es laut Entwurf
            keinen Startbonus.
          </p>
        </Section>

        <Section id="einzahlen" title="Wer darf einzahlen, und warum es uns gibt">
          <p>
            Pro Kind und Jahr dürfen bis zu <b>5.000 €</b> eingezahlt werden. Der Startbonus zählt dabei nicht mit.
          </p>
          <p>
            Laut Entwurf zahlen <b>nur die gesetzlichen Vertreter</b> ein, also in der Regel die Eltern. Großeltern, Paten,
            Tanten oder Freunde der Familie können also nicht selbst ins Depot überweisen.
          </p>
          <h3>Genau hier hilft Zukunftsgeschenk</h3>
          <p>
            Wer etwas fürs Zukunftsdepot schenken will, schenkt das Geld den Eltern. Mit unserer Karte wird daraus ein
            schönes Geschenk zum Auspacken. Den Betrag überweist du per Bank-QR-Code direkt an die Eltern. Die Eltern zahlen
            ihn dann ins Depot ein. Bei uns bezahlst du nur die Karte.
          </p>
          <p>
            <Link className="sec-link" href="/so-funktionierts">
              So funktioniert das Schenken <Icon name="arrow" />
            </Link>
          </p>
        </Section>

        <Section id="anlage" title="Wie wird angelegt?">
          <p>Im Zukunftsdepot sind laut Entwurf nur bestimmte Anlagen erlaubt:</p>
          <List>
            <li>
              Investmentfonds und ETFs nach der europäischen UCITS-Richtlinie. Das sind streng regulierte Fonds für
              Privatanleger.
            </li>
            <li>
              Nur Fonds der Risikoklassen 1 bis 5. Die Skala reicht von 1 (geringes Risiko) bis 7 (hohes Risiko).
            </li>
            <li>Die laufenden Kosten eines Fonds dürfen höchstens 1 % pro Jahr betragen.</li>
            <li>Alternativ Bundesschatz, also Geldanlage direkt beim Bund.</li>
          </List>
          <p>
            Nicht erlaubt sind Einzelaktien, Kryptowerte und Produkte mit Hebel. Welche Fonds die Banken anbieten, steht
            noch nicht fest.
          </p>
          <Note tone="rosa">
            <p>
              Wir empfehlen keine Fonds und geben keine Anlageberatung. Für die Auswahl ist das Erstgespräch bei der Bank
              vorgesehen.
            </p>
          </Note>
        </Section>

        <Section id="steuer" title="Steuer">
          <p>
            Kursgewinne im Zukunftsdepot sind laut Entwurf <b>von der Kapitalertragsteuer (KESt) befreit</b>. Normalerweise
            fallen darauf 27,5 % an.
          </p>
          <p>
            Dividenden und Zinsen bleiben laut Entwurf steuerpflichtig. Wird Geld in einem Ausnahmefall vor dem 18.
            Geburtstag entnommen, entfällt der Steuervorteil.
          </p>
          <p className="muted">Das ist eine vereinfachte Darstellung und keine Steuerberatung.</p>
        </Section>

        <Section id="mit-18" title="Mit 18">
          <p>
            Bis zum 18. Geburtstag ist das Depot gesperrt. Die Eltern verwalten es in dieser Zeit für das Kind. Ab dem 18.
            Geburtstag verfügt das Kind selbst über das Geld.
          </p>
          <p>
            Vorher ist eine Entnahme nur in Ausnahmefällen möglich, etwa in einer Notlage. Dafür braucht es die Zustimmung
            des Gerichts, und der Steuervorteil fällt weg.
          </p>
        </Section>

        <Section id="zeitplan" title="Zeitplan">
          <p>Vom Entwurf bis zum 18. Geburtstag der ersten Bonus-Kinder. Termine nach 2026 sind geplant und können sich ändern.</p>
          <Timeline items={TIMELINE} label="Zeitplan Zukunftsdepot 2026 bis 2045" />
        </Section>

        <Section id="offen" title="Was noch offen ist">
          <p>Einige Punkte stehen erst fest, wenn das Gesetz beschlossen ist und die Banken ihre Angebote zeigen:</p>
          <List>
            <li>Der endgültige Gesetzestext. Nach der Begutachtung kann sich noch einiges ändern.</li>
            <li>Der genaue Starttermin: voraussichtlich ab Juli 2027, laut Entwurf spätestens 1. Dezember 2027.</li>
            <li>Welche Banken das Depot anbieten und welche Fonds sie zur Auswahl stellen.</li>
            <li>Wie das verpflichtende Erstgespräch für die Eltern genau abläuft.</li>
            <li>Ob später auch andere Personen als die Eltern einzahlen dürfen. Der Entwurf sieht das derzeit nicht vor.</li>
          </List>
          <p>Sobald sich etwas ändert, passen wir diese Seite an.</p>
        </Section>

        <Section id="quellen" title="Quellen">
          <p>Wir haben die Angaben auf dieser Seite aus diesen Quellen zusammengefasst:</p>
          <ul className={s.sources}>
            {SOURCES.map((q) => (
              <li key={q.href}>
                <a href={q.href} target="_blank" rel="noopener noreferrer">
                  {q.label}
                  <span className="sr"> (öffnet in neuem Fenster)</span>
                </a>
                <span>{q.note}</span>
              </li>
            ))}
            <li>
              <a href="https://www.ris.bka.gv.at/" target="_blank" rel="noopener noreferrer">
                Rechtsinformationssystem des Bundes (RIS)
                <span className="sr"> (öffnet in neuem Fenster)</span>
              </a>
              <span>Nach dem Beschluss steht dort der gültige Gesetzestext im Bundesgesetzblatt.</span>
            </li>
          </ul>
          <p className={s.stand}>
            Stand: 9. November 2026, Ministerialentwurf 157/ME. Privates Angebot. Kein offizielles Angebot der Republik
            Österreich oder einer Partei. Keine Anlageberatung.
          </p>
        </Section>

        <CtaBox
          title="Ein Stück Zukunft verschenken"
          text="Such dir eine Karte aus oder rechne nach, wie ein Geschenk bis zum 18. Geburtstag wachsen kann."
        >
          <Link className="btn" href="/karten">
            Karten ansehen <Icon name="arrow" />
          </Link>
          <Link className="btn btn--ghost" href="/rechner">
            Zum Rechner
          </Link>
        </CtaBox>
      </InfoBody>
    </>
  );
}
