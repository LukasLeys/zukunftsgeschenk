import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { queueMail } from "@/lib/mail";
import * as T from "@/lib/emails";
import { fail, guard } from "@/components/admin/server";

const bodySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("confirmation") }),
  z.object({ type: z.literal("card"), cardId: z.string().min(1) }),
  z.object({ type: z.literal("payment"), cardId: z.string().min(1) }),
]);

/**
 * Mails erneut senden, frisch aus den Vorlagen:
 * confirmation = Bestellbestätigung an Käufer:in, card = E-Mail-Karte an Empfänger:in,
 * payment = Link zum Bank-QR-Code an Käufer:in (nur eingelöste Karten).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = guard(req);
  if (blocked) return blocked;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Unbekannte Aktion");
  const { id } = await params;
  const d = await db();
  const [order] = await d.select().from(schema.orders).where(eq(schema.orders.id, id));
  if (!order) return fail("Bestellung nicht gefunden", 404);
  if (order.status !== "paid") return fail("Nur bei bezahlten Bestellungen möglich");
  const cards = await d.select().from(schema.cards).where(eq(schema.cards.orderId, id));
  const b = parsed.data;

  if (b.type === "confirmation") {
    await queueMail({ to: order.buyerEmail, ...T.orderConfirmation(order, cards) });
    return NextResponse.json({ message: `Bestätigung an ${order.buyerEmail} gesendet` });
  }
  const card = cards.find((c) => c.id === b.cardId);
  if (!card) return fail("Karte gehört nicht zu dieser Bestellung", 404);
  if (b.type === "card") {
    if (card.format !== "mail" || !card.recipientEmail) return fail("Diese Karte hat keine E-Mail-Zustellung");
    await queueMail({ to: card.recipientEmail, ...T.cardDelivery(card) });
    return NextResponse.json({ message: `Karte an ${card.recipientEmail} gesendet` });
  }
  if (card.status !== "redeemed" || !card.payToken || !card.ibanEnc) return fail("Nur für eingelöste Karten mit hinterlegter IBAN");
  await queueMail({ to: order.buyerEmail, ...T.redeemedToGiver(card, order.buyerName) });
  return NextResponse.json({ message: `Bank-QR-Link an ${order.buyerEmail} gesendet` });
}
