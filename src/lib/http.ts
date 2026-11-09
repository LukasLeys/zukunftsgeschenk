import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UserError } from "./errors";

export function errorResponse(e: unknown) {
  if (e instanceof ZodError) {
    const first = e.issues[0];
    return NextResponse.json({ error: first?.message ?? "Bitte prüft eure Eingaben.", field: first?.path.join(".") }, { status: 400 });
  }
  if (e instanceof UserError) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error("[api]", e);
  return NextResponse.json({ error: "Da ist bei uns etwas schiefgelaufen. Bitte versucht es in ein paar Minuten noch einmal." }, { status: 500 });
}
