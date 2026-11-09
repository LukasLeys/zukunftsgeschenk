import { NextResponse } from "next/server";
import { markTransferred } from "@/lib/shop";
import { errorResponse } from "@/lib/http";

/** Schenkende melden: „Ich habe überwiesen“. */
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const c = await markTransferred(token);
    return NextResponse.json({ status: c.status });
  } catch (e) {
    return errorResponse(e);
  }
}
