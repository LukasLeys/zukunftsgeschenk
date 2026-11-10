import { NextResponse } from "next/server";
import { cardByCode, redeemCard } from "@/lib/shop";
import { errorResponse } from "@/lib/http";
import { LIMITS, rateLimit } from "@/lib/ratelimit";

/** GET ?code= prüft einen Code (für Schritt 1 der Einlöseseite). POST löst ein. */
export async function GET(req: Request) {
  try {
    rateLimit(req, LIMITS.redeem);
    const code = new URL(req.url).searchParams.get("code") ?? "";
    const c = await cardByCode(code);
    if (!c) return NextResponse.json({ error: "Diesen Code kennen wir nicht. Bitte prüft die Schreibweise, z. B. ZG-7K4P-29XM." }, { status: 404 });
    return NextResponse.json({
      code: c.code, status: c.status, childName: c.childName, sender: c.sender, amountCents: c.amountCents,
      motif: c.motif, paper: c.paper, message: c.message, ibanKnown: Boolean(c.ibanEnc) && c.status === "issued", viaWish: Boolean(c.wishSlug),
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    rateLimit(req, LIMITS.redeem);
    const c = await redeemCard(await req.json());
    return NextResponse.json({ status: c.status, childName: c.childName, sender: c.sender, amountCents: c.amountCents });
  } catch (e) {
    return errorResponse(e);
  }
}
