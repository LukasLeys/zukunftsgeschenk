import Link from "next/link";
import { notFound } from "next/navigation";
import s from "@/components/admin/admin.module.css";
import { ActionButton } from "@/components/admin/ActionButton";
import { CardStatus, EmptyRow, OrderStatus, PageHead, SectionHead, Badge } from "@/components/admin/ui";
import { mailsForOrder } from "@/components/admin/queries";
import { envelopeName, fmtDateTime, fmtShort, formatShort, maskedIban, motifName, PAPER_NAME, pdfUrl, vatOf } from "@/components/admin/server";
import { eurCents } from "@/components/format";
import { getOrder } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getOrder(id);
  return { title: r ? `Bestellung ${r.order.invoiceNumber ?? r.order.id}` : "Bestellung nicht gefunden" };
}

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getOrder(id);
  if (!r) notFound();
  const { order, cards } = r;
  const mails = await mailsForOrder(order, cards);
  const now = Date.now();
  const paid = order.status === "paid";
  const cancelled = order.status === "cancelled";
  const gift = cards.reduce((a, c) => a + c.amountCents, 0);
  const redeemedCount = cards.filter((c) => c.status !== "issued").length;
  const api = `/api/admin/bestellungen/${order.id}`;

  const cancelConfirm = [
    `Bestellung ${order.invoiceNumber ?? order.id} wirklich stornieren?`,
    "Alle Einlösecodes dieser Bestellung werden ungültig und geplante Mails werden gelöscht.",
    redeemedCount ? `Achtung: ${redeemedCount} Karte(n) sind bereits eingelöst.` : "",
    paid ? "Die Rückzahlung des Kartenpreises bitte separat im Zahlungsanbieter auslösen." : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <>
      <PageHead
        crumb={{ href: "/admin/bestellungen", label: "Bestellungen" }}
        title={
          <>
            {order.invoiceNumber ?? "Bestellung ohne Rechnungsnummer"} <OrderStatus status={order.status} />
          </>
        }
        sub={`${order.buyerName}, ${cards.length} ${cards.length === 1 ? "Karte" : "Karten"}, angelegt ${fmtDateTime(order.createdAt)}`}
      >
        {paid && <ActionButton url={`${api}/mails`} body={{ type: "confirmation" }} label="Bestellbestätigung erneut senden" pendingLabel="Sendet …" />}
        {!cancelled && <ActionButton url={`${api}/stornieren`} label="Bestellung stornieren" pendingLabel="Wird storniert …" variant="danger" confirm={cancelConfirm} />}
      </PageHead>

      {cancelled && (
        <p className={`${s.note} ${s.noteWarn}`}>
          Diese Bestellung ist storniert. Die Einlösecodes funktionieren nicht mehr, PDF und Einlösung sind gesperrt.
        </p>
      )}

      <div className={s.cols} style={{ marginTop: 16 }}>
        <section className={`${s.panel} ${s.panelPad}`} aria-labelledby="h-b">
          <SectionHead title={<span id="h-b">Bestellung</span>} />
          <dl className={s.dl}>
            <dt>Bestell-ID</dt>
            <dd className={s.code}>{order.id}</dd>
            <dt>Bezahlt</dt>
            <dd>{order.paidAt ? fmtDateTime(order.paidAt) : "noch nicht"}</dd>
            <dt>Zahlung</dt>
            <dd>{order.stripeSessionId ? <span className={s.code}>{order.stripeSessionId}</span> : order.paidAt ? "Demo-Zahlung" : "keine"}</dd>
            <dt>Kundenseite</dt>
            <dd>
              <a href={`/bestellung/${order.id}?t=${order.accessToken}`} target="_blank" rel="noreferrer">
                Bestellseite öffnen
              </a>
            </dd>
          </dl>
        </section>
        <section className={`${s.panel} ${s.panelPad}`} aria-labelledby="h-k">
          <SectionHead title={<span id="h-k">Käufer:in und Lieferung</span>} />
          <dl className={s.dl}>
            <dt>Name</dt>
            <dd>{order.buyerName}</dd>
            <dt>E-Mail</dt>
            <dd>
              <a href={`mailto:${order.buyerEmail}`}>{order.buyerEmail}</a>
            </dd>
            <dt>Lieferadresse</dt>
            <dd>
              {order.shipping ? (
                <>
                  {order.shipping.name}
                  <br />
                  {order.shipping.street}
                  <br />
                  {order.shipping.zip} {order.shipping.city}, Österreich
                </>
              ) : (
                "keine, nur digitale Karten"
              )}
            </dd>
          </dl>
        </section>
        <section className={`${s.panel} ${s.panelPad}`} aria-labelledby="h-s">
          <SectionHead title={<span id="h-s">Beträge</span>} />
          <dl className={s.dl}>
            <dt>Kartenpreise brutto</dt>
            <dd className="num">
              <b>{eurCents(order.totalCents)}</b>
            </dd>
            <dt>darin 20 % USt.</dt>
            <dd className="num">{eurCents(vatOf(order.totalCents))}</dd>
            <dt>Geschenkbeträge</dt>
            <dd className="num">
              {eurCents(gift)} <span className={s.meta}>(Info, gehen direkt an die Eltern)</span>
            </dd>
          </dl>
        </section>
      </div>

      <section className={s.section} aria-labelledby="h-c">
        <SectionHead title={<span id="h-c">Karten</span>} sub={`${cards.length} ${cards.length === 1 ? "Karte" : "Karten"}`} />
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Motiv</th>
                <th scope="col">Format</th>
                <th scope="col">Für</th>
                <th scope="col" className={s.r}>Betrag</th>
                <th scope="col">Zustellung</th>
                <th scope="col">Status</th>
                <th scope="col">Eltern</th>
                <th scope="col">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => {
                const canPayLink = paid && c.status === "redeemed" && c.payToken && c.ibanEnc;
                return (
                  <tr key={c.id}>
                    <td>
                      <span className={s.code}>{c.code}</span>
                      {paid && (
                        <span className={s.sub}>
                          <a href={pdfUrl(c.code)} target="_blank" rel="noreferrer">PDF</a>
                        </span>
                      )}
                    </td>
                    <td>
                      {motifName(c.motif)}
                      <span className={s.sub}>Papier {PAPER_NAME[c.paper] ?? c.paper}</span>
                    </td>
                    <td className={s.nowrap}>
                      {formatShort(c.format)}
                      <span className={s.sub}>{c.format === "mail" ? eurCents(c.priceCents) : `Kuvert ${envelopeName(c)}, ${eurCents(c.priceCents)}`}</span>
                    </td>
                    <td>
                      {c.childName}
                      <span className={s.sub}>von {c.sender}</span>
                      {c.message && <span className={`${s.sub} ${s.clip}`} title={c.message}>„{c.message}“</span>}
                    </td>
                    <td className={`${s.r} ${s.nowrap}`}>{eurCents(c.amountCents)}</td>
                    <td>
                      {c.format === "mail" ? (
                        c.recipientEmail ? (
                          <>
                            an {c.recipientEmail}
                            <span className={s.sub}>{c.deliveryAt && c.deliveryAt.getTime() > now ? `geplant ${fmtDateTime(c.deliveryAt)}` : "sofort"}</span>
                          </>
                        ) : (
                          <span className={s.meta}>PDF an Käufer:in</span>
                        )
                      ) : c.shippedAt ? (
                        <>
                          versendet
                          <span className={s.sub}>{fmtDateTime(c.shippedAt)}</span>
                        </>
                      ) : (
                        <Badge tone="warn">Druck offen</Badge>
                      )}
                    </td>
                    <td>
                      <CardStatus status={c.status} orderStatus={order.status} />
                      <span className={s.sub}>
                        {c.transferredAt ? `überwiesen ${fmtShort(c.transferredAt)}` : c.redeemedAt ? `eingelöst ${fmtShort(c.redeemedAt)}` : c.wishSlug ? "über Wunschseite" : c.ibanEnc ? "IBAN beim Kauf" : ""}
                      </span>
                    </td>
                    <td>
                      {c.parentName ?? ""}
                      {c.parentEmail && <span className={s.sub}>{c.parentEmail}</span>}
                      {c.ibanEnc && <span className={`${s.sub} ${s.code}`}>{maskedIban(c.ibanEnc)}</span>}
                    </td>
                    <td>
                      <div style={{ display: "grid", gap: 6, justifyItems: "start" }}>
                        {paid && c.format === "mail" && c.recipientEmail && (
                          <ActionButton small url={`${api}/mails`} body={{ type: "card", cardId: c.id }} label="Karte erneut senden" pendingLabel="Sendet …" confirm={`Karte ${c.code} jetzt erneut an ${c.recipientEmail} senden?`} />
                        )}
                        {canPayLink && (
                          <ActionButton small url={`${api}/mails`} body={{ type: "payment", cardId: c.id }} label="Bank-QR-Link erneut senden" pendingLabel="Sendet …" title={`An ${order.buyerEmail}`} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className={s.section} aria-labelledby="h-m">
        <SectionHead title={<span id="h-m">Mails dieser Bestellung</span>} sub="Zugeordnet über Bestelllink, Kartencodes und Überweisungslinks." />
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr>
                <th scope="col">Zeitpunkt</th>
                <th scope="col">Status</th>
                <th scope="col">An</th>
                <th scope="col">Betreff</th>
                <th scope="col">Vorschau</th>
              </tr>
            </thead>
            <tbody>
              {mails.length === 0 && <EmptyRow cols={5}>Keine Mails zu dieser Bestellung.</EmptyRow>}
              {mails.map((m) => (
                <tr key={m.id}>
                  <td className={s.nowrap}>{fmtDateTime(m.sentAt ?? m.sendAt)}</td>
                  <td>
                    {m.sentAt ? <Badge tone="ok">gesendet</Badge> : m.sendAt.getTime() <= now ? <Badge tone="warn">fällig</Badge> : <Badge tone="plain">geplant</Badge>}
                  </td>
                  <td>{m.to}</td>
                  <td>{m.subject}</td>
                  <td>
                    <Link href={`/admin/postausgang?ansicht=${m.sentAt ? "gesendet" : "offen"}&vorschau=${m.id}`}>ansehen</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
