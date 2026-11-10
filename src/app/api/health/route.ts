import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Lebenszeichen für Monitoring. Prüft die Datenbank mit einer trivialen Abfrage. Gibt nie Umgebungswerte aus. */
export async function GET() {
  let dbState: "ok" | "error" = "ok";
  try {
    const d = await db();
    await d.execute(sql`select 1`);
  } catch (e) {
    console.error("[health]", e);
    dbState = "error";
  }
  const ok = dbState === "ok";
  return NextResponse.json(
    { ok, db: dbState, time: new Date().toISOString() },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
