import type { Metadata } from "next";
import Link from "next/link";
import { FORMATS, MAX_AMOUNT_EUR, MIN_AMOUNT_EUR, XMAS_DEADLINE } from "@/lib/catalog";
import { eur, eurCents } from "@/components/format";
import { InfoBody, List, Note, PageIntro, Section } from "@/components/info/InfoPage";
import { Co, CoNameAddress, DraftBox, legalTag, Ph } from "@/components/info/Legal";
// Firmendaten kommen zur Laufzeit aus Umgebungsvariablen. Deshalb wird die Seite bei jedem Aufruf erzeugt.
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description:
    "AGB für den Kauf personalisierter Geschenkkarten bei Zukunftsgeschenk. Der Geschenkbetrag wird nicht über uns abgewickelt. Karten sind unbefristet einlösbar.",
};

const SECTIONS = [
  { id: "geltung", label: "§ 1 Geltungsbereich" },
  { id: "leistung", label: "§ 2 Was wir anbieten" },
  { id: "zahlungsdienst", label: "§ 3 Kein Zahlungsdienst" },
  { id: "vertrag", label: "§ 4 Vertragsabschluss" },
  { id: "preise", label: "§ 5 Preise und Zahlung" },
  { id: "lieferung", label: "§ 6 Lieferung" },
  { id: "einloesung", label: "§ 7 Einlösung" },
  { id: "inhalte", label: "§ 8 Ihre Inhalte" },
  { id: "ruecktritt", label: "§ 9 Rücktrittsrecht" },
  { id: "gewaehr", label: "§ 10 Gewährleistung" },
  { id: "haftung", label: "§ 11 Haftung" },
  { id: "schluss", label: "§ 12 Schlussbestimmungen" },
];

const title = (id: string) => SECTIONS.find((s) => s.id === id)!.label;
const xmasDate = XMAS_DEADLINE.toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Vienna" });
const price = (id: string) => eurCents(FORMATS.find((f) => f.id === id)!.priceCents);

export default function AgbPage() {
  return (
    <>
      <PageIntro
        title={"Allgemeine Geschäfts\u00adbedingungen"}
        lead="Diese Bedingungen gelten für den Kauf personalisierter Geschenkkarten im Online-Shop Zukunftsgeschenk."
        tag={legalTag()}
        meta={<span>Fassung vom <Co k="legalDate" /></span>}
      />
      <InfoBody legal before={<DraftBox />} toc={SECTIONS}>
        <Note>
          <p>
            <b>Kurz gesagt:</b> Sie kaufen bei uns eine gestaltete Geschenkkarte. Den Geldbetrag, der auf der Karte steht,
            überweisen Sie später selbst direkt an die Eltern des Kindes. Dieses Geld wird nicht über uns abgewickelt. Die
            Karten sind unbefristet einlösbar.
          </p>
        </Note>

        <Section id="geltung" title={title("geltung")}>
          <p>
            (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen <CoNameAddress />{" "}
            (im Folgenden „wir“) und den Kundinnen und Kunden (im Folgenden „Sie“) über den Online-Shop
            Zukunftsgeschenk.
          </p>
          <p>
            (2) Unser Angebot richtet sich an Verbraucherinnen und Verbraucher im Sinne des Konsumentenschutzgesetzes (KSchG).
            Abweichende Bedingungen von Kundinnen und Kunden gelten nur, wenn wir ihnen ausdrücklich schriftlich zustimmen.
          </p>
        </Section>

        <Section id="leistung" title={title("leistung")}>
          <p>(1) Wir gestalten und verkaufen personalisierte Geschenkkarten in diesen Formen:</p>
          <List>
            <li>Karte per E-Mail als PDF, sofort oder zu einem gewählten Zeitpunkt ({price("mail")}).</li>
            <li>Gedruckte Karte im Format des Motivs mit Kuvert, Versand per Post in Österreich ({price("print")} inkl. Versand).</li>
            <li>
              Premium-Karte auf Büttenpapier mit Goldkuvert und Siegel, Versand per Post in Österreich ({price("premium")}{" "}
              inkl. Versand).
            </li>
          </List>
          <p>
            (2) Jede Karte enthält die von Ihnen gewählten Angaben, etwa Motiv, Papierfarbe, den Namen des Kindes, einen
            Geschenkbetrag, eine Botschaft und den Absender. Dazu kommen ein persönlicher Einlösecode und ein QR-Code.
          </p>
          <p>
            (3) Der Geschenkbetrag ist frei wählbar von {eur(MIN_AMOUNT_EUR)} bis {eur(MAX_AMOUNT_EUR)}. Er ist eine
            Absichtserklärung von Ihnen gegenüber den Beschenkten und kein Teil des Kaufpreises.
          </p>
          <p>
            (4) Wir sind ein privates Unternehmen und kein offizielles Angebot der Republik Österreich oder einer Partei. Wir
            bieten keine Anlageberatung an und vermitteln keine Depots oder Finanzprodukte. Angaben zum Zukunftsdepot beruhen
            auf dem Ministerialentwurf 157/ME (Stand November 2026) und können sich ändern. Ob und wann das Zukunftsdepot
            startet, liegt außerhalb unseres Einflusses.
          </p>
        </Section>

        <Section id="zahlungsdienst" title={title("zahlungsdienst")}>
          <p>
            (1) <b>Der Geschenkbetrag wird nicht über uns abgewickelt.</b> Wir nehmen ihn nicht entgegen, verwahren ihn nicht
            und leiten ihn nicht weiter. Wir erbringen keine Zahlungsdienste im Sinne des Zahlungsdienstegesetzes 2018.
          </p>
          <p>
            (2) Nach der Einlösung erhalten Sie einen Bank-QR-Code (EPC-Standard) mit den Kontodaten der Eltern. Ob, wann und
            in welcher Höhe Sie überweisen, entscheiden Sie selbst. Die Überweisung erfolgt direkt von Ihrem Konto auf das
            Konto der Eltern.
          </p>
          <p>
            (3) Die Kontodaten stammen von den Eltern oder, wenn Sie Name und IBAN der Eltern bei der Bestellung selbst
            eintragen, von Ihnen. Wir prüfen die Gültigkeit der IBAN technisch, aber nicht, wem das
            Konto gehört. Bitte prüfen Sie Empfänger und Betrag in Ihrer Banking-App, bevor Sie die Überweisung freigeben.
          </p>
          <p>
            (4) Die Einzahlung ins Zukunftsdepot nehmen ausschließlich die Eltern vor. Wir haben darauf keinen Einfluss und
            übernehmen keine Gewähr dafür, dass der Betrag eingezahlt wird.
          </p>
        </Section>

        <Section id="vertrag" title={title("vertrag")}>
          <p>
            (1) Die Darstellung der Karten im Shop ist kein verbindliches Angebot. Sie gestalten Ihre Karte, legen sie in den
            Warenkorb und prüfen Ihre Angaben in der Bestellübersicht.
          </p>
          <p>
            (2) Mit Klick auf den Bestellknopf „Zahlungspflichtig bestellen“, auf dem auch der zu zahlende Betrag steht, geben
            Sie ein verbindliches Angebot ab. Der
            Vertrag kommt zustande, sobald die Zahlung bestätigt ist und wir Ihnen die Bestellbestätigung per E-Mail senden.
          </p>
          <p>
            (3) Vertragssprache ist Deutsch. Die Bestellbestätigung mit den Angaben zu Ihrer Bestellung senden wir Ihnen per
            E-Mail. Ihre Bestellung können Sie über den Link in dieser E-Mail jederzeit wieder aufrufen. Diese AGB und die
            Widerrufsbelehrung können Sie auf unserer Website abrufen, speichern und ausdrucken.{" "}
            <Ph>Prüfen, ob AGB und Widerrufsbelehrung der Bestellbestätigung beiliegen müssen (§ 7 Abs. 3 FAGG)</Ph>
          </p>
          <p>
            (4) Eingabefehler können Sie vor dem Absenden in der Bestellübersicht erkennen und korrigieren, indem Sie zurück
            zur Gestaltung oder in den Warenkorb wechseln.
          </p>
        </Section>

        <Section id="preise" title={title("preise")}>
          <p>
            (1) Es gelten die Preise zum Zeitpunkt der Bestellung. Alle Preise sind Endpreise in Euro inklusive 20 %
            Umsatzsteuer. Bei gedruckten Karten ist der Versand innerhalb Österreichs im Preis enthalten. Der Geschenkbetrag
            ist im Preis nicht enthalten.
          </p>
          <p>
            (2) Die Zahlung wickelt der Zahlungsdienst Stripe Payments Europe, Limited (Dublin, Irland) ab. Sie können mit
            den Zahlungsarten bezahlen, die Ihnen auf der Bezahlseite angezeigt werden, etwa Kreditkarte, Apple Pay, Google
            Pay oder EPS.
          </p>
          <p>(3) Der Kaufpreis ist mit der Bestellung fällig. Sie erhalten eine Rechnung per E-Mail.</p>
          <p>
            (4) Aktionen gelten nur im angegebenen Zeitraum und solange sie im Shop angezeigt werden. Zu Weihnachten
            erhalten gedruckte Karten bei Bestellung bis {xmasDate} das Goldkuvert ohne Aufpreis.
          </p>
        </Section>

        <Section id="lieferung" title={title("lieferung")}>
          <p>
            (1) <b>E-Mail-Karten</b> senden wir nach Zahlungseingang an die angegebene Adresse, sofort oder zum gewählten
            Zeitpunkt. Für die richtige E-Mail-Adresse sind Sie verantwortlich.
          </p>
          <p>
            (2) <b>Gedruckte Karten</b> drucken wir nach Zahlungseingang und versenden sie per Post. Wir liefern nur an
            Adressen in Österreich. Die Lieferzeit beträgt in der Regel <Co k="deliveryDays" /> Werktage ab Zahlungseingang.
          </p>
          <p>
            (3) Für Bestellungen vor Weihnachten nennen wir im Shop einen Bestellschluss, zuletzt den {xmasDate}. Wir
            bemühen uns, Karten bis zu diesem Termin rechtzeitig zuzustellen. Für Verzögerungen bei der Post können wir nicht
            einstehen.
          </p>
          <p>
            (4) Die Gefahr geht bei Verbraucherinnen und Verbrauchern erst mit der Übergabe der Karte an sie oder an eine von
            ihnen bestimmte Person über (§ 7b KSchG).
          </p>
        </Section>

        <Section id="einloesung" title={title("einloesung")}>
          <p>
            (1) <b>Die Karten sind unbefristet einlösbar.</b> Der Einlösecode verfällt nicht.
          </p>
          <p>
            (2) Zum Einlösen geben die Eltern den Code auf unserer Website ein und hinterlegen ihren Namen, ihre E-Mail-Adresse
            und ihre IBAN. Danach senden wir Ihnen per E-Mail den Link zum Bank-QR-Code. Jede Karte kann nur einmal
            eingelöst werden.
          </p>
          <p>
            (3) Die Karte begründet keinen Anspruch gegen uns auf Auszahlung des Geschenkbetrags. Der Betrag ist ein Geschenk
            von Ihnen an die Eltern.
          </p>
          <p>
            (4) Ist die Bankverbindung schon bei der Bestellung bekannt, weil die Eltern eine Wunschseite angelegt haben oder
            weil Sie Name und IBAN der Eltern selbst eintragen, steht der Bank-QR-Code direkt auf der Karte. Ein Einlösen ist
            dann nicht nötig. Tragen Sie die Bankverbindung selbst ein, sind Sie für ihre Richtigkeit verantwortlich. Diese
            Bankverbindung löschen wir 90 Tage nach dem Kauf. Danach können die Eltern die Karte wie jede andere Karte mit dem
            Einlösecode einlösen.
          </p>
          <p>
            (5) Sollten wir den Betrieb des Shops einstellen, informieren wir Sie und die Eltern rechtzeitig, damit
            ausstehende Karten noch eingelöst werden können. <Ph>Regelung für die Einstellung des Betriebs prüfen</Ph>
          </p>
        </Section>

        <Section id="inhalte" title={title("inhalte")}>
          <p>
            (1) Für Namen, Botschaften und andere Texte auf der Karte sind Sie verantwortlich. Sie dürfen keine Rechte Dritter
            verletzen und keine rechtswidrigen, beleidigenden oder diskriminierenden Inhalte verwenden.
          </p>
          <p>
            (2) Wir drucken Ihre Texte so, wie Sie sie eingeben, und prüfen Rechtschreibung nicht. Bitte prüfen Sie die
            Vorschau sorgfältig.
          </p>
          <p>
            (3) Farben können im Druck geringfügig von der Darstellung am Bildschirm abweichen. Das ist kein Mangel.
          </p>
          <p>(4) Wir dürfen Bestellungen ablehnen, deren Inhalte gegen Absatz 1 verstoßen.</p>
        </Section>

        <Section id="ruecktritt" title={title("ruecktritt")}>
          <p>
            Informationen zum Rücktrittsrecht nach dem Fern- und Auswärtsgeschäfte-Gesetz (FAGG) und zu seinen Ausnahmen
            finden Sie in unserer <Link href="/widerruf">Widerrufsbelehrung</Link>. Bei gedruckten Karten, die nach Ihren
            Angaben gestaltet werden, besteht kein Rücktrittsrecht (§ 18 Abs. 1 Z 3 FAGG). Bei E-Mail-Karten erlischt das
            Rücktrittsrecht, wenn Sie in der Kasse ausdrücklich zustimmen, dass wir die digitale Karte sofort erstellen und
            zum gewählten Termin versenden (§ 18 Abs. 1 Z 11 FAGG). Diese Zustimmung bestätigen wir in der
            Bestellbestätigung.
          </p>
        </Section>

        <Section id="gewaehr" title={title("gewaehr")}>
          <p>
            Es gilt die gesetzliche Gewährleistung, insbesondere nach dem Verbrauchergewährleistungsgesetz (VGG). Ist eine
            Karte fehlerhaft gedruckt, beschädigt oder nicht angekommen, melden Sie sich bitte bei <Co k="email" link="mailto" />.
            Wir drucken die Karte dann neu oder senden sie erneut.
          </p>
        </Section>

        <Section id="haftung" title={title("haftung")}>
          <p>
            (1) Wir haften für Schäden nur bei Vorsatz und grober Fahrlässigkeit. Das gilt nicht für Personenschäden und
            nicht, soweit zwingende gesetzliche Bestimmungen etwas anderes vorsehen.
          </p>
          <p>
            (2) Soweit gesetzlich zulässig, haften wir nicht für Überweisungen, die Sie an die Eltern vornehmen, für die Richtigkeit der Kontodaten der
            Eltern und für die Verwendung des Geldes. Ebenso haften wir nicht dafür, ob und in welcher Form das Zukunftsdepot
            gesetzlich eingeführt wird.
          </p>
        </Section>

        <Section id="schluss" title={title("schluss")}>
          <p>
            (1) Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts. Für Verbraucherinnen und Verbraucher gilt
            diese Rechtswahl nur, soweit ihnen dadurch nicht der Schutz zwingender Bestimmungen ihres Aufenthaltsstaates
            entzogen wird.
          </p>
          <p>
            (2) Für Klagen gegen Verbraucherinnen und Verbraucher mit Wohnsitz in Österreich ist das Gericht an ihrem Wohnsitz
            zuständig (§ 14 KSchG).
          </p>
          <p>
            (3) Sollte eine Bestimmung dieser AGB unwirksam sein, bleiben die übrigen Bestimmungen wirksam.
          </p>
          <p>
            (4) Informationen zur Streitbeilegung finden Sie im <Link href="/impressum">Impressum</Link>.
          </p>
        </Section>
      </InfoBody>
    </>
  );
}
