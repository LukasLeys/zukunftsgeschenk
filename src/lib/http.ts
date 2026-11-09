import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function errorResponse(e: unknown) {
  if (e instanceof ZodError) {
    const first = e.issues[0];
    return NextResponse.json({ error: first?.message ?? "Eingabe prüfen", field: first?.path.join(".") }, { status: 400 });
  }
  const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
  console.error("[api]", e);
  return NextResponse.json({ error: msg }, { status: 400 });
}
