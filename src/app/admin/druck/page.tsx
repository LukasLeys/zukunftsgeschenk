import Link from "next/link";
import s from "@/components/admin/admin.module.css";
import { ShipForm } from "@/components/admin/ShipForm";
import { Badge, EmptyRow, PageHead, SectionHead } from "@/components/admin/ui";
import { printJobs, type PrintJob } from "@/components/admin/queries";
import { daysSince, envelopeName, fmtDateTime, fmtShort, formatShort, motifName, PAPER_NAME, pdfUrl } from "@/components/admin/server";
import { eurCents } from "@/components/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Druck" };

function Rows({ jobs, undo }: { jobs: PrintJob[]; undo?: boolean }) {
  return (
    <>
      {jobs.map((j) => {
        const a = j.order.shipping;
        const wait = daysSince(j.order.paidAt);
        return (
          <tr key={j.id}>
            <td>
              <input className={s.check} type="checkbox" name="id" value={j.id} aria-label={`${j.code} auswählen`} />
            </td>
            <td className={s.nowrap}>
              {undo ? fmtShort(j.shippedAt) : fmtShort(j.order.paidAt)}
              {!undo && wait > 0 && <span className={s.sub}>seit {wait} {wait === 1 ? "Tag" : "Tagen"}</span>}
            </td>
            <td>
              <span className={s.code}>{j.code}</span>
              <span className={s.sub}>
                <Link href={`/admin/bestellungen/${j.order.id}`}>{j.order.invoiceNumber ?? j.order.id}</Link>
              </span>
            </td>
            <td className={s.nowrap}>
              {j.format === "premium" ? <Badge tone="accent">Premium</Badge> : formatShort(j.format)}
            </td>
            <td>
              {motifName(j.motif)}
              <span className={s.sub}>Papier {PAPER_NAME[j.paper] ?? j.paper}</span>
            </td>
            <td className={s.nowrap}>{envelopeName(j) === "Gold" ? <b>Gold</b> : envelopeName(j)}</td>
            <td>
              {j.childName}
              <span className={s.sub}>{eurCents(j.amountCents)}</span>
            </td>
            <td>
              {j.message ? <span className={s.clip} style={{ display: "block", maxWidth: 220 }} title={j.message}>{j.message}</span> : <span className={s.meta}>keine</span>}
              <span className={s.sub}>von {j.sender}</span>
            </td>
            <td>
              {a ? (
                <>
                  {a.name}
                  <span className={s.sub}>{a.street}, {a.zip} {a.city}</span>
                </>
              ) : (
                <Badge tone="warn">Adresse fehlt</Badge>
              )}
            </td>
            <td className={s.nowrap}>
              <a href={pdfUrl(j.code)} target="_blank" rel="noreferrer">PDF</a>
            </td>
            <td>
              <button className={`${s.btn} ${s.btnSm}`} type="submit" name="only" value={j.id}>
                {undo ? "zurücknehmen" : "versendet"}
              </button>
            </td>
          </tr>
        );
      })}
    </>
  );
}

function Head({ undo }: { undo?: boolean }) {
  return (
    <thead>
      <tr>
        <th scope="col"><span className="sr">Auswahl</span></th>
        <th scope="col">{undo ? "Versendet" : "Bezahlt"}</th>
        <th scope="col">Code</th>
        <th scope="col">Format</th>
        <th scope="col">Motiv</th>
        <th scope="col">Kuvert</th>
        <th scope="col">Name</th>
        <th scope="col">Botschaft</th>
        <th scope="col">Lieferadresse</th>
        <th scope="col">Karte</th>
        <th scope="col"><span className="sr">Aktion</span></th>
      </tr>
    </thead>
  );
}

export default async function PrintPage() {
  const [open, shipped] = await Promise.all([printJobs(), printJobs({ shipped: true, sinceDays: 14 })]);
  const gold = open.filter((j) => j.goldEnvelope).length;
  return (
    <>
      <PageHead
        title="Druck"
        sub={
          open.length
            ? `${open.length} ${open.length === 1 ? "Karte" : "Karten"} offen, ${gold} mit Goldkuvert, ${open.length - gold} mit weißem Kuvert. Älteste zuerst.`
            : "Keine offenen Druckaufträge."
        }
      >
        <a className={`${s.btn} ${s.btnPrimary}`} href="/api/admin/druck" download aria-disabled={!open.length || undefined}>
          CSV für die Druckerei
        </a>
      </PageHead>

      <section aria-label="Offene Druckaufträge">
        <ShipForm bulkLabel="Auswahl als versendet markieren" count={open.length}>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <Head />
              <tbody>
                {open.length === 0 ? <EmptyRow cols={11}>Alle gedruckten Karten sind versendet.</EmptyRow> : <Rows jobs={open} />}
              </tbody>
            </table>
          </div>
        </ShipForm>
        <p className={s.meta} style={{ marginTop: 8 }}>
          Die CSV enthält alle offenen Aufträge mit Code, Motiv, Papier, Kuvert, Name, Betrag, Botschaft, Absender und Lieferadresse (Semikolon, UTF-8).
        </p>
      </section>

      <section className={s.section} aria-labelledby="h-v">
        <SectionHead title={<span id="h-v">Zuletzt versendet</span>} sub={`Letzte 14 Tage. Stand ${fmtDateTime(new Date())}.`} />
        <ShipForm bulkLabel="Auswahl wieder auf offen setzen" count={shipped.length} undo>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <Head undo />
              <tbody>
                {shipped.length === 0 ? <EmptyRow cols={11}>In den letzten 14 Tagen nichts versendet.</EmptyRow> : <Rows jobs={shipped} undo />}
              </tbody>
            </table>
          </div>
        </ShipForm>
      </section>
    </>
  );
}
