import { customAlphabet } from "nanoid";

// Einlösecodes ohne verwechselbare Zeichen (kein 0/O, 1/I/L).
const alpha = customAlphabet("23456789ABCDEFGHJKMNPQRSTUVWXYZ", 4);
export const newRedeemCode = () => `ZG-${alpha()}-${alpha()}`;
export const normalizeCode = (raw: string) => {
  const c = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = c.startsWith("ZG") ? c.slice(2) : c;
  return body.length === 8 ? `ZG-${body.slice(0, 4)}-${body.slice(4)}` : raw.trim().toUpperCase();
};
export const newToken = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 24);
export const newId = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 12);
export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
