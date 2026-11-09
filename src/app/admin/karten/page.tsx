import Link from "next/link";
import { and, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import s from "@/components/admin/admin.module.css";
import { CardStatus, EmptyRow, PageHead, Seg } from "@/components/admin/ui";
import { fmtShort, formatShort, maskedIban, motifName } from "@/components/admin/server";
import { eurCents } from "@/components/format";
import { db, schema } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Karten" };

const STATUS = [
  { id: "alle", label: "Alle" },
  { id: "issued", label: "Ausgegeben" },
  { id: "redeemed", label: "Eingelöst" },
  { id: "transferred", label: "Überwiesen" },
] as const;
const FORMAT = [
  { id: "alle", label: "Alle Formate" },
  { id: "mail", label: "E-Mail" },
  { id: "print", label: "Gedruckt" },
  { id: "premium", label: "Premium" },
] as const;
const LIMIT = 300;

export default async function CardsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80).trim() : "";
  const status = STATUS.find((x) => x.id === sp.status)?.id ?? "alle";
  const format = FORMAT.find((x) => x.id === sp.format)?.id ?? "alle";
  const { cards, orders } = schema;
  const d = await db();

  // Karten nicht bezahlter (abgebrochener) Bestellungen sind nie gültig geworden und bleiben ausgeblendet.
  const base = [ne(orders.status, "pending")];
  if (format !== "alle") base.push(eq(cards.format, format));
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    base.push(or(ilike(cards.code, like), ilike(cards.childName, like), ilike(cards.sender, like), ilike(cards.parentName, like), ilike(orders.invoiceNumber, like))!);
  }
  const where = status === "alle" ? and(...base) : and(...base, eq(cards.status, status));
  const rows = await d
    .select({ card: cards, orderStatus: orders.status, invoiceNumber: orders.invoiceNumber })
    .from(cards)
    .innerJoin(orders, eq(orders.id, cards.orderId))
    .where(where)
    .orderBy(desc(cards.createdAt))
    .limit(LIMIT + 1);
  const [cnt] = await d
    .select({
      alle: sql<number>`count(*)::int`,
      issued: sql<number>`count(*) filter (where ${cards.status} = 'issued')::int`,
      redeemed: sql<number>`count(*) filter (where ${cards.status} = 'redeemed')::int`,
      transferred: sql<number>`count(*) filter (where ${cards.status} = 'transferred')::int`,
    })
    .from(cards)
    .innerJoin(orders, eq(orders.id, cards.orderId))
    .where(and(...base));
  const list = rows.slice(0, LIMIT);

  const href = (over: Record<string, string>) => {
    const p = new URLSearchParams();
    const v = { q, status, format, ...over };
    if (v.q) p.set("q", v.q);
    if (v.status !== "alle") p.set("status", v.status);
    if (v.format !== "alle") p.set("format", v.format);
    const qs = p.toString();
    return `/admin/karten${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHead title="Karten" sub="Alle Karten bezahlter und stornierter Bestellungen. IBANs erscheinen nur maskiert." />
      <div className={s.toolbar}>
        <form role="search" action="/admin/karten" className={s.searchForm}>
          <label className="sr" htmlFor="q">Karten durchsuchen</label>
          <input id="q" className={s.search} type="search" name="q" defaultValue={q} placeholder="Code, Kind, Absender, Eltern …" autoComplete="off" />
          {status !== "alle" && <input type="hidden" name="status" value={status} />}
          <label className="sr" htmlFor="format">Format</label>
          <select id="format" className={s.select} name="format" defaultValue={format}>
            {FORMAT.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
          <button className={s.btn} type="submit">Filtern</button>
          {(q || format !== "alle") && <Link className={s.btn} href={href({ q: "", format: "alle" })}>Zurücksetzen</Link>}
        </form>
        <Seg label="Status" items={STATUS.map((x) => ({ href: href({ status: x.id }), label: x.label, count: Number(cnt?.[x.id] ?? 0), active: status === x.id }))} />
        <span className={s.meta} style={{ marginLeft: "auto" }}>
          {list.length} {list.length === 1 ? "Karte" : "Karten"}{rows.length > LIMIT ? `, nur die neuesten ${LIMIT}` : ""}
        </span>
      </div>

      <div className={s.tblWrap}>
        <table className={s.tbl}>
          <thead>
            <tr>
              <th scope="col">Code</th>
              <th scope="col">Erstellt</th>
              <th scope="col">Motiv</th>
              <th scope="col">Format</th>
              <th scope="col">Für</th>
              <th scope="col" className={s.r}>Betrag</th>
              <th scope="col">Status</th>
              <th scope="col">Eltern</th>
              <th scope="col">IBAN</th>
              <th scope="col">Bestellung</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && <EmptyRow cols={10}>{q ? `Keine Karte passt zu „${q}“.` : "Keine Karten in dieser Auswahl."}</EmptyRow>}
            {list.map(({ card: c, orderStatus, invoiceNumber }) => (
              <tr key={c.id}>
                <td><span className={s.code}>{c.code}</span></td>
                <td className={s.nowrap}>{fmtShort(c.createdAt)}</td>
                <td>{motifName(c.motif)}</td>
                <td className={s.nowrap}>
                  {formatShort(c.format)}
                  {c.format !== "mail" && <span className={s.sub}>{c.shippedAt ? `versendet ${fmtShort(c.shippedAt)}` : "Druck offen"}</span>}
                </td>
                <td>
                  {c.childName}
                  <span className={s.sub}>von {c.sender}</span>
                </td>
                <td className={`${s.r} ${s.nowrap}`}>{eurCents(c.amountCents)}</td>
                <td className={s.nowrap}>
                  <CardStatus status={c.status} orderStatus={orderStatus} />
                  <span className={s.sub}>
                    {c.transferredAt ? fmtShort(c.transferredAt) : c.redeemedAt ? fmtShort(c.redeemedAt) : c.wishSlug ? "Wunschseite" : c.ibanEnc ? "IBAN beim Kauf" : ""}
                  </span>
                </td>
                <td>
                  {c.parentName ?? ""}
                  {c.parentEmail && <span className={s.sub}>{c.parentEmail}</span>}
                </td>
                <td className={s.nowrap}><span className={s.code}>{maskedIban(c.ibanEnc)}</span></td>
                <td className={s.nowrap}>
                  <Link href={`/admin/bestellungen/${c.orderId}`}>{invoiceNumber ?? c.orderId}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
