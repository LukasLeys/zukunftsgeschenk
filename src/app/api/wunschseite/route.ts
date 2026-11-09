import { NextResponse } from "next/server";
import { createWishPage } from "@/lib/shop";
import { errorResponse } from "@/lib/http";

export async function POST(req: Request) {
  try {
    const { slug } = await createWishPage(await req.json());
    return NextResponse.json({ slug, url: `/fuer/${slug}` });
  } catch (e) {
    return errorResponse(e);
  }
}
