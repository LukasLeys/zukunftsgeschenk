// Datum und Uhrzeit für E-Mail-Karten. Wunschtermine gelten immer in österreichischer Zeit (Europe/Vienna),
// egal in welcher Zeitzone das Gerät der Käufer läuft. Rein, ohne Abhängigkeiten, im Client und Server nutzbar.

const TZ = "Europe/Vienna";

/** Versatz von Wien gegenüber UTC in Minuten zu einem Zeitpunkt (Winter +60, Sommer +120). */
function viennaOffsetMinutes(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - utcMs) / 60000);
}

/** „2026-12-24T17:00“ (Wiener Ortszeit, wie aus datetime-local) → Date. Ungültig → null. */
export function viennaLocalToDate(local: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local.trim());
  if (!m) return null;
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  const off = viennaOffsetMinutes(guess);
  let t = guess - off * 60000;
  const off2 = viennaOffsetMinutes(t);
  if (off2 !== off) t = guess - off2 * 60000;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Date → „2026-12-24T17:00“ in Wiener Ortszeit (für das min-Attribut von datetime-local). */
export function dateToViennaLocal(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** „24.12.2026 um 17:00 Uhr“ (Wiener Zeit). */
export function formatVienna(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  const date = new Intl.DateTimeFormat("de-AT", { day: "numeric", month: "numeric", year: "numeric", timeZone: TZ }).format(d);
  const time = new Intl.DateTimeFormat("de-AT", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TZ }).format(d);
  return `${date} um ${time} Uhr`;
}

/** Vorbelegung für den Wunschtermin: Heiliger Abend 2026, 17 Uhr. */
export const DEFAULT_DELIVERY_LOCAL = "2026-12-24T17:00";
