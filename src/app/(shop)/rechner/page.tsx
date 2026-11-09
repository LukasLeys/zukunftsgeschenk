import type { Metadata } from "next";
import Link from "next/link";
import { CalcTabs } from "@/components/calc/CalcTabs";
import { Icon } from "@/components/Icon";
import { eur } from "@/components/format";
import { InfoIcon } from "@/components/info/InfoIcon";
import { CtaBox, InfoBody, List, Note, PageIntro, Section, infoStyles as s } from "@/components/info/InfoPage";
import { DEFAULT_RATE, depotModel, giftModel } from "@/lib/calc";

export const metadata: Metadata = {
  title: "Rechner: Was wird aus deinem Gutschein bis 18?",
  description:
    "Unverbindliche Modellrechnung fürs Zukunftsdepot: Wie kann ein Geschenk oder ein Sparplan bis zum 18. Geburtstag wachsen? Mit 6,7 % angenommener Rendite, ohne Kosten und Inflation. Keine Garantie.",
};

type SP = Promise<Record<string, string | string[] | undefined>>;

const pct = (r: number) => `${String(Math.round(r * 1000) / 10).replace(".", ",")} %`;

export default async function RechnerPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const modus = Array.isArray(sp.modus) ? sp.modus[0] : sp.modus;
  const initial = modus === "depot" ? "depot" : "gift";

  // Beispiele (Jahrgang 2027, Modell). Nur Depotwert und Einzahlungen.
  const depotRows = [50, 100, 150, 416.67].map((m) => {
    const r = depotModel(2027, m, 0);
    return { label: m > 400 ? "416,67 € pro Monat (5.000 € im Jahr)" : `${eur(m)} pro Monat`, paid: r.end.paid, value: r.end.value };
  });
  const giftRows = [50, 100, 250, 500].map((a) => ({ amount: a, once: giftModel(a, 2027, false), yearly: giftModel(a, 2027, true) }));
  const rateRows = [0.03, 0.05, DEFAULT_RATE].map((rate) => ({ rate, r: depotModel(2027, 100, 0, rate) }));

  return (
    <>
      <PageIntro
        title="Was wird aus deinem Gutschein bis 18?"
        lead="Zwei Rechner zum Ausprobieren. Der Gutschein-Rechner zeigt, wie ein einzelnes Geschenk wachsen kann. Der Depot-Rechner zeigt das ganze Zukunftsdepot mit einem monatlichen Sparplan der Eltern."
        tag={{ top: "Modell mit", big: "6,7 %", line: "angenommener Rendite, ohne Garantie" }}
        meta={
          <>
            <span>
              <InfoIcon name="doc" />
              Stand: Gesetzesentwurf 157/ME, November 2026
            </span>
            <span>
              <InfoIcon name="shield" />
              Keine Anlageberatung
            </span>
          </>
        }
      />

      <section className="calc-sec band" aria-label="Rechner">
        <div className="wrap">
          <CalcTabs key={initial} initial={initial} />
        </div>
      </section>

      <InfoBody
        toc={[
          { id: "annahmen", label: "So rechnen wir" },
          { id: "beispiele", label: "Beispiele" },
          { id: "rendite", label: "Was die Annahme ausmacht" },
          { id: "hinweis", label: "Wichtiger Hinweis" },
        ]}
      >
        <Section id="annahmen" title="So rechnen wir">
          <p>Beide Rechner sind ein Modell. Sie zeigen, was unter bestimmten Annahmen möglich wäre. Diese Annahmen sind:</p>
          <List>
            <li>
              <b>6,7 % Rendite pro Jahr.</b> Diesen Wert verwenden auch öffentlich diskutierte Modellrechnungen zum
              Zukunftsdepot. Es ist eine Annahme über einen langen Zeitraum und keine Zusage. Im Gutschein-Rechner kannst du
              auch mit 3 % oder 5 % rechnen.
            </li>
            <li>
              <b>Keine Kosten.</b> Die Fonds im Zukunftsdepot dürfen bis zu 1 % pro Jahr kosten. Diese Kosten würden das
              Ergebnis verringern.
            </li>
            <li>
              <b>Keine Inflation.</b> Die Beträge sind in heutigen Euro gerechnet. In 18 Jahren kann man sich für denselben
              Betrag voraussichtlich weniger kaufen.
            </li>
            <li>
              <b>Sparbeginn frühestens 2027.</b> Das Depot startet laut Entwurf voraussichtlich ab Juli 2027. Wir rechnen ab 2027 in
              ganzen Jahren bis zum 18. Geburtstag.
            </li>
            <li>
              <b>Startbonus und Obergrenze.</b> Für die Jahrgänge 2027 und 2028 rechnet der Depot-Rechner 500 € Startbonus
              ein. Private Einzahlungen sind auf 5.000 € pro Jahr begrenzt, der Bonus zählt nicht mit.
            </li>
            <li>
              <b>Steuer vereinfacht.</b> Kursgewinne sind laut Entwurf KESt-frei. Die angezeigte KESt-Ersparnis ist grob
              geschätzt: 27,5 % des Wertzuwachses aus privaten Einzahlungen.
            </li>
          </List>
        </Section>

        <Section id="beispiele" title="Beispiele">
          <h3>Sparplan der Eltern, Kind geboren 2027</h3>
          <p>Monatliche Einzahlung ab 2027 bis zum 18. Geburtstag, mit 500 € Startbonus.</p>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <caption>Modellwerte mit 6,7 % angenommener Rendite pro Jahr, ohne Kosten und Inflation.</caption>
              <thead>
                <tr>
                  <th scope="col">Sparplan</th>
                  <th scope="col">Einzahlungen inkl. Bonus</th>
                  <th scope="col">Depotwert mit 18</th>
                </tr>
              </thead>
              <tbody>
                {depotRows.map((r) => (
                  <tr key={r.label}>
                    <td>{r.label}</td>
                    <td className="num">{eur(r.paid)}</td>
                    <td className="num">
                      <b>{eur(r.value)}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Ein Geschenk, Kind geboren 2027</h3>
          <p>
            Einmal zu Weihnachten 2026 geschenkt und 2027 eingezahlt. Oder jedes Jahr derselbe Betrag, von 2027 bis 2044.
          </p>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <caption>Depotwert mit 18. Modellwerte mit 6,7 % angenommener Rendite pro Jahr, ohne Kosten und Inflation.</caption>
              <thead>
                <tr>
                  <th scope="col">Geschenk</th>
                  <th scope="col">Einmal geschenkt</th>
                  <th scope="col">Jedes Jahr geschenkt</th>
                </tr>
              </thead>
              <tbody>
                {giftRows.map((g) => (
                  <tr key={g.amount}>
                    <td>{eur(g.amount)}</td>
                    <td className="num">
                      <b>{eur(g.once.value)}</b>
                      <small className={s.sub}>eingezahlt {eur(g.once.given)}</small>
                    </td>
                    <td className="num">
                      <b>{eur(g.yearly.value)}</b>
                      <small className={s.sub}>eingezahlt {eur(g.yearly.given)}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="rendite" title="Was die Annahme ausmacht">
          <p>
            Wie viel am Ende im Depot liegt, hängt stark von der Rendite ab. Derselbe Sparplan von 100 € pro Monat, Kind
            geboren 2027, mit drei verschiedenen Annahmen:
          </p>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <caption>Modellwerte ohne Kosten und Inflation. Keine Garantie.</caption>
              <thead>
                <tr>
                  <th scope="col">Angenommene Rendite</th>
                  <th scope="col">Einzahlungen inkl. Bonus</th>
                  <th scope="col">Depotwert mit 18</th>
                </tr>
              </thead>
              <tbody>
                {rateRows.map(({ rate, r }) => (
                  <tr key={rate}>
                    <td>{pct(rate)} pro Jahr</td>
                    <td className="num">{eur(r.end.paid)}</td>
                    <td className="num">
                      <b>{eur(r.end.value)}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Fonds schwanken im Wert. Es gibt gute und schlechte Jahre, und am Ende kann auch weniger herauskommen als
            eingezahlt.
          </p>
        </Section>

        <Section id="hinweis" title="Wichtiger Hinweis">
          <Note>
            <p>
              Alle Werte sind unverbindliche Modellrechnungen auf Grundlage des Gesetzesentwurfs 157/ME (Stand November
              2026). Sie sind keine Prognose, keine Renditegarantie und keine Anlageberatung. Wir empfehlen keine Fonds.
            </p>
          </Note>
          <p>
            Mehr zu den Regeln liest du auf der Seite <Link href="/zukunftsdepot">Was ist das Zukunftsdepot?</Link>
          </p>
        </Section>

        <CtaBox
          title="Aus der Zahl ein Geschenk machen"
          text="Such dir eine Karte aus, trag den Betrag und den Namen des Kindes ein. Das Geld überweist du später direkt an die Eltern."
        >
          <Link className="btn" href="/karten">
            Karte gestalten <Icon name="arrow" />
          </Link>
        </CtaBox>
      </InfoBody>
    </>
  );
}
