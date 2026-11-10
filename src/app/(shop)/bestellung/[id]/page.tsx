import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { formatById, motifById, type Paper } from "@/lib/catalog";
import { getOrder } from "@/lib/shop";
import { invoicePath } from "@/lib/links";
import type { Card, Order } from "@/lib/db/schema";
import { GiftCard, type CardEnvelope } from "@/components/GiftCard";
import { Icon } from "@/components/Icon";
import { eur, eurCents } from "@/components/format";
import { formatVienna } from "@/components/shop/datetime";
import { ClearPending } from "@/components/shop/ClearPending";
import s from "@/components/shop/shop.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deine Bestellung",
  robots: { index: false, follow: false },
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function sameToken(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

const STATUS: Record<string, { label: string; tone: string }> = {
  issued: { label: "Wartet auf Einlösung", tone: "wait" },
  redeemed: { label: "Eingelöst", tone: "ok" },
  transferred: { label: "Überwiesen", tone: "done" },
  bank: { label: "Bankverbindung hinterlegt", tone: "ok" },
};

/** Bankverbindung schon beim Kauf bekannt (Wunschseite oder Variante „IBAN bekannt“): Bank-QR-Code steht auf der Karte. */
const qrOnCard = (c: Card) => Boolean(c.ibanEnc && c.payToken && c.status === "issued");

const envelopeOf = (c: Card): CardEnvelope => (c.goldEnvelope ? "gold" : c.format === "mail" ? "none" : "white");
const firstName = (n: string) => n.trim().split(/\s+/)[0] ?? n;

function NextSteps({ card, order }: { card: Card; order: Order }) {
  const amt = eur(card.amountCents / 100);
  const addr = order.shipping;
  const steps: ReactNode[] = [];

  if (card.format === "mail") {
    if (card.recipientEmail && card.deliveryAt)
      steps.push(
        <>
          Die Karte geht am <b>{formatVienna(card.deliveryAt)}</b> per E-Mail an <b>{card.recipientEmail}</b>.
        </>,
      );
    else if (card.recipientEmail)
      steps.push(
        <>
          Die Karte ist per E-Mail an <b>{card.recipientEmail}</b> unterwegs.
        </>,
      );
    else steps.push(<>Lade die Karte als PDF und gib sie weiter, ausgedruckt oder per E-Mail.</>);
  } else {
    steps.push(
      <>
        Wir drucken die Karte und schicken sie {card.goldEnvelope ? "im Goldkuvert" : "im Kuvert"} per Post
        {addr ? (
          <>
            {" "}
            an <b>{addr.name}</b>, {addr.street}, {addr.zip} {addr.city}
          </>
        ) : null}
        .
      </>,
    );
  }

  if (card.status === "transferred") {
    steps.push(<>Die Überweisung ist vermerkt. Danke, das Geschenk ist bei den Eltern angekommen.</>);
  } else if (qrOnCard(card)) {
    steps.push(
      <>
        Die Eltern müssen nichts einlösen. Der Bank-QR-Code ist schon auf der Karte, für{" "}
        <b>{card.parentName ?? "die Eltern"}</b>.
      </>,
    );
    steps.push(
      <>
        Du kannst die {amt} gleich selbst überweisen. Auf der{" "}
        <Link href={`/ueberweisen/${card.payToken}`}>Überweisungsseite</Link> findest du den Bank-QR-Code und alle Daten.
      </>,
    );
  } else if (card.status === "redeemed") {
    steps.push(
      <>
        Die Eltern haben die Karte eingelöst. Die E-Mail mit dem Bank-QR-Code ist bei dir.
        {card.payToken ? (
          <>
            {" "}
            <Link href={`/ueberweisen/${card.payToken}`}>Jetzt {amt} überweisen</Link>.
          </>
        ) : null}
      </>,
    );
  } else {
    steps.push(<>Die Eltern geben den Code auf unserer Seite ein und tragen ihre IBAN ein.</>);
    steps.push(
      <>
        Dann bekommst du eine E-Mail mit dem Bank-QR-Code und überweist die {amt} direkt an die Eltern.
      </>,
    );
  }

  return (
    <ol className={s.next}>
      {steps.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ol>
  );
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string | string[]; demo?: string | string[] }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const token = one(sp.t) ?? "";
  if (!/^[a-z0-9]{6,40}$/.test(id) || !token) notFound();
  const res = await getOrder(id);
  if (!res || !sameToken(token, res.order.accessToken)) notFound();
  const { order, cards } = res;
  const paid = order.status === "paid";
  const demo = one(sp.demo) === "1";
  const gifts = cards.reduce((sum, c) => sum + c.amountCents, 0) / 100;
  const paidAt = order.paidAt ?? order.createdAt;
  const selfUrl = `/bestellung/${order.id}?t=${order.accessToken}${demo ? "&demo=1" : ""}`;

  return (
    <>
      {paid ? <ClearPending /> : null}
      <section className={`band ${s.thanks}`} aria-labelledby="ty-h">
        <div className="wrap">
          <div className={`paper ${s.thanksCard}`}>
            {demo ? (
              <p className={s.demo} role="note">
                <Icon name="info" />
                Demo-Zahlung: Es wurde kein Geld abgebucht.
              </p>
            ) : null}
            <h1 id="ty-h" className={s.h1}>
              {paid ? `Danke, ${firstName(order.buyerName)}!` : "Fast geschafft."}
            </h1>
            {paid ? (
              <p className="lead">
                Deine Bestellung ist bezahlt. Die Bestätigung haben wir an <b>{order.buyerEmail}</b> geschickt. Dort findest
                du auch den Link zu dieser Seite.
              </p>
            ) : (
              <p className="lead">
                Wir warten noch auf die Bestätigung der Zahlung. Das dauert meist nur einen Moment.{" "}
                <a href={selfUrl}>Seite neu laden</a>
              </p>
            )}
            <dl className={s.facts}>
              <div>
                <dt>Rechnungsnummer</dt>
                <dd className="num">{order.invoiceNumber ?? "folgt nach der Zahlung"}</dd>
              </div>
              <div>
                <dt>Bezahlt für {cards.length === 1 ? "die Karte" : `${cards.length} Karten`}</dt>
                <dd className="num">{eurCents(order.totalCents)}</dd>
              </div>
              <div>
                <dt>Bestellt am</dt>
                <dd className="num">{formatVienna(paidAt)}</dd>
              </div>
            </dl>
            {order.invoiceNumber ? (
              <p>
                <a className="sec-link" href={invoicePath(order)}>
                  Rechnung {order.invoiceNumber} als PDF <Icon name="arrow" />
                </a>
              </p>
            ) : null}
            <p className={s.giftNote}>
              <Icon name="direct" />
              <span>
                Die Geschenkbeträge von zusammen <b className="num">{eur(gifts)}</b> sind nicht Teil dieser Zahlung. Sie
                gehen später direkt von dir an die Eltern.
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className={`band ${s.orderCards}`} aria-labelledby="oc-h">
        <div className="wrap">
          <h2 className="h2" id="oc-h">
            {cards.length === 1 ? "Deine Karte" : "Deine Karten"}
          </h2>
          <ul className={s.ocList}>
            {cards.map((c) => {
              const m = motifById(c.motif);
              const st = qrOnCard(c) ? STATUS.bank : (STATUS[c.status] ?? STATUS.issued);
              return (
                <li key={c.id} className={s.oc}>
                  <div className={s.ocStage}>
                    <GiftCard
                      motif={c.motif}
                      paper={c.paper as Paper}
                      amount={c.amountCents / 100}
                      childName={c.childName}
                      sender={c.sender}
                      envelope={envelopeOf(c)}
                      code={c.code}
                      badge={c.format === "mail" ? "PDF" : undefined}
                      size="md"
                    />
                  </div>
                  <div className={s.ocBody}>
                    <div className={s.ocTop}>
                      <h3>
                        {m?.name ?? c.motif} für {c.childName}
                      </h3>
                      <span className={s.status} data-tone={st.tone}>
                        {st.label}
                      </span>
                    </div>
                    <p className="muted small">
                      {formatById(c.format)?.label} · {eurCents(c.priceCents)} · Geschenk {eur(c.amountCents / 100)} an die
                      Eltern
                    </p>
                    {qrOnCard(c) ? (
                      <p className={s.qrNote}>
                        <Icon name="qr" />
                        <span>
                          <b>Bank-QR-Code ist auf der Karte.</b>{" "}
                          <Link href={`/ueberweisen/${c.payToken}`}>Zur Überweisungsseite</Link>
                        </span>
                      </p>
                    ) : null}
                    <div className={s.codeBox}>
                      <span>Einlösecode</span>
                      <b className="num">{c.code}</b>
                      <small>Unbefristet einlösbar</small>
                    </div>
                    {paid ? (
                      <div className={s.ocActions}>
                        {c.payToken && (c.status === "redeemed" || qrOnCard(c)) ? (
                          <>
                            <Link className="btn btn--sm" href={`/ueberweisen/${c.payToken}`}>
                              Jetzt {eur(c.amountCents / 100)} überweisen <Icon name="arrow" />
                            </Link>
                            <a className="sec-link" href={`/api/karten/${c.code}/pdf`}>
                              Karte als PDF <Icon name="arrow" />
                            </a>
                          </>
                        ) : (
                          <a className="btn btn--sm" href={`/api/karten/${c.code}/pdf`}>
                            Karte als PDF <Icon name="arrow" />
                          </a>
                        )}
                        {c.format === "mail" ? (
                          <Link className="sec-link" href={`/karte/${c.code}`}>
                            So sieht die Karte für die Empfänger aus <Icon name="arrow" />
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                    <h4 className={s.nextH}>So geht es weiter</h4>
                    <NextSteps card={c} order={order} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="more-row">
            <Link className="btn btn--ghost" href="/karten">
              Noch eine Karte verschenken <Icon name="arrow" />
            </Link>
            <Link className="sec-link" href="/faq">
              Fragen zum Ablauf <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
