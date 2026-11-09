import type { Metadata } from "next";
import Link from "next/link";
import { FORMATS, xmasActive } from "@/lib/catalog";
import { Icon } from "@/components/Icon";
import { eur, eurCents } from "@/components/format";
import { InfoIcon } from "@/components/info/InfoIcon";
import { CtaBox, InfoBody, List, Note, PageIntro, Section, infoStyles as s } from "@/components/info/InfoPage";
import { MoneyFlow } from "@/components/info/MoneyFlow";
import { Timeline, type TimelineItem } from "@/components/info/Timeline";

// Weihnachtsaktion im Zeitplan hängt vom Datum ab.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "So funktioniert's",
  description:
    "In sechs Schritten vom Aussuchen bis ins Zukunftsdepot. Bei uns bezahlst du nur die Karte. Den Geschenkbetrag überweist du per Bank-QR-Code direkt an die Eltern.",
};

const price = (id: string) => FORMATS.find((f) => f.id === id)!.priceCents;

type Step = { who: "Du" | "Eltern"; h: string; p: string; items?: string[] };

const STEPS: Step[] = [
  {
    who: "Du",
    h: "Karte aussuchen",
    p: "Wähle ein Motiv für den Anlass, zum Beispiel Weihnachten, Geburt oder Taufe. Dann trägst du den Betrag ein, den du schenken möchtest, den Namen des Kindes und deine Botschaft.",
    items: ["Die Vorschau zeigt dir sofort, wie die Karte aussieht.", "Der Betrag ist frei wählbar, von 10 € bis 5.000 €."],
  },
  {
    who: "Du",
    h: "Nur die Karte bezahlen",
    p: `Im Shop bezahlst du nur den Kartenpreis, ab ${eurCents(price("mail"))}. Den Geschenkbetrag bezahlst du hier nicht. Du kannst mit Karte, Apple Pay, Google Pay oder EPS bezahlen.`,
  },
  {
    who: "Du",
    h: "Verschenken",
    p: "Die Karte kommt so, wie du es möchtest.",
    items: [
      `Per E-Mail als PDF, sofort oder zu einem Wunschtermin, etwa am 24. Dezember um 17 Uhr (${eurCents(price("mail"))}).`,
      `Gedruckt als Klappkarte mit Kuvert, per Post in Österreich (${eurCents(price("print"))} inkl. Versand).`,
      `Premium mit Goldkuvert (${eurCents(price("premium"))} inkl. Versand).`,
    ],
  },
  {
    who: "Eltern",
    h: "Eltern lösen ein",
    p: "In der Karte steht ein Einlösecode mit QR-Code. Die Eltern öffnen damit unsere Einlöseseite und tragen ihren Namen, ihre E-Mail-Adresse und ihre IBAN ein. Die Karte gilt unbefristet, es gibt keine Eile.",
  },
  {
    who: "Du",
    h: "Du überweist direkt an die Eltern",
    p: "Sobald die Karte eingelöst ist, bekommst du eine E-Mail mit einem Bank-QR-Code. Du scannst ihn in deiner Banking-App. Empfänger, IBAN und Betrag sind dann schon ausgefüllt. Du prüfst die Angaben und gibst die Überweisung frei.",
  },
  {
    who: "Eltern",
    h: "Ab ins Zukunftsdepot",
    p: "Das Geld liegt jetzt auf dem Konto der Eltern. Sobald das Zukunftsdepot startet, voraussichtlich ab Juli 2027, eröffnen sie es für das Kind und zahlen dein Geschenk ein.",
  },
];

export default function SoFunktioniertsPage() {
  const promo = xmasActive();
  const cardPrice = eurCents(price("mail"));

  const timeline: TimelineItem[] = [
    ...(promo
      ? [
          {
            when: "Bis 17. Dezember 2026",
            title: "Gedruckte Karte bestellen",
            text: "Dann liegt sie rechtzeitig unterm Christbaum. Zu jeder gedruckten Karte gibt es das Goldkuvert gratis (Aktion vorläufig).",
            state: "now" as const,
            badge: "Jetzt",
          },
        ]
      : []),
    {
      when: "24. Dezember 2026",
      title: "Bescherung",
      text: "Die gedruckte Karte liegt unterm Christbaum. Oder die E-Mail-Karte kommt zum Wunschtermin an.",
    },
    {
      when: "Ab Weihnachten",
      title: "Einlösen und überweisen",
      text: "Die Eltern lösen die Karte ein. Du bekommst den Bank-QR-Code und überweist direkt an sie. Das Geld wartet auf ihrem Konto.",
    },
    {
      when: "Juli 2027",
      title: "Das Zukunftsdepot startet voraussichtlich",
      text: "Voraussichtlich ab Juli 2027 eröffnen die Eltern nach dem Erstgespräch das Depot und zahlen das Geschenk ein. Laut Entwurf ist eine Verschiebung bis 1. Dezember 2027 möglich.",
    },
  ];

  return (
    <>
      <PageIntro
        title="So kommt dein Geschenk an."
        lead="Sechs Schritte vom Aussuchen bis ins Zukunftsdepot. Für dich dauert es nur ein paar Minuten. Das Geld geht dabei nie über uns."
        tag={{ top: "In nur", big: "6", line: "Schritten bis ins Depot" }}
        actions={
          <>
            <Link className="btn" href="/karten">
              Karte aussuchen <Icon name="arrow" />
            </Link>
            <Link className="btn btn--ghost" href="/einloesen">
              Für Eltern: Karte einlösen
            </Link>
          </>
        }
      />

      <InfoBody
        toc={[
          { id: "schritte", label: "Die 6 Schritte" },
          { id: "geldfluss", label: "Wohin das Geld fließt" },
          { id: "varianten", label: "Zwei weitere Wege" },
          { id: "zeitplan", label: "Zeitplan bis Juli 2027" },
        ]}
      >
        <Section id="schritte" title="Die 6 Schritte">
          <ol className={s.steps}>
            {STEPS.map((st, i) => (
              <li key={st.h} className={st.who === "Eltern" ? `${s.step} ${s.stepParent}` : s.step}>
                <span className={s.stepN} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={s.stepWho}>{st.who === "Eltern" ? "Das machen die Eltern" : "Das machst du"}</span>
                <h3>
                  <span className="sr">Schritt {i + 1}: </span>
                  {st.h}
                </h3>
                <p>{st.p}</p>
                {st.items ? (
                  <List>
                    {st.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </List>
                ) : null}
              </li>
            ))}
          </ol>
        </Section>

        <Section id="geldfluss" title="Wohin das Geld fließt">
          <p>
            Es gibt zwei getrennte Wege. Der Kartenpreis geht an uns. Der Geschenkbetrag geht von dir direkt an die Eltern.
            Wir sind kein Zahlungsdienst und halten nie Geld für andere.
          </p>
          <MoneyFlow cardPrice={cardPrice} giftAmount={eur(100)} />
          <p>
            Warum so? Laut Gesetzesentwurf dürfen nur die Eltern ins Zukunftsdepot einzahlen. Deshalb schenkst du das Geld
            den Eltern, und sie zahlen es für das Kind ein.
          </p>
        </Section>

        <Section id="varianten" title="Zwei weitere Wege">
          <div className={s.variants}>
            <article className={s.variant}>
              <span className={s.nodeIc}>
                <InfoIcon name="home" />
              </span>
              <h3>Die Wunschseite der Eltern</h3>
              <p>
                Eltern können eine eigene Wunschseite für ihr Kind anlegen und dabei einmal ihre IBAN hinterlegen. Den Link
                schicken sie an Familie und Freunde. Wer über die Wunschseite eine Karte kauft, bekommt den Bank-QR-Code
                gleich nach dem Kauf. Das Einlösen entfällt.
              </p>
              <p style={{ marginTop: 12 }}>
                Die IBAN steckt im Bank-QR-Code. Teilt den Link deshalb nur mit Menschen, denen ihr vertraut.
              </p>
              <p style={{ marginTop: 14 }}>
                <Link className="sec-link" href="/wunschseite">
                  Wunschseite anlegen <Icon name="arrow" />
                </Link>
              </p>
            </article>
            <article className={s.variant}>
              <span className={s.nodeIc}>
                <Icon name="qr" />
              </span>
              <h3>Du kennst die IBAN schon</h3>
              <p>
                Dann kannst du die IBAN der Eltern beim Gestalten eintragen. Der Bank-QR-Code steht direkt in der Karte. Die
                Eltern müssen nichts einlösen, und du überweist, wann es für dich passt.
              </p>
              <p style={{ marginTop: 12 }}>
                Praktisch für Großeltern, die die Kontodaten ihrer Kinder ohnehin haben.
              </p>
            </article>
          </div>
        </Section>

        <Section id="zeitplan" title="Zeitplan: von Weihnachten 2026 bis Juli 2027">
          <p>
            Das Zukunftsdepot gibt es zu Weihnachten 2026 noch nicht. Das ist kein Problem. Das Geschenk wartet bei den
            Eltern, bis das Depot startet.
          </p>
          <Timeline items={timeline} label="Zeitplan von Weihnachten 2026 bis Juli 2027" />
          <Note>
            <p>
              Das Zukunftsdepot ist derzeit ein Gesetzesentwurf (157/ME). Termine können sich bis zum Beschluss ändern. Auf
              der Karte steht deshalb kein Datum, das wir nicht halten können.
            </p>
          </Note>
        </Section>

        <CtaBox
          title="Bereit zum Schenken?"
          text="Such dir ein Motiv aus. In ein paar Minuten ist die Karte fertig."
        >
          <Link className="btn" href="/karten">
            Karten ansehen <Icon name="arrow" />
          </Link>
          <Link className="btn btn--ghost" href="/faq">
            Häufige Fragen
          </Link>
        </CtaBox>
      </InfoBody>
    </>
  );
}
