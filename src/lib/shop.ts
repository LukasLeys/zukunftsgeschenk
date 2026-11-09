import "server-only";
import { eq, and, lt, isNotNull, isNull, sql } from "drizzle-orm";
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
import { FORMATS, MAX_AMOUNT_EUR, MIN_AMOUNT_EUR, MOTIFS, xmasActive } from "./catalog";
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

/** Nach erfolgreicher Zahlung (Stripe-Webhook oder Demo): Status, Rechnungsnummer, Mails. Idempotent. */
export async function markPaid(orderId: string, stripeSessionId?: string) {
  const d = await db();
  const res = await getOrder(orderId);
  if (!res || res.order.status === "paid") return res;
  const seq = await d.execute(sql`select nextval('invoice_seq') as n`);
  const rows = (seq as unknown as { rows?: { n: number }[] }).rows ?? (seq as unknown as { n: number }[]);
  const n = Number(rows[0]?.n ?? Date.now() % 100000);
  const invoiceNumber = `ZG-${new Date().getFullYear()}-${String(n).padStart(5, "0")}`;
  await d.update(schema.orders).set({ status: "paid", paidAt: new Date(), invoiceNumber, stripeSessionId: stripeSessionId ?? res.order.stripeSessionId }).where(eq(schema.orders.id, orderId));
  const after = (await getOrder(orderId))!;
  const conf = T.orderConfirmation(after.order, after.cards);
  await queueMail({ to: after.order.buyerEmail, ...conf });
  for (const c of after.cards) {
    if (c.format === "mail" && c.recipientEmail) {
      await queueMail({ to: c.recipientEmail, ...T.cardDelivery(c), sendAt: c.deliveryAt ?? undefined });
    }
  }
  return after;
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
  occasion: z.enum(["weihnachten", "geburt", "taufe", "geburtstag", "kommunion", "firmung", "neutral"]),
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
