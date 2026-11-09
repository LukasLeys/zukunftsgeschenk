import { cardByCode, cardEpc } from "@/lib/shop";
import { cardPdf } from "@/lib/pdf";
import { SITE_URL } from "@/lib/env";

// Wer den Einlösecode hat, besitzt die Karte und darf sie als PDF laden.
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const card = await cardByCode(code);
  if (!card) return new Response("Karte nicht gefunden", { status: 404 });
  const bytes = await cardPdf(card, { redeemUrl: `${SITE_URL}/einloesen?code=${card.code}`, epcPayload: cardEpc(card) });
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Zukunftsgeschenk-${card.childName.replace(/[^\p{L}\d-]/gu, "")}-${card.code}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
