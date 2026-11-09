import type { Metadata } from "next";
import Link from "next/link";
import { InfoBody, List, PageIntro, Section } from "@/components/info/InfoPage";
import { DraftBox, Dl, Ph } from "@/components/info/Legal";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Offenlegung nach E-Commerce-Gesetz, Unternehmensgesetzbuch und Mediengesetz.",
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <>
      <PageIntro
        title="Impressum"
        lead="Informationen nach § 5 E-Commerce-Gesetz (ECG), § 14 Unternehmensgesetzbuch (UGB) und Offenlegung nach § 25 Mediengesetz (MedienG)."
        tag={{ top: "Stand", big: "Entwurf", line: "vor dem Start prüfen" }}
      />
      <InfoBody
        legal
        before={<DraftBox />}
        toc={[
          { id: "anbieter", label: "Anbieter und Medieninhaber" },
          { id: "unternehmen", label: "Unternehmensangaben" },
          { id: "aufsicht", label: "Gewerbe und Aufsicht" },
          { id: "offenlegung", label: "Offenlegung nach MedienG" },
          { id: "hinweis", label: "Kein offizielles Angebot" },
          { id: "streit", label: "Streitbeilegung" },
          { id: "haftung", label: "Haftung und Urheberrecht" },
        ]}
      >
        <Section id="anbieter" title="Anbieter und Medieninhaber">
          <Dl
            rows={[
              { dt: "Unternehmen", dd: <><Ph>Firmenname</Ph> <Ph>Rechtsform</Ph></> },
              { dt: "Anschrift", dd: <Ph>Anschrift: Straße, Hausnummer, PLZ Ort, Österreich</Ph> },
              { dt: "E-Mail", dd: <Ph>E-Mail-Adresse</Ph> },
              { dt: "Telefon", dd: <Ph>Telefonnummer</Ph> },
              { dt: "Vertretungsbefugt", dd: <Ph>Name der Geschäftsführung</Ph> },
            ]}
          />
        </Section>

        <Section id="unternehmen" title="Unternehmensangaben">
          <Dl
            rows={[
              { dt: "Unternehmensgegenstand", dd: "Gestaltung und Online-Verkauf personalisierter Geschenkkarten in digitaler und gedruckter Form" },
              { dt: "UID-Nummer", dd: <Ph>UID</Ph> },
              { dt: "Firmenbuchnummer", dd: <Ph>Firmenbuchnummer</Ph> },
              { dt: "Firmenbuchgericht", dd: <Ph>Firmenbuchgericht</Ph> },
              { dt: "Sitz", dd: <Ph>Sitz der Gesellschaft</Ph> },
            ]}
          />
          <p style={{ marginTop: 14 }}>
            Bei einem Einzelunternehmen ohne Firmenbucheintrag entfallen Firmenbuchnummer und Firmenbuchgericht.
          </p>
        </Section>

        <Section id="aufsicht" title="Gewerbe und Aufsicht">
          <Dl
            rows={[
              { dt: "Gewerbe", dd: <Ph>Gewerbewortlaut laut Gewerbeberechtigung</Ph> },
              { dt: "Gewerbebehörde", dd: <Ph>zuständige Bezirkshauptmannschaft oder Magistrat</Ph> },
              { dt: "Kammer", dd: <><Ph>Mitglied der Wirtschaftskammer</Ph>, <Ph>Fachgruppe</Ph></> },
              {
                dt: "Berufsrecht",
                dd: (
                  <>
                    Gewerbeordnung 1994, abrufbar im{" "}
                    <a href="https://www.ris.bka.gv.at/" target="_blank" rel="noopener noreferrer">
                      Rechtsinformationssystem des Bundes (RIS)
                    </a>
                  </>
                ),
              },
            ]}
          />
        </Section>

        <Section id="offenlegung" title="Offenlegung nach § 25 Mediengesetz">
          <Dl
            rows={[
              { dt: "Medieninhaber", dd: <><Ph>Firmenname</Ph>, <Ph>Anschrift</Ph></> },
              { dt: "Beteiligungen", dd: <Ph>Gesellschafter und Beteiligungsverhältnisse, falls zutreffend</Ph> },
              {
                dt: "Grundlegende Richtung",
                dd: "Information über das Angebot von Geschenkkarten für Geldgeschenke an Familien sowie allgemeine Information über das geplante Zukunftsdepot in Österreich.",
              },
            ]}
          />
        </Section>

        <Section id="hinweis" title="Kein offizielles Angebot">
          <p>
            Zukunftsgeschenk ist ein privates Angebot. Es ist kein offizielles Angebot der Republik Österreich, eines
            Ministeriums oder einer Partei. Wir verkaufen Geschenkkarten. Wir nehmen keine Geschenkbeträge an und sind kein
            Zahlungsdienst. Die Einzahlung ins Zukunftsdepot erfolgt durch die Eltern. Wir bieten keine Anlageberatung an.
          </p>
          <p>
            Informationen zum Zukunftsdepot beruhen auf dem Ministerialentwurf 157/ME (Stand November 2026) und können sich
            bis zum Beschluss des Gesetzes ändern.
          </p>
        </Section>

        <Section id="streit" title="Streitbeilegung">
          <p>
            Die Plattform der EU zur Online-Streitbeilegung wurde am 20. Juli 2025 eingestellt. Ein Link darauf ist daher
            nicht mehr erforderlich.
          </p>
          <p>
            <Ph>Bitte wählen: Wir sind bereit / nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.</Ph> Zuständig wäre etwa die Schlichtungsstelle Verbraucherschlichtung
            Austria oder die Internet Ombudsstelle.
          </p>
        </Section>

        <Section id="haftung" title="Haftung und Urheberrecht">
          <List>
            <li>
              Wir prüfen die Inhalte dieser Website sorgfältig. Für Inhalte externer Seiten, auf die wir verlinken, sind
              deren Betreiber verantwortlich.
            </li>
            <li>
              Texte, Kartenmotive und Grafiken dieser Website sind urheberrechtlich geschützt. Eine Verwendung außerhalb
              dieser Website braucht unsere Zustimmung.
            </li>
            <li>Schriften: Bricolage Grotesque und Figtree, beide unter der SIL Open Font License.</li>
          </List>
          <p style={{ marginTop: 18 }}>
            Weitere Rechtstexte: <Link href="/agb">AGB</Link>, <Link href="/datenschutz">Datenschutz</Link>,{" "}
            <Link href="/widerruf">Widerrufsbelehrung</Link>.
          </p>
        </Section>
      </InfoBody>
    </>
  );
}
