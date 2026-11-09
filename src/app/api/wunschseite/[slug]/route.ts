import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { safeEqual } from "@/lib/crypto";
import { errorResponse } from "@/lib/http";

const OCC = ["weihnachten", "geburt", "taufe", "geburtstag", "kommunion", "firmung", "neutral"] as const;

const patchSchema = z.object({
  t: z.string().min(10).optional(),
  message: z.string().trim().max(400, "Die Nachricht darf höchstens 400 Zeichen lang sein.").optional(),
  occasion: z.enum(OCC, { errorMap: () => ({ message: "Bitte wählt einen Anlass." }) }).optional(),
});

const NOT_FOUND = { error: "Diese Wunschseite gibt es nicht, oder der Link zum Bearbeiten stimmt nicht." };

/** Bearbeiten-Token aus ?t= oder dem Body prüfen. Gibt die Seite zurück oder null. */
async function authorize(slug: string, token: string | undefined | null) {
  if (!token) return null;
  const d = await db();
  const [w] = await d.select().from(schema.wishPages).where(eq(schema.wishPages.slug, slug));
  if (!w || !safeEqual(token, w.editToken)) return null;
  return { d, w };
}

/** PATCH /api/wunschseite/{slug}?t=editToken  Body: { message?, occasion? } */
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = patchSchema.parse(await req.json().catch(() => ({})));
    const auth = await authorize(slug, new URL(req.url).searchParams.get("t") ?? body.t);
    if (!auth) return NextResponse.json(NOT_FOUND, { status: 404 });
    const set: { message?: string; occasion?: string } = {};
    if (body.message !== undefined) set.message = body.message;
    if (body.occasion !== undefined) set.occasion = body.occasion;
    if (Object.keys(set).length) await auth.d.update(schema.wishPages).set(set).where(eq(schema.wishPages.slug, slug));
    const [u] = await auth.d.select().from(schema.wishPages).where(eq(schema.wishPages.slug, slug));
    return NextResponse.json({ slug: u.slug, message: u.message, occasion: u.occasion });
  } catch (e) {
    return errorResponse(e);
  }
}

/** DELETE /api/wunschseite/{slug}?t=editToken  Löscht die Seite samt verschlüsselter IBAN. */
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const auth = await authorize(slug, new URL(req.url).searchParams.get("t"));
    if (!auth) return NextResponse.json(NOT_FOUND, { status: 404 });
    await auth.d.delete(schema.wishPages).where(eq(schema.wishPages.slug, slug));
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return errorResponse(e);
  }
}
