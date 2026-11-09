import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FORMATS, MAX_AMOUNT_EUR, MIN_AMOUNT_EUR, MOTIFS, motifById, xmasActive, type FormatId, type Motif, type Paper } from "@/lib/catalog";
import { getWishPage } from "@/lib/shop";
import type { WishPage } from "@/lib/db/schema";
import { SHAPE_LABEL } from "@/components/GiftCard";
import { Icon } from "@/components/Icon";
import { showcaseFor } from "@/components/showcase";
import { Configurator } from "@/components/shop/Configurator";
import { FROM_PRICE, MotifTile, OCCASION_PHRASE, occasionLabel } from "@/components/shop/MotifTile";
import s from "@/components/shop/shop.module.css";

type Params = { motif: string };
type Search = { betrag?: string; name?: string; format?: string; wunsch?: string; papier?: string };

export function generateStaticParams(): Params[] {
  return MOTIFS.map((m) => ({ motif: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { motif } = await params;
  const m = motifById(motif);
  if (!m) return { title: "Karte nicht gefunden" };
  return {
    title: `${m.name} gestalten`,
    description: `Geschenkkarte „${m.name}“ (${occasionLabel(m.occasion)}, ${SHAPE_LABEL[m.shape]}) mit Betrag, Name und deiner Botschaft gestalten. Ab ${FROM_PRICE}. Das Geschenkgeld geht direkt an die Eltern.`,
  };
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function initialAmount(raw?: string): number {
  const n = Number((raw ?? "").replace(/[^\d]/g, ""));
  return Number.isInteger(n) && n >= MIN_AMOUNT_EUR && n <= MAX_AMOUNT_EUR ? n : 100;
}

/** Ähnliche Karten: gleicher Anlass, aufgefüllt mit Karten für „Einfach so“. */
function similar(m: Motif): Motif[] {
  const same = MOTIFS.filter((x) => x.id !== m.id && x.occasion === m.occasion);
  const fill = MOTIFS.filter((x) => x.id !== m.id && x.occasion === "neutral" && !same.includes(x));
  const rest = MOTIFS.filter((x) => x.id !== m.id && !same.includes(x) && !fill.includes(x));
  return [...same, ...fill, ...rest].slice(0, 3);
}

export default async function MotifPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<keyof Search, string | string[] | undefined>>;
}) {
  const { motif } = await params;
  const m = motifById(motif);
  if (!m) notFound();
  const sp = await searchParams;

  const wunsch = one(sp.wunsch)?.trim();
  let wish: WishPage | null = null;
  if (wunsch && /^[a-z0-9-]{1,60}$/.test(wunsch)) {
    try {
      wish = await getWishPage(wunsch);
    } catch {
      wish = null;
    }
  }

  const fmtRaw = one(sp.format);
  const format: FormatId = FORMATS.some((f) => f.id === fmtRaw) ? (fmtRaw as FormatId) : showcaseFor(m.id).format;
  const papRaw = one(sp.papier);
  const paper: Paper = m.papers.includes(papRaw as Paper) ? (papRaw as Paper) : m.papers[0];
  const childName = (wish?.childName ?? one(sp.name) ?? "").trim().slice(0, 40);
  const promo = xmasActive();
  const occ = occasionLabel(m.occasion);

  return (
    <>
      <section className={`cfg-sec band ${s.pdp}`} aria-labelledby="pdp-h">
        <div className="wrap">
          <nav className={s.crumbs} aria-label="Brotkrümelnavigation">
            <ol>
              <li>
                <Link href="/karten">Alle Karten</Link>
              </li>
              <li>
                <Link href={`/karten?anlass=${m.occasion}`}>{occ}</Link>
              </li>
              <li aria-current="page">{m.name}</li>
            </ol>
          </nav>
          <div className={`sec-head ${s.pdpHead}`}>
            <h1 className="h2" id="pdp-h">
              {m.name}
            </h1>
            <p className="muted">
              {SHAPE_LABEL[m.shape]} {OCCASION_PHRASE[m.occasion]}, ab {FROM_PRICE}. Alles, was du
              einträgst, siehst du sofort auf der Karte.
            </p>
          </div>
          {wish ? (
            <div className={s.wishNote} role="note">
              <Icon name="qr" />
              <p>
                <b>Wunschseite von {wish.childName}.</b> Die Bankverbindung der Eltern ist hinterlegt. Der Bank-QR-Code kommt
                direkt auf die Karte.
              </p>
            </div>
          ) : null}
          <Configurator
            motifId={m.id}
            initial={{ paper, amount: initialAmount(one(sp.betrag)), childName, format }}
            promo={promo}
            wishSlug={wish?.slug}
          />
        </div>
      </section>

      <section className={`band ${s.money}`} aria-labelledby="money-h">
        <div className="wrap">
          <div className={s.moneyGrid}>
            <div>
              <h2 className="h2" id="money-h">
                So kommt das Geld an
              </h2>
              <p className="lead">
                Bei uns zahlst du nur die Karte. Den Betrag auf der Karte überweist du selbst, direkt auf das Konto der
                Eltern.
              </p>
            </div>
            <ol className={s.flow}>
              {wish ? (
                <>
                  <li>
                    <b>Du verschenkst die Karte.</b> Gedruckt im Kuvert oder als PDF per E-Mail.
                  </li>
                  <li>
                    <b>Der Bank-QR-Code ist schon drauf.</b> Die IBAN der Eltern kennen wir von der Wunschseite.
                  </li>
                  <li>
                    <b>Du überweist direkt.</b> QR-Code mit der Banking-App scannen, Betrag und Empfänger sind ausgefüllt.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <b>Die Eltern lösen ein.</b> Sie geben den Code von der Karte auf unserer Seite ein und tragen ihre IBAN
                    ein.
                  </li>
                  <li>
                    <b>Du bekommst den Bank-QR-Code.</b> Er kommt per E-Mail, Betrag und Empfänger sind schon ausgefüllt.
                  </li>
                  <li>
                    <b>Du überweist direkt an die Eltern.</b> Voraussichtlich ab Juli 2027 zahlen sie das Geld ins Zukunftsdepot ein.
                  </li>
                </>
              )}
            </ol>
          </div>
          <p className={s.forever}>
            <Icon name="forever" />
            Die Karte ist unbefristet einlösbar. <Link href="/so-funktionierts">Mehr zum Ablauf</Link>
          </p>
        </div>
      </section>

      <section className={`shop band ${s.related}`} aria-labelledby="rel-h">
        <div className="wrap">
          <div className="sec-head">
            <h2 className="h2" id="rel-h">
              Ähnliche Karten
            </h2>
            <Link className="sec-link" href={`/karten?anlass=${m.occasion}`}>
              Alle Karten {OCCASION_PHRASE[m.occasion]} <Icon name="arrow" />
            </Link>
          </div>
          <div className="shopgrid filtered">
            {similar(m).map((x) => (
              <MotifTile key={x.id} motif={x} query={wish ? `wunsch=${wish.slug}&name=${encodeURIComponent(wish.childName)}` : ""} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
