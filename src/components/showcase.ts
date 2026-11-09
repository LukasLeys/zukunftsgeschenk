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
};

export const showcaseFor = (motifId: string): Showcase =>
  SHOWCASE[motifId] ?? { childName: "Lena", sender: "Von Oma Gerti", amount: 100, stage: "rosa", format: "print" };
