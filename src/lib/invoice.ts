import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatEUR, formatById, motifById } from "./catalog";
import { COMPANY_FIELDS, companyValue, type CompanyKey } from "./company";
import { SITE_URL } from "./env";
import type { Card, Order } from "./db/schema";

// Rechnung nach § 11 UStG: Name und Anschrift des Unternehmens, UID, fortlaufende Nummer, Datum,
// Leistungsdatum, Name der Kundin oder des Kunden, Menge und Bezeichnung, Entgelt, Steuersatz und Steuerbetrag.

export const VAT_RATE = 20;

/** Firmenwert oder markierter Platzhalter wie „[UID-Nummer]“. */
const co = (k: CompanyKey) => companyValue(k) ?? `[${COMPANY_FIELDS[k].label}]`;

/** Netto und USt. aus einem Bruttobetrag in Cent (20 %). Netto wird gerundet, die USt. ist der Rest. */
export function splitGross(grossCents: number) {
  const net = Math.round((grossCents * 100) / (100 + VAT_RATE));
  return { net, vat: grossCents - net, gross: grossCents };
}

export interface InvoiceLine {
  pos: number;
  text: string;
  detail: string;
  qty: number;
  net: number;
  vat: number;
  gross: number;
}

const dateAT = (d: Date) => new Intl.DateTimeFormat("de-AT", { timeZone: "Europe/Vienna", day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
const money = (c: number) => formatEUR(c, { cents: true, decimals: true });

/** Inhalt der Rechnung als Daten. Gibt null zurück, solange die Bestellung keine Rechnungsnummer hat. */
export function invoiceData(order: Order, cards: Card[]) {
  if (!order.invoiceNumber || !order.paidAt) return null;
  const lines: InvoiceLine[] = cards.map((c, i) => ({
    pos: i + 1,
    text: `Geschenkkarte „${motifById(c.motif)?.name ?? c.motif}“`,
    detail: `${formatById(c.format)?.label ?? c.format}, für ${c.childName}, Einlösecode ${c.code}`,
    qty: 1,
    ...splitGross(c.priceCents),
  }));
  const total = lines.reduce((s, l) => ({ net: s.net + l.net, vat: s.vat + l.vat, gross: s.gross + l.gross }), { net: 0, vat: 0, gross: 0 });
  const giftCents = cards.reduce((s, c) => s + c.amountCents, 0);
  const rawName = companyValue("name"), rawForm = companyValue("form");
  const sellerName = rawName && rawForm && rawName.includes(rawForm) ? rawName : `${co("name")} ${co("form")}`;
  return {
    number: order.invoiceNumber,
    date: dateAT(order.paidAt),
    serviceDate: dateAT(order.paidAt),
    orderId: order.id,
    seller: {
      name: sellerName,
      lines: [co("street"), `${co("zipCity")}, Österreich`],
      uid: co("uid"),
      fn: companyValue("fn") ? `${companyValue("fn")}${companyValue("fbCourt") ? `, ${companyValue("fbCourt")}` : ""}` : null,
      email: co("email"),
    },
    buyer: { name: order.buyerName, email: order.buyerEmail },
    shipping: order.shipping,
    lines,
    total,
    giftCents,
    refunded: order.status === "refunded",
    refundedAt: order.refundedAt ? dateAT(order.refundedAt) : null,
  };
}
export type InvoiceData = NonNullable<ReturnType<typeof invoiceData>>;

/** Nur Zeichen, die die Standardschrift kennt (WinAnsi). Andere werden zu „?“, statt dass die PDF scheitert. */
function safe(font: PDFFont, text: string) {
  const set = new Set(font.getCharacterSet());
  const ok = (str: string) => str !== "" && Array.from(str).every((b) => set.has(b.codePointAt(0)!));
  const fallback: Record<string, string> = { "Ł": "L", "ł": "l", "Đ": "D", "đ": "d", "−": "-", " ": " " };
  return Array.from(text)
    .map((ch) => {
      if (ok(ch)) return ch;
      const base = fallback[ch] ?? ch.normalize("NFD").replace(/\p{M}/gu, "");
      return ok(base) ? base : "?";
    })
    .join("");
}

const INK = rgb(0x2a / 255, 0x1f / 255, 0x2d / 255);
const PINK = rgb(0xd8 / 255, 0x1b / 255, 0x6a / 255);
const MUTED = rgb(0x5b / 255, 0x4a / 255, 0x5c / 255);
const LINE = rgb(0xf1 / 255, 0xdd / 255, 0xe6 / 255);
const mm = (v: number) => (v * 72) / 25.4;

/** Rechnung als A4-PDF. */
export async function invoicePdf(order: Order, cards: Card[]) {
  const data = invoiceData(order, cards);
  if (!data) throw new Error("Bestellung hat noch keine Rechnungsnummer");
  const doc = await PDFDocument.create();
  doc.setTitle(`Rechnung ${data.number}`);
  doc.setSubject(`Rechnung ${data.number}, ${money(data.total.gross)}`);
  doc.setAuthor(data.seller.name);
  doc.setCreator("Zukunftsgeschenk");
  doc.setLanguage("de-AT");
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const W = 595.28, H = 841.89, L = mm(20), R = W - mm(20);

  let page: PDFPage = doc.addPage([W, H]);
  const text = (t: string, x: number, y: number, o: { size?: number; font?: PDFFont; color?: typeof INK; right?: boolean; max?: number } = {}) => {
    const font = o.font ?? reg, size = o.size ?? 10;
    let s = safe(font, t);
    if (o.max) while (s.length > 4 && font.widthOfTextAtSize(s, size) > o.max) s = s.slice(0, -4).trimEnd() + "...";
    const dx = o.right ? font.widthOfTextAtSize(s, size) : 0;
    page.drawText(s, { x: x - dx, y, size, font, color: o.color ?? INK });
  };

  // Kopf
  page.drawRectangle({ x: 0, y: H - mm(8), width: W, height: mm(8), color: PINK });
  let y = H - mm(24);
  text("Zukunftsgeschenk", L, y, { size: 16, font: bold, color: PINK });
  const sellerLines = [data.seller.name, ...data.seller.lines, `UID: ${data.seller.uid}`, ...(data.seller.fn ? [`FN ${data.seller.fn}`] : []), data.seller.email];
  sellerLines.forEach((l, i) => text(l, R, y - i * 12, { size: 9, right: true, color: i === 0 ? INK : MUTED, font: i === 0 ? bold : reg }));

  y = H - mm(70);
  text("Rechnung an", L, y, { size: 9, color: MUTED });
  text(data.buyer.name, L, y - 14, { size: 11, font: bold });
  text(data.buyer.email, L, y - 28, { size: 10 });
  if (data.shipping) {
    text("Lieferadresse", L + mm(80), y, { size: 9, color: MUTED });
    [data.shipping.name, data.shipping.street, `${data.shipping.zip} ${data.shipping.city}, Österreich`].forEach((l, i) => text(l, L + mm(80), y - 14 - i * 13, { size: 10 }));
  }

  y = H - mm(105);
  text(`Rechnung ${data.number}`, L, y, { size: 18, font: bold });
  y -= 22;
  const facts: [string, string][] = [
    ["Rechnungsnummer", data.number],
    ["Rechnungsdatum", data.date],
    ["Liefer- und Leistungsdatum", data.serviceDate],
    ["Bestellnummer", data.orderId],
  ];
  for (const [k, v] of facts) {
    text(k, L, y, { size: 10, color: MUTED });
    text(v, L + mm(52), y, { size: 10 });
    y -= 14;
  }

  // Tabelle
  y -= 14;
  const col = { pos: L, text: L + mm(10), qty: L + mm(100), net: L + mm(122), vat: L + mm(146), gross: R };
  const head = (yy: number) => {
    text("Pos.", col.pos, yy, { size: 9, font: bold });
    text("Bezeichnung", col.text, yy, { size: 9, font: bold });
    text("Menge", col.qty, yy, { size: 9, font: bold, right: true });
    text("Netto", col.net, yy, { size: 9, font: bold, right: true });
    text(`USt. ${VAT_RATE} %`, col.vat, yy, { size: 9, font: bold, right: true });
    text("Brutto", col.gross, yy, { size: 9, font: bold, right: true });
    page.drawLine({ start: { x: L, y: yy - 6 }, end: { x: R, y: yy - 6 }, thickness: 0.8, color: INK });
  };
  head(y);
  y -= 22;
  for (const l of data.lines) {
    if (y < mm(70)) {
      page = doc.addPage([W, H]);
      y = H - mm(25);
      head(y);
      y -= 22;
    }
    text(String(l.pos), col.pos, y);
    text(l.text, col.text, y, { max: col.qty - col.text - mm(12) });
    text(l.detail, col.text, y - 12, { size: 8.5, color: MUTED, max: col.gross - col.text });
    text(String(l.qty), col.qty, y, { right: true });
    text(money(l.net), col.net, y, { right: true });
    text(money(l.vat), col.vat, y, { right: true });
    text(money(l.gross), col.gross, y, { right: true });
    page.drawLine({ start: { x: L, y: y - 20 }, end: { x: R, y: y - 20 }, thickness: 0.5, color: LINE });
    y -= 32;
  }

  // Summen
  const sums: [string, string, boolean][] = [
    ["Summe netto", money(data.total.net), false],
    [`USt. ${VAT_RATE} %`, money(data.total.vat), false],
    ["Gesamtbetrag brutto", money(data.total.gross), true],
  ];
  for (const [k, v, strong] of sums) {
    text(k, col.vat, y, { size: strong ? 11 : 10, font: strong ? bold : reg, right: true });
    text(v, col.gross, y, { size: strong ? 11 : 10, font: strong ? bold : reg, right: true });
    y -= 16;
  }
  y -= 6;
  text(`Bezahlt am ${data.date}. Es ist nichts mehr offen.`, L, y, { size: 10 });
  y -= 26;

  const note = [
    `Die Geschenkbeträge von zusammen ${formatEUR(data.giftCents, { cents: true, decimals: data.giftCents % 100 !== 0 })} sind nicht Teil dieser Rechnung.`,
    "Sie gehen direkt von den Schenkenden an die Eltern. Wir erhalten dieses Geld nie.",
  ];
  if (data.refunded) note.push(`Diese Bestellung wurde${data.refundedAt ? ` am ${data.refundedAt}` : ""} erstattet. Die Karten daraus sind gesperrt, sofern sie noch nicht eingelöst waren.`);
  page.drawRectangle({ x: L, y: y - note.length * 13 + 4, width: R - L, height: note.length * 13 + 10, color: rgb(1, 0xf2 / 255, 0xf7 / 255) });
  note.forEach((l, i) => text(l, L + 8, y - i * 13, { size: 9.5 }));

  // Fuß auf jeder Seite
  for (const p of doc.getPages()) {
    page = p;
    const foot = [
      [data.seller.name, data.seller.lines.join(", ")].join(", "),
      `UID ${data.seller.uid}${data.seller.fn ? `, FN ${data.seller.fn}` : ""}, ${data.seller.email}, ${SITE_URL.replace(/^https?:\/\//, "")}`,
    ];
    foot.forEach((l, i) => text(l, L, mm(16) - i * 11, { size: 8, color: MUTED }));
  }
  return doc.save();
}
