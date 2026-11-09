import { NextResponse } from "next/server";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { fail, guard } from "@/components/admin/server";

/** Bestellung stornieren: Status „cancelled“, geplante (ungesendete) Mails zu ihren Karten löschen. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = guard(req);
  if (blocked) return blocked;
  const { id } = await params;
  const d = await db();
  const [order] = await d.select().from(schema.orders).where(eq(schema.orders.id, id));
  if (!order) return fail("Bestellung nicht gefunden", 404);
  if (order.status === "cancelled") return NextResponse.json({ message: "War bereits storniert" });
  const cards = await d.select().from(schema.cards).where(eq(schema.cards.orderId, id));
  await d.update(schema.orders).set({ status: "cancelled" }).where(eq(schema.orders.id, id));
  const needles = [`/bestellung/${order.id}`, ...cards.map((c) => c.code), ...cards.filter((c) => c.payToken).map((c) => `/ueberweisen/${c.payToken}`)];
  const removed = await d
    .delete(schema.outbox)
    .where(and(isNull(schema.outbox.sentAt), or(...needles.map((n) => sql`position(${n} in ${schema.outbox.html}) > 0`))))
    .returning({ id: schema.outbox.id });
  console.info(`[admin] Bestellung ${order.invoiceNumber ?? order.id} storniert, ${removed.length} geplante Mails gelöscht`);
  return NextResponse.json({
    message: removed.length ? `Storniert. ${removed.length} geplante Mail(s) gelöscht.` : "Storniert.",
    removedMails: removed.length,
  });
}
