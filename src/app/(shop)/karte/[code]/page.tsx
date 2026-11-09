import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motifById, type Paper, type Shape } from "@/lib/catalog";
import { cardByCode } from "@/lib/shop";
import { GiftCard } from "@/components/GiftCard";
import { Icon } from "@/components/Icon";
import { eur } from "@/components/format";
import s from "@/components/shop/shop.module.css";

export const dynamic = "force-dynamic";

const load = cache(async (code: string) => {
  if (!/^[A-Za-z0-9-]{6,20}$/.test(code)) return null;
  try {
    return await cardByCode(code);
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const card = await load(code);
  return {
    title: card ? `Ein Geschenk für ${card.childName}` : "Karte nicht gefunden",
    robots: { index: false, follow: false },
  };
}

/** Kartenbreite und -höhe (px bei --k: 1) je Form, damit die Karte ins Kuvert passt. */
const SIZE: Record<Shape, { w: number; h: number }> = {
  a6: { w: 230, h: 324 },
  post: { w: 360, h: 254 },
  square: { w: 260, h: 260 },
  tag: { w: 180, h: 288 },
};

export default async function CardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const card = await load(code);
  if (!card) notFound();
  const m = motifById(card.motif);
  const shape = m?.shape ?? "a6";
  const size = SIZE[shape];
  const amount = card.amountCents / 100;
  const open = card.status === "issued";
  // Bankverbindung schon beim Kauf bekannt (Wunschseite oder Variante „IBAN bekannt“): nichts einzulösen.
  const ibanKnown = open && Boolean(card.ibanEnc);
  const gold = card.goldEnvelope;

  return (
    <>
      <section className={`band ${s.recv}`} aria-labelledby="recv-h">
        <div className={`wrap ${s.recvGrid}`}>
          <div className={s.unwrapCol}>
            <div className="sun" aria-hidden="true" />
            <div
              className={s.unwrap}
              data-gold={gold ? "1" : undefined}
              style={{ "--cw": `${size.w}px`, "--ch": `${size.h}px` } as CSSProperties}
            >
              <span className={s.envBack} aria-hidden="true" />
              <span className={s.flap} aria-hidden="true" />
              <div className={s.slot}>
                <div className={s.rise}>
                  <GiftCard
                    motif={card.motif}
                    paper={card.paper as Paper}
                    amount={amount}
                    childName={card.childName}
                    sender={card.sender}
                    size="md"
                    style={{ "--bw": "var(--cw)" } as CSSProperties}
                  />
                </div>
              </div>
              <span className={s.envFront} aria-hidden="true" />
            </div>
          </div>

          <div className={`paper ${s.recvText}`}>
            <h1 id="recv-h" className={s.h1}>
              Ein Geschenk für {card.childName}
            </h1>
            <p className="lead">
              <b className="num">{eur(amount)}</b> für die Zukunft von {card.childName}. Das Geld ist für das Zukunftsdepot
              gedacht, das Eltern voraussichtlich ab Juli 2027 für ihr Kind eröffnen können.
            </p>
            {card.message ? (
              <blockquote className={s.quote}>
                <p>{card.message}</p>
              </blockquote>
            ) : (
              <p className={s.quote}>{m?.line}</p>
            )}
            <p className={s.signed}>{card.sender}</p>

            <div className={s.parents}>
              <h2 className={s.h2sm}>Für die Eltern</h2>
              {ibanKnown ? (
                <>
                  <p>
                    Eure Bankverbindung ist bei dieser Karte schon hinterlegt. Ihr müsst nichts einlösen. Der Bank-QR-Code
                    steht auf der Karte, und das Geld kommt direkt von den Schenkenden auf euer Konto.
                  </p>
                  <div className="buy-row">
                    <a className="btn btn--ghost" href={`/api/karten/${card.code}/pdf`}>
                      Karte als PDF
                    </a>
                  </div>
                </>
              ) : open ? (
                <>
                  <p>
                    Löst die Karte mit dem Code ein und gebt eure IBAN an. Die Schenkenden bekommen dann einen Bank-QR-Code
                    und überweisen das Geld direkt auf euer Konto.
                  </p>
                  <p className={s.codeLine}>
                    Einlösecode <b className="num">{card.code}</b>, unbefristet einlösbar
                  </p>
                  <div className="buy-row">
                    <Link className="btn" href={`/einloesen?code=${encodeURIComponent(card.code)}`}>
                      Jetzt einlösen <Icon name="arrow" />
                    </Link>
                    <a className="btn btn--ghost" href={`/api/karten/${card.code}/pdf`}>
                      Karte als PDF
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Diese Karte ist schon eingelöst. Das Geld kommt direkt von den Schenkenden auf das angegebene Konto.
                  </p>
                  <div className="buy-row">
                    <a className="btn btn--ghost" href={`/api/karten/${card.code}/pdf`}>
                      Karte als PDF
                    </a>
                  </div>
                </>
              )}
              <p className="tiny">
                Das Geld geht nie über uns. Wir verkaufen nur die Karte.{" "}
                <Link href="/so-funktionierts">So funktioniert es</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
