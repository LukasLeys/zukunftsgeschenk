import { describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import {
  createOrder, markPaid, getOrder, cardEpc, transferInfo, redeemCard, createWishPage, getWishPage,
  purgeOldIbans, purgeOldWishPages,
} from "../src/lib/shop";
import { orderConfirmation, cardDelivery, wishPageCreated } from "../src/lib/emails";
import { IBAN_LENGTHS, isValidIban } from "../src/lib/iban";
import { db, schema } from "../src/lib/db";

const IBAN = "AT61 1904 3002 3457 3201";
const base = { buyerName: "Gerti Muster", buyerEmail: "oma@example.at", acceptTerms: true as const };
const mailItem = { motif: "konfetti", paper: "pink" as const, format: "mail" as const, amount: 80, childName: "Mia", message: "", sender: "Oma Gerti" };
const printItem = { ...mailItem, format: "print" as const };
const ship = { name: "Gerti Muster", street: "Hauptstraße 1", zip: "1010", city: "Wien", country: "AT" as const };

async function setCreatedAt(table: "cards" | "wishPages", where: { id?: string; slug?: string }, at: Date) {
  const d = await db();
  if (table === "cards") await d.update(schema.cards).set({ createdAt: at }).where(eq(schema.cards.id, where.id!));
  else await d.update(schema.wishPages).set({ createdAt: at }).where(eq(schema.wishPages.slug, where.slug!));
}

describe("Variante „IBAN bekannt“", () => {
  it("legt die Bankverbindung verschlüsselt an und liefert den Bank-QR für die Karte", async () => {
    const r = await createOrder({ ...base, digitalConsent: true, shipping: null, items: [{ ...mailItem, parentName: "Anna Muster", parentIban: IBAN }] });
    const c = r!.cards[0];
    expect(c.parentName).toBe("Anna Muster");
    expect(c.ibanEnc).toBeTruthy();
    expect(c.ibanEnc).not.toContain("AT61");
    expect(c.payToken).toBeTruthy();
    expect(c.wishSlug).toBeNull();
    const epc = cardEpc(c)!;
    expect(epc).toContain("Anna Muster");
    expect(epc).toContain("AT611904300234573201");
    expect(epc).toContain("EUR80.00");
    const info = await transferInfo(c.payToken!);
    expect(info!.recipient).toBe("Anna Muster");
    expect(info!.iban).toBe("AT611904300234573201");
  });

  it("Bestätigung und Karten-Mail erwähnen den Bank-QR und verlangen kein Einlösen", async () => {
    const r = await createOrder({ ...base, digitalConsent: true, shipping: null, items: [{ ...mailItem, recipientEmail: "eltern@example.at", parentName: "Anna Muster", parentIban: IBAN }] });
    const paid = (await markPaid(r!.order.id))!;
    const conf = orderConfirmation(paid.order, paid.cards);
    expect(conf.html).toContain("Bank-QR-Code ist auf der Karte");
    expect(conf.html).toContain(`/ueberweisen/${paid.cards[0].payToken}`);
    expect(conf.html).not.toContain("Sobald die Eltern eine Karte einlösen");
    expect(cardDelivery(paid.cards[0]).html).toContain("Ihr müsst nichts einlösen");
  });

  it("verlangt Name und IBAN gemeinsam und prüft die IBAN", async () => {
    await expect(createOrder({ ...base, digitalConsent: true, shipping: null, items: [{ ...mailItem, parentIban: IBAN }] })).rejects.toThrow(/Namen/);
    await expect(createOrder({ ...base, digitalConsent: true, shipping: null, items: [{ ...mailItem, parentName: "Anna Muster" }] })).rejects.toThrow(/IBAN/);
    await expect(createOrder({ ...base, digitalConsent: true, shipping: null, items: [{ ...mailItem, parentName: "Anna Muster", parentIban: "AT61 1904 3002 3457 3202" }] })).rejects.toThrow(/nicht gültig/);
    await expect(createOrder({ ...base, digitalConsent: true, shipping: null, items: [{ ...mailItem, parentName: "A", parentIban: IBAN }] })).rejects.toThrow(/Mindestens 2/);
    // Leere Felder zählen als „nicht angegeben“
    const r = await createOrder({ ...base, digitalConsent: true, shipping: null, items: [{ ...mailItem, parentName: "", parentIban: "" }] });
    expect(r!.cards[0].ibanEnc).toBeNull();
    expect(r!.cards[0].payToken).toBeNull();
  });
});

describe("Zustimmung bei E-Mail-Karten (§ 18 Abs. 1 Z 11 FAGG)", () => {
  it("ist Pflicht, sobald eine E-Mail-Karte im Warenkorb ist", async () => {
    await expect(createOrder({ ...base, shipping: null, items: [mailItem] })).rejects.toThrow(/sofort erstellen/);
    await expect(createOrder({ ...base, digitalConsent: false, shipping: ship, items: [printItem, mailItem] })).rejects.toThrow(/sofort erstellen/);
  });

  it("wird gespeichert und in der Bestellbestätigung erwähnt", async () => {
    const r = await createOrder({ ...base, digitalConsent: true, shipping: null, items: [mailItem] });
    expect(r!.order.digitalConsent).toBe(true);
    const paid = (await markPaid(r!.order.id))!;
    const conf = orderConfirmation(paid.order, paid.cards);
    expect(conf.html).toContain("Rücktrittsrecht");
    expect(conf.text).toContain("Rücktrittsrecht");
  });

  it("ist bei nur gedruckten Karten nicht nötig", async () => {
    const r = await createOrder({ ...base, shipping: ship, items: [printItem] });
    expect(r!.order.digitalConsent).toBeNull();
    const paid = (await markPaid(r!.order.id))!;
    expect(orderConfirmation(paid.order, paid.cards).html).not.toContain("Rücktrittsrecht");
  });
});

describe("Löschfristen", () => {
  it("löscht die IBAN 90 Tage nach dem Kauf bei nie eingelösten Karten mit bekannter Bankverbindung", async () => {
    const r = await createOrder({ ...base, digitalConsent: true, shipping: null, items: [
      { ...mailItem, parentName: "Anna Muster", parentIban: IBAN },
      { ...mailItem, parentName: "Anna Muster", parentIban: IBAN },
    ] });
    const [old, fresh] = r!.cards;
    await setCreatedAt("cards", { id: old.id }, new Date(Date.now() - 91 * 864e5));
    await setCreatedAt("cards", { id: fresh.id }, new Date(Date.now() - 89 * 864e5));
    expect(await purgeOldIbans()).toBeGreaterThanOrEqual(1);
    const after = (await getOrder(r!.order.id))!.cards;
    expect(after.find((c) => c.id === old.id)!.ibanEnc).toBeNull();
    expect(after.find((c) => c.id === fresh.id)!.ibanEnc).toBeTruthy();
  });

  it("zählt bei eingelösten Karten ab der Einlösung, nicht ab dem Kauf", async () => {
    const r = await createOrder({ ...base, digitalConsent: true, shipping: null, items: [mailItem] });
    const paid = (await markPaid(r!.order.id))!;
    const card = paid.cards[0];
    await redeemCard({ code: card.code, parentName: "Anna Muster", parentEmail: "anna@example.at", iban: IBAN, consent: true });
    await setCreatedAt("cards", { id: card.id }, new Date(Date.now() - 200 * 864e5));
    await purgeOldIbans();
    expect((await getOrder(r!.order.id))!.cards[0].ibanEnc).toBeTruthy();
    // 91 Tage nach der Einlösung ist sie weg
    await purgeOldIbans(new Date(Date.now() + 91 * 864e5));
    expect((await getOrder(r!.order.id))!.cards[0].ibanEnc).toBeNull();
  });

  it("löscht Wunschseiten 12 Monate nach dem Anlegen", async () => {
    const wish = { childName: "Paul", parentName: "Max Huber", parentEmail: "max@example.at", message: "", occasion: "geburt" as const, iban: IBAN, consent: true as const };
    const old = await createWishPage(wish);
    const fresh = await createWishPage(wish);
    const elevenMonths = new Date();
    elevenMonths.setMonth(elevenMonths.getMonth() - 11);
    const thirteenMonths = new Date();
    thirteenMonths.setMonth(thirteenMonths.getMonth() - 13);
    await setCreatedAt("wishPages", { slug: old.slug }, thirteenMonths);
    await setCreatedAt("wishPages", { slug: fresh.slug }, elevenMonths);
    expect(await purgeOldWishPages()).toBe(1);
    expect(await getWishPage(old.slug)).toBeNull();
    expect(await getWishPage(fresh.slug)).not.toBeNull();
  });

  it("Wunschseiten-Mail nennt die Löschfrist", () => {
    expect(wishPageCreated("paul-ab12", "Paul", "tok").html).toContain("nach 12 Monaten automatisch gelöscht");
  });
});

describe("IBAN-Längen", () => {
  it("sind exportiert und passen zu gültigen Beispiel-IBANs", () => {
    expect(IBAN_LENGTHS.AT).toBe(20);
    expect(IBAN_LENGTHS.DE).toBe(22);
    expect(isValidIban("DE89 3704 0044 0532 0130 00")).toBe(true);
  });
});

describe("IBAN-Eingabehilfe", async () => {
  const { ibanError } = await import("../src/components/eltern/IbanField");
  it("nutzt die Längen aus lib/iban, auch für Länder außerhalb der DACH-Region", () => {
    expect(ibanError("SI56 2633 0001 2039 086", true)).toBeNull();
    expect(ibanError("SI56 2633 0001 2039 08", true)).toMatch(/slowenische IBAN hat 19 Zeichen/);
    expect(ibanError("AT61 1904 3002 3457 3201 9", false)).toMatch(/österreichische IBAN hat 20 Zeichen/);
  });
  it("spricht Schenkende mit du an", () => {
    expect(ibanError("", true, "schenkende")).toBe("Bitte gib die IBAN der Eltern ein.");
    expect(ibanError("AT61 1904 3002 3457 3202", true, "schenkende")).toMatch(/vergleich sie/);
    expect(ibanError("", true)).toMatch(/gebt eure IBAN/);
  });
});
