import "server-only";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

// Produktion: Postgres über DATABASE_URL (z. B. Neon/Supabase, Region EU).
// Entwicklung: PGlite (Postgres als WASM) mit Dateispeicher unter .data/pglite.

const BOOT_SQL = `
CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(), status text NOT NULL DEFAULT 'pending',
  buyer_name text NOT NULL, buyer_email text NOT NULL, total_cents integer NOT NULL, access_token text NOT NULL,
  stripe_session_id text, invoice_number text, shipping jsonb, paid_at timestamptz);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS digital_consent boolean;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at timestamptz;
CREATE TABLE IF NOT EXISTS cards (
  id text PRIMARY KEY, order_id text NOT NULL, code text NOT NULL UNIQUE, motif text NOT NULL, paper text NOT NULL,
  format text NOT NULL, price_cents integer NOT NULL, amount_cents integer NOT NULL, child_name text NOT NULL,
  message text NOT NULL DEFAULT '', sender text NOT NULL, delivery_at timestamptz, recipient_email text,
  gold_envelope boolean NOT NULL DEFAULT false, wish_slug text, status text NOT NULL DEFAULT 'issued',
  parent_name text, parent_email text, iban_enc text, pay_token text, redeemed_at timestamptz,
  transferred_at timestamptz, shipped_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS cards_order_idx ON cards(order_id);
CREATE INDEX IF NOT EXISTS cards_pay_token_idx ON cards(pay_token);
CREATE INDEX IF NOT EXISTS orders_payment_intent_idx ON orders(stripe_payment_intent);
CREATE TABLE IF NOT EXISTS wish_pages (
  slug text PRIMARY KEY, child_name text NOT NULL, parent_name text NOT NULL, parent_email text NOT NULL,
  message text NOT NULL DEFAULT '', occasion text NOT NULL DEFAULT 'weihnachten', iban_enc text NOT NULL,
  edit_token text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS outbox (
  id text PRIMARY KEY, to_addr text NOT NULL, subject text NOT NULL, html text NOT NULL, text_body text NOT NULL,
  send_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1001;
`;

type DB = Awaited<ReturnType<typeof create>>;

async function create() {
  if (process.env.DATABASE_URL) {
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const postgres = (await import("postgres")).default;
    const client = postgres(process.env.DATABASE_URL, { max: 5, prepare: false });
    const db = drizzle(client, { schema });
    await db.execute(sql.raw(BOOT_SQL));
    return db as unknown as ReturnType<typeof import("drizzle-orm/pglite").drizzle<typeof schema>>;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  // Auf Vercel ohne DATABASE_URL: flüchtige Demo-Datenbank in /tmp (Daten gehen bei jedem Kaltstart verloren).
  const dir = process.env.PGLITE_DIR ?? (process.env.VERCEL ? "/tmp/pglite" : ".data/pglite");
  const client = dir === "memory" ? new PGlite() : new PGlite(dir);
  const db = drizzle(client, { schema });
  await client.exec(BOOT_SQL);
  return db;
}

const g = globalThis as unknown as { __zgDb?: Promise<DB> };
export function db(): Promise<DB> {
  if (!g.__zgDb) g.__zgDb = create();
  return g.__zgDb;
}

export { schema };
