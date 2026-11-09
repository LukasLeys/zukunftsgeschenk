import Link from "next/link";
import { and, asc, desc, eq, gt, isNotNull, isNull, lte } from "drizzle-orm";
import s from "@/components/admin/admin.module.css";
import { ActionButton } from "@/components/admin/ActionButton";
import { Badge, EmptyRow, PageHead, Seg } from "@/components/admin/ui";
import { outboxStats } from "@/components/admin/queries";
import { fmtDateTime, fmtShort } from "@/components/admin/server";
import { db, schema } from "@/lib/db";
import { isDemoMail } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata = { title: "Postausgang" };

const VIEWS = [
  { id: "faellig", label: "Fällig" },
  { id: "geplant", label: "Geplant" },
  { id: "offen", label: "Alle offenen" },
  { id: "gesendet", label: "Gesendet" },
] as const;
type View = (typeof VIEWS)[number]["id"];
const LIMIT = 200;

export default async function OutboxPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const view: View = VIEWS.find((v) => v.id === sp.ansicht)?.id ?? "offen";
  const previewId = typeof sp.vorschau === "string" ? sp.vorschau : "";
  const { outbox } = schema;
  const d = await db();
  const now = new Date();
  const where =
    view === "gesendet" ? isNotNull(outbox.sentAt)
    : view === "faellig" ? and(isNull(outbox.sentAt), lte(outbox.sendAt, now))
    : view === "geplant" ? and(isNull(outbox.sentAt), gt(outbox.sendAt, now))
    : isNull(outbox.sentAt);
  const [list, stats, previewRows] = await Promise.all([
    d
      .select({ id: outbox.id, to: outbox.to, subject: outbox.subject, sendAt: outbox.sendAt, sentAt: outbox.sentAt })
      .from(outbox)
      .where(where)
      .orderBy(view === "gesendet" ? desc(outbox.sentAt) : asc(outbox.sendAt))
      .limit(LIMIT),
    outboxStats(),
    previewId ? d.select().from(outbox).where(eq(outbox.id, previewId)) : Promise.resolve([]),
  ]);
  const preview = previewRows[0];
  const counts: Record<View, number> = { faellig: stats.due, geplant: stats.planned, offen: stats.due + stats.planned, gesendet: stats.sent };
  const href = (v: View, id?: string) => `/admin/postausgang?ansicht=${v}${id ? `&vorschau=${id}` : ""}`;

  return (
    <>
      <PageHead
        title="Postausgang"
        sub={
          isDemoMail()
            ? "Demo-Versand aktiv. Mails werden nur protokolliert und hier abgelegt. Es geht nichts wirklich hinaus."
            : "Fällige Mails gehen sofort hinaus, geplante per Cron. Hier lassen sich fällige auch von Hand senden."
        }
      >
        <ActionButton
          url="/api/admin/postausgang/senden"
          label={stats.due ? `Fällige jetzt senden (${stats.due})` : "Fällige jetzt senden"}
          pendingLabel="Sendet …"
          variant="primary"
          disabled={!stats.due}
          title={stats.due ? undefined : "Keine fälligen Mails"}
        />
      </PageHead>

      <div className={s.toolbar}>
        <Seg label="Ansicht" items={VIEWS.map((v) => ({ href: href(v.id), label: v.label, count: counts[v.id], active: view === v.id }))} />
        <span className={s.meta} style={{ marginLeft: "auto" }}>
          {stats.next ? `Nächste geplante Mail: ${fmtDateTime(stats.next)}` : "Keine geplanten Mails"}
        </span>
      </div>

      <div className={s.outbox}>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr>
                <th scope="col">{view === "gesendet" ? "Gesendet" : "Geplant für"}</th>
                <th scope="col">Status</th>
                <th scope="col">An</th>
                <th scope="col">Betreff</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && <EmptyRow cols={4}>{view === "gesendet" ? "Noch nichts gesendet." : "Nichts offen."}</EmptyRow>}
              {list.map((m) => {
                const due = !m.sentAt && m.sendAt <= now;
                return (
                  <tr key={m.id} data-selected={m.id === previewId ? "true" : undefined}>
                    <td className={s.nowrap}>{fmtShort(m.sentAt ?? m.sendAt)}</td>
                    <td>{m.sentAt ? <Badge tone="ok">gesendet</Badge> : due ? <Badge tone="warn">fällig</Badge> : <Badge tone="plain">geplant</Badge>}</td>
                    <td className={s.clip} style={{ maxWidth: 200 }} title={m.to}>{m.to}</td>
                    <td>
                      <Link className={s.rowLink} href={href(view, m.id)} scroll={false} aria-current={m.id === previewId ? "true" : undefined}>
                        {m.subject}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside className={`${s.panel} ${s.preview}`} aria-label="Vorschau">
          {preview ? (
            <>
              <div className={s.previewHead}>
                <h2>{preview.subject}</h2>
                <p className={s.meta}>
                  An {preview.to}.{" "}
                  {preview.sentAt ? `Gesendet ${fmtDateTime(preview.sentAt)}.` : `Geplant für ${fmtDateTime(preview.sendAt)}.`} Angelegt {fmtDateTime(preview.createdAt)}.
                </p>
              </div>
              <iframe className={s.previewFrame} title={`Vorschau: ${preview.subject}`} srcDoc={preview.html} sandbox="" referrerPolicy="no-referrer" loading="lazy" />
              <details>
                <summary className={s.meta} style={{ padding: "8px 16px", cursor: "pointer" }}>Textfassung</summary>
                <pre className={s.plainText}>{preview.text}</pre>
              </details>
            </>
          ) : (
            <p className={s.previewEmpty}>{previewId ? "Diese Mail gibt es nicht mehr." : "Betreff anklicken, um die Mail hier anzusehen."}</p>
          )}
        </aside>
      </div>
    </>
  );
}
