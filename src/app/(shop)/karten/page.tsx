import type { Metadata } from "next";
import Link from "next/link";
import { FORMATS, MOTIFS, OCCASIONS, xmasActive, type Occasion } from "@/lib/catalog";
import { GiftCard } from "@/components/GiftCard";
import { Icon, type IconName } from "@/components/Icon";
import { Torn } from "@/components/Torn";
import { eurCents } from "@/components/format";
import { FROM_PRICE, MotifTile, OCCASION_PHRASE } from "@/components/shop/MotifTile";
import s from "@/components/shop/shop.module.css";

type Search = Promise<{ anlass?: string | string[] }>;

const pick = (raw: string | string[] | undefined): Occasion | null => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return OCCASIONS.some((o) => o.id === v) ? (v as Occasion) : null;
};

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const occ = pick((await searchParams).anlass);
  const base = "/karten";
  if (!occ)
    return {
      title: "Alle Karten",
      description: `Elf Geschenkkarten fürs Zukunftsdepot: Weihnachten, Geburt, Taufe, Geburtstag, Erstkommunion, Firmung und einfach so. Per E-Mail oder gedruckt, ab ${FROM_PRICE}. Das Geschenkgeld geht direkt an die Eltern.`,
      alternates: { canonical: base },
    };
  return {
    title: `Karten ${OCCASION_PHRASE[occ]}`,
    description: `Geschenkkarten ${OCCASION_PHRASE[occ]} fürs Zukunftsdepot, ab ${FROM_PRICE}. Das Geschenkgeld geht direkt an die Eltern.`,
    alternates: { canonical: `${base}?anlass=${occ}` },
  };
}

const ZICON: Record<string, IconName> = { mail: "mail", print: "env", premium: "seal" };

export default async function KartenPage({ searchParams }: { searchParams: Search }) {
  const occ = pick((await searchParams).anlass);
  const list = occ ? MOTIFS.filter((m) => m.occasion === occ) : MOTIFS;
  const promo = xmasActive();
  const count = (id: Occasion) => MOTIFS.filter((m) => m.occasion === id).length;

  return (
    <>
      <section className={`band ${s.shopHead}`} aria-labelledby="karten-h">
        <div className={`wrap ${s.shopHeadGrid}`}>
          <div>
            <h1 id="karten-h" className={s.h1}>
              Such dir eine Karte aus.
            </h1>
            <p className="lead">
              Elf Motive, jedes in mehreren Papierfarben. Du trägst Betrag, Namen und deine Worte ein. Bei uns zahlst du nur
              die Karte, das Geschenkgeld überweist du direkt an die Eltern.
            </p>
          </div>
          <div className={s.fan} aria-hidden="true">
            <GiftCard motif="mobile" paper="rosa" amount={500} childName="Emma" sender="Von Oma und Opa" size="sm" decorative />
            <GiftCard motif="sterne" paper="pink" amount={100} childName="Lena" sender="Von Oma Gerti" size="sm" decorative />
            <GiftCard motif="kuchen" paper="gelb" amount={250} childName="Leon" sender="Von Tante Susi" size="sm" decorative />
          </div>
        </div>
      </section>

      <section className={`shop band ${s.shopList}`} aria-labelledby="list-h">
        <div className="wrap">
          <nav className={s.filters} aria-label="Nach Anlass filtern">
            <ul>
              <li>
                <Link href="/karten" scroll={false} aria-current={occ ? undefined : "page"}>
                  Alle <span className={s.n}>{MOTIFS.length}</span>
                </Link>
              </li>
              {OCCASIONS.map((o) => (
                <li key={o.id}>
                  <Link href={`/karten?anlass=${o.id}`} scroll={false} aria-current={occ === o.id ? "page" : undefined}>
                    {o.label} <span className={s.n}>{count(o.id)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <h2 id="list-h" className={s.listH}>
            {occ
              ? `${list.length === 1 ? "Eine Karte" : `${list.length} Karten`} ${OCCASION_PHRASE[occ]}`
              : `Alle ${list.length} Karten`}
          </h2>
          <div className={occ ? "shopgrid filtered" : "shopgrid"}>
            {list.map((m, i) => (
              <MotifTile key={m.id} motif={m} feature={!occ && i === 0} />
            ))}
          </div>
          {occ ? (
            <p className={s.moreLine}>
              Nicht das Richtige dabei? Die Karten für <Link href="/karten?anlass=neutral">einfach so</Link> passen zu jedem
              Anlass. Oder <Link href="/karten">alle Karten ansehen</Link>.
            </p>
          ) : null}
        </div>
      </section>

      <Torn className={`band ${s.formats}`} paper="gelb" aria-labelledby="fmt-h">
        <div className="wrap">
          <div className="sec-head">
            <h2 className="h2" id="fmt-h">
              Formate und Preise
            </h2>
            <p className="muted">
              Jedes Motiv gibt es in allen drei Varianten. Du wählst beim Gestalten, wie die Karte ankommt.
            </p>
          </div>
          <div className={`paper ${s.priceSheet}`}>
            <ul className={s.priceList}>
              {FORMATS.map((f) => (
                <li key={f.id}>
                  <span className={s.priceIc}>
                    <Icon name={ZICON[f.id]} />
                  </span>
                  <div>
                    <h3>{f.label}</h3>
                    <p>
                      {f.detail}
                      {f.id === "print" && promo ? " Bis 17. Dezember gratis im Goldkuvert." : ""}
                    </p>
                  </div>
                  <b className="num">{eurCents(f.priceCents)}</b>
                </li>
              ))}
            </ul>
            <div className={s.priceFoot}>
              <p>
                <b>Preise vorläufig.</b> Alle Preise inklusive Umsatzsteuer, gedruckte Karten inklusive Versand in
                Österreich.
              </p>
              <p>
                <b>Der Geschenkbetrag ist nicht im Preis.</b> Du überweist ihn später per Bank-QR-Code direkt an die Eltern,
                nie an uns. Die Karten sind unbefristet einlösbar.
              </p>
            </div>
          </div>
        </div>
      </Torn>
    </>
  );
}
