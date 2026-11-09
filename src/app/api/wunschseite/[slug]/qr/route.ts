import { wishEpc } from "@/lib/shop";
import { qrPng, qrSvg } from "@/lib/qr";

/** Bank-QR (SVG) zum direkten Überweisen über die Wunschseite: ?betrag=100&von=Oma. Mit &format=png als Bild zum Speichern. */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const u = new URL(req.url);
  const amount = Math.min(5000, Math.max(1, Number(u.searchParams.get("betrag") ?? 100)));
  const epc = await wishEpc(slug, amount, (u.searchParams.get("von") ?? "").slice(0, 40));
  if (!epc) return new Response("Nicht gefunden", { status: 404 });
  if (u.searchParams.get("format") === "png") {
    return new Response(new Uint8Array(await qrPng(epc, 600)), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="zukunftsgeschenk-qr.png"`,
        "Cache-Control": "private, no-store",
      },
    });
  }
  return new Response(await qrSvg(epc), { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "private, no-store" } });
}
