import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { inflateSync } from "node:zlib";
import { createOrder, markPaid } from "../src/lib/shop";
import { invoiceData, invoicePdf, splitGross } from "../src/lib/invoice";
import { invoiceUrl } from "../src/lib/links";
import { orderConfirmation } from "../src/lib/emails";

/** Liest den sichtbaren Text aus einer pdf-lib-PDF: Inhaltsströme entpacken, Hex-Strings (WinAnsi) dekodieren. */
function pdfText(bytes: Uint8Array) {
  const buf = Buffer.from(bytes);
  const raw = buf.toString("latin1");
  const out: string[] = [];
  const re = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const start = m.index + m[0].length;
    const end = raw.indexOf("endstream", start);
    let content: string;
    try {
      content = inflateSync(buf.subarray(start, end)).toString("latin1");
    } catch {
      content = raw.slice(start, end);
    }
    for (const h of content.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)) out.push(Buffer.from(h[1], "hex").toString("latin1"));
  }
  return out.join("\n").replace(/ /g, " ").replace(/\x80/g, "€");
}

const ENV = { COMPANY_NAME: "Zukunftsgeschenk Test GmbH", COMPANY_LEGAL_FORM: "GmbH", COMPANY_STREET: "Hauptstraße 1", COMPANY_ZIP_CITY: "1010 Wien", COMPANY_EMAIL: "hallo@example.at", COMPANY_UID: "ATU12345678" };
const saved: Record<string, string | undefined> = {};
beforeAll(() => { for (const [k, v] of Object.entries(ENV)) { saved[k] = process.env[k]; process.env[k] = v; } });
afterAll(() => { for (const k of Object.keys(ENV)) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } });

async function paidOrder() {
  const r = await createOrder({
    buyerName: "Gerti Muster", buyerEmail: "oma@example.at", acceptTerms: true, digitalConsent: true,
    shipping: { name: "Anna Muster", street: "Ringstraße 5", zip: "8010", city: "Graz", country: "AT" },
    items: [
      { motif: "sterne", paper: "pink", format: "print", amount: 100, childName: "Lena", message: "", sender: "Oma Gerti" },
      { motif: "konfetti", paper: "tinte", format: "mail", amount: 50, childName: "Lena", message: "", sender: "Oma Gerti" },
      { motif: "sterne", paper: "gold", format: "premium", amount: 250, childName: "Jakob", message: "", sender: "Oma Gerti" },
    ],
  });
  return (await markPaid(r!.order.id))!;
}

describe("Rechnung", () => {
  it("teilt Bruttopreise in Netto und 20 % USt.", () => {
    expect(splitGross(490)).toEqual({ net: 408, vat: 82, gross: 490 });
    expect(splitGross(1290)).toEqual({ net: 1075, vat: 215, gross: 1290 });
    expect(splitGross(1990)).toEqual({ net: 1658, vat: 332, gross: 1990 });
  });

  it("vergibt Rechnungsnummern fortlaufend ohne Lücken, auch bei gleichzeitigen Zahlungen", async () => {
    const make = () => createOrder({ buyerName: "Gerti Muster", buyerEmail: "oma@example.at", acceptTerms: true, shipping: { name: "A B", street: "Weg 12", zip: "1010", city: "Wien", country: "AT" }, items: [{ motif: "sterne", paper: "pink", format: "print", amount: 100, childName: "Lena", message: "", sender: "Oma" }] });
    const orders = await Promise.all([make(), make(), make()]);
    const paid = await Promise.all(orders.map((o) => markPaid(o!.order.id)));
    const again = await markPaid(orders[0]!.order.id);
    expect(again!.order.invoiceNumber).toBe(paid[0]!.order.invoiceNumber);
    const nums = paid.map((p) => Number(p!.order.invoiceNumber!.split("-")[2])).sort((a, b) => a - b);
    expect(new Set(nums).size).toBe(3);
    expect(nums[2] - nums[0]).toBe(2);
    const next = await markPaid((await make())!.order.id);
    expect(Number(next!.order.invoiceNumber!.split("-")[2])).toBe(nums[2] + 1);
  });

  it("gibt es erst mit Rechnungsnummer", async () => {
    const r = await createOrder({ buyerName: "Gerti Muster", buyerEmail: "oma@example.at", acceptTerms: true, shipping: { name: "A B", street: "Weg 12", zip: "1010", city: "Wien", country: "AT" }, items: [{ motif: "sterne", paper: "pink", format: "print", amount: 100, childName: "Lena", message: "", sender: "Oma" }] });
    expect(invoiceData(r!.order, r!.cards)).toBeNull();
    await expect(invoicePdf(r!.order, r!.cards)).rejects.toThrow();
  });

  it("enthält Nummer, Firmendaten, Positionen und Summen", async () => {
    const { order, cards } = await paidOrder();
    const data = invoiceData(order, cards)!;
    expect(data.total).toEqual({ net: 408 + 1075 + 1658, vat: 82 + 215 + 332, gross: 3770 });
    expect(data.total.gross).toBe(order.totalCents);

    const text = pdfText(await invoicePdf(order, cards));
    expect(text).toContain(`Rechnung ${order.invoiceNumber}`);
    expect(text).toMatch(/ZG-\d{4}-\d{5}/);
    expect(text).toContain("Zukunftsgeschenk Test GmbH");
    expect(text).toContain("Hauptstraße 1");
    expect(text).toContain("UID: ATU12345678");
    expect(text).toContain("Gerti Muster");
    expect(text).toContain("Summe netto");
    expect(text).toContain("31,41 €");
    expect(text).toContain("USt. 20 %");
    expect(text).toContain("6,29 €");
    expect(text).toContain("Gesamtbetrag brutto");
    expect(text).toContain("37,70 €");
    expect(text).toContain("10,75 €");
    expect(text).toContain("2,15 €");
    expect(text).toContain("12,90 €");
    expect(text).toContain("400 € sind nicht Teil dieser Rechnung");
    expect(text).not.toMatch(/[–—]/);
  });

  it("zeigt Platzhalter, wenn Firmendaten fehlen", async () => {
    const { order, cards } = await paidOrder();
    const uid = process.env.COMPANY_UID;
    delete process.env.COMPANY_UID;
    try {
      expect(pdfText(await invoicePdf(order, cards))).toContain("[UID-Nummer]");
    } finally {
      process.env.COMPANY_UID = uid;
    }
  });

  it("ist in der Bestellbestätigung verlinkt", async () => {
    const { order, cards } = await paidOrder();
    const conf = orderConfirmation(order, cards);
    expect(conf.html).toContain(invoiceUrl(order).replace(/&/g, "&amp;").split("?")[0]);
    expect(conf.text).toContain(invoiceUrl(order));
  });
});
