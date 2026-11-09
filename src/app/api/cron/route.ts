import { NextResponse } from "next/server";
import { deliverDue } from "@/lib/mail";
import { purgeOldIbans } from "@/lib/shop";

/** Regelmäßig aufrufen (z. B. Vercel Cron alle 15 Minuten): geplante Mails senden, alte IBANs löschen. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Nicht erlaubt" }, { status: 401 });
  const sent = await deliverDue();
  const purged = await purgeOldIbans();
  return NextResponse.json({ sent, purged });
}
