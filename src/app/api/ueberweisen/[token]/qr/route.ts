import { transferInfo } from "@/lib/shop";
import { qrPng } from "@/lib/qr";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const info = await transferInfo(token);
  if (!info) return new Response("Nicht gefunden", { status: 404 });
  return new Response(new Uint8Array(await qrPng(info.epc)), { headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store" } });
}
