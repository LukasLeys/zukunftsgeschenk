import "server-only";
import { and, asc, desc, eq, inArray, isNotNull, isNull, lte, or, sql, ilike, gte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Card, Order } from "@/lib/db/schema";

const { orders, cards, outbox } = schema;

const PRINT_FORMATS = ["print", "premium"];

/** Zähler für die Navigation. */
export async function navCounts() {
  const d = await db();
  const [p] = await d
    .select({ n: sql<number>`count(*)::int` })
    .from(cards)
    .innerJoin(orders, eq(orders.id, cards.orderId))
    .where(and(eq(orders.status, "paid"), inArray(cards.format, PRINT_FORMATS), isNull(cards.shippedAt)));
  const [m] = await d
    .select({ n: sql<number>`count(*)::int` })
    .from(outbox)
    .where(and(isNull(outbox.sentAt), lte(outbox.sendAt, new Date())));
  return { print: Number(p?.n ?? 0), mail: Number(m?.n ?? 0) };
}

export interface Totals {
  orders: number;
  byFormat: Record<string, number>;
  cards: number;
  grossCents: number;
  giftCents: number;
}

/** Kennzahlen bezahlter Bestellungen, optional ab einem Zeitpunkt (Zahlungszeitpunkt). */
export async function totals(since?: Date): Promise<Totals> {
  const d = await db();
  const cond = since ? and(eq(orders.status, "paid"), gte(orders.paidAt, since)) : eq(orders.status, "paid");
  const [o] = await d.select({ n: sql<number>`count(*)::int` }).from(orders).where(cond);
  const rows = await d
    .select({
      format: cards.format,
      n: sql<number>`count(*)::int`,
      gross: sql<number>`coalesce(sum(${cards.priceCents}),0)::int`,
      gift: sql<number>`coalesce(sum(${cards.amountCents}),0)::bigint`,
    })
    .from(cards)
    .innerJoin(orders, eq(orders.id, cards.orderId))
    .where(cond)
    .groupBy(cards.format);
  const byFormat: Record<string, number> = { mail: 0, print: 0, premium: 0 };
  let n = 0, gross = 0, gift = 0;
  for (const r of rows) {
    byFormat[r.format] = Number(r.n);
    n += Number(r.n);
    gross += Number(r.gross);
    gift += Number(r.gift);
  }
  return { orders: Number(o?.n ?? 0), byFormat, cards: n, grossCents: gross, giftCents: gift };
}

/** Status aller Karten bezahlter Bestellungen plus heutige Einlösungen und Überweisungen. */
export async function cardFlow(since: Date) {
  const d = await db();
  const [r] = await d
    .select({
      all: sql<number>`count(*)::int`,
      redeemed: sql<number>`count(*) filter (where ${cards.status} in ('redeemed','transferred'))::int`,
      transferred: sql<number>`count(*) filter (where ${cards.status} = 'transferred')::int`,
      redeemedToday: sql<number>`count(*) filter (where ${cards.redeemedAt} >= ${since})::int`,
      transferredToday: sql<number>`count(*) filter (where ${cards.transferredAt} >= ${since})::int`,
    })
    .from(cards)
    .innerJoin(orders, eq(orders.id, cards.orderId))
    .where(eq(orders.status, "paid"));
  return {
    all: Number(r?.all ?? 0),
    redeemed: Number(r?.redeemed ?? 0),
    transferred: Number(r?.transferred ?? 0),
    redeemedToday: Number(r?.redeemedToday ?? 0),
    transferredToday: Number(r?.transferredToday ?? 0),
  };
}

export type PrintJob = Card & { order: Pick<Order, "id" | "invoiceNumber" | "buyerName" | "paidAt" | "shipping"> };

/** Offene Druckaufträge: bezahlte Karten im Format Druck/Premium ohne Versanddatum, älteste zuerst. */
export async function printJobs(opts: { shipped?: boolean; sinceDays?: number } = {}): Promise<PrintJob[]> {
  const d = await db();
  const shippedCond = opts.shipped
    ? and(isNotNull(cards.shippedAt), gte(cards.shippedAt, new Date(Date.now() - (opts.sinceDays ?? 14) * 864e5)))
    : isNull(cards.shippedAt);
  const rows = await d
    .select({ card: cards, order: { id: orders.id, invoiceNumber: orders.invoiceNumber, buyerName: orders.buyerName, paidAt: orders.paidAt, shipping: orders.shipping } })
    .from(cards)
    .innerJoin(orders, eq(orders.id, cards.orderId))
    .where(and(eq(orders.status, "paid"), inArray(cards.format, PRINT_FORMATS), shippedCond))
    .orderBy(opts.shipped ? desc(cards.shippedAt) : asc(orders.paidAt), asc(cards.createdAt));
  return rows.map((r) => ({ ...r.card, order: r.order }));
}

export async function outboxStats() {
  const d = await db();
  const [r] = await d
    .select({
      planned: sql<number>`count(*) filter (where ${outbox.sentAt} is null and ${outbox.sendAt} > now())::int`,
      due: sql<number>`count(*) filter (where ${outbox.sentAt} is null and ${outbox.sendAt} <= now())::int`,
      sent: sql<number>`count(*) filter (where ${outbox.sentAt} is not null)::int`,
      next: sql<Date | null>`min(${outbox.sendAt}) filter (where ${outbox.sentAt} is null and ${outbox.sendAt} > now())`,
    })
    .from(outbox);
  return {
    planned: Number(r?.planned ?? 0),
    due: Number(r?.due ?? 0),
    sent: Number(r?.sent ?? 0),
    next: r?.next ? new Date(r.next) : null,
  };
}

export interface Activity {
  at: Date;
  kind: "order" | "paid" | "redeemed" | "transferred" | "shipped" | "mail" | "cancelled";
  text: string;
  href?: string;
}

/** Letzte Ereignisse aus Bestellungen, Karten und Postausgang, neueste zuerst. */
export async function recentActivity(limit = 14): Promise<Activity[]> {
  const d = await db();
  const out: Activity[] = [];
  const os = await d.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  for (const o of os) {
    const href = `/admin/bestellungen/${o.id}`;
    if (o.paidAt) out.push({ at: o.paidAt, kind: o.status === "cancelled" ? "cancelled" : "paid", text: `Bezahlt: ${o.invoiceNumber ?? o.id}, ${o.buyerName}${o.status === "cancelled" ? " (inzwischen storniert)" : ""}`, href });
    else out.push({ at: o.createdAt, kind: "order", text: `Bestellung angelegt, noch nicht bezahlt: ${o.buyerName}`, href });
  }
  const red = await d.select().from(cards).where(isNotNull(cards.redeemedAt)).orderBy(desc(cards.redeemedAt)).limit(limit);
  for (const c of red) out.push({ at: c.redeemedAt!, kind: "redeemed", text: `Eingelöst: ${c.code} für ${c.childName}`, href: `/admin/bestellungen/${c.orderId}` });
  const tr = await d.select().from(cards).where(isNotNull(cards.transferredAt)).orderBy(desc(cards.transferredAt)).limit(limit);
  for (const c of tr) out.push({ at: c.transferredAt!, kind: "transferred", text: `Überweisung gemeldet: ${c.code}`, href: `/admin/bestellungen/${c.orderId}` });
  const sh = await d.select().from(cards).where(isNotNull(cards.shippedAt)).orderBy(desc(cards.shippedAt)).limit(limit);
  for (const c of sh) out.push({ at: c.shippedAt!, kind: "shipped", text: `Versendet: ${c.code}`, href: `/admin/bestellungen/${c.orderId}` });
  const ms = await d.select({ id: outbox.id, to: outbox.to, subject: outbox.subject, sentAt: outbox.sentAt }).from(outbox).where(isNotNull(outbox.sentAt)).orderBy(desc(outbox.sentAt)).limit(limit);
  for (const m of ms) out.push({ at: m.sentAt!, kind: "mail", text: `Mail an ${m.to}: ${m.subject}`, href: `/admin/postausgang?ansicht=gesendet&vorschau=${m.id}` });
  return out.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}

/** Bestellliste mit Suche (Name, E-Mail, Rechnungsnummer, Kartencode) und Statusfilter. */
export async function listOrders(q: string, status: string, limit = 200) {
  const d = await db();
  const conds = [];
  if (status && status !== "alle") conds.push(eq(orders.status, status));
  const term = q.trim();
  if (term) {
    const like = `%${term.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    conds.push(
      or(
        ilike(orders.buyerName, like),
        ilike(orders.buyerEmail, like),
        ilike(orders.invoiceNumber, like),
        sql`exists (select 1 from cards c where c.order_id = ${orders.id} and (c.code ilike ${like} or c.child_name ilike ${like}))`,
      ),
    );
  }
  const rows = await d
    .select()
    .from(orders)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(limit + 1);
  const list = rows.slice(0, limit);
  const ids = list.map((o) => o.id);
  const cs = ids.length ? await d.select({ orderId: cards.orderId, format: cards.format }).from(cards).where(inArray(cards.orderId, ids)) : [];
  const counts = new Map<string, Record<string, number>>();
  for (const c of cs) {
    const m = counts.get(c.orderId) ?? {};
    m[c.format] = (m[c.format] ?? 0) + 1;
    counts.set(c.orderId, m);
  }
  const [st] = await d
    .select({
      alle: sql<number>`count(*)::int`,
      paid: sql<number>`count(*) filter (where ${orders.status} = 'paid')::int`,
      pending: sql<number>`count(*) filter (where ${orders.status} = 'pending')::int`,
      cancelled: sql<number>`count(*) filter (where ${orders.status} = 'cancelled')::int`,
    })
    .from(orders);
  return { list: list.map((o) => ({ ...o, formats: counts.get(o.id) ?? {} })), more: rows.length > limit, statusCounts: st };
}

/** Mails einer Bestellung: zugeordnet über Bestell-ID, Kartencodes und Überweisungslinks im Mailtext. */
export async function mailsForOrder(order: Order, cs: Card[]) {
  const d = await db();
  const needles = [`/bestellung/${order.id}`, ...cs.map((c) => c.code), ...cs.filter((c) => c.payToken).map((c) => `/ueberweisen/${c.payToken}`)];
  const conds = needles.map((n) => sql`position(${n} in ${outbox.html}) > 0`);
  // „hat überwiesen“-Mail an die Eltern enthält weder Code noch Link: über Adresse und Betreff zuordnen.
  for (const c of cs) {
    if (c.parentEmail) conds.push(and(eq(outbox.to, c.parentEmail), eq(outbox.subject, `${c.sender} hat überwiesen`))!);
  }
  return d
    .select()
    .from(outbox)
    .where(or(...conds))
    .orderBy(desc(outbox.sendAt));
}
