import Link from "next/link";
import type { ReactNode } from "react";
import s from "@/components/admin/admin.module.css";
import { PageHead, SectionHead } from "@/components/admin/ui";
import { cardFlow, outboxStats, printJobs, recentActivity, totals } from "@/components/admin/queries";
import { daysSince, fmtDateTime, fmtShort, pct, startOfToday, vatOf } from "@/components/admin/server";
import { eurCents } from "@/components/format";
import { readinessSummary } from "@/components/admin/readiness";

export const dynamic = "force-dynamic";
export const metadata = { title: "Übersicht" };

export default async function AdminOverview() {
  const today = startOfToday();
  const [t, all, flow, jobs, mail, feed] = await Promise.all([totals(today), totals(), cardFlow(today), printJobs(), outboxStats(), recentActivity(14)]);
  const oldest = jobs[0]?.order.paidAt ?? null;
  const premium = jobs.filter((j) => j.format === "premium").length;
  const ready = readinessSummary();

  const row = (label: string, a: ReactNode, b: ReactNode, cls?: string) => (
    <tr className={cls}>
      <td>{label}</td>
      <td className={s.r}>{a}</td>
      <td className={s.r}>{b}</td>
    </tr>
  );

  return (
    <>
      <PageHead title="Übersicht" sub={`Stand ${fmtDateTime(new Date())}. „Heute“ zählt ab 0 Uhr Wiener Zeit nach Zahlungszeitpunkt.`} />

      <div className={s.overview}>
        <section aria-labelledby="kz">
          <SectionHead title={<span id="kz">Kennzahlen</span>} sub="Nur bezahlte Bestellungen, ohne Stornos." />
          <div className={s.tblWrap}>
            <table className={`${s.tbl} ${s.kpiTbl}`}>
              <thead>
                <tr>
                  <th scope="col">Kennzahl</th>
                  <th scope="col" className={s.r}>Heute</th>
                  <th scope="col" className={s.r}>Gesamt</th>
                </tr>
              </thead>
              <tbody>
                {row("Bezahlte Bestellungen", <span className={s.big}>{t.orders}</span>, <span className={s.big}>{all.orders}</span>)}
                {row("Verkaufte Karten", t.cards, all.cards)}
                {row("per E-Mail (PDF)", t.byFormat.mail, all.byFormat.mail, s.indent)}
                {row("gedruckt", t.byFormat.print, all.byFormat.print, s.indent)}
                {row("Premium", t.byFormat.premium, all.byFormat.premium, s.indent)}
                {row("Umsatz Kartenpreise brutto", <span className={s.big}>{eurCents(t.grossCents)}</span>, <span className={s.big}>{eurCents(all.grossCents)}</span>)}
                {row("darin 20 % USt.", eurCents(vatOf(t.grossCents)), eurCents(vatOf(all.grossCents)), s.indent)}
                {row("netto", eurCents(t.grossCents - vatOf(t.grossCents)), eurCents(all.grossCents - vatOf(all.grossCents)), s.indent)}
                {row("Geschenkte Beträge (Info, gehen direkt an die Eltern)", eurCents(t.giftCents), eurCents(all.giftCents), s.info)}
                {row(
                  "Einlösequote",
                  <span className={s.meta}>{flow.redeemedToday} heute eingelöst</span>,
                  <>
                    <b>{pct(flow.redeemed, flow.all)}</b> <span className={s.sub}>{flow.redeemed} von {flow.all} Karten</span>
                  </>,
                )}
                {row(
                  "Überweisungsquote",
                  <span className={s.meta}>{flow.transferredToday} heute gemeldet</span>,
                  <>
                    <b>{pct(flow.transferred, flow.redeemed)}</b> <span className={s.sub}>{flow.transferred} von {flow.redeemed} eingelösten</span>
                  </>,
                )}
              </tbody>
            </table>
          </div>
          <p className={s.meta} style={{ marginTop: 8 }}>
            Umsatz sind nur die Kartenpreise. Die Geschenkbeträge überweisen die Schenkenden direkt an die Eltern, sie laufen nie über uns.
          </p>
        </section>

        <div className={s.side}>
          <section aria-labelledby="sb">
            <SectionHead title={<span id="sb">Startbereitschaft</span>}>
              <Link className={`${s.btn} ${s.btnSm}`} href="/admin/start">Prüfen</Link>
            </SectionHead>
            <div className={s.panel}>
              <div className={s.stat}>
                <span>
                  Punkte erledigt
                  <span className={s.meta}>
                    {ready.bad ? `${ready.bad} fehlen noch für den Start.` : "Nichts blockiert den Start."}
                    {ready.warn ? ` ${ready.warn} Hinweise.` : ""}
                  </span>
                </span>
                <b>
                  {ready.ok} von {ready.total}
                </b>
              </div>
            </div>
          </section>

          <section aria-labelledby="dr">
            <SectionHead title={<span id="dr">Offene Druckaufträge</span>}>
              <Link className={`${s.btn} ${s.btnSm}`} href="/admin/druck">Zum Druck</Link>
            </SectionHead>
            <div className={s.panel}>
              <div className={s.stat}>
                <span>
                  Karten zu drucken und zu versenden
                  <span className={s.meta}>{jobs.length ? `davon ${premium} Premium mit Goldkuvert` : "Alles versendet."}</span>
                </span>
                <b>{jobs.length}</b>
              </div>
              <div className={s.stat}>
                <span>
                  Älteste offene Karte
                  <span className={s.meta}>{oldest ? `bezahlt ${fmtDateTime(oldest)}` : "keine"}</span>
                </span>
                <b>{oldest ? (daysSince(oldest) ? `${daysSince(oldest)} ${daysSince(oldest) === 1 ? "Tag" : "Tage"}` : "heute") : ""}</b>
              </div>
            </div>
          </section>

          <section aria-labelledby="pa">
            <SectionHead title={<span id="pa">Postausgang</span>}>
              <Link className={`${s.btn} ${s.btnSm}`} href="/admin/postausgang">Öffnen</Link>
            </SectionHead>
            <div className={s.panel}>
              <div className={s.stat}>
                <span>
                  Fällig, noch nicht gesendet
                  <span className={s.meta}>{mail.due ? "Bitte im Postausgang senden." : "Nichts offen."}</span>
                </span>
                <b>{mail.due}</b>
              </div>
              <div className={s.stat}>
                <span>
                  Geplant
                  <span className={s.meta}>{mail.next ? `nächste ${fmtDateTime(mail.next)}` : "keine geplant"}</span>
                </span>
                <b>{mail.planned}</b>
              </div>
            </div>
          </section>

          <section aria-labelledby="la">
            <SectionHead title={<span id="la">Letzte Aktivitäten</span>} />
            <div className={s.panel}>
              {feed.length ? (
                <ul className={s.feed}>
                  {feed.map((a, i) => (
                    <li key={i}>
                      <time dateTime={a.at.toISOString()}>{fmtShort(a.at)}</time>
                      <span>{a.href ? <Link href={a.href}>{a.text}</Link> : a.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={s.previewEmpty}>Noch keine Aktivitäten.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
