import { UserError } from "./errors";

// Einfacher Schutz vor Missbrauch der öffentlichen Formulare: gleitendes Zeitfenster pro IP-Adresse.
// Die Zähler liegen im Arbeitsspeicher. Auf Vercel (serverless) gilt das Limit deshalb nur pro Instanz
// und beginnt nach einem Kaltstart neu. Das bremst Skripte, ist aber keine harte Grenze. Für mehr Schutz
// braucht es einen gemeinsamen Speicher (z. B. Redis) oder die Firewall von Vercel.

export interface Limit {
  /** Name des Zählers. Gleicher Name heißt gemeinsamer Zähler. */
  name: string;
  /** Erlaubte Anfragen im Zeitfenster. */
  max: number;
  /** Länge des Zeitfensters in Millisekunden. */
  windowMs: number;
  /** Meldung für die Kundin oder den Kunden. */
  message: string;
}

const TEN_MIN = 10 * 60 * 1000;

export const LIMITS = {
  redeem: {
    name: "redeem",
    max: 20,
    windowMs: TEN_MIN,
    message: "Ihr habt in kurzer Zeit sehr viele Versuche gemacht. Bitte wartet ein paar Minuten und versucht es dann noch einmal.",
  },
  wish: {
    name: "wish",
    max: 10,
    windowMs: TEN_MIN,
    message: "Ihr habt in kurzer Zeit sehr viele Wunschseiten angelegt. Bitte wartet ein paar Minuten und versucht es dann noch einmal.",
  },
  checkout: {
    name: "checkout",
    max: 30,
    windowMs: TEN_MIN,
    message: "Du hast in kurzer Zeit sehr oft bestellt. Bitte warte ein paar Minuten und versuch es dann noch einmal. Es wurde nichts abgebucht.",
  },
} as const satisfies Record<string, Limit>;

const hits = new Map<string, number[]>();

/** Zählt eine Anfrage. Gibt false zurück, wenn das Limit im Zeitfenster schon erreicht ist. */
export function take(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const from = now - windowMs;
  const list = (hits.get(key) ?? []).filter((t) => t > from);
  if (list.length >= max) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 10_000) sweep(now, windowMs);
  return true;
}

/** Entfernt abgelaufene Einträge, damit der Speicher nicht wächst. */
function sweep(now: number, windowMs: number) {
  for (const [k, list] of hits) {
    if (!list.some((t) => t > now - windowMs)) hits.delete(k);
  }
}

/** IP-Adresse der Anfrage. Hinter Vercel steht die echte Adresse an erster Stelle in x-forwarded-for. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || req.headers.get("x-real-ip")?.trim() || "unbekannt";
}

/** Wirft einen UserError mit Status 429, wenn diese IP das Limit überschritten hat. */
export function rateLimit(req: Request, limit: Limit, now = Date.now()): void {
  if (!take(`${limit.name}:${clientIp(req)}`, limit.max, limit.windowMs, now)) throw new UserError(limit.message, 429);
}

/** Nur für Tests: alle Zähler leeren. */
export function resetRateLimits() {
  hits.clear();
}
