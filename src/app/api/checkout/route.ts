import { NextResponse } from "next/server";
import { createOrder, markPaid } from "@/lib/shop";
import { stripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/env";
import { motifById, formatById } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { errorResponse } from "@/lib/http";

/** Legt die Bestellung an. Mit Stripe-Schlüssel: Weiterleitung zu Stripe Checkout. Ohne: Demo-Zahlung. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await createOrder(body);
    if (!res) throw new Error("Bestellung konnte nicht angelegt werden");
    const { order, cards } = res;
    const done = `${SITE_URL}/bestellung/${order.id}?t=${order.accessToken}`;
    const s = stripe();
    if (!s) {
      await markPaid(order.id);
      return NextResponse.json({ url: `${done}&demo=1`, demo: true });
    }
    const session = await s.checkout.sessions.create({
      mode: "payment",
      locale: "de",
      customer_email: order.buyerEmail,
      line_items: cards.map((c) => ({
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: c.priceCents,
          tax_behavior: "inclusive",
          product_data: {
            name: `Geschenkkarte „${motifById(c.motif)?.name ?? c.motif}“ – ${formatById(c.format)?.short}`,
            description: `Für ${c.childName}. Der Geschenkbetrag ist nicht enthalten und geht direkt an die Eltern.`,
          },
        },
      })),
      metadata: { orderId: order.id },
      success_url: `${done}&paid=1`,
      cancel_url: `${SITE_URL}/kasse?abbruch=1`,
    });
    const d = await db();
    await d.update(schema.orders).set({ stripeSessionId: session.id }).where(eq(schema.orders.id, order.id));
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return errorResponse(e);
  }
}
