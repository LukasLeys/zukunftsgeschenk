import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { fail, guard } from "@/components/admin/server";

const bodySchema = z.object({ ids: z.array(z.string().min(1)).min(1).max(500), undo: z.boolean().optional() });

/** Gedruckte Karten als versendet markieren (oder die Markierung zurücknehmen). */
export async function POST(req: Request) {
  const blocked = guard(req);
  if (blocked) return blocked;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Bitte mindestens eine Karte auswählen");
  const { ids, undo } = parsed.data;
  const d = await db();
  const rows = await d
    .select({ id: schema.cards.id, format: schema.cards.format, status: schema.orders.status })
    .from(schema.cards)
    .innerJoin(schema.orders, eq(schema.orders.id, schema.cards.orderId))
    .where(inArray(schema.cards.id, ids));
  const ok = rows.filter((r) => r.format !== "mail" && r.status === "paid").map((r) => r.id);
  if (!ok.length) return fail("Keine passende gedruckte Karte gefunden", 404);
  await d
    .update(schema.cards)
    .set({ shippedAt: undo ? null : new Date() })
    .where(and(inArray(schema.cards.id, ok)));
  const n = ok.length;
  return NextResponse.json({
    message: undo ? `${n} ${n === 1 ? "Karte" : "Karten"} wieder offen` : `${n} ${n === 1 ? "Karte" : "Karten"} als versendet markiert`,
    updated: n,
    skipped: ids.length - n,
  });
}
