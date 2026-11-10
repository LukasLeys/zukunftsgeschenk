import { describe, it, expect } from "vitest";
import { createOrder } from "../src/lib/shop";
import { checkoutIdempotencyKey, checkoutSessionParams, CHECKOUT_TTL_MINUTES } from "../src/lib/stripe";

describe("Stripe Checkout", () => {
  it("überlässt Stripe die Zahlungsarten und setzt Sprache, E-Mail, Bestellnummer und Ablaufzeit", async () => {
    const r = (await createOrder({
      buyerName: "Gerti Muster", buyerEmail: "oma@example.at", acceptTerms: true, digitalConsent: true, shipping: null,
      items: [{ motif: "konfetti", paper: "pink", format: "mail", amount: 80, childName: "Mia", message: "", sender: "Oma Gerti" }],
    }))!;
    const now = new Date("2026-11-10T10:00:00Z");
    const p = checkoutSessionParams(r.order, r.cards, now);
    expect(p).not.toHaveProperty("payment_method_types");
    expect(p.mode).toBe("payment");
    expect(p.locale).toBe("de");
    expect(p.customer_email).toBe("oma@example.at");
    expect(p.metadata).toEqual({ orderId: r.order.id });
    expect(p.payment_intent_data?.metadata).toEqual({ orderId: r.order.id });
    expect(p.client_reference_id).toBe(r.order.id);
    expect(p.cancel_url).toMatch(/\/kasse\?abbruch=1$/);
    expect(p.success_url).toContain(`/bestellung/${r.order.id}?t=${r.order.accessToken}&paid=1`);
    expect(p.expires_at).toBe(Math.floor(now.getTime() / 1000) + CHECKOUT_TTL_MINUTES * 60);
    expect(CHECKOUT_TTL_MINUTES).toBeGreaterThanOrEqual(30);
    expect(p.line_items).toHaveLength(1);
    expect(p.line_items![0].price_data!.unit_amount).toBe(490);
    expect(p.line_items![0].price_data!.tax_behavior).toBe("inclusive");
    expect(checkoutIdempotencyKey(r.order.id)).toContain(r.order.id);
  });
});
