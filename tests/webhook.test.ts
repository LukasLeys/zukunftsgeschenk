import { describe, it, expect, beforeAll } from "vitest";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { createOrder, getOrder, redeemCard, cardByCode } from "../src/lib/shop";
import { db, schema } from "../src/lib/db";

// Kein Netz: Stripe-Schlüssel ist ein Dummy, Ereignisse bauen wir selbst und signieren sie lokal.
const SECRET = "whsec_test_geheim";
beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
});
const local = new Stripe("sk_test_dummy");

let n = 0;
function event(type: string, object: Record<string, unknown>) {
  return { id: `evt_test_${++n}`, object: "event", type, api_version: "2025-08-27.basil", created: Math.floor(Date.now() / 1000), data: { object } };
}

async function post(body: unknown, opts: { secret?: string; sig?: string | null } = {}) {
  const { POST } = await import("../src/app/api/stripe/webhook/route");
  const payload = JSON.stringify(body);
  const sig = opts.sig === undefined ? local.webhooks.generateTestHeaderString({ payload, secret: opts.secret ?? SECRET }) : opts.sig;
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (sig) headers["stripe-signature"] = sig;
  return POST(new Request("http://localhost/api/stripe/webhook", { method: "POST", body: payload, headers }));
}

async function newOrder() {
  return (await createOrder({
    buyerName: "Gerti Muster", buyerEmail: `oma${++n}@example.at`, acceptTerms: true, digitalConsent: true,
    shipping: { name: "Gerti Muster", street: "Hauptstraße 1", zip: "1010", city: "Wien", country: "AT" },
    items: [
      { motif: "sterne", paper: "pink", format: "print", amount: 100, childName: "Lena", message: "", sender: "Oma Gerti" },
      { motif: "konfetti", paper: "tinte", format: "mail", amount: 50, childName: "Lena", message: "", sender: "Oma Gerti", recipientEmail: `eltern${n}@example.at`, deliveryAt: "2027-12-24T17:00:00+01:00" },
    ],
  }))!;
}

const session = (orderId: string, extra: Record<string, unknown>) => ({
  id: `cs_test_${orderId}`, object: "checkout.session", metadata: { orderId }, client_reference_id: orderId,
  currency: "eur", amount_total: 1290 + 490, payment_intent: `pi_test_${orderId}`, status: "complete", ...extra,
});

async function mailsTo(to: string) {
  const d = await db();
  return d.select().from(schema.outbox).where(eq(schema.outbox.to, to));
}

describe("Stripe-Webhook", () => {
  it("lehnt fehlende und falsche Signaturen ab", async () => {
    const r = await newOrder();
    const body = event("checkout.session.completed", session(r.order.id, { payment_status: "paid" }));
    expect((await post(body, { sig: null })).status).toBe(400);
    expect((await post(body, { secret: "whsec_falsch" })).status).toBe(400);
    expect((await getOrder(r.order.id))!.order.status).toBe("pending");
  });

  it("verbucht checkout.session.completed genau einmal", async () => {
    const r = await newOrder();
    const body = event("checkout.session.completed", session(r.order.id, { payment_status: "paid" }));
    expect((await post(body)).status).toBe(200);
    expect((await post(body)).status).toBe(200);
    const o = (await getOrder(r.order.id))!.order;
    expect(o.status).toBe("paid");
    expect(o.invoiceNumber).toMatch(/^ZG-\d{4}-\d{5,}$/);
    expect(o.stripeSessionId).toBe(`cs_test_${r.order.id}`);
    expect(o.stripePaymentIntent).toBe(`pi_test_${r.order.id}`);
    const conf = await mailsTo(r.order.buyerEmail);
    expect(conf).toHaveLength(1);
    expect(conf[0].sentAt).not.toBeNull();
  });

  it("wartet bei EPS und Co. auf async_payment_succeeded", async () => {
    const r = await newOrder();
    expect((await post(event("checkout.session.completed", session(r.order.id, { payment_status: "unpaid" })))).status).toBe(200);
    expect((await getOrder(r.order.id))!.order.status).toBe("processing");
    expect(await mailsTo(r.order.buyerEmail)).toHaveLength(0);
    await post(event("checkout.session.async_payment_succeeded", session(r.order.id, { payment_status: "paid" })));
    const o = (await getOrder(r.order.id))!.order;
    expect(o.status).toBe("paid");
    expect(o.invoiceNumber).toBeTruthy();
  });

  it("meldet eine gescheiterte verzögerte Zahlung", async () => {
    const r = await newOrder();
    await post(event("checkout.session.completed", session(r.order.id, { payment_status: "unpaid" })));
    await post(event("checkout.session.async_payment_failed", session(r.order.id, { payment_status: "unpaid" })));
    const o = (await getOrder(r.order.id))!.order;
    expect(o.status).toBe("failed");
    expect(o.invoiceNumber).toBeNull();
    const m = await mailsTo(r.order.buyerEmail);
    expect(m).toHaveLength(1);
    expect(m[0].subject).toMatch(/nicht geklappt/);
  });

  it("verbucht nichts, wenn der Betrag nicht passt", async () => {
    const r = await newOrder();
    await post(event("checkout.session.completed", session(r.order.id, { payment_status: "paid", amount_total: 1 })));
    expect((await getOrder(r.order.id))!.order.status).toBe("pending");
  });

  it("markiert eine abgelaufene Sitzung", async () => {
    const r = await newOrder();
    await post(event("checkout.session.expired", session(r.order.id, { payment_status: "unpaid", status: "expired" })));
    expect((await getOrder(r.order.id))!.order.status).toBe("expired");
  });

  it("sperrt bei voller Erstattung die nicht eingelösten Karten", async () => {
    const r = await newOrder();
    await post(event("checkout.session.completed", session(r.order.id, { payment_status: "paid" })));
    const [print, mail] = [r.cards.find((c) => c.format === "print")!, r.cards.find((c) => c.format === "mail")!];
    await redeemCard({ code: print.code, parentName: "Anna Muster", parentEmail: "anna@example.at", iban: "AT61 1904 3002 3457 3201", consent: true });
    const scheduled = (await mailsTo(mail.recipientEmail!)).filter((m) => !m.sentAt);
    expect(scheduled).toHaveLength(1);

    // Teilerstattung ändert nichts
    const charge = { id: "ch_test", object: "charge", payment_intent: `pi_test_${r.order.id}`, metadata: {}, amount: 1780, amount_refunded: 490, refunded: false };
    await post(event("charge.refunded", charge));
    expect((await getOrder(r.order.id))!.order.status).toBe("paid");

    // Volle Erstattung, Bestellung über den PaymentIntent gefunden
    expect((await post(event("charge.refunded", { ...charge, amount_refunded: 1780, refunded: true }))).status).toBe(200);
    const after = (await getOrder(r.order.id))!;
    expect(after.order.status).toBe("refunded");
    expect(after.order.refundedAt).not.toBeNull();
    expect(after.cards.find((c) => c.id === mail.id)!.status).toBe("blocked");
    expect(after.cards.find((c) => c.id === print.id)!.status).toBe("redeemed");
    expect(await cardByCode(mail.code)).toBeNull();
    expect((await mailsTo(mail.recipientEmail!)).filter((m) => !m.sentAt)).toHaveLength(0);

    // Späte Zahlungsereignisse machen eine erstattete Bestellung nicht wieder gültig
    await post(event("checkout.session.completed", session(r.order.id, { payment_status: "paid" })));
    expect((await getOrder(r.order.id))!.order.status).toBe("refunded");
  });

  it("ignoriert andere Ereignisse mit 200", async () => {
    expect((await post(event("customer.created", { id: "cus_test", object: "customer" }))).status).toBe(200);
  });
});
