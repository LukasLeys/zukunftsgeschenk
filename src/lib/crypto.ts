import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { UserError } from "./errors";

/** Meldung, wenn im Produktivbetrieb kein Schlüssel gesetzt ist. Einlösen und Wunschseiten antworten dann mit 503. */
export const IBAN_NOT_READY =
  "Diese Funktion ist noch nicht freigeschaltet, weil die sichere Speicherung der IBAN noch eingerichtet wird. Bitte später noch einmal versuchen.";

/** Zustand von IBAN_ENCRYPTION_KEY, ohne den Wert preiszugeben. */
export function encryptionKeyStatus(): "ok" | "missing" | "invalid" {
  const k = process.env.IBAN_ENCRYPTION_KEY;
  if (!k) return "missing";
  return Buffer.from(k, "base64").length === 32 ? "ok" : "invalid";
}

/** false, wenn im Produktivbetrieb der Schlüssel fehlt. Dann zeigen Einlösen und Wunschseite vorab einen Hinweis. */
export function ibanFeaturesReady(): boolean {
  return process.env.NODE_ENV !== "production" || encryptionKeyStatus() !== "missing";
}

// AES-256-GCM für IBANs. Schlüssel aus IBAN_ENCRYPTION_KEY (32 Byte, base64). Im Entwicklungsmodus ein fester Dev-Schlüssel.
// Im Produktivbetrieb gibt es nie einen Ersatzschlüssel: ohne Schlüssel keine IBAN-Funktionen.
function key(): Buffer {
  const k = process.env.IBAN_ENCRYPTION_KEY;
  if (k) {
    const b = Buffer.from(k, "base64");
    if (b.length !== 32) throw new Error("IBAN_ENCRYPTION_KEY muss 32 Byte (base64) lang sein");
    return b;
  }
  if (process.env.NODE_ENV === "production") {
    console.error("[crypto] IBAN_ENCRYPTION_KEY fehlt. Einlösen und Wunschseiten sind gesperrt.");
    throw new UserError(IBAN_NOT_READY, 503);
  }
  return createHash("sha256").update("zukunftsgeschenk-dev-key").digest();
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return ["v1", iv.toString("base64"), c.getAuthTag().toString("base64"), enc.toString("base64")].join(".");
}

export function decrypt(token: string): string {
  const [v, iv, tag, data] = token.split(".");
  if (v !== "v1") throw new Error("Unbekanntes Format");
  const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  d.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([d.update(Buffer.from(data, "base64")), d.final()]).toString("utf8");
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}
