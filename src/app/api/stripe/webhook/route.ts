import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { markPaid } from "@/lib/shop";

export async function POST(req: Request) {
  const s = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s || !secret) return NextResponse.json({ error: "Stripe nicht konfiguriert" }, { status: 501 });
  const sig = req.headers.get("stripe-signature") ?? "";
  let event;
  try {
    event = s.webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return NextResponse.json({ error: "Signatur ungültig" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    if (session.payment_status === "paid" && session.metadata?.orderId) await markPaid(session.metadata.orderId, session.id);
  }
  return NextResponse.json({ received: true });
}
