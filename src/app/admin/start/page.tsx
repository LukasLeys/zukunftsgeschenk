import s from "@/components/admin/admin.module.css";
import { Badge, PageHead, SectionHead } from "@/components/admin/ui";
import { readiness, readinessSummary, type CheckState } from "@/components/admin/readiness";
import type { Tone } from "@/components/admin/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Startbereitschaft" };

const TONE: Record<CheckState, Tone> = { ok: "ok", bad: "bad", warn: "warn" };

export default function AdminStart() {
  const groups = readiness();
  const sum = readinessSummary();
  const dev = process.env.NODE_ENV !== "production";
  return (
    <>
      <PageHead
        title="Startbereitschaft"
        sub={`${sum.ok} von ${sum.total} Punkten erledigt. ${sum.bad ? `${sum.bad} fehlen noch für den Start.` : "Nichts blockiert den Start."}${sum.warn ? ` ${sum.warn} Hinweise.` : ""}`}
      />
      {dev && (
        <p className={`${s.note} ${s.noteWarn}`} style={{ marginBottom: 18 }}>
          Lokaler Entwicklungsmodus. Hier gelten Ersatzwerte, die im Produktivbetrieb fehlen. Maßgeblich ist diese Seite auf Vercel.
        </p>
      )}
      <p className={s.meta} style={{ marginBottom: 18 }}>
        Werte werden in Vercel unter Settings, Environment Variables eingetragen. Diese Seite zeigt nur, ob etwas gesetzt ist, nie den Wert.
        Nach einer Änderung braucht es ein neues Deployment.
      </p>
      {groups.map((g, gi) => (
        <section key={g.title} className={s.section} aria-labelledby={`g-${gi}`} style={gi === 0 ? { marginTop: 0 } : undefined}>
          <SectionHead title={<span id={`g-${gi}`}>{g.title}</span>} />
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead>
                <tr>
                  <th scope="col">Punkt</th>
                  <th scope="col" className={s.r}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {g.checks.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <b>{c.label}</b> <span className={`${s.code} ${s.meta}`}>{c.env}</span>
                      <span className={s.sub}>{c.hint}</span>
                    </td>
                    <td className={`${s.r} ${s.nowrap}`} style={{ width: "1%" }}>
                      <Badge tone={TONE[c.state]}>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
