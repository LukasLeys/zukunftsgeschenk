// IBAN-Prüfung (ISO 13616, Modulo 97) und EPC-QR-Payload (EPC069-12, Version 002, UTF-8).

/** Länge der IBAN je Ländercode (für die Prüfung hier und die Eingabehilfe im Formular). */
export const IBAN_LENGTHS: Record<string, number> = { AT: 20, DE: 22, CH: 21, LI: 21, IT: 27, SI: 19, HU: 28, CZ: 24, SK: 24, NL: 18, BE: 16, LU: 20, FR: 27, ES: 24 };

export function normalizeIban(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export function formatIban(raw: string): string {
  return normalizeIban(raw).replace(/(.{4})/g, "$1 ").trim();
}

export function maskIban(raw: string): string {
  const i = normalizeIban(raw);
  if (i.length < 8) return i;
  return formatIban(i.slice(0, 4) + "•".repeat(i.length - 8) + i.slice(-4));
}

export function isValidIban(raw: string): boolean {
  const iban = normalizeIban(raw);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  const len = IBAN_LENGTHS[iban.slice(0, 2)];
  if (len && iban.length !== len) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const code = ch >= "A" && ch <= "Z" ? (ch.charCodeAt(0) - 55).toString() : ch;
    for (const d of code) remainder = (remainder * 10 + Number(d)) % 97;
  }
  return remainder === 1;
}

export interface EpcInput {
  name: string; // Empfänger, max 70 Zeichen
  iban: string;
  bic?: string;
  amountCents: number; // 1 Cent bis 999.999.999,99 €
  remittance: string; // unstrukturierter Verwendungszweck, max 140 Zeichen
}

/** Baut den Inhalt eines EPC-QR-Codes ("GiroCode"), scannbar in österreichischen Banking-Apps. */
export function epcPayload(i: EpcInput): string {
  const name = i.name.replace(/\s+/g, " ").trim().slice(0, 70);
  const amount = (i.amountCents / 100).toFixed(2);
  if (i.amountCents < 1 || i.amountCents > 99999999999) throw new Error("Betrag außerhalb des EPC-Bereichs");
  return [
    "BCD",
    "002",
    "1", // UTF-8
    "SCT",
    (i.bic ?? "").trim(),
    name,
    normalizeIban(i.iban),
    `EUR${amount}`,
    "", // Purpose
    "", // strukturierte Referenz
    i.remittance.replace(/\s+/g, " ").trim().slice(0, 140),
  ].join("\n");
}
