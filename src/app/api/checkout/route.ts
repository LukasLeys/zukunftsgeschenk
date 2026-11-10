import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createOrder, markPaid } from "@/lib/shop";
import { checkoutIdempotencyKey, checkoutSessionParams, orderUrl, stripe } from "@/lib/stripe";
import { db, schema } from "@/lib/db";
import { errorResponse } from "@/lib/http";
import { LIMITS, rateLimit } from "@/lib/ratelimit";

/** Legt die Bestellung an. Mit Stripe-Schlüssel: Weiterleitung zu Stripe Checkout. Ohne: Demo-Zahlung. */
export async function POST(req: Request) {
  try {
    rateLimit(req, LIMITS.checkout);
    const body = await req.json();
    const res = await createOrder(body);
    if (!res) throw new Error("createOrder lieferte keine Bestellung");
    const { order, cards } = res;
    const s = stripe();
    if (!s) {
      await markPaid(order.id);
      return NextResponse.json({ url: `${orderUrl(order)}&demo=1`, demo: true });
    }
    const session = await s.checkout.sessions.create(checkoutSessionParams(order, cards), {
      idempotencyKey: checkoutIdempotencyKey(order.id),
    });
    if (!session.url) throw new Error("Stripe lieferte keine Checkout-Adresse");
    const d = await db();
    await d.update(schema.orders).set({ stripeSessionId: session.id }).where(eq(schema.orders.id, order.id));
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return errorResponse(e);
  }
}
