import "server-only";
import { lte, isNull, and, eq } from "drizzle-orm";
import { db, schema } from "./db";
import { newId } from "./codes";
import { isDemoMail, mailFrom, mailReplyTo } from "./env";

export interface Mail { to: string; subject: string; html: string; text: string; sendAt?: Date }

/**
 * Legt jede Mail im Postausgang ab. Fällige Mails werden sofort zugestellt (Resend), geplante per Cron.
 * Mit `defer` bleibt auch eine fällige Mail liegen, bis `deliverDue` läuft (zum Beispiel nach der Antwort an Stripe).
 */
export async function queueMail(m: Mail, opts: { defer?: boolean } = {}) {
  const d = await db();
  const id = newId();
  const sendAt = m.sendAt ?? new Date();
  await d.insert(schema.outbox).values({ id, to: m.to, subject: m.subject, html: m.html, text: m.text, sendAt });
  if (!opts.defer && sendAt <= new Date()) await deliver(id);
  return id;
}

async function deliver(id: string) {
  const d = await db();
  const [m] = await d.select().from(schema.outbox).where(and(eq(schema.outbox.id, id), isNull(schema.outbox.sentAt)));
  if (!m) return;
  if (isDemoMail()) {
    console.info(`[mail:demo] an ${m.to}: ${m.subject}`);
  } else {
    const replyTo = mailReplyTo();
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          // Gleiche Mail nie doppelt, auch wenn Cron und Webhook gleichzeitig zustellen.
          "Idempotency-Key": `outbox-${m.id}`,
        },
        body: JSON.stringify({ from: mailFrom(), to: [m.to], subject: m.subject, html: m.html, text: m.text, ...(replyTo ? { reply_to: replyTo } : {}) }),
      });
      if (!res.ok) {
        console.error("[mail] Versand fehlgeschlagen", res.status, await res.text());
        return;
      }
    } catch (e) {
      // Bleibt im Postausgang und geht mit dem nächsten Cron-Lauf raus.
      console.error("[mail] Versand fehlgeschlagen", e);
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
