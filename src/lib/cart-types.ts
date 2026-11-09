// Client-sicherer Warenkorb-Typ. Muss identisch bleiben mit `CartItem` aus lib/shop.ts
// (dort per zod: cartItemSchema). Ohne zod und ohne server-only, damit Client-Komponenten ihn nutzen können.

export type CartPaper = "pink" | "gelb" | "rosa" | "tinte" | "gold";
export type CartFormat = "mail" | "print" | "premium";

export interface CartItem {
  /** Motiv-ID aus lib/catalog. */
  motif: string;
  paper: CartPaper;
  format: CartFormat;
  /** Geschenkbetrag in ganzen Euro, 10 bis 5.000. */
  amount: number;
  childName: string;
  message: string;
  sender: string;
  /** Nur E-Mail-Karten: Empfänger-Adresse. */
  recipientEmail?: string;
  /** Nur E-Mail-Karten: Wunschtermin als ISO-Zeitpunkt. */
  deliveryAt?: string;
  /** Wenn die Karte über eine Wunschseite gekauft wird. */
  wishSlug?: string;
}
