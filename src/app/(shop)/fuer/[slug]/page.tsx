import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWishPage } from "@/lib/shop";
import { FORMATS, OCCASIONS, motifById, type Occasion } from "@/lib/catalog";
import { SITE_URL } from "@/lib/env";
import { GiftCard } from "@/components/GiftCard";
import { Icon } from "@/components/Icon";
import { eurCents } from "@/components/format";
import { ShareBox } from "@/components/eltern/ShareBox";
import { WishDirect } from "@/components/eltern/WishDirect";
import s from "@/components/eltern/eltern.module.css";

export const dynamic = "force-dynamic";

/** Hauptmotiv je Anlass plus zwei passende Vorschläge. */
const MOTIFS_FOR: Record<Occasion, [string, string, string]> = {
  weihnachten: ["sterne", "gold", "kugel"],
  zukunft: ["kurve", "weltkugel", "schneeball"],
  geburt: ["mobile", "mond", "strampler"],
  taufe: ["kerze", "regenbogen", "muschel"],
  geburtstag: ["kuchen", "luftballons", "krone"],
  ostern: ["osterei", "osterhase", "osternest"],
  kommunion: ["kelch", "fisch", "trauben"],
  firmung: ["taube", "flamme", "kompass"],
  schule: ["schultuete", "schultasche", "zeugnis"],
  neutral: ["pfeil", "kurve", "kleeblatt"],
};

const occasionOf = (o: string): Occasion => (o in MOTIFS_FOR ? (o as Occasion) : "neutral");
const occasionLabel = (o: Occasion) => OCCASIONS.find((x) => x.id === o)?.label ?? "";

async function load(slug: string) {
  try {
    return await getWishPage(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = await load(slug);
  return {
    title: w ? `Ein Stück Zukunft für ${w.childName}` : "Wunschseite",
    description: w ? `Wunschseite für ${w.childName}: Geld fürs Zukunftsdepot schenken, direkt an die Eltern.` : undefined,
    robots: { index: false, follow: false },
  };
}

export default async function WishPublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ neu?: string }>;
}) {
  const { slug } = await params;
  const { neu } = await searchParams;
  const w = await load(slug);
  if (!w) notFound();

  const occ = occasionOf(w.occasion);
  const motifs = MOTIFS_FOR[occ].map((id) => motifById(id)!).filter(Boolean);
  const href = (id: string) => `/karten/${id}?name=${encodeURIComponent(w.childName)}&wunsch=${encodeURIComponent(w.slug)}`;
  const fromPrice = eurCents(Math.min(...FORMATS.map((f) => f.priceCents)));

  return (
    <>
      <header className={`band ${s.festive}`}>
        <span className={s.ribbonV} aria-hidden="true" />
        {neu === "1" ? (
          <div className="wrap">
            <ShareBox path={`/fuer/${w.slug}`} childName={w.childName} fallbackOrigin={SITE_URL} />
          </div>
        ) : null}
        <div className={`wrap ${s.festGrid}`}>
          <div className={`paper ${s.festCard}`}>
            <h1>
              Ein Stück Zukunft für <em>{w.childName}</em>
            </h1>
            <p className={s.festBy}>Eine Wunschseite von {w.parentName}</p>
            {w.message ? (
              <blockquote className={s.quote}>
                <p>{w.message}</p>
                <footer>{w.parentName}</footer>
              </blockquote>
            ) : null}
          </div>
          <div className={s.tagHang} aria-hidden="true">
            <div className="tag">
              <span className="tag-ring" />
              <p className="tag-for">Für {w.childName}</p>
              <p className="tag-line">Fürs Zukunftsdepot</p>
              <p className={s.tagOcc}>{occasionLabel(occ)}</p>
              <div className="tag-foot" />
            </div>
          </div>
        </div>
      </header>

      <section className={`band ${s.page}`} aria-labelledby="ex-h">
        <div className={`wrap ${s.explain}`}>
          <h2 className={s.h2} id="ex-h">
            So schenkst du {w.childName} ein Stück Zukunft
          </h2>
          <p>
            Die Eltern von {w.childName} wünschen sich Geld fürs Zukunftsdepot. Du schenkst den Betrag den Eltern und überweist ihn
            per Bank-QR-Code direkt auf ihr Konto. Voraussichtlich ab Juli 2027 zahlen sie das Geld ins Depot ein, wo es bis zum 18. Geburtstag liegen
            bleibt.
          </p>
        </div>
        <div className={`wrap ${s.ways}`}>
          <article className={`paper ${s.way}`} aria-labelledby="way-a">
            <p className={s.wayLabel}>
              <Icon name="gift" /> Mit Geschenkkarte
            </p>
            <h2 className={s.h2} id="way-a">
              Karte gestalten
            </h2>
            <p>
              Eine schöne Karte zum Überreichen, per E-Mail oder gedruckt im Kuvert. Du zahlst bei uns nur die Karte, ab {fromPrice}.
              Den Bank-QR-Code für die Überweisung bekommst du gleich nach dem Kauf. Die Eltern müssen nichts einlösen.
            </p>
            <ul className={s.motifs} aria-label="Passende Motive">
              {motifs.map((m) => (
                <li key={m.id}>
                  <Link href={href(m.id)}>
                    <span className={s.mini}>
                      <GiftCard motif={m.id} paper={m.papers[0]} amount={100} childName={w.childName} sender="" size="sm" decorative />
                    </span>
                    <span>{m.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="buy-row">
              <Link className="btn" href={href(motifs[0].id)}>
                Karte gestalten <Icon name="arrow" />
              </Link>
            </div>
          </article>

          <article className={`paper ${s.way}`} aria-labelledby="way-b">
            <p className={s.wayLabel}>
              <Icon name="qr" /> Ohne Karte
            </p>
            <h2 className={s.h2} id="way-b">
              Direkt überweisen
            </h2>
            <p>Das kostet nichts. Wähl einen Betrag und scanne den QR-Code mit deiner Banking-App.</p>
            <WishDirect slug={w.slug} childName={w.childName} parentName={w.parentName} />
          </article>
        </div>
      </section>
    </>
  );
}
