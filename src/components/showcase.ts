// Beispielbelegung der Motive für Schaufenster-Darstellungen (Startseite, Kartenübersicht).
// Werte aus dem freigegebenen Entwurf. Reine Anzeige-Daten, keine Geschäftslogik.
import type { CardEnvelope } from "./GiftCard";
import type { FormatId } from "@/lib/catalog";

export type StageTone = "rosa" | "gelb" | "weiss" | "tinte" | "creme";

export interface Showcase {
  childName: string;
  sender: string;
  amount: number;
  /** Hintergrund der Bühne: Klasse `st-<tone>`. */
  stage: StageTone;
  /** Empfohlene Zustellart des Motivs. */
  format: FormatId;
  envelope?: CardEnvelope;
}

export const SHOWCASE: Record<string, Showcase> = {
  gold: { childName: "Jakob", sender: "Von Opa Franz", amount: 500, stage: "tinte", format: "premium", envelope: "gold" },
  sterne: { childName: "Lena", sender: "Von Oma Gerti", amount: 100, stage: "gelb", format: "print" },
  baum: { childName: "Mia", sender: "Von Tante Susi", amount: 250, stage: "rosa", format: "print" },
  mobile: { childName: "Emma", sender: "Von Oma und Opa", amount: 500, stage: "creme", format: "print" },
  mond: { childName: "Felix", sender: "Von Onkel Martin", amount: 250, stage: "rosa", format: "print" },
  kerze: { childName: "Sophie", sender: "Von deinem Taufpaten", amount: 100, stage: "creme", format: "print" },
  kuchen: { childName: "Leon", sender: "Von Oma Gerti", amount: 100, stage: "rosa", format: "print" },
  kelch: { childName: "Valentina", sender: "Von deiner Godi", amount: 100, stage: "weiss", format: "print" },
  taube: { childName: "Lukas", sender: "Von deinem Firmpaten", amount: 250, stage: "gelb", format: "print" },
  konfetti: { childName: "Noah", sender: "Von Familie Huber", amount: 50, stage: "creme", format: "mail" },
  pfeil: { childName: "Hanna", sender: "Von deiner Tante", amount: 100, stage: "tinte", format: "mail" },
  kugel: { childName: "Paul", sender: "Von Oma Resi", amount: 100, stage: "gelb", format: "print" },
  adventkranz: { childName: "Anna", sender: "Von Opa Sepp", amount: 50, stage: "creme", format: "print" },
  lebkuchen: { childName: "Theo", sender: "Von Tante Vroni", amount: 100, stage: "rosa", format: "print" },
  sackerl: { childName: "Marie", sender: "Vom Nikolaus und Oma", amount: 50, stage: "creme", format: "mail" },
  kurve: { childName: "Elias", sender: "Von Opa Franz", amount: 500, stage: "gelb", format: "premium", envelope: "gold" },
  kerzenchart: { childName: "Laura", sender: "Von Onkel Martin", amount: 250, stage: "rosa", format: "print" },
  muenzen: { childName: "Maximilian", sender: "Von Oma Gerti", amount: 100, stage: "tinte", format: "print" },
  schneeball: { childName: "Lea", sender: "Von deinem Göd", amount: 250, stage: "rosa", format: "print" },
  weltkugel: { childName: "David", sender: "Von Tante Susi", amount: 500, stage: "weiss", format: "print" },
  geldbaum: { childName: "Lina", sender: "Von Oma und Opa", amount: 250, stage: "gelb", format: "print" },
  stier: { childName: "Tobias", sender: "Von Onkel Stefan", amount: 250, stage: "gelb", format: "print" },
  schatz: { childName: "Johanna", sender: "Von Uroma Hilde", amount: 1000, stage: "creme", format: "premium", envelope: "gold" },
  eichel: { childName: "Moritz", sender: "Von Familie Gruber", amount: 50, stage: "rosa", format: "print" },
  schluessel: { childName: "Klara", sender: "Von deiner Godi", amount: 500, stage: "tinte", format: "print" },
  strampler: { childName: "Ben", sender: "Von Oma Resi", amount: 250, stage: "creme", format: "print" },
  fuesse: { childName: "Ida", sender: "Von Tante Vroni", amount: 100, stage: "rosa", format: "print" },
  kinderwagen: { childName: "Luis", sender: "Von Opa Sepp", amount: 500, stage: "gelb", format: "print" },
  regenbogen: { childName: "Emilia", sender: "Von deiner Taufpatin", amount: 250, stage: "creme", format: "print" },
  muschel: { childName: "Jonas", sender: "Von deinem Taufpaten", amount: 100, stage: "rosa", format: "print" },
  luftballons: { childName: "Mila", sender: "Von Oma Gerti", amount: 50, stage: "creme", format: "mail" },
  krone: { childName: "Leonie", sender: "Von Opa Franz", amount: 100, stage: "rosa", format: "print" },
  geschenk: { childName: "Simon", sender: "Von Tante Susi", amount: 100, stage: "rosa", format: "print" },
  einser: { childName: "Rosa", sender: "Von Oma und Opa", amount: 250, stage: "gelb", format: "print" },
  wimpel: { childName: "Fabian", sender: "Von Onkel Martin", amount: 50, stage: "tinte", format: "mail" },
  osterei: { childName: "Nora", sender: "Von Oma Resi", amount: 50, stage: "rosa", format: "print" },
  osterhase: { childName: "Anton", sender: "Von Opa Sepp", amount: 50, stage: "gelb", format: "mail" },
  osternest: { childName: "Sara", sender: "Von Tante Vroni", amount: 50, stage: "tinte", format: "print" },
  trauben: { childName: "Elena", sender: "Von deiner Godi", amount: 100, stage: "rosa", format: "print" },
  fisch: { childName: "Matthias", sender: "Von deinem Göd", amount: 100, stage: "creme", format: "print" },
  flamme: { childName: "Julia", sender: "Von deiner Firmpatin", amount: 250, stage: "creme", format: "print" },
  kompass: { childName: "Florian", sender: "Von deinem Firmpaten", amount: 250, stage: "rosa", format: "print" },
  schultuete: { childName: "Lilli", sender: "Von Oma Gerti", amount: 50, stage: "rosa", format: "print" },
  schultasche: { childName: "Niklas", sender: "Von Opa Franz", amount: 100, stage: "creme", format: "print" },
  zeugnis: { childName: "Amelie", sender: "Von Tante Susi", amount: 50, stage: "tinte", format: "mail" },
  bleistift: { childName: "Valentin", sender: "Von Oma und Opa", amount: 50, stage: "gelb", format: "mail" },
  kleeblatt: { childName: "Greta", sender: "Von Onkel Stefan", amount: 100, stage: "creme", format: "mail" },
  herz: { childName: "Leo", sender: "Von Oma Resi", amount: 100, stage: "gelb", format: "print" },
  blume: { childName: "Magdalena", sender: "Von deiner Tante", amount: 50, stage: "rosa", format: "mail" },
  sonne: { childName: "Benjamin", sender: "Von Familie Huber", amount: 100, stage: "rosa", format: "print" },
};

export const showcaseFor = (motifId: string): Showcase =>
  SHOWCASE[motifId] ?? { childName: "Lena", sender: "Von Oma Gerti", amount: 100, stage: "rosa", format: "print" };
