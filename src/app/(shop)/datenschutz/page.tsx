import type { Metadata } from "next";
import Link from "next/link";
import { InfoBody, List, Note, PageIntro, Section } from "@/components/info/InfoPage";
import { Co, CoNameAddress, DraftBox, legalTag, Dl, Ph, showOptional } from "@/components/info/Legal";
// Firmendaten kommen zur Laufzeit aus Umgebungsvariablen. Deshalb wird die Seite bei jedem Aufruf erzeugt.
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Wie Zukunftsgeschenk personenbezogene Daten verarbeitet: Bestellung, Einlösung mit verschlüsselter IBAN, E-Mail-Versand, Druck, Zahlung über Stripe und cookiefreie Statistik.",
};

const TOC = [
  { id: "verantwortlich", label: "Verantwortlich" },
  { id: "ueberblick", label: "Überblick" },
  { id: "bestellung", label: "Bestellung und Zahlung" },
  { id: "einloesung", label: "Einlösung und IBAN" },
  { id: "wunschseite", label: "Wunschseite" },
  { id: "emails", label: "E-Mails" },
  { id: "druck", label: "Druck und Versand" },
  { id: "hosting", label: "Hosting und Server-Protokolle" },
  { id: "statistik", label: "Cookies und Statistik" },
  { id: "empfaenger", label: "Empfänger im Überblick" },
  { id: "rechte", label: "Ihre Rechte" },
  { id: "sicherheit", label: "Sicherheit und Änderungen" },
];

export default function DatenschutzPage() {
  return (
    <>
      <PageIntro
        title={"Datenschutz\u00aderklärung"}
        lead="Hier erklären wir, welche personenbezogenen Daten wir verarbeiten, wofür, wie lange und an wen wir sie weitergeben. Grundlage sind die Datenschutz-Grundverordnung (DSGVO) und das österreichische Datenschutzgesetz (DSG)."
        tag={legalTag()}
        meta={<span>Fassung vom <Co k="legalDate" /></span>}
      />
      <InfoBody legal before={<DraftBox />} toc={TOC}>
        <Note>
          <p>
            <b>Kurz gesagt:</b> Wir erheben nur, was wir für Ihre Karte brauchen. Die IBAN der Eltern speichern wir
            verschlüsselt und löschen sie 90 Tage nach der Einlösung bzw. nach dem Kauf. Wunschseiten löschen wir nach 12
            Monaten. Wir setzen keine Werbe- oder Tracking-Cookies ein.
          </p>
        </Note>

        <Section id="verantwortlich" title="Verantwortlich">
          <Dl
            rows={[
              { dt: "Verantwortlicher", dd: <CoNameAddress /> },
              { dt: "E-Mail", dd: <Co k="privacyEmail" or="email" link="mailto" /> },
              ...(showOptional("dpo") ? [{ dt: "Datenschutzbeauftragte Person", dd: <Co k="dpo" /> }] : []),
            ]}
          />
        </Section>

        <Section id="ueberblick" title="Überblick">
          <p>Wir verarbeiten personenbezogene Daten in diesen Fällen:</p>
          <List>
            <li>wenn Sie eine Karte bestellen und bezahlen,</li>
            <li>wenn Eltern eine Karte einlösen oder eine Wunschseite anlegen,</li>
            <li>wenn wir E-Mails zu Bestellung, Karte und Überweisung versenden,</li>
            <li>wenn Sie unsere Website aufrufen (technisch notwendige Daten und cookiefreie Statistik).</li>
          </List>
          <p>
            Den Geschenkbetrag überweisen Schenkende direkt an die Eltern. Diese Zahlung läuft nicht über uns. Wir erhalten
            dazu keine Kontoauszüge oder Zahlungsdaten.
          </p>
        </Section>

        <Section id="bestellung" title="Bestellung und Zahlung">
          <Dl
            rows={[
              {
                dt: "Daten",
                dd: "Name und E-Mail-Adresse der bestellenden Person, Karteninhalte (Name des Kindes, Betrag, Botschaft, Absender), gewünschter Versandzeitpunkt, E-Mail-Adresse der Empfänger bei E-Mail-Karten, Ihre Zustimmung zur sofortigen Erstellung von E-Mail-Karten, Lieferadresse bei gedruckten Karten, auf Wunsch Name und IBAN der Eltern.",
              },
              { dt: "Zweck", dd: "Abwicklung des Kaufvertrags, Erstellung und Zustellung der Karte, Rechnung." },
              {
                dt: "Rechtsgrundlage",
                dd: "Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO); Aufbewahrung von Rechnungsdaten aufgrund gesetzlicher Pflichten (Art. 6 Abs. 1 lit. c DSGVO, § 132 BAO).",
              },
              {
                dt: "Speicherdauer",
                dd: "Rechnungs- und Buchhaltungsdaten 7 Jahre. Übrige Bestelldaten bis zum Ablauf möglicher Gewährleistungs- und Schadenersatzfristen.",
              },
            ]}
          />
          <h3>Zahlung über Stripe</h3>
          <p>
            Die Zahlung des Kartenpreises wickelt Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin 2, Irland,
            ab. Ihre Zahlungsdaten (etwa Kartennummer) geben Sie direkt bei Stripe ein. Wir erhalten nur die Bestätigung der
            Zahlung und Angaben zur Zahlungsart. Stripe verarbeitet Daten teilweise als eigener Verantwortlicher, etwa zur
            Betrugsvorbeugung, und kann Daten an die Stripe, Inc. in den USA übermitteln.{" "}
            <Ph>Grundlage der Übermittlung prüfen: EU-US Data Privacy Framework oder Standardvertragsklauseln</Ph>.
            Rechtsgrundlage ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).
          </p>
        </Section>

        <Section id="einloesung" title="Einlösung und IBAN">
          <Dl
            rows={[
              { dt: "Daten", dd: "Name und E-Mail-Adresse der Eltern, IBAN, Einlösecode, Zeitpunkt der Einlösung." },
              {
                dt: "Zweck",
                dd: "Erstellung des Bank-QR-Codes, mit dem die schenkende Person den Geschenkbetrag direkt an die Eltern überweist. Information beider Seiten über Einlösung und Überweisung.",
              },
              {
                dt: "Rechtsgrundlage",
                dd: "Einwilligung und Wunsch der Eltern beim Einlösen (Art. 6 Abs. 1 lit. a und b DSGVO) sowie unser berechtigtes Interesse an der Durchführung des Geschenks (Art. 6 Abs. 1 lit. f DSGVO).",
              },
              {
                dt: "Weitergabe",
                dd: "Die schenkende Person erhält Name und IBAN der Eltern im Bank-QR-Code und auf der Überweisungsseite. Ohne diese Angaben ist keine Überweisung möglich.",
              },
            ]}
          />
          <h3>Bankverbindung schon bei der Bestellung</h3>
          <p>
            Kennt die schenkende Person die Bankverbindung der Eltern, kann sie Name und IBAN der Eltern bei der Bestellung
            eintragen. Dann steht der Bank-QR-Code gleich auf der Karte, und die Eltern müssen nichts einlösen. Rechtsgrundlage
            ist das berechtigte Interesse der schenkenden Person, der Eltern und unser Interesse an der Durchführung des
            Geschenks (Art. 6 Abs. 1 lit. f DSGVO).
          </p>
          <h3>Verschlüsselung und Löschung</h3>
          <List>
            <li>Wir speichern die IBAN nur verschlüsselt (AES-256-GCM). Der Schlüssel liegt getrennt von der Datenbank.</li>
            <li>
              <b>90 Tage nach der Einlösung löschen wir die IBAN automatisch.</b> Ist die Bankverbindung schon beim Kauf
              bekannt, weil die Karte über eine Wunschseite gekauft wurde oder die schenkende Person sie eingetragen hat,
              löschen wir sie 90 Tage nach dem Kauf. Danach kann kein neuer Bank-QR-Code mehr erzeugt werden.
            </li>
            <li>
              Name und E-Mail-Adresse der Eltern bewahren wir auf, solange die zugehörige Bestellung aufbewahrt wird.{" "}
              <Ph>Löschfrist prüfen</Ph>
            </li>
          </List>
        </Section>

        <Section id="wunschseite" title="Wunschseite">
          <p>
            Eltern können eine Wunschseite für ihr Kind anlegen. Dafür speichern wir den Vornamen des Kindes, Name und
            E-Mail-Adresse der Eltern, eine optionale Botschaft, den Anlass und die IBAN (verschlüsselt). Wer den Link kennt,
            kann die Seite aufrufen und erhält im Bank-QR-Code Name und IBAN der Eltern.
          </p>
          <p>
            Rechtsgrundlage ist die Einwilligung der Eltern (Art. 6 Abs. 1 lit. a DSGVO), die jederzeit widerrufen werden
            kann. <b>Wir löschen die Wunschseite samt IBAN automatisch 12 Monate nach dem Anlegen.</b> Die Eltern können sie
            jederzeit vorher selbst löschen oder uns darum bitten. Karten, die über die Wunschseite gekauft wurden, behalten
            die Bankverbindung bis 90 Tage nach dem Kauf, damit der Bank-QR-Code auf der Karte funktioniert.
          </p>
        </Section>

        <Section id="emails" title="E-Mails">
          <p>
            Wir versenden Bestellbestätigungen, E-Mail-Karten, Einlöse-Benachrichtigungen, Bank-QR-Codes und Erinnerungen über
            den E-Mail-Dienst Resend (Resend, Inc., USA) als Auftragsverarbeiter.{" "}
            <Ph>Serverregion bei Resend (EU) und Grundlage der Übermittlung prüfen: EU-US Data Privacy Framework oder Standardvertragsklauseln</Ph>.
            Verarbeitet werden E-Mail-Adresse, Name und der Inhalt der Nachricht. Rechtsgrundlage ist die Vertragserfüllung
            (Art. 6 Abs. 1 lit. b DSGVO).
          </p>
          <p>Wir versenden keine Werbe-Newsletter.</p>
        </Section>

        <Section id="druck" title="Druck und Versand">
          <p>
            Für gedruckte Karten übermitteln wir Karteninhalt, Name und Lieferadresse an unsere Druckerei <Co k="printShop" />{" "}
            als Auftragsverarbeiter. Die Druckerei übergibt die Karte an die Österreichische Post AG oder <Ph>Versanddienst</Ph>.
            Rechtsgrundlage ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).
          </p>
        </Section>

        <Section id="hosting" title="Hosting und Server-Protokolle">
          <p>
            Unsere Website und Datenbank laufen bei <Ph>Hosting-Anbieter</Ph> und <Ph>Datenbank-Anbieter</Ph> auf Servern in
            der Europäischen Union (geplant: Frankfurt am Main). Die Anbieter sind unsere Auftragsverarbeiter.{" "}
            <Ph>Falls ein Anbieter seinen Sitz in den USA hat: Grundlage der Übermittlung ergänzen</Ph>
          </p>
          <p>
            Beim Aufruf der Website werden technisch notwendige Daten verarbeitet, etwa IP-Adresse, Datum und Uhrzeit,
            aufgerufene Seite und Browsertyp. Das dient dem sicheren Betrieb und der Fehlersuche (berechtigtes Interesse,
            Art. 6 Abs. 1 lit. f DSGVO). Server-Protokolle löschen wir nach <Ph>Anzahl</Ph> Tagen.
          </p>
        </Section>

        <Section id="statistik" title="Cookies und Statistik">
          <p>
            Wir setzen keine Werbe- oder Tracking-Cookies ein. Ein Cookie-Banner ist deshalb nicht nötig.
          </p>
          <List>
            <li>
              <b>Warenkorb:</b> Ihr Warenkorb wird im lokalen Speicher Ihres Browsers (localStorage) abgelegt und erst bei der
              Bestellung an uns übertragen. Sie können ihn jederzeit in den Browsereinstellungen löschen. Rechtsgrundlage ist
              § 165 Abs. 3 TKG 2021, weil die Speicherung für den von Ihnen gewünschten Dienst unbedingt erforderlich ist.
            </li>
            <li>
              <b>Statistik:</b> Wir messen die Nutzung unserer Website mit <Ph>Name des Statistikdienstes</Ph> ohne Cookies und
              ohne Wiedererkennung über mehrere Tage. Wir sehen nur zusammengefasste Zahlen, etwa Seitenaufrufe und Herkunftsland.
              Rechtsgrundlage ist unser berechtigtes Interesse an einer bedarfsgerechten Website (Art. 6 Abs. 1 lit. f DSGVO).
            </li>
          </List>
        </Section>

        <Section id="empfaenger" title="Empfänger im Überblick">
          <Dl
            rows={[
              { dt: "Stripe Payments Europe, Ltd.", dd: "Zahlungsabwicklung des Kartenpreises" },
              { dt: "Resend, Inc.", dd: "Versand von E-Mails" },
              { dt: <Co k="printShop" />, dd: "Druck und Versand gedruckter Karten" },
              { dt: <Ph>Hosting-Anbieter</Ph>, dd: "Betrieb von Website und Datenbank, Serverstandort EU" },
              { dt: <Ph>Statistikdienst</Ph>, dd: "Cookiefreie Reichweitenmessung" },
              { dt: "Schenkende Person", dd: "Name und IBAN der Eltern im Bank-QR-Code" },
              { dt: "Steuerberatung, Behörden", dd: "soweit gesetzlich vorgeschrieben" },
            ]}
          />
        </Section>

        <Section id="rechte" title="Ihre Rechte">
          <p>Sie haben das Recht auf</p>
          <List>
            <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO),</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
            <li>Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
            <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO),</li>
            <li>Widerruf einer Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).</li>
          </List>
          <p>
            Schreiben Sie dazu an <Co k="privacyEmail" or="email" link="mailto" />. Wenn Sie meinen, dass wir Ihre Daten nicht
            rechtmäßig verarbeiten, können Sie sich bei der Österreichischen Datenschutzbehörde beschweren: Barichgasse
            40 bis 42, 1030 Wien,{" "}
            <a href="https://www.dsb.gv.at/" target="_blank" rel="noopener noreferrer">
              www.dsb.gv.at
            </a>
            .
          </p>
          <p>
            Die Angabe Ihrer Daten ist für den Vertragsabschluss erforderlich. Ohne sie können wir keine Karte erstellen. Eine
            automatisierte Entscheidungsfindung oder ein Profiling findet nicht statt.
          </p>
        </Section>

        <Section id="sicherheit" title="Sicherheit und Änderungen">
          <p>
            Alle Verbindungen zu unserer Website sind per TLS verschlüsselt. Zugriff auf Bestellungen hat nur ein kleiner,
            berechtigter Personenkreis. Wir passen diese Datenschutzerklärung an, wenn sich unser Angebot oder die Rechtslage
            ändert.
          </p>
          <p style={{ marginTop: 18 }}>
            Weitere Rechtstexte: <Link href="/impressum">Impressum</Link>, <Link href="/agb">AGB</Link>,{" "}
            <Link href="/widerruf">Widerrufsbelehrung</Link>.
          </p>
        </Section>
      </InfoBody>
    </>
  );
}
