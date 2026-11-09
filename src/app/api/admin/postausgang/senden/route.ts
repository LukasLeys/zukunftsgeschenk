import { NextResponse } from "next/server";
import { and, isNull, lte, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { deliverDue } from "@/lib/mail";
import { guard } from "@/components/admin/server";

/** Alle fälligen, noch nicht gesendeten Mails jetzt zustellen (wie der Cron-Endpunkt). */
export async function POST(req: Request) {
  const blocked = guard(req);
  if (blocked) return blocked;
  const due = await deliverDue();
  const d = await db();
  const [left] = await d
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.outbox)
    .where(and(isNull(schema.outbox.sentAt), lte(schema.outbox.sendAt, new Date())));
  const failed = Math.min(due, Number(left?.n ?? 0));
  const sent = due - failed;
  const word = (n: number) => (n === 1 ? "Mail" : "Mails");
  const message = !due ? "Nichts fällig" : failed ? `${sent} ${word(sent)} zugestellt, ${failed} fehlgeschlagen (siehe Server-Log)` : `${sent} ${word(sent)} zugestellt`;
  return NextResponse.json({ message, sent, failed }, { status: failed && !sent ? 502 : 200 });
}
