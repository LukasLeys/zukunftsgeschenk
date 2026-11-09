import { printJobs } from "@/components/admin/queries";
import { envelopeName, fmtDate, formatShort, motifName, PAPER_NAME } from "@/components/admin/server";
import { formatEUR } from "@/lib/catalog";

export const dynamic = "force-dynamic";

// Formel-Injektion verhindern: Zellen, die mit = + - @ beginnen, bekommen ein führendes Hochkomma.
function cell(v: string | number | null | undefined) {
  let s = v == null ? "" : String(v);
  s = s.replace(/\r?\n/g, " ").trim();
  if (/^[=+\-@\t]/.test(s)) s = `'${s}`;
  return /[";]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const HEAD = [
  "Code", "Format", "Motiv", "Papier", "Kuvert", "Name", "Betrag", "Botschaft", "Absender",
  "Lieferadresse Name", "Straße", "PLZ", "Ort", "Land", "Rechnungsnr.", "Bezahlt am",
];

/** CSV für die Druckerei: alle offenen Druckaufträge (bezahlt, Druck oder Premium, noch nicht versendet). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const only = url.searchParams.getAll("id");
  let jobs = await printJobs();
  if (only.length) jobs = jobs.filter((j) => only.includes(j.id));
  const lines = [HEAD.join(";")];
  for (const j of jobs) {
    const a = j.order.shipping;
    lines.push(
      [
        j.code, formatShort(j.format), motifName(j.motif), PAPER_NAME[j.paper] ?? j.paper, envelopeName(j), j.childName,
        formatEUR(j.amountCents, { cents: true, decimals: j.amountCents % 100 !== 0 }).replace(" ", " "),
        j.message, j.sender, a?.name, a?.street, a?.zip, a?.city, a ? "Österreich" : "", j.order.invoiceNumber, fmtDate(j.order.paidAt),
      ]
        .map(cell)
        .join(";"),
    );
  }
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Vienna" }).format(new Date());
  // BOM und Semikolon, damit Excel (de-AT) Umlaute und Spalten richtig erkennt.
  return new Response("﻿" + lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="druckauftraege-${today}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
