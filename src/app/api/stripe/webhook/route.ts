import { NextResponse, after } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { handleStripeEvent } from "@/lib/payments";
import { deliverDue } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Mails erst nach der Antwort an Stripe zustellen. Ohne Request-Kontext (Tests) sofort. */
function deliverLater() {
  const run = () => deliverDue().catch((e) => console.error("[stripe] Mailversand nach Webhook fehlgeschlagen", e));
  try {
    after(run);
  } catch {
    return run();
  }
}

/**
 * Stripe-Webhook. Prüft die Signatur, verbucht den Zahlungsstand und antwortet schnell.
 * Mails gehen danach raus. Scheitert die Verbuchung, antworten wir mit 500, damit Stripe es erneut versucht.
 */
export async function POST(req: Request) {
  const s = stripe();
  if (!s) return NextResponse.json({ error: "Stripe ist nicht eingerichtet." }, { status: 501 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[stripe] STRIPE_WEBHOOK_SECRET fehlt. Webhooks werden abgelehnt.");
    return NextResponse.json({ error: "Webhook-Geheimnis fehlt." }, { status: 500 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Signatur fehlt." }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return NextResponse.json({ error: "Signatur ungültig." }, { status: 400 });
  }
  try {
    const result = await handleStripeEvent(event, { deferMail: true });
    console.info(`[stripe] ${event.type} ${event.id}: ${result}`);
  } catch (e) {
    console.error(`[stripe] ${event.type} ${event.id} nicht verarbeitet`, e);
    return NextResponse.json({ error: "Verarbeitung fehlgeschlagen." }, { status: 500 });
  }
  await deliverLater();
  return NextResponse.json({ received: true });
}
