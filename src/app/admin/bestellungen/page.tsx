import Link from "next/link";
import s from "@/components/admin/admin.module.css";
import { EmptyRow, OrderStatus, PageHead, Seg } from "@/components/admin/ui";
import { listOrders } from "@/components/admin/queries";
import { fmtShort } from "@/components/admin/server";
import { eurCents } from "@/components/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bestellungen" };

const STATUS = [
  { id: "alle", label: "Alle" },
  { id: "paid", label: "Bezahlt" },
  { id: "pending", label: "Offen" },
  { id: "cancelled", label: "Storniert" },
] as const;

const FMT_SHORT: Record<string, string> = { mail: "E-Mail", print: "Druck", premium: "Premium" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const status = typeof sp.status === "string" && STATUS.some((x) => x.id === sp.status) ? sp.status : "alle";
  const { list, more, statusCounts } = await listOrders(q, status);
  const href = (st: string, qq = q) => {
    const p = new URLSearchParams();
    if (qq) p.set("q", qq);
    if (st !== "alle") p.set("status", st);
    const qs = p.toString();
    return `/admin/bestellungen${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHead title="Bestellungen" sub="Neueste zuerst. Suche nach Name, E-Mail, Rechnungsnummer, Kartencode oder Kindername." />
      <div className={s.toolbar}>
        <form role="search" action="/admin/bestellungen" className={s.searchForm}>
          <label className="sr" htmlFor="q">Bestellungen durchsuchen</label>
          <input id="q" className={s.search} type="search" name="q" defaultValue={q} placeholder="Name, E-Mail, ZG-2026-01001 …" autoComplete="off" />
          {status !== "alle" && <input type="hidden" name="status" value={status} />}
          <button className={s.btn} type="submit">Suchen</button>
          {q && <Link className={s.btn} href={href(status, "")}>Suche löschen</Link>}
        </form>
        <Seg
          label="Status"
          items={STATUS.map((x) => ({ href: href(x.id), label: x.label, count: Number(statusCounts?.[x.id as keyof typeof statusCounts] ?? 0), active: status === x.id }))}
        />
        <span className={s.meta} style={{ marginLeft: "auto" }}>
          {list.length} {list.length === 1 ? "Bestellung" : "Bestellungen"}{more ? ", weitere vorhanden: Suche eingrenzen" : ""}
        </span>
      </div>

      <div className={s.tblWrap}>
        <table className={s.tbl}>
          <thead>
            <tr>
              <th scope="col">Angelegt</th>
              <th scope="col">Rechnungsnr.</th>
              <th scope="col">Käufer:in</th>
              <th scope="col">Karten</th>
              <th scope="col">Lieferung</th>
              <th scope="col" className={s.r}>Summe</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && <EmptyRow cols={7}>{q ? `Keine Bestellung passt zu „${q}“.` : "Noch keine Bestellungen."}</EmptyRow>}
            {list.map((o) => {
              const n = Object.values(o.formats).reduce((a, b) => a + b, 0);
              return (
                <tr key={o.id}>
                  <td className={s.nowrap}>{fmtShort(o.createdAt)}</td>
                  <td className={s.nowrap}>
                    <Link className={s.rowLink} href={`/admin/bestellungen/${o.id}`}>{o.invoiceNumber ?? `ohne Nr. (${o.id})`}</Link>
                  </td>
                  <td>
                    {o.buyerName}
                    <span className={s.sub}>{o.buyerEmail}</span>
                  </td>
                  <td className={s.nowrap}>
                    {n}
                    <span className={s.sub}>
                      {Object.entries(o.formats)
                        .map(([f, c]) => `${c} ${FMT_SHORT[f] ?? f}`)
                        .join(", ")}
                    </span>
                  </td>
                  <td>{o.shipping ? `${o.shipping.zip} ${o.shipping.city}` : <span className={s.meta}>nur digital</span>}</td>
                  <td className={`${s.r} ${s.nowrap}`}>{eurCents(o.totalCents)}</td>
                  <td><OrderStatus status={o.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
