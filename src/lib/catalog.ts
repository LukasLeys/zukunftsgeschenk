// Kartenkatalog, Formate und Preise. Preise sind vorläufig (Product Sheet).

export type Occasion =
  | "weihnachten" | "geburt" | "taufe" | "geburtstag" | "kommunion" | "firmung" | "neutral";
export type Shape = "a6" | "post" | "square" | "tag";
export type Paper = "pink" | "gelb" | "rosa" | "tinte" | "gold";
export type Emblem =
  | "star" | "stars" | "tree" | "mobile" | "moon" | "candle" | "cake" | "chalice" | "dove" | "confetti" | "arrow";
export type FormatId = "mail" | "print" | "premium";

export interface Motif {
  id: string;
  name: string;
  occasion: Occasion;
  shape: Shape;
  papers: Paper[];
  emblem: Emblem;
  line: string; // Gruß auf der Karte
  featured?: boolean;
}

export const OCCASIONS: { id: Occasion; label: string }[] = [
  { id: "weihnachten", label: "Weihnachten" },
  { id: "geburt", label: "Geburt" },
  { id: "taufe", label: "Taufe" },
  { id: "geburtstag", label: "Geburtstag" },
  { id: "kommunion", label: "Erstkommunion" },
  { id: "firmung", label: "Firmung" },
  { id: "neutral", label: "Einfach so" },
];

export const MOTIFS: Motif[] = [
  { id: "gold", name: "Goldkuvert", occasion: "weihnachten", shape: "a6", papers: ["pink", "tinte"], emblem: "star", line: "Frohe Weihnachten!", featured: true },
  { id: "sterne", name: "Sternenpapier", occasion: "weihnachten", shape: "a6", papers: ["pink", "tinte", "gelb"], emblem: "stars", line: "Frohe Weihnachten!" },
  { id: "baum", name: "Pfeilbaum", occasion: "weihnachten", shape: "post", papers: ["tinte", "pink"], emblem: "tree", line: "Ein Christbaum, der mitwächst" },
  { id: "mobile", name: "Willkommen", occasion: "geburt", shape: "square", papers: ["rosa", "gelb"], emblem: "mobile", line: "Willkommen auf der Welt!" },
  { id: "mond", name: "Mond & Sterne", occasion: "geburt", shape: "a6", papers: ["gelb", "rosa"], emblem: "moon", line: "Schön, dass du da bist" },
  { id: "kerze", name: "Taufkerze", occasion: "taufe", shape: "a6", papers: ["rosa", "gelb"], emblem: "candle", line: "Alles Liebe zur Taufe" },
  { id: "kuchen", name: "Kerzenkuchen", occasion: "geburtstag", shape: "post", papers: ["gelb", "pink"], emblem: "cake", line: "Alles Gute zum Geburtstag!" },
  { id: "kelch", name: "Kelch & Licht", occasion: "kommunion", shape: "a6", papers: ["gelb", "rosa"], emblem: "chalice", line: "Zur Erstkommunion" },
  { id: "taube", name: "Taube", occasion: "firmung", shape: "square", papers: ["rosa", "tinte"], emblem: "dove", line: "Alles Gute zur Firmung" },
  { id: "konfetti", name: "Konfetti", occasion: "neutral", shape: "tag", papers: ["tinte", "pink"], emblem: "confetti", line: "Einfach so, für später" },
  { id: "pfeil", name: "Nach oben", occasion: "neutral", shape: "square", papers: ["gelb", "rosa"], emblem: "arrow", line: "Für deine Zukunft" },
];

export interface Format {
  id: FormatId;
  label: string;
  short: string;
  priceCents: number;
  detail: string;
}

export const FORMATS: Format[] = [
  { id: "mail", label: "Per E-Mail (PDF)", short: "E-Mail", priceCents: 490, detail: "Sofort oder zum Wunschtermin, zum Beispiel am 24.12. um 17 Uhr." },
  { id: "print", label: "Gedruckt mit Kuvert", short: "Gedruckt", priceCents: 1290, detail: "Klappkarte A6 mit Kuvert, per Post in Österreich, Versand inklusive." },
  { id: "premium", label: "Premium mit Goldkuvert", short: "Premium", priceCents: 1990, detail: "Büttenpapier, Goldkuvert mit Siegel, Versand inklusive." },
];

export const PRESET_AMOUNTS = [50, 100, 250, 500] as const;
export const MAX_AMOUNT_EUR = 5000;
export const MIN_AMOUNT_EUR = 10;

/** Bestellschluss für die Weihnachtsaktion (Goldkuvert gratis bei gedruckten Karten). */
export const XMAS_DEADLINE = new Date("2026-12-17T23:59:59+01:00");
export const xmasActive = (now = new Date()) => now <= XMAS_DEADLINE;

export const motifById = (id: string) => MOTIFS.find((m) => m.id === id);
export const formatById = (id: string) => FORMATS.find((f) => f.id === id);

/** Euro-Betrag wie im freigegebenen Design: „100 €“, „4,90 €“ (geschütztes Leerzeichen). */
export function formatEUR(value: number, opts: { cents?: boolean; decimals?: boolean } = {}): string {
  const v = opts.cents ? value / 100 : value;
  const decimals = opts.decimals ?? (opts.cents ? true : false);
  const fixed = Math.abs(v).toFixed(decimals ? 2 : 0);
  const [i, f] = fixed.split(".");
  const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${v < 0 ? "−" : ""}${f ? `${int},${f}` : int}\u00a0€`;
}
