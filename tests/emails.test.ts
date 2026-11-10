import { describe, it, expect, vi, afterEach } from "vitest";
import { createOrder, markPaid, redeemCard } from "../src/lib/shop";
import * as T from "../src/lib/emails";
import { queueMail } from "../src/lib/mail";

const DASH = new RegExp("[\\u2013\\u2014]");

async function sample() {
  const r = await createOrder({
    buyerName: "Gerti Muster", buyerEmail: "oma@example.at", acceptTerms: true, digitalConsent: true,
    shipping: { name: "Gerti Muster", street: "Hauptstraße 1", zip: "1010", city: "Wien", country: "AT" },
    items: [
      { motif: "sterne", paper: "pink", format: "print", amount: 100, childName: "Lena", message: "Alles Liebe", sender: "Oma Gerti" },
      { motif: "konfetti", paper: "tinte", format: "mail", amount: 50, childName: "Lena", message: "", sender: "Oma Gerti", recipientEmail: "eltern@example.at" },
    ],
  });
  const paid = (await markPaid(r!.order.id))!;
  const card = paid.cards.find((c) => c.format === "print")!;
  const red = await redeemCard({ code: card.code, parentName: "Anna Muster", parentEmail: "anna@example.at", iban: "AT61 1904 3002 3457 3201", consent: true });
  return { ...paid, red };
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.RESEND_API_KEY;
  delete process.env.MAIL_REPLY_TO;
  delete process.env.COMPANY_UID;
});

describe("E-Mails", () => {
  it("haben alle einen Textteil, eine Fußzeile mit Firmendaten und keine Gedankenstriche", async () => {
    const { order, cards, red } = await sample();
    const all = [
      T.orderConfirmation(order, cards), T.cardDelivery(cards[1]), T.redeemedToGiver(red, order.buyerName), T.redeemedToParent(red),
      T.transferredToParent(red), T.transferReminder(red), T.wishPageCreated("lena-ab12", "Lena", "tok123"), T.paymentFailed(order),
    ];
    for (const m of all) {
      expect(m.subject.length).toBeGreaterThan(5);
      expect(m.text.length).toBeGreaterThan(80);
      expect(m.text).not.toMatch(/<[a-z]/i);
      expect(m.html).toContain("[UID-Nummer]");
      expect(m.text).toContain("[UID-Nummer]");
      expect(m.text).toContain("/impressum");
      for (const s of [m.subject, m.html, m.text]) expect(s).not.toMatch(DASH);
    }
  });

  it("nimmt Firmendaten aus der Umgebung", async () => {
    process.env.COMPANY_UID = "ATU12345678";
    const m = T.paymentFailed((await sample()).order);
    expect(m.html).toContain("UID ATU12345678");
    expect(m.html).not.toContain("[UID-Nummer]");
  });

  it("Bestellbestätigung: du-Ansprache, Rechnungslink und alle Links auch im Text", async () => {
    const { order, cards } = await sample();
    const m = T.orderConfirmation(order, cards);
    expect(m.subject).toContain(order.invoiceNumber!);
    expect(m.html).toContain("deine Karten sind bestellt");
    expect(m.html).not.toMatch(/\beure Karten\b/);
    expect(m.text).toContain(`/api/bestellung/${order.id}/rechnung?t=${order.accessToken}`);
    expect(m.text).toContain(`/bestellung/${order.id}?t=${order.accessToken}`);
    expect(m.text).toContain("Rücktrittsrecht");
  });

  it("Karten-Mail an die Eltern nennt Code und Einlöse-Link im Text", async () => {
    const { cards } = await sample();
    const m = T.cardDelivery(cards[1]);
    expect(m.text).toContain(cards[1].code);
    expect(m.text).toContain("/einloesen?code=");
  });

  it("Wunschseiten-Mail enthält den Bearbeiten-Link auch im Text", () => {
    expect(T.wishPageCreated("lena-ab12", "Lena", "tok123").text).toContain("/fuer/lena-ab12/bearbeiten?t=tok123");
  });

  it("schickt über Resend mit Absender, Antwortadresse und Textteil", async () => {
    process.env.RESEND_API_KEY = "re_test_dummy";
    process.env.MAIL_REPLY_TO = "hilfe@example.at";
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await queueMail({ to: "x@example.at", subject: "Test", html: "<p>Hallo</p>", text: "Hallo" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body.reply_to).toBe("hilfe@example.at");
    expect(body.text).toBe("Hallo");
    expect(body.from).toContain("@");
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toMatch(/^outbox-/);
  });

  it("legt Mails ohne Resend-Schlüssel nur in den Postausgang (Demo)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await queueMail({ to: "x@example.at", subject: "Test", html: "<p>Hallo</p>", text: "Hallo" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
