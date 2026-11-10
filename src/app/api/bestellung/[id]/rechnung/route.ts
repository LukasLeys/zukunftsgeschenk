import { getOrder } from "@/lib/shop";
import { invoicePdf } from "@/lib/invoice";
import { safeEqual } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Rechnung als PDF. Zugriff nur mit dem Schlüssel aus dem Bestelllink (?t=). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(req.url).searchParams.get("t") ?? "";
  if (!/^[a-z0-9]{6,40}$/.test(id) || !token) return new Response("Rechnung nicht gefunden", { status: 404 });
  const res = await getOrder(id);
  if (!res || !safeEqual(token, res.order.accessToken)) return new Response("Rechnung nicht gefunden", { status: 404 });
  if (!res.order.invoiceNumber) return new Response("Die Rechnung gibt es, sobald die Zahlung bestätigt ist.", { status: 409, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  const bytes = await invoicePdf(res.order, res.cards);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Rechnung-${res.order.invoiceNumber}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
