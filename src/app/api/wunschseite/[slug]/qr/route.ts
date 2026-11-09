import { wishEpc } from "@/lib/shop";
import { qrSvg } from "@/lib/qr";

/** Bank-QR (SVG) zum direkten Überweisen über die Wunschseite: ?betrag=100&von=Oma */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const u = new URL(req.url);
  const amount = Math.min(5000, Math.max(1, Number(u.searchParams.get("betrag") ?? 100)));
  const epc = await wishEpc(slug, amount, (u.searchParams.get("von") ?? "").slice(0, 40));
  if (!epc) return new Response("Nicht gefunden", { status: 404 });
  return new Response(await qrSvg(epc), { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "private, no-store" } });
}
