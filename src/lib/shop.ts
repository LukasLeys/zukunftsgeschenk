import "server-only";
import { eq, and, lt, isNotNull, isNull, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";

// Deutsche Fehlermeldungen für alle Schemas.
z.setErrorMap((issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_string && issue.validation === "email") return { message: "Bitte eine gültige E-Mail-Adresse eingeben." };
  if (issue.code === z.ZodIssueCode.too_small) return { message: issue.type === "string" ? "Bitte ausfüllen." : "Der Wert ist zu klein." };
  if (issue.code === z.ZodIssueCode.too_big) return { message: issue.type === "string" ? "Der Text ist zu lang." : "Der Wert ist zu groß." };
  if (issue.code === z.ZodIssueCode.invalid_literal) return { message: "Bitte bestätigen." };
  if (issue.code === z.ZodIssueCode.invalid_type && issue.received === "undefined") return { message: "Bitte ausfüllen." };
  return { message: ctx.defaultError };
});
import { db, schema } from "./db";
import { FORMATS, MAX_AMOUNT_EUR, MIN_AMOUNT_EUR, MOTIFS, OCCASION_IDS, xmasActive } from "./catalog";
import { newId, newRedeemCode, newToken, normalizeCode, slugify } from "./codes";
import { encrypt, decrypt } from "./crypto";
import { isValidIban, normalizeIban, epcPayload } from "./iban";
import { queueMail } from "./mail";
import * as T from "./emails";
import { UserError } from "./errors";
import type { Card } from "./db/schema";

/** Leere Eingaben aus dem Formular wie „nicht angegeben“ behandeln. */
const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

export const PARENT_NAME_MSG = "Bitte den Namen so eintragen, wie das Konto lautet. Mindestens 2, höchstens 70 Zeichen.";
export const PARENT_IBAN_MSG = "Diese IBAN ist nicht gültig. Bitte prüf die Eingabe.";

export const cartItemSchema = z.object({
  motif: z.enum(MOTIFS.map((m) => m.id) as [string, ...string[]]),
  paper: z.enum(["pink", "gelb", "rosa", "tinte", "gold"]),
  format: z.enum(["mail", "print", "premium"]),
  amount: z.number().int().min(MIN_AMOUNT_EUR).max(MAX_AMOUNT_EUR),
  childName: z.string().trim().min(1).max(40),
  message: z.string().trim().max(240).default(""),
  sender: z.string().trim().min(1).max(60),
  recipientEmail: z.string().email().optional().or(z.literal("")),
  deliveryAt: z.string().optional().or(z.literal("")), // ISO, nur E-Mail
  wishSlug: z.string().optional(),
  // Variante „IBAN bekannt“: Schenkende kennen die Bankverbindung der Eltern. Beide Felder oder keins.
  parentName: z.preprocess(emptyToUndefined, z.string().trim().min(2, PARENT_NAME_MSG).max(70, PARENT_NAME_MSG).optional()),
  parentIban: z.preprocess(emptyToUndefined, z.string().refine(isValidIban, PARENT_IBAN_MSG).optional()),
}).superRefine((i, ctx) => {
  if (i.parentIban && !i.parentName) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["parentName"], message: "Bitte auch den Namen der Kontoinhaberin oder des Kontoinhabers eintragen." });
  if (i.parentName && !i.parentIban) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["parentIban"], message: "Bitte auch die IBAN der Eltern eintragen." });
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const checkoutSchema = z.object({
  buyerName: z.string().trim().min(2).max(80),
  buyerEmail: z.string().trim().email(),
  items: z.array(cartItemSchema).min(1).max(20),
  shipping: z
    .object({ name: z.string().trim().min(2), street: z.string().trim().min(3), zip: z.string().trim().regex(/^\d{4}$/, "Bitte eine österreichische Postleitzahl mit 4 Ziffern eingeben."), city: z.string().trim().min(2), country: z.literal("AT") })
    .nullable(),
  acceptTerms: z.literal(true),
  /** Zustimmung zur sofortigen Erstellung digitaler Karten (§ 18 Abs. 1 Z 11 FAGG). Pflicht, wenn E-Mail-Karten im Warenkorb sind. */
  digitalConsent: z.boolean().default(false),
});
export type CheckoutInput = z.input<typeof checkoutSchema>;

export const DIGITAL_CONSENT_MSG = "Bitte stimm zu, dass wir die digitale Karte sofort erstellen. Ohne diese Zustimmung können wir E-Mail-Karten nicht verkaufen.";

const price = (f: string) => FORMATS.find((x) => x.id === f)!.priceCents;

export async function createOrder(input: CheckoutInput) {
  const data = checkoutSchema.parse(input);
  const needsShipping = data.items.some((i) => i.format !== "mail");
  if (needsShipping && !data.shipping)
    throw new z.ZodError([{ code: z.ZodIssueCode.custom, path: ["shipping"], message: "Für gedruckte Karten brauchen wir eine Lieferadresse in Österreich." }]);
  const hasDigital = data.items.some((i) => i.format === "mail");
  if (hasDigital && !data.digitalConsent)
    throw new z.ZodError([{ code: z.ZodIssueCode.custom, path: ["digitalConsent"], message: DIGITAL_CONSENT_MSG }]);
  const d = await db();
  const orderId = newId();
  const total = data.items.reduce((s, i) => s + price(i.format), 0);
  await d.insert(schema.orders).values({
    id: orderId, buyerName: data.buyerName, buyerEmail: data.buyerEmail, totalCents: total,
    accessToken: newToken(), shipping: needsShipping ? data.shipping : null,
    digitalConsent: hasDigital ? true : null,
  });
  const gold = xmasActive();
  for (const i of data.items) {
    let ibanEnc: string | null = null, parentName: string | null = null, parentEmail: string | null = null;
    if (i.wishSlug) {
      const [w] = await d.select().from(schema.wishPages).where(eq(schema.wishPages.slug, i.wishSlug));
      if (w) { ibanEnc = w.ibanEnc; parentName = w.parentName; parentEmail = w.parentEmail; }
    }
    // Variante „IBAN bekannt“: Die Bankverbindung kommt von den Schenkenden, der Bank-QR-Code gleich auf die Karte.
    if (!ibanEnc && i.parentIban && i.parentName) {
      ibanEnc = encrypt(normalizeIban(i.parentIban));
      parentName = i.parentName;
    }
    await d.insert(schema.cards).values({
      id: newId(), orderId, code: newRedeemCode(), motif: i.motif, paper: i.paper, format: i.format,
      priceCents: price(i.format), amountCents: i.amount * 100, childName: i.childName, message: i.message,
      sender: i.sender, recipientEmail: i.recipientEmail || null,
      deliveryAt: i.format === "mail" && i.deliveryAt ? new Date(i.deliveryAt) : null,
      goldEnvelope: i.format === "premium" || (i.format === "print" && gold),
      wishSlug: i.wishSlug ?? null, ibanEnc, parentName, parentEmail,
      payToken: ibanEnc ? newToken() : null,
    });
  }
  return getOrder(orderId);
}

export async function getOrder(id: string) {
  const d = await db();
  const [order] = await d.select().from(schema.orders).where(eq(schema.orders.id, id));
  if (!order) return null;
  const cards = await d.select().from(schema.cards).where(eq(schema.cards.orderId, id));
  return { order, cards };
}

/** Bestellstatus, ab dem eine Zahlung noch als bezahlt verbucht werden darf. Stornierte und erstattete Bestellungen nie. */
const PAYABLE = ["pending", "processing", "failed", "expired"];

/**
 * Nächste Rechnungsnummer ohne Lücken: höchste vergebene Nummer plus eins, mit dem Jahr der Zahlung (Wiener Zeit).
 * Eine Datenbanksequenz kann nach einem Neustart Nummern überspringen, das wollen wir bei Rechnungen nicht.
 * Der eindeutige Index auf invoice_number schützt vor doppelten Nummern.
 */
const NEXT_INVOICE_NUMBER = sql`(select 'ZG-' || to_char(now() at time zone 'Europe/Vienna', 'YYYY') || '-' || lpad(s.n::text, greatest(5, length(s.n::text)), '0')
  from (select coalesce(max(split_part(invoice_number, '-', 3)::int), 1000) + 1 as n from orders where invoice_number ~ '^ZG-[0-9]{4}-[0-9]+$') s)`;

function isUniqueViolation(e: unknown): boolean {
  for (let x: unknown = e, i = 0; x && i < 4; x = (x as { cause?: unknown }).cause, i++)
    if ((x as { code?: string }).code === "23505") return true;
  return false;
}

export interface PaymentRef {
  stripeSessionId?: string;
  paymentIntentId?: string | null;
  /** Mails nur in den Postausgang legen, Zustellung später über deliverDue. */
  deferMail?: boolean;
}

/**
 * Nach erfolgreicher Zahlung (Stripe-Webhook, Rückkehr von Stripe oder Demo): Status, Rechnungsnummer, Mails.
 * Idempotent und sicher bei gleichzeitigen Aufrufen: Nur der Aufruf, der den Status wirklich umstellt,
 * vergibt die Rechnungsnummer und verschickt die Mails.
 * Die Rechnungsnummer ist fortlaufend und lückenlos, mit dem Jahr der Zahlung, zum Beispiel ZG-2026-01001.
 */
export async function markPaid(orderId: string, ref: PaymentRef = {}) {
  const d = await db();
  let claimed: { id: string }[] = [];
  for (let attempt = 0; ; attempt++) {
    try {
      claimed = await d
        .update(schema.orders)
        .set({
          status: "paid",
          paidAt: new Date(),
          invoiceNumber: NEXT_INVOICE_NUMBER,
          ...(ref.stripeSessionId ? { stripeSessionId: ref.stripeSessionId } : {}),
          ...(ref.paymentIntentId ? { stripePaymentIntent: ref.paymentIntentId } : {}),
        })
        .where(and(eq(schema.orders.id, orderId), inArray(schema.orders.status, PAYABLE), isNull(schema.orders.invoiceNumber)))
        .returning({ id: schema.orders.id });
      break;
    } catch (e) {
      // Zwei Zahlungen gleichzeitig haben dieselbe Nummer gezogen: Der eindeutige Index lehnt die zweite ab, wir ziehen neu.
      if (attempt < 5 && isUniqueViolation(e)) continue;
      throw e;
    }
  }
  const after = await getOrder(orderId);
  if (!after || !claimed.length) return after;
  const opts = { defer: ref.deferMail };
  await queueMail({ to: after.order.buyerEmail, ...T.orderConfirmation(after.order, after.cards) }, opts);
  for (const c of after.cards) {
    if (c.format === "mail" && c.recipientEmail) {
      await queueMail({ to: c.recipientEmail, ...T.cardDelivery(c), sendAt: c.deliveryAt ?? undefined }, opts);
    }
  }
  return after;
}

/** Checkout abgeschlossen, das Geld ist aber noch unterwegs (zum Beispiel bei verzögerten Zahlungsarten). */
export async function markProcessing(orderId: string, ref: PaymentRef = {}) {
  const d = await db();
  await d
    .update(schema.orders)
    .set({
      status: "processing",
      ...(ref.stripeSessionId ? { stripeSessionId: ref.stripeSessionId } : {}),
      ...(ref.paymentIntentId ? { stripePaymentIntent: ref.paymentIntentId } : {}),
    })
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.status, "pending")));
  return getOrder(orderId);
}

/** Verzögerte Zahlung ist gescheitert. Schenkende bekommen eine kurze Mail. */
export async function markPaymentFailed(orderId: string, ref: PaymentRef = {}) {
  const d = await db();
  const changed = await d
    .update(schema.orders)
    .set({ status: "failed" })
    .where(and(eq(schema.orders.id, orderId), inArray(schema.orders.status, ["pending", "processing"])))
    .returning({ id: schema.orders.id });
  const res = await getOrder(orderId);
  if (res && changed.length) await queueMail({ to: res.order.buyerEmail, ...T.paymentFailed(res.order) }, { defer: ref.deferMail });
  return res;
}

/** Checkout-Sitzung ist abgelaufen, ohne dass bezahlt wurde. */
export async function markExpired(orderId: string) {
  const d = await db();
  await d.update(schema.orders).set({ status: "expired" }).where(and(eq(schema.orders.id, orderId), eq(schema.orders.status, "pending")));
  return getOrder(orderId);
}

/**
 * Volle Erstattung: Bestellung auf „refunded“, noch nicht eingelöste Karten sperren, geplante Mails zur Bestellung löschen.
 * Eingelöste Karten bleiben, wie sie sind: Dort haben die Eltern ihre Bankverbindung schon angegeben.
 */
export async function markRefunded(orderId: string) {
  const d = await db();
  const res = await getOrder(orderId);
  if (!res || res.order.status === "refunded") return res;
  await d.update(schema.orders).set({ status: "refunded", refundedAt: new Date() }).where(eq(schema.orders.id, orderId));
  await d.update(schema.cards).set({ status: "blocked" }).where(and(eq(schema.cards.orderId, orderId), eq(schema.cards.status, "issued")));
  const needles = [`/bestellung/${orderId}`, ...res.cards.map((c) => c.code)];
  await d
    .delete(schema.outbox)
    .where(and(isNull(schema.outbox.sentAt), or(...needles.map((n) => sql`position(${n} in ${schema.outbox.html}) > 0`))));
  return getOrder(orderId);
}

/** Bestellung zu einer Stripe-Zahlung (PaymentIntent). */
export async function orderIdByPaymentIntent(paymentIntentId: string) {
  const d = await db();
  const [o] = await d.select({ id: schema.orders.id }).from(schema.orders).where(eq(schema.orders.stripePaymentIntent, paymentIntentId));
  return o?.id ?? null;
}

export async function cardByCode(raw: string) {
  const d = await db();
  const [c] = await d.select().from(schema.cards).where(eq(schema.cards.code, normalizeCode(raw)));
  if (!c) return null;
  const [o] = await d.select().from(schema.orders).where(eq(schema.orders.id, c.orderId));
  if (!o || o.status !== "paid") return null;
  return c;
}

export const redeemSchema = z.object({
  code: z.string().min(6),
  parentName: z.string().trim().min(2).max(70),
  parentEmail: z.string().trim().email(),
  iban: z.string().refine(isValidIban, "Diese IBAN ist nicht gültig. Bitte prüft die Eingabe."),
  consent: z.literal(true),
});

export async function redeemCard(input: z.infer<typeof redeemSchema>) {
  const data = redeemSchema.parse(input);
  const card = await cardByCode(data.code);
  if (!card) throw new UserError("Diesen Code kennen wir nicht. Bitte prüft die Schreibweise.", 404);
  if (card.status === "blocked") throw new UserError("Diese Karte ist nicht mehr gültig.", 410);
  if (card.status !== "issued") throw new UserError("Diese Karte wurde bereits eingelöst.", 409);
  if (card.ibanEnc) throw new UserError("Bei dieser Karte ist eure Bankverbindung schon hinterlegt. Ihr müsst nichts einlösen.", 409);
  const d = await db();
  await d.update(schema.cards).set({
    status: "redeemed", redeemedAt: new Date(), parentName: data.parentName, parentEmail: data.parentEmail,
    ibanEnc: encrypt(normalizeIban(data.iban)), payToken: card.payToken ?? newToken(),
  }).where(eq(schema.cards.id, card.id));
  const [updated] = await d.select().from(schema.cards).where(eq(schema.cards.id, card.id));
  const [order] = await d.select().from(schema.orders).where(eq(schema.orders.id, card.orderId));
  await queueMail({ to: order.buyerEmail, ...T.redeemedToGiver(updated, order.buyerName) });
  await queueMail({ to: data.parentEmail, ...T.redeemedToParent(updated) });
  await queueMail({ to: order.buyerEmail, ...T.transferReminder(updated), sendAt: new Date(Date.now() + 7 * 864e5) });
  return updated;
}

/** Daten für die Überweisungsseite der Schenkenden. Gibt die IBAN nur über den geheimen Link heraus. */
export async function transferInfo(payToken: string) {
  const d = await db();
  const [card] = await d.select().from(schema.cards).where(eq(schema.cards.payToken, payToken));
  if (!card || !card.ibanEnc) return null;
  const iban = decrypt(card.ibanEnc);
  const remittance = `Zukunftsgeschenk für ${card.childName}`;
  return {
    card,
    iban,
    recipient: card.parentName ?? "Eltern",
    remittance,
    epc: epcPayload({ name: card.parentName ?? "Eltern", iban, amountCents: card.amountCents, remittance }),
  };
}

export async function markTransferred(payToken: string) {
  const d = await db();
  const [card] = await d.select().from(schema.cards).where(eq(schema.cards.payToken, payToken));
  if (!card) throw new UserError("Dieser Link ist ungültig.", 404);
  if (card.status === "transferred") return card;
  await d.update(schema.cards).set({ status: "transferred", transferredAt: new Date() }).where(eq(schema.cards.id, card.id));
  const [u] = await d.select().from(schema.cards).where(eq(schema.cards.id, card.id));
  if (u.parentEmail) await queueMail({ to: u.parentEmail, ...T.transferredToParent(u) });
  return u;
}

/** EPC-Payload für Karten, bei denen die IBAN beim Kauf schon bekannt ist (Wunschseite oder Variante „IBAN bekannt“). */
export function cardEpc(card: Card) {
  if (!card.ibanEnc) return undefined;
  return epcPayload({ name: card.parentName ?? "Eltern", iban: decrypt(card.ibanEnc), amountCents: card.amountCents, remittance: `Zukunftsgeschenk für ${card.childName}` });
}

export const wishSchema = z.object({
  childName: z.string().trim().min(1).max(40),
  parentName: z.string().trim().min(2).max(70),
  parentEmail: z.string().trim().email(),
  message: z.string().trim().max(400).default(""),
  occasion: z.enum(OCCASION_IDS),
  iban: z.string().refine(isValidIban, "Diese IBAN ist nicht gültig. Bitte prüft die Eingabe."),
  consent: z.literal(true),
});

export async function createWishPage(input: z.infer<typeof wishSchema>) {
  const data = wishSchema.parse(input);
  const d = await db();
  const base = slugify(data.childName) || "kind";
  let slug = `${base}-${newId().slice(0, 4)}`;
  while ((await d.select().from(schema.wishPages).where(eq(schema.wishPages.slug, slug))).length) slug = `${base}-${newId().slice(0, 4)}`;
  const editToken = newToken();
  await d.insert(schema.wishPages).values({
    slug, childName: data.childName, parentName: data.parentName, parentEmail: data.parentEmail,
    message: data.message, occasion: data.occasion, ibanEnc: encrypt(normalizeIban(data.iban)), editToken,
  });
  await queueMail({ to: data.parentEmail, ...T.wishPageCreated(slug, data.childName, editToken) });
  return { slug, editToken };
}

export async function getWishPage(slug: string) {
  const d = await db();
  const [w] = await d.select().from(schema.wishPages).where(eq(schema.wishPages.slug, slug));
  return w ?? null;
}

/** Direktes Überweisen ohne Karte auf der Wunschseite. */
export async function wishEpc(slug: string, amountEur: number, from: string) {
  const w = await getWishPage(slug);
  if (!w) return null;
  return epcPayload({ name: w.parentName, iban: decrypt(w.ibanEnc), amountCents: Math.round(amountEur * 100), remittance: `Zukunftsgeschenk für ${w.childName}${from ? ` von ${from}` : ""}` });
}

export const IBAN_RETENTION_DAYS = 90;
export const WISH_PAGE_RETENTION_MONTHS = 12;

/** Datensparsamkeit: IBAN auf Karten 90 Tage nach der Einlösung bzw. nach dem Kauf löschen. */
export async function purgeOldIbans(now = new Date()) {
  const d = await db();
  const cutoff = new Date(now.getTime() - IBAN_RETENTION_DAYS * 864e5);
  // Eingelöste Karten: 90 Tage nach der Einlösung.
  const a = await d.update(schema.cards).set({ ibanEnc: null }).where(and(isNotNull(schema.cards.ibanEnc), lt(schema.cards.redeemedAt, cutoff))).returning({ id: schema.cards.id });
  // Bankverbindung schon beim Kauf bekannt (Wunschseite oder Variante „IBAN bekannt“), nie eingelöst: 90 Tage nach dem Kauf.
  const b = await d.update(schema.cards).set({ ibanEnc: null }).where(and(isNotNull(schema.cards.ibanEnc), isNull(schema.cards.redeemedAt), lt(schema.cards.createdAt, cutoff))).returning({ id: schema.cards.id });
  return a.length + b.length;
}

/** Wunschseiten samt verschlüsselter IBAN 12 Monate nach dem Anlegen löschen. */
export async function purgeOldWishPages(now = new Date()) {
  const d = await db();
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - WISH_PAGE_RETENTION_MONTHS);
  const gone = await d.delete(schema.wishPages).where(lt(schema.wishPages.createdAt, cutoff)).returning({ slug: schema.wishPages.slug });
  return gone.length;
}
