// Kartenkatalog, Formate und Preise. Preise sind vorläufig (Product Sheet).

export const OCCASION_IDS = [
  "weihnachten", "zukunft", "geburt", "taufe", "geburtstag", "ostern", "kommunion", "firmung", "schule", "neutral",
] as const;
export type Occasion = (typeof OCCASION_IDS)[number];
export type Shape = "a6" | "post" | "square" | "tag";
export type Paper = "pink" | "gelb" | "rosa" | "tinte" | "gold";
/** Innenfläche der Karte. Standard ist weiß. */
export type Panel = "white" | "tinte" | "pink" | "gelb";
export type Emblem =
  | "star" | "stars" | "tree" | "mobile" | "moon" | "candle" | "cake" | "chalice" | "dove" | "confetti" | "arrow"
  | "bauble" | "sack" | "wreath" | "gingerbread"
  | "egg" | "bunny" | "nest"
  | "onesie" | "feet" | "pram"
  | "rainbow" | "shell"
  | "balloons" | "crown" | "gift" | "one" | "bunting"
  | "grapes" | "fish" | "flame" | "compass"
  | "cone" | "backpack" | "certificate" | "pencil"
  | "clover" | "heart" | "flower" | "sun"
  | "chart" | "candlechart" | "coins" | "snowball" | "globe" | "moneytree" | "bull" | "chest" | "acorn" | "key";
export type FormatId = "mail" | "print" | "premium";

export interface Motif {
  id: string;
  name: string;
  occasion: Occasion;
  shape: Shape;
  papers: Paper[];
  emblem: Emblem;
  line: string; // Gruß auf der Karte
  panel?: Panel;
  featured?: boolean;
}

export const OCCASIONS: { id: Occasion; label: string }[] = [
  { id: "weihnachten", label: "Weihnachten" },
  { id: "zukunft", label: "Aktien & Geld" },
  { id: "geburt", label: "Geburt" },
  { id: "taufe", label: "Taufe" },
  { id: "geburtstag", label: "Geburtstag" },
  { id: "ostern", label: "Ostern" },
  { id: "kommunion", label: "Erstkommunion" },
  { id: "firmung", label: "Firmung" },
  { id: "schule", label: "Schule" },
  { id: "neutral", label: "Einfach so" },
];

export const MOTIFS: Motif[] = [
  // Weihnachten
  { id: "gold", name: "Goldkuvert", occasion: "weihnachten", shape: "a6", papers: ["pink", "tinte"], emblem: "star", line: "Frohe Weihnachten!", featured: true },
  { id: "sterne", name: "Sternenpapier", occasion: "weihnachten", shape: "a6", papers: ["pink", "tinte", "gelb"], emblem: "stars", line: "Frohe Weihnachten!" },
  { id: "baum", name: "Pfeilbaum", occasion: "weihnachten", shape: "post", papers: ["tinte", "pink"], emblem: "tree", line: "Ein Christbaum, der mitwächst" },
  { id: "kugel", name: "Christbaumkugel", occasion: "weihnachten", shape: "square", papers: ["pink", "tinte", "gelb"], emblem: "bauble", line: "Fröhliche Weihnachten" },
  { id: "adventkranz", name: "Adventkranz", occasion: "weihnachten", shape: "post", papers: ["pink", "gelb"], emblem: "wreath", line: "Eine schöne Adventzeit", panel: "tinte" },
  { id: "lebkuchen", name: "Lebkuchenherz", occasion: "weihnachten", shape: "a6", papers: ["gelb", "rosa"], emblem: "gingerbread", line: "Ein frohes Fest!" },
  { id: "sackerl", name: "Nikolaussackerl", occasion: "weihnachten", shape: "tag", papers: ["pink", "gelb"], emblem: "sack", line: "Vom Nikolaus, für später" },
  // Aktien & Geld
  { id: "kurve", name: "Aufwärtskurve", occasion: "zukunft", shape: "a6", papers: ["tinte", "pink"], emblem: "chart", line: "Langfristig gedacht" },
  { id: "kerzenchart", name: "Börsenkerzen", occasion: "zukunft", shape: "post", papers: ["gelb", "pink"], emblem: "candlechart", line: "Dein Start an der Börse", panel: "tinte" },
  { id: "muenzen", name: "Münzstapel", occasion: "zukunft", shape: "square", papers: ["gelb", "pink"], emblem: "coins", line: "Stück für Stück bis 18" },
  { id: "schneeball", name: "Schneeball", occasion: "zukunft", shape: "a6", papers: ["tinte", "rosa"], emblem: "snowball", line: "Zinseszins braucht Zeit" },
  { id: "weltkugel", name: "Weltkugel", occasion: "zukunft", shape: "square", papers: ["gelb", "tinte"], emblem: "globe", line: "Ein Stück von der ganzen Welt", panel: "pink" },
  { id: "geldbaum", name: "Geldbaum", occasion: "zukunft", shape: "a6", papers: ["rosa", "gelb"], emblem: "moneytree", line: "Damit was wachsen kann" },
  { id: "stier", name: "Börsenstier", occasion: "zukunft", shape: "square", papers: ["tinte", "pink"], emblem: "bull", line: "Viel Glück an der Börse!", panel: "gelb" },
  { id: "schatz", name: "Schatztruhe", occasion: "zukunft", shape: "post", papers: ["pink", "gelb"], emblem: "chest", line: "Ein Schatz für deinen 18er" },
  { id: "eichel", name: "Eichel", occasion: "zukunft", shape: "tag", papers: ["gelb", "rosa"], emblem: "acorn", line: "Klein anfangen, groß werden" },
  { id: "schluessel", name: "Schlüssel zum 18er", occasion: "zukunft", shape: "a6", papers: ["gelb", "rosa"], emblem: "key", line: "Dein Startkapital für später", panel: "pink" },
  // Geburt
  { id: "mobile", name: "Willkommen", occasion: "geburt", shape: "square", papers: ["rosa", "gelb"], emblem: "mobile", line: "Willkommen auf der Welt!" },
  { id: "mond", name: "Mond & Sterne", occasion: "geburt", shape: "a6", papers: ["gelb", "rosa"], emblem: "moon", line: "Schön, dass du da bist", panel: "tinte" },
  { id: "strampler", name: "Strampler", occasion: "geburt", shape: "a6", papers: ["rosa", "gelb"], emblem: "onesie", line: "Willkommen, kleiner Mensch" },
  { id: "fuesse", name: "Kleine Füße", occasion: "geburt", shape: "square", papers: ["gelb", "rosa"], emblem: "feet", line: "Herzlich willkommen!" },
  { id: "kinderwagen", name: "Kinderwagen", occasion: "geburt", shape: "post", papers: ["rosa", "pink"], emblem: "pram", line: "Alles Gute zur Geburt" },
  // Taufe
  { id: "kerze", name: "Taufkerze", occasion: "taufe", shape: "a6", papers: ["rosa", "gelb"], emblem: "candle", line: "Alles Liebe zur Taufe" },
  { id: "regenbogen", name: "Regenbogen", occasion: "taufe", shape: "post", papers: ["rosa", "gelb"], emblem: "rainbow", line: "Gottes Segen zur Taufe" },
  { id: "muschel", name: "Taufmuschel", occasion: "taufe", shape: "square", papers: ["gelb", "rosa", "tinte"], emblem: "shell", line: "Zur Taufe alles Liebe" },
  // Geburtstag
  { id: "kuchen", name: "Kerzenkuchen", occasion: "geburtstag", shape: "post", papers: ["gelb", "pink"], emblem: "cake", line: "Alles Gute zum Geburtstag!" },
  { id: "luftballons", name: "Luftballons", occasion: "geburtstag", shape: "a6", papers: ["pink", "gelb"], emblem: "balloons", line: "Hoch sollst du leben!" },
  { id: "krone", name: "Geburtstagskrone", occasion: "geburtstag", shape: "square", papers: ["tinte", "pink"], emblem: "crown", line: "Alles Gute, Geburtstagskind!", panel: "gelb" },
  { id: "geschenk", name: "Geschenkpaket", occasion: "geburtstag", shape: "a6", papers: ["gelb", "pink"], emblem: "gift", line: "Ein Geschenk, das mitwächst" },
  { id: "einser", name: "Erster Geburtstag", occasion: "geburtstag", shape: "a6", papers: ["rosa", "gelb"], emblem: "one", line: "Alles Gute zum ersten Geburtstag" },
  { id: "wimpel", name: "Wimpelkette", occasion: "geburtstag", shape: "post", papers: ["gelb", "pink", "tinte"], emblem: "bunting", line: "Alles Gute zum Geburtstag!" },
  // Ostern
  { id: "osterei", name: "Osterei", occasion: "ostern", shape: "a6", papers: ["gelb", "rosa", "pink"], emblem: "egg", line: "Frohe Ostern!" },
  { id: "osterhase", name: "Osterhase", occasion: "ostern", shape: "square", papers: ["rosa", "gelb"], emblem: "bunny", line: "Der Osterhase war da" },
  { id: "osternest", name: "Osternest", occasion: "ostern", shape: "tag", papers: ["gelb", "rosa"], emblem: "nest", line: "Schöne Ostern!" },
  // Erstkommunion
  { id: "kelch", name: "Kelch & Licht", occasion: "kommunion", shape: "a6", papers: ["gelb", "rosa"], emblem: "chalice", line: "Zur Erstkommunion" },
  { id: "trauben", name: "Weintrauben", occasion: "kommunion", shape: "post", papers: ["gelb", "rosa"], emblem: "grapes", line: "Zum Fest der Erstkommunion" },
  { id: "fisch", name: "Fisch", occasion: "kommunion", shape: "square", papers: ["rosa", "gelb"], emblem: "fish", line: "Gottes Segen zur Erstkommunion" },
  // Firmung
  { id: "taube", name: "Taube", occasion: "firmung", shape: "square", papers: ["rosa", "tinte"], emblem: "dove", line: "Alles Gute zur Firmung" },
  { id: "flamme", name: "Flamme", occasion: "firmung", shape: "a6", papers: ["pink", "gelb"], emblem: "flame", line: "Viel Kraft für deinen Weg", panel: "tinte" },
  { id: "kompass", name: "Kompass", occasion: "firmung", shape: "square", papers: ["gelb", "rosa"], emblem: "compass", line: "Finde deinen Weg", panel: "tinte" },
  // Schule
  { id: "schultuete", name: "Schultüte", occasion: "schule", shape: "tag", papers: ["gelb", "pink"], emblem: "cone", line: "Alles Gute zum Schulstart!" },
  { id: "schultasche", name: "Schultasche", occasion: "schule", shape: "a6", papers: ["pink", "gelb"], emblem: "backpack", line: "Auf geht's in die Schule!" },
  { id: "zeugnis", name: "Zeugnis", occasion: "schule", shape: "post", papers: ["gelb", "rosa"], emblem: "certificate", line: "Bravo zum Zeugnis!" },
  { id: "bleistift", name: "Bleistift", occasion: "schule", shape: "square", papers: ["rosa", "gelb", "tinte"], emblem: "pencil", line: "Viel Freude beim Lernen" },
  // Einfach so
  { id: "konfetti", name: "Konfetti", occasion: "neutral", shape: "tag", papers: ["tinte", "pink"], emblem: "confetti", line: "Einfach so, für später" },
  { id: "pfeil", name: "Nach oben", occasion: "neutral", shape: "square", papers: ["gelb", "rosa"], emblem: "arrow", line: "Für deine Zukunft", panel: "pink" },
  { id: "kleeblatt", name: "Glücksklee", occasion: "neutral", shape: "square", papers: ["pink", "gelb"], emblem: "clover", line: "Viel Glück!" },
  { id: "herz", name: "Von Herzen", occasion: "neutral", shape: "a6", papers: ["rosa", "pink"], emblem: "heart", line: "Weil wir dich lieb haben" },
  { id: "blume", name: "Namenstag", occasion: "neutral", shape: "a6", papers: ["gelb", "rosa"], emblem: "flower", line: "Alles Gute zum Namenstag" },
  { id: "sonne", name: "Sonnenschein", occasion: "neutral", shape: "post", papers: ["pink", "tinte"], emblem: "sun", line: "Für sonnige Zeiten", panel: "gelb" },
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
