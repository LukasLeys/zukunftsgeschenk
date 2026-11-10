import "server-only";
import Stripe from "stripe";
import { SITE_URL } from "./env";
import { formatById, motifById } from "./catalog";
import type { Card, Order } from "./db/schema";

/** Fest eingestellte API-Version, damit ein Update der Bibliothek das Verhalten nicht still ändert. */
export const STRIPE_API_VERSION = "2025-08-27.basil" as const;

/** So lange bleibt eine Checkout-Sitzung offen. Stripe erlaubt 30 Minuten bis 24 Stunden. */
export const CHECKOUT_TTL_MINUTES = 60;

let client: Stripe | null = null;
/** Stripe-Client oder null im Demo-Modus (ohne STRIPE_SECRET_KEY). */
export function stripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION, maxNetworkRetries: 2, timeout: 20_000 });
  return client;
}

/** Link zur Bestellseite mit Zugriffsschlüssel. */
export const orderUrl = (order: Pick<Order, "id" | "accessToken">) => `${SITE_URL}/bestellung/${order.id}?t=${order.accessToken}`;

/** Idempotenzschlüssel: Ein doppelter Aufruf für dieselbe Bestellung legt keine zweite Sitzung an. */
export const checkoutIdempotencyKey = (orderId: string) => `checkout-session-${orderId}`;

/**
 * Parameter für Stripe Checkout. Wir legen keine Zahlungsarten fest. Stripe zeigt, was im Dashboard aktiv ist
 * (Karte, EPS, Apple Pay, Google Pay und weitere), passend zu Gerät und Land.
 */
export function checkoutSessionParams(order: Order, cards: Card[], now = new Date()): Stripe.Checkout.SessionCreateParams {
  return {
    mode: "payment",
    locale: "de",
    currency: "eur",
    customer_email: order.buyerEmail,
    client_reference_id: order.id,
    submit_type: "pay",
    line_items: cards.map((c) => ({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: c.priceCents,
        tax_behavior: "inclusive",
        product_data: {
          name: `Geschenkkarte „${motifById(c.motif)?.name ?? c.motif}“, ${formatById(c.format)?.short ?? c.format}`,
          description: `Für ${c.childName}. Der Geschenkbetrag ist nicht enthalten und geht direkt an die Eltern.`,
        },
      },
    })),
    metadata: { orderId: order.id },
    payment_intent_data: {
      metadata: { orderId: order.id },
      description: `Zukunftsgeschenk, Bestellung ${order.id}`,
    },
    success_url: `${orderUrl(order)}&paid=1`,
    cancel_url: `${SITE_URL}/kasse?abbruch=1`,
    expires_at: Math.floor(now.getTime() / 1000) + CHECKOUT_TTL_MINUTES * 60,
  };
}
