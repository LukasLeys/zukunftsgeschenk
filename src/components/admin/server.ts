import "server-only";
import { NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto";
import { maskIban } from "@/lib/iban";
import { motifById, formatById } from "@/lib/catalog";
import type { Card } from "@/lib/db/schema";

// Gemeinsame Helfer für den Admin-Bereich (Seiten und Routen unter /api/admin).

export const TZ = "Europe/Vienna";

const dtFmt = new Intl.DateTimeFormat("de-AT", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const dFmt = new Intl.DateTimeFormat("de-AT", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
const tFmt = new Intl.DateTimeFormat("de-AT", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

/** „09.11.2026, 14:05“ (Wiener Zeit). Leer bei fehlendem Datum. */
export const fmtDateTime = (d?: Date | null) => (d ? dtFmt.format(d) : "");
export const fmtDate = (d?: Date | null) => (d ? dFmt.format(d) : "");
export const fmtTime = (d?: Date | null) => (d ? tFmt.format(d) : "");

/** Kurzform für Listen: heute nur Uhrzeit, sonst Datum mit Uhrzeit. */
export function fmtShort(d?: Date | null) {
  if (!d) return "";
  return dFmt.format(d) === dFmt.format(new Date()) ? `heute ${tFmt.format(d)}` : dtFmt.format(d);
}

/** Beginn des heutigen Tages in Wien als Date (UTC-Zeitpunkt). */
export function startOfToday(now = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
      .formatToParts(now)
      .map((x) => [x.type, x.value]),
  );
  const wall = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  const offset = wall - Math.floor(now.getTime() / 1000) * 1000;
  return new Date(Date.UTC(+p.year, +p.month - 1, +p.day) - offset);
}

/** Wartezeit in ganzen Tagen. */
export const daysSince = (d?: Date | null) => (d ? Math.max(0, Math.floor((Date.now() - d.getTime()) / 864e5)) : 0);

export const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)} %` : "0 %");

/** Enthaltene 20 % USt. aus einem Bruttobetrag in Cent. */
export const vatOf = (grossCents: number) => Math.round(grossCents / 6);

export const ORDER_STATUS: Record<string, { label: string; tone: Tone }> = {
  paid: { label: "bezahlt", tone: "ok" },
  pending: { label: "offen", tone: "warn" },
  processing: { label: "Zahlung läuft", tone: "warn" },
  failed: { label: "Zahlung gescheitert", tone: "off" },
  expired: { label: "abgelaufen", tone: "off" },
  cancelled: { label: "storniert", tone: "off" },
  refunded: { label: "erstattet", tone: "off" },
};

export const CARD_STATUS: Record<string, { label: string; tone: Tone }> = {
  issued: { label: "ausgegeben", tone: "plain" },
  redeemed: { label: "eingelöst", tone: "warn" },
  transferred: { label: "überwiesen", tone: "ok" },
  blocked: { label: "gesperrt", tone: "off" },
};

export type Tone = "ok" | "warn" | "bad" | "off" | "plain" | "accent";

export const PAPER_NAME: Record<string, string> = { pink: "Pink", gelb: "Gelb", rosa: "Rosa", tinte: "Tinte", gold: "Gold" };
export const motifName = (id: string) => motifById(id)?.name ?? id;
export const formatShort = (id: string) => formatById(id)?.short ?? id;
export const envelopeName = (c: Pick<Card, "goldEnvelope" | "format">) => (c.format === "mail" ? "" : c.goldEnvelope ? "Gold" : "Weiß");

/** IBAN nur maskiert ausgeben, niemals im Klartext. */
export function maskedIban(enc?: string | null) {
  if (!enc) return "";
  try {
    return maskIban(decrypt(enc));
  } catch {
    return "nicht lesbar";
  }
}

export const pdfUrl = (code: string) => `/api/karten/${encodeURIComponent(code)}/pdf`;

/**
 * Schutz der POST-Routen vor fremden Seiten (CSRF): Basic-Auth schickt der Browser automatisch mit,
 * deshalb nur JSON-Anfragen von derselben Herkunft zulassen.
 */
export function guard(req: Request): Response | null {
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return NextResponse.json({ error: "Nur JSON-Anfragen erlaubt" }, { status: 415 });
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return NextResponse.json({ error: "Fremde Herkunft" }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "Fremde Herkunft" }, { status: 403 });
    }
  }
  return null;
}

export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
