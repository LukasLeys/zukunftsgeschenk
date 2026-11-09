// Anzeige-Formatierung wie im freigegebenen Entwurf: „1.234 €“ (geschütztes Leerzeichen).
// formatEUR aus lib/catalog nutzt dieselbe Schreibweise (E-Mails/PDF).

const NBSP = " ";

/** Zahl mit Tausenderpunkt und Dezimalkomma, z. B. 1234.5 → „1.234,50“ bei decimals = 2. */
export function fmtNumber(x: number, decimals = 0): string {
  const neg = x < 0;
  const abs = Math.abs(x);
  const fixed = (Math.round(abs * 10 ** decimals) / 10 ** decimals).toFixed(decimals);
  const [i, f] = fixed.split(".");
  const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "−" : "") + (f ? `${int},${f}` : int);
}

/** Euro-Betrag für die Oberfläche: eur(100) → „100 €“, eur(4.9, 2) → „4,90 €“. */
export const eur = (x: number, decimals = 0) => `${fmtNumber(x, decimals)}${NBSP}€`;

/** Cent-Betrag für die Oberfläche: eurCents(490) → „4,90 €“. */
export const eurCents = (cents: number) => eur(cents / 100, 2);

/** Rundung wie im Entwurf: ab 1.000 € auf 10 € genau. */
export const roundNice = (v: number) => (v >= 1000 ? Math.round(v / 10) * 10 : Math.round(v));
