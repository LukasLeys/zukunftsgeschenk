import "server-only";
import { lte, isNull, and, eq } from "drizzle-orm";
import { db, schema } from "./db";
import { newId } from "./codes";
import { MAIL_FROM, isDemoMail } from "./env";

export interface Mail { to: string; subject: string; html: string; text: string; sendAt?: Date }

/** Legt jede Mail im Postausgang ab. Fällige Mails werden sofort zugestellt (Resend), geplante per Cron. */
export async function queueMail(m: Mail) {
  const d = await db();
  const id = newId();
  const sendAt = m.sendAt ?? new Date();
  await d.insert(schema.outbox).values({ id, to: m.to, subject: m.subject, html: m.html, text: m.text, sendAt });
  if (sendAt <= new Date()) await deliver(id);
  return id;
}

async function deliver(id: string) {
  const d = await db();
  const [m] = await d.select().from(schema.outbox).where(and(eq(schema.outbox.id, id), isNull(schema.outbox.sentAt)));
  if (!m) return;
  if (isDemoMail()) {
    console.info(`[mail:demo] an ${m.to}: ${m.subject}`);
  } else {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: MAIL_FROM, to: [m.to], subject: m.subject, html: m.html, text: m.text }),
    });
    if (!res.ok) {
      console.error("[mail] Versand fehlgeschlagen", res.status, await res.text());
      return;
    }
  }
  await d.update(schema.outbox).set({ sentAt: new Date() }).where(eq(schema.outbox.id, id));
}

/** Für den Cron-Endpunkt: alle fälligen, noch nicht gesendeten Mails zustellen. */
export async function deliverDue() {
  const d = await db();
  const due = await d.select({ id: schema.outbox.id }).from(schema.outbox).where(and(isNull(schema.outbox.sentAt), lte(schema.outbox.sendAt, new Date())));
  for (const m of due) await deliver(m.id);
  return due.length;
}
