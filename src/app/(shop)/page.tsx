import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { FORMATS, MOTIFS, OCCASIONS, motifById, xmasActive } from "@/lib/catalog";
import { HeroGift } from "@/components/HeroGift";
import { GiftCard, PAPER_LABEL, SHAPE_LABEL, paperSwatch } from "@/components/GiftCard";
import { Icon } from "@/components/Icon";
import { Torn } from "@/components/Torn";
import { Countdown } from "@/components/Countdown";
import { Faq, FAQ_ITEMS } from "@/components/Faq";
import { CalcTabs } from "@/components/calc/CalcTabs";
import { showcaseFor } from "@/components/showcase";
import { eurCents } from "@/components/format";

// Weihnachtsaktion und Countdown-Text hängen vom Datum ab: stündlich neu erzeugen.
export const revalidate = 3600;

const TEASER = ["gold", "sterne", "kurve", "mobile", "kuchen"] as const;

const occasionLabel = (id: string) => OCCASIONS.find((o) => o.id === id)?.label ?? "";
const price = (id: string) => FORMATS.find((f) => f.id === id)!.priceCents;

const STEPS = [
  { h: "Karte gestalten", p: "Motiv wählen, Betrag, Name des Kindes und deine Botschaft eintragen." },
  { h: "Nur die Karte zahlen", p: `Ab ${eurCents(price("mail"))}. Sie kommt per E-Mail zum Wunschtermin oder gedruckt im Kuvert per Post.` },
  { h: "Eltern lösen ein", p: "Sie geben den Code von der Karte ein und tragen ihre IBAN ein." },
  { h: "Du überweist direkt", p: "Du bekommst einen Bank-QR-Code per E-Mail und überweist direkt an die Eltern." },
  { h: "Ab ins Depot", p: "Die Eltern zahlen voraussichtlich ab Juli 2027 ins Zukunftsdepot ein." },
];

const FACTS: { dt: string; dd: ReactNode }[] = [
  { dt: "Was", dd: "Ein Wertpapierdepot mit Verrechnungskonto auf den Namen des Kindes, gesperrt bis zum 18. Geburtstag. Alternativ ein Bundesschatz-Zukunftskonto. Pro Kind ein Depot." },
  { dt: "Start", dd: "Voraussichtlich ab Juli 2027. Laut Entwurf ist der 1. Juli 2027 geplant, eine Verschiebung bis 1. Dezember 2027 ist möglich." },
  {
    dt: "Startbonus",
    dd: "500 € einmalig vom Staat für Kinder, die 2027 oder 2028 geboren werden (Wohnsitz in Österreich, Staatsbürgerschaft oder gleichgestellter Aufenthaltstitel). Er wird zurückgefordert, wenn das Kind nicht 15 Jahre bis zur Volljährigkeit in Österreich lebt. Eröffnen die Eltern bis zum 3. Geburtstag kein Depot, legt der Bund den Bonus vorübergehend im Bundesschatz an. Der Anspruch geht nicht verloren.",
  },
  {
    dt: "Einzahlen",
    dd: (
      <>
        Bis 5.000 € pro Kind und Jahr, der Bonus zählt nicht mit. Laut Entwurf <b>nur durch die Eltern</b>. Großeltern,
        Paten und Freunde schenken also den Eltern. Dafür gibt es Zukunftsgeschenk.
      </>
    ),
  },
  { dt: "Kosten", dd: "Banken bieten das Depot ohne Depotgebühren an." },
  { dt: "Steuer", dd: "Kursgewinne im Depot sind KESt-frei (normal 27,5 %). Dividenden und Zinsen bleiben laut Entwurf steuerpflichtig." },
  { dt: "Mit 18", dd: "Das Kind verfügt selbst über das Geld. Vorher ist eine Entnahme nur in Ausnahmefällen möglich (Notlage, Zustimmung des Gerichts), dann ohne Steuervorteil." },
];

export default function Home() {
  const promo = xmasActive();
  const fromPrice = eurCents(Math.min(...FORMATS.map((f) => f.priceCents)));

  return (
    <>
      <HeroGift fromPrice={fromPrice} promo={promo} />

      <div className="trust band" aria-label="Gut zu wissen">
        <ul className="wrap">
          <li>
            <Icon name="direct" />
            Geld geht direkt an die Eltern
          </li>
          <li>
            <Icon name="forever" />
            Unbefristet einlösbar
          </li>
          <li>
            <Icon name="truck" />
            Druck &amp; Versand aus Österreich (geplant)
          </li>
          <li>
            <Icon name="lock" />
            Sichere Zahlung: Karte, EPS, Apple Pay
          </li>
        </ul>
      </div>

      {/* ============ RECHNER ============ */}
      <section className="calc-sec band" id="rechner" aria-labelledby="calc-h">
        <div className="wrap">
          <div className="sec-head">
            <h2 className="h2" id="calc-h">
              Was wird aus deinem Geschenk bis 18?
            </h2>
            <p className="muted">
              Rechne nach, wie ein Geschenk bis zum 18. Geburtstag wachsen kann oder wie sich das ganze Depot entwickelt.
            </p>
          </div>
          <CalcTabs />
        </div>
      </section>

      {/* ============ KARTENAUSWAHL ============ */}
      <section className="shop band" id="karten" aria-labelledby="shop-h">
        <div className="wrap">
          <div className="sec-head">
            <h2 className="h2" id="shop-h">
              Such dir dein Papier aus.
            </h2>
            <p className="muted">
              {MOTIFS.length} Motive als Klappkarte, Postkarte, Quadrat, Anhänger oder im Goldkuvert. Jedes in mehreren
              Papierfarben, mit Name, Betrag und deinen Worten.
            </p>
          </div>
          <div className="shopgrid">
            {TEASER.map((id, i) => {
              const m = motifById(id)!;
              const sc = showcaseFor(id);
              const feature = i === 0;
              const premium = sc.format === "premium";
              return (
                <article key={id} className={feature ? "item feature" : "item"}>
                  <div className={`stage st-${sc.stage}`}>
                    <GiftCard
                      motif={m.id}
                      paper={m.papers[0]}
                      amount={sc.amount}
                      childName={sc.childName}
                      sender={sc.sender}
                      envelope={sc.envelope ?? "none"}
                      size="sm"
                      decorative
                      style={feature ? ({ "--bw": "190px" } as CSSProperties) : undefined}
                    />
                  </div>
                  <div className="iinfo">
                    <h3>
                      <Link href={`/karten/${m.id}`}>{m.name}</Link>
                    </h3>
                    <p className="meta">
                      {occasionLabel(m.occasion)} · {premium ? "Premium mit Goldkuvert" : SHAPE_LABEL[m.shape]}
                    </p>
                    <p className="price">{premium ? `Premium ${eurCents(price("premium"))}` : `ab ${fromPrice}`}</p>
                    <ul className="swatches" aria-label={`Papierfarben: ${m.papers.map((p) => PAPER_LABEL[p]).join(", ")}`}>
                      {m.papers.map((p) => (
                        <li key={p} style={paperSwatch(p)} />
                      ))}
                    </ul>
                    <div className="btn-holder">
                      <Link className="btn btn--sm" href={`/karten/${m.id}`} tabIndex={-1} aria-hidden="true">
                        Gestalten <Icon name="arrow" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="more-row">
            <Link className="btn btn--ghost" href="/karten">
              Alle Karten ansehen <Icon name="arrow" />
            </Link>
            <span className="muted small">Weihnachten, Aktien und Geld, Geburt, Taufe, Geburtstag, Ostern, Erstkommunion, Firmung, Schule und einfach so.</span>
          </div>
          <div className="shop-note">
            <div>
              <Icon name="info" />
              <p>
                <b>Preise vorläufig:</b> per E-Mail (PDF) {eurCents(price("mail"))} · gedruckt mit Kuvert, inkl. Versand{" "}
                {eurCents(price("print"))} · Premium mit Goldkuvert {eurCents(price("premium"))}.
              </p>
            </div>
            <div>
              <Icon name="qr" />
              <p>
                Der Betrag auf der Karte ist dein Geschenk an die Eltern. Du überweist ihn später per Bank-QR-Code direkt an
                sie, <b>nicht an uns</b>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WEIHNACHTSAKTION (Riss) ============ */}
      {promo ? (
        <Torn className="xmas band" paper="pink" id="weihnachten" aria-labelledby="xmas-h">
          <div className="wrap">
            <div className="goldstage" aria-hidden="true">
              <div className="genv">
                <div className="genv-card">
                  <span className="t1">Für Jakob</span>
                  <span className="t2 num">250&nbsp;€</span>
                  <span className="t3">Frohe Weihnachten!</span>
                </div>
                <div className="genv-front" />
                <div className="seal">
                  <Icon name="bow" />
                </div>
              </div>
            </div>
            <div className="xcard">
              <h2 id="xmas-h">
                Goldkuvert <span className="hl">gratis</span> zu jeder gedruckten Karte.
              </h2>
              <p className="lead">Bestellt bis 17. Dezember, dann liegt die Karte rechtzeitig unterm Christbaum.</p>
              <Countdown />
              <div className="buy-row">
                <Link className="btn" href="/karten/sterne?format=print">
                  Gedruckte Karte gestalten <Icon name="arrow" />
                </Link>
                <span className="gold-rule">
                  <i />
                  Goldkuvert statt weißem Kuvert
                </span>
              </div>
              <p className="tiny" style={{ marginTop: 16 }}>
                Aktion: Vorschlag, Bedingungen vorläufig. Karten sind unbefristet einlösbar.
              </p>
            </div>
          </div>
        </Torn>
      ) : null}

      {/* ============ SO FUNKTIONIERT'S ============ */}
      <section className="how band" id="so-gehts" aria-labelledby="how-h">
        <div className="wrap">
          <div className="sec-head">
            <h2 className="h2" id="how-h">
              So kommt dein Geschenk an.
            </h2>
            <p className="muted">Sechs Schritte, vom Aussuchen bis ins Depot. Für dich dauert es nur ein paar Minuten.</p>
          </div>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.h}>
                <span className="n" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </li>
            ))}
          </ol>
          <div className="direct">
            <span className="dic">
              <Icon name="qr" />
            </span>
            <div>
              <h3>Das Geld geht nie über uns.</h3>
              <p>
                Du überweist das Geschenk per Bank-QR-Code direkt auf das Konto der Eltern. Wer die IBAN schon kennt, bekommt
                den QR-Code gleich in die Karte gedruckt.
              </p>
            </div>
          </div>
          <div className="more-row">
            <Link className="sec-link" href="/so-funktionierts">
              Alles zum Ablauf, für Schenkende und Eltern <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ ZUKUNFTSDEPOT (kurz) ============ */}
      <section className="what band" id="depot" aria-labelledby="what-h">
        <div className="wrap">
          <div className="what-grid">
            <div className="what-intro">
              <h2 className="h2" id="what-h">
                Was ist das Zukunftsdepot?
              </h2>
              <p className="lead">
                Ein eigenes Wertpapierdepot für jedes Kind in Österreich, gesperrt bis zum 18. Geburtstag. Dann verfügt das
                Kind selbst über das Geld, zum Beispiel für Ausbildung, Wohnen oder den Berufseinstieg.
              </p>
              <span className="stand">Stand: Gesetzesentwurf, Nov. 2026. Details können sich bis zum Beschluss ändern.</span>
              <div className="more-row">
                <Link className="sec-link" href="/zukunftsdepot">
                  Mehr zum Zukunftsdepot <Icon name="arrow" />
                </Link>
              </div>
            </div>
            <dl className="facts">
              {FACTS.map((f) => (
                <div key={f.dt}>
                  <dt>{f.dt}</dt>
                  <dd>{f.dd}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ============ FAQ (kurz) ============ */}
      <section className="faq band" id="faq" aria-labelledby="faq-h">
        <div className="wrap">
          <h2 className="h2" id="faq-h">
            Häufige Fragen
          </h2>
          <Faq items={FAQ_ITEMS.slice(0, 5)} />
          <div className="more-row">
            <Link className="sec-link" href="/faq">
              Alle Fragen und Antworten <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
