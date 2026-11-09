import { pgTable, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("pending"), // pending | paid | cancelled
  buyerName: text("buyer_name").notNull(),
  buyerEmail: text("buyer_email").notNull(),
  totalCents: integer("total_cents").notNull(),
  accessToken: text("access_token").notNull(), // Zugriff auf Bestellseite/PDFs
  stripeSessionId: text("stripe_session_id"),
  invoiceNumber: text("invoice_number"),
  shipping: jsonb("shipping").$type<ShippingAddress | null>(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export const cards = pgTable("cards", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  code: text("code").notNull().unique(), // Einlösecode ZG-XXXX-XXXX
  motif: text("motif").notNull(),
  paper: text("paper").notNull(),
  format: text("format").notNull(), // mail | print | premium
  priceCents: integer("price_cents").notNull(),
  amountCents: integer("amount_cents").notNull(), // Geschenkbetrag (geht direkt an die Eltern)
  childName: text("child_name").notNull(),
  message: text("message").notNull().default(""),
  sender: text("sender").notNull(),
  deliveryAt: timestamp("delivery_at", { withTimezone: true }), // nur E-Mail-Karten
  recipientEmail: text("recipient_email"),
  goldEnvelope: boolean("gold_envelope").notNull().default(false),
  wishSlug: text("wish_slug"),
  status: text("status").notNull().default("issued"), // issued | redeemed | transferred
  // Eltern beim Einlösen (oder bekannt über Wunschseite / Schenkende)
  parentName: text("parent_name"),
  parentEmail: text("parent_email"),
  ibanEnc: text("iban_enc"),
  payToken: text("pay_token"), // Link für Schenkende zur Überweisungsseite
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
  transferredAt: timestamp("transferred_at", { withTimezone: true }),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const wishPages = pgTable("wish_pages", {
  slug: text("slug").primaryKey(),
  childName: text("child_name").notNull(),
  parentName: text("parent_name").notNull(),
  parentEmail: text("parent_email").notNull(),
  message: text("message").notNull().default(""),
  occasion: text("occasion").notNull().default("weihnachten"),
  ibanEnc: text("iban_enc").notNull(),
  editToken: text("edit_token").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const outbox = pgTable("outbox", {
  id: text("id").primaryKey(),
  to: text("to_addr").notNull(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  text: text("text_body").notNull(),
  sendAt: timestamp("send_at", { withTimezone: true }).notNull().defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export interface ShippingAddress {
  name: string;
  street: string;
  zip: string;
  city: string;
  country: "AT";
}

export type Order = typeof orders.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type WishPage = typeof wishPages.$inferSelect;
