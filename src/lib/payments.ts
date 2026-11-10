import "server-only";
import type Stripe from "stripe";
import { getOrder, markExpired, markPaid, markPaymentFailed, markProcessing, markRefunded, orderIdByPaymentIntent } from "./shop";

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : (v?.id ?? null));

/** Bestellnummer aus einer Checkout-Sitzung. */
const orderIdOf = (s: Stripe.Checkout.Session) => s.metadata?.orderId || s.client_reference_id || null;

/**
 * Wendet den Stand einer Checkout-Sitzung auf die Bestellung an. Wird vom Webhook und von der Bestellseite
 * (Rückkehr von Stripe) genutzt. Mehrfache Aufrufe sind unschädlich.
 */
export async function applyCheckoutSession(session: Stripe.Checkout.Session, opts: { deferMail?: boolean } = {}) {
  const orderId = orderIdOf(session);
  if (!orderId) return "ohne Bestellnummer";
  const res = await getOrder(orderId);
  if (!res) return "Bestellung unbekannt";
  const ref = { stripeSessionId: session.id, paymentIntentId: idOf(session.payment_intent), deferMail: opts.deferMail };
  if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
    if (session.currency !== "eur" || session.amount_total !== res.order.totalCents) {
      console.error(`[stripe] Betrag passt nicht zur Bestellung ${orderId}: ${session.amount_total} ${session.currency}, erwartet ${res.order.totalCents} eur`);
      return "Betrag passt nicht";
    }
    const after = await markPaid(orderId, ref);
    return after?.order.status === "paid" ? "bezahlt" : `Status bleibt ${after?.order.status}`;
  }
  if (session.status === "complete") {
    await markProcessing(orderId, ref);
    return "in Bearbeitung";
  }
  return "offen";
}

/** Verarbeitet ein bereits geprüftes Stripe-Ereignis. Gibt eine kurze Beschreibung für das Protokoll zurück. */
export async function handleStripeEvent(event: Stripe.Event, opts: { deferMail?: boolean } = {}): Promise<string> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      return applyCheckoutSession(event.data.object, opts);
    case "checkout.session.async_payment_failed": {
      const orderId = orderIdOf(event.data.object);
      if (!orderId) return "ohne Bestellnummer";
      await markPaymentFailed(orderId, { deferMail: opts.deferMail });
      return "Zahlung gescheitert";
    }
    case "checkout.session.expired": {
      const orderId = orderIdOf(event.data.object);
      if (!orderId) return "ohne Bestellnummer";
      await markExpired(orderId);
      return "abgelaufen";
    }
    case "charge.refunded": {
      const charge = event.data.object;
      const pi = idOf(charge.payment_intent);
      const orderId = charge.metadata?.orderId || (pi ? await orderIdByPaymentIntent(pi) : null);
      if (!orderId) return "Erstattung ohne Bestellung";
      if (!charge.refunded) {
        console.warn(`[stripe] Teilerstattung für Bestellung ${orderId}: ${charge.amount_refunded} von ${charge.amount} Cent. Karten bleiben gültig.`);
        return "Teilerstattung";
      }
      await markRefunded(orderId);
      return "erstattet";
    }
    default:
      return "ignoriert";
  }
}
