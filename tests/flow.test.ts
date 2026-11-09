import { describe, it, expect } from "vitest";
import { createOrder, markPaid, redeemCard, transferInfo, markTransferred, createWishPage, cardEpc, getOrder } from "../src/lib/shop";
import { cardPdf } from "../src/lib/pdf";
import { db, schema } from "../src/lib/db";

describe("Ablauf Kauf → Einlösen → Überweisen", () => {
  it("funktioniert von Anfang bis Ende", async () => {
    const r = await createOrder({
      buyerName: "Gerti Muster", buyerEmail: "oma@example.at", acceptTerms: true,
      shipping: { name: "Gerti Muster", street: "Hauptstraße 1", zip: "1010", city: "Wien", country: "AT" },
      items: [
        { motif: "sterne", paper: "pink", format: "print", amount: 100, childName: "Lena", message: "Frohe Weihnachten", sender: "Oma Gerti" },
        { motif: "konfetti", paper: "tinte", format: "mail", amount: 50, childName: "Lena", message: "", sender: "Oma Gerti", recipientEmail: "eltern@example.at", deliveryAt: "2026-12-24T17:00:00+01:00" },
      ],
    });
    expect(r!.order.totalCents).toBe(1290 + 490);
    const paid = await markPaid(r!.order.id);
    expect(paid!.order.status).toBe("paid");
    expect(paid!.order.invoiceNumber).toMatch(/^ZG-\d{4}-\d{5}$/);
    const card = paid!.cards.find((c) => c.format === "print")!;
    expect(card.goldEnvelope).toBe(true);
    const pdf = await cardPdf(card, { redeemUrl: "https://example.at/einloesen?code=" + card.code });
    expect(pdf.byteLength).toBeGreaterThan(1000);

    await expect(redeemCard({ code: card.code, parentName: "Anna Muster", parentEmail: "anna@example.at", iban: "AT61 1904 3002 3457 3202", consent: true })).rejects.toThrow();
    const red = await redeemCard({ code: card.code.toLowerCase().replace(/-/g, " "), parentName: "Anna Muster", parentEmail: "anna@example.at", iban: "AT61 1904 3002 3457 3201", consent: true });
    expect(red.status).toBe("redeemed");
    expect(red.ibanEnc).not.toContain("AT61");
    const info = await transferInfo(red.payToken!);
    expect(info!.iban).toBe("AT611904300234573201");
    expect(info!.epc).toContain("EUR100.00");
    const t = await markTransferred(red.payToken!);
    expect(t.status).toBe("transferred");
    const d = await db();
    const mails = await d.select().from(schema.outbox);
    expect(mails.length).toBeGreaterThanOrEqual(5);
    const scheduled = mails.find((m) => m.to === "eltern@example.at");
    expect(scheduled!.sentAt).toBeNull();
  });

  it("Wunschseite liefert die IBAN direkt auf die Karte", async () => {
    const w = await createWishPage({ childName: "Jakob", parentName: "Max Huber", parentEmail: "max@example.at", message: "Danke!", occasion: "geburt", iban: "AT611904300234573201", consent: true });
    const r = await createOrder({ buyerName: "Opa Franz", buyerEmail: "opa@example.at", acceptTerms: true, shipping: null,
      items: [{ motif: "mobile", paper: "rosa", format: "mail", amount: 250, childName: "Jakob", message: "", sender: "Opa Franz", wishSlug: w.slug }] });
    const c = (await getOrder(r!.order.id))!.cards[0];
    expect(cardEpc(c)).toContain("EUR250.00");
  });
});
