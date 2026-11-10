import type { Metadata } from "next";
import Link from "next/link";
import { InfoBody, List, Note, PageIntro, Section } from "@/components/info/InfoPage";
import { Co, CoNameAddress, DraftBox, legalTag, Dl, Ph, showOptional } from "@/components/info/Legal";
// Firmendaten kommen zur Laufzeit aus Umgebungsvariablen. Deshalb wird die Seite bei jedem Aufruf erzeugt.
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Wie Zukunftsgeschenk personenbezogene Daten verarbeitet: Bestellung, Einlösung mit verschlüsselter IBAN, E-Mail-Versand, Druck, Zahlung über Stripe, Hosting in Frankfurt. Keine Tracking-Cookies.",
};

const TOC = [
  { id: "verantwortlich", label: "Verantwortlich" },
  { id: "ueberblick", label: "Überblick" },
  { id: "bestellung", label: "Bestellung und Zahlung" },
  { id: "einloesung", label: "Einlösung und IBAN" },
  { id: "wunschseite", label: "Wunschseite" },
  { id: "emails", label: "E-Mails" },
  { id: "druck", label: "Druck und Versand" },
  { id: "hosting", label: "Hosting und Datenbank" },
  { id: "cookies", label: "Cookies und lokaler Speicher" },
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
            Monaten. Wir setzen keine Cookies und keine Analysedienste ein.
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
            <li>wenn Sie unsere Website aufrufen (nur technisch notwendige Daten).</li>
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
            Die Zahlung des Kartenpreises wickelt Stripe Payments Europe, Limited, 1 Grand Canal Street Lower, Grand Canal
            Dock, Dublin, D02 H210, Irland, ab. Für die Zahlung leiten wir Sie auf eine Bezahlseite von Stripe weiter. Ihre
            Zahlungsdaten (etwa Kartennummer) geben Sie direkt bei Stripe ein. Wir übermitteln Stripe Ihre E-Mail-Adresse,
            die Bestellpositionen und den Betrag. Wir erhalten nur die Bestätigung der Zahlung und Angaben zur Zahlungsart.
            Stripe verarbeitet Daten teilweise als eigener Verantwortlicher, etwa zur Betrugsvorbeugung, und kann Daten an die
            Stripe, Inc. in den USA übermitteln. Grundlage dafür ist der Angemessenheitsbeschluss der EU-Kommission zum
            EU-US Data Privacy Framework, ergänzend Standardvertragsklauseln (Art. 45 und 46 DSGVO).{" "}
            <Ph>Zertifizierung von Stripe im Data Privacy Framework prüfen</Ph>. Auf der Bezahlseite gilt die
            Datenschutzerklärung von Stripe. Rechtsgrundlage ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).
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
            Wir versenden Bestellbestätigungen, E-Mail-Karten, Einlöse-Benachrichtigungen, Links zum Bank-QR-Code und eine Erinnerung an die Überweisung über
            den E-Mail-Dienst Resend (Resend, Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA) als
            Auftragsverarbeiter. Verarbeitet werden E-Mail-Adresse, Name und der Inhalt der Nachricht. Eine IBAN steht in
            unseren E-Mails nicht. Weil Resend seinen Sitz in den USA hat, können Daten in die USA übermittelt werden.
            Grundlage sind Standardvertragsklauseln (Art. 46 DSGVO) oder, falls Resend zertifiziert ist, das EU-US Data
            Privacy Framework (Art. 45 DSGVO).{" "}
            <Ph>Serverregion bei Resend (EU) und Grundlage der Übermittlung prüfen</Ph>. Rechtsgrundlage ist die
            Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).
          </p>
          <p>
            E-Mails zum Wunschtermin bewahren wir bis zum Versand in unserem Postausgang auf. Eine Kopie jeder versendeten
            E-Mail bleibt dort, damit wir Rückfragen zur Zustellung beantworten können.{" "}
            <Ph>Löschfrist für den Postausgang festlegen</Ph>
          </p>
          <p>Wir versenden keine Werbe-Newsletter.</p>
        </Section>

        <Section id="druck" title="Druck und Versand">
          <p>
            Für gedruckte Karten übermitteln wir Karteninhalt, Name und Lieferadresse an unsere Druckerei <Co k="printShop" />{" "}
            als Auftragsverarbeiter. Die Druckerei übergibt die Karte an die Österreichische Post AG, Rochusplatz 1, 1030
            Wien. Die Post erhält dafür nur Name und Lieferadresse auf dem Kuvert. Wir liefern nur an Adressen in Österreich.
            Rechtsgrundlage ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).
          </p>
        </Section>

        <Section id="hosting" title="Hosting und Datenbank">
          <p>
            Unsere Website läuft bei Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA, als
            Auftragsverarbeiter. Die Server, die unsere Seiten erzeugen und auf die Datenbank zugreifen, stehen in Frankfurt
            am Main (Region fra1). Inhalte können zur schnelleren Auslieferung auch über Server von Vercel in anderen
            Ländern ausgeliefert werden. Weil Vercel seinen Sitz in den USA hat, ist ein Zugriff aus den USA nicht
            ausgeschlossen. Grundlage ist der Angemessenheitsbeschluss der EU-Kommission zum EU-US Data Privacy Framework,
            ergänzend Standardvertragsklauseln (Art. 45 und 46 DSGVO).{" "}
            <Ph>Zertifizierung von Vercel im Data Privacy Framework prüfen</Ph>
          </p>
          <p>
            Unsere Datenbank betreibt Neon (Neon, Inc., USA) als Auftragsverarbeiter auf Servern in der EU-Region Frankfurt
            am Main. Dort liegen Bestellungen, Karten, Wunschseiten und der Postausgang. Die IBAN ist dort nur verschlüsselt
            gespeichert. Für einen möglichen Zugriff aus den USA gelten Standardvertragsklauseln oder das EU-US Data Privacy
            Framework (Art. 45 und 46 DSGVO).{" "}
            <Ph>Anschrift von Neon und Grundlage der Übermittlung prüfen</Ph>
          </p>
          <p>
            Beim Aufruf der Website verarbeitet Vercel technisch notwendige Daten, etwa IP-Adresse, Datum und Uhrzeit,
            aufgerufene Seite und Browsertyp. Das dient dem sicheren Betrieb und der Fehlersuche (berechtigtes Interesse,
            Art. 6 Abs. 1 lit. f DSGVO). Wir speichern diese Protokolle nicht selbst in unserer Datenbank.{" "}
            <Ph>Speicherdauer der Protokolle laut Vercel-Tarif ergänzen</Ph>
          </p>
        </Section>

        <Section id="cookies" title="Cookies und lokaler Speicher">
          <p>
            Wir setzen keine Cookies. Es gibt keine Werbe-, Tracking- oder Statistik-Cookies und keine Analysedienste. Ein
            Cookie-Banner ist deshalb nicht nötig.
          </p>
          <List>
            <li>
              <b>Warenkorb:</b> Ihr Warenkorb wird im lokalen Speicher Ihres Browsers (localStorage) abgelegt und erst bei der
              Bestellung an uns übertragen. Sie können ihn jederzeit in den Browsereinstellungen löschen.
            </li>
            <li>
              <b>Kasse:</b> Während Sie bei Stripe bezahlen, hält Ihr Browser den Warenkorb kurz im Sitzungsspeicher
              (sessionStorage). Nach der Bestellung löschen wir diesen Eintrag. Er endet spätestens, wenn Sie den Tab schließen.
            </li>
          </List>
          <p>
            Beide Speicher sind für den von Ihnen gewünschten Dienst unbedingt erforderlich. Rechtsgrundlage ist § 165 Abs. 3
            TKG 2021. Unsere Schriften liegen auf unserem eigenen Server. Wir laden keine Inhalte von Google oder anderen
            Drittanbietern nach. Auf der Bezahlseite von Stripe kann Stripe eigene, für die Zahlung notwendige Cookies setzen.
          </p>
        </Section>

        <Section id="empfaenger" title="Empfänger im Überblick">
          <Dl
            rows={[
              { dt: "Vercel Inc., USA", dd: "Hosting der Website, Serverregion Frankfurt am Main" },
              { dt: "Neon, Inc., USA", dd: "Datenbank, Serverregion Frankfurt am Main" },
              { dt: "Stripe Payments Europe, Limited, Irland", dd: "Zahlungsabwicklung des Kartenpreises" },
              { dt: "Resend, Inc., USA", dd: "Versand von E-Mails" },
              { dt: <Co k="printShop" />, dd: "Druck gedruckter Karten" },
              { dt: "Österreichische Post AG", dd: "Zustellung gedruckter Karten, nur Name und Lieferadresse" },
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
            40 bis 42, 1030 Wien, E-Mail dsb@dsb.gv.at,{" "}
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
