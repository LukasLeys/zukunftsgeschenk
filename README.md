# Zukunftsgeschenk

Online-Shop für Geschenkkarten fürs österreichische Zukunftsdepot. Schenkende kaufen eine gestaltete Karte, das Geschenkgeld überweisen sie per Bank-QR-Code direkt an die Eltern. Der Shop nimmt nie Geschenkgeld an.

## Funktionen

- Kartenshop mit 50 Motiven für zehn Anlässe (darunter 10 zu Aktien und Geld), Konfigurator mit Live-Vorschau, Warenkorb, Kasse (Stripe Checkout, ohne Schlüssel Demo-Zahlung)
- Zustellung als PDF per E-Mail (sofort oder zum Wunschtermin), gedruckt mit Kuvert oder Premium mit Goldkuvert
- Einlösen für Eltern (Code und IBAN), Überweisungsseite mit EPC-QR-Code für Schenkende, Variante „IBAN bekannt“
- Wunschseite für Eltern mit Link für die Familie
- Gutschein-Rechner und Depot-Rechner, Infoseiten, FAQ, Vorlagen für Impressum, AGB, Datenschutz und Widerruf
- Admin unter `/admin`: Übersicht, Bestellungen, Karten, Druckaufträge mit CSV, Postausgang

## Lokal starten

```bash
npm install
npm run dev
```

Ohne `DATABASE_URL` nutzt der Shop eine lokale PGlite-Datenbank unter `.data/pglite`. Ohne Stripe- und Resend-Schlüssel laufen Zahlung und E-Mail im Demo-Modus. Admin lokal: Benutzer `admin`, Passwort `admin`.

```bash
npx vitest run
```

## Umgebungsvariablen

Siehe `.env.example`. Für den Betrieb nötig:

| Variable | Zweck |
|---|---|
| `DATABASE_URL` | Postgres in der EU, z. B. Neon über Vercel |
| `IBAN_ENCRYPTION_KEY` | 32 Byte base64 (`openssl rand -base64 32`), nie mehr ändern |
| `ADMIN_PASSWORD` | Passwort für `/admin` |
| `CRON_SECRET` | schützt `/api/cron` (Mailversand zum Wunschtermin, Löschfristen) |
| `SITE_URL` | öffentliche Adresse des Shops |
| `ALLOW_INDEXING` | `1` erlaubt Suchmaschinen. Ohne den Wert steht auf allen Seiten noindex. Vorschaubilder für WhatsApp und Co. funktionieren in beiden Fällen. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Zahlung; Webhook auf `/api/stripe/webhook` |
| `RESEND_API_KEY`, `MAIL_FROM` | E-Mail-Versand. Ohne Schlüssel bleiben Mails im Postausgang (Demo). |
| `MAIL_REPLY_TO` | Antwortadresse der Mails. Ohne den Wert gilt `COMPANY_EMAIL`. |

## Deployment

Vercel, Region Frankfurt (`vercel.json`), Cron alle 15 Minuten auf `/api/cron`.

## Vor dem Start

Rechtstexte enthalten markierte Platzhalter und müssen von einer Kanzlei geprüft werden. Fakten zum Zukunftsdepot beruhen auf dem Ministerialentwurf 157/ME (Stand November 2026).

## Verkaufsstart: Einstellungen in Vercel

Die Admin-Seite `/admin/start` zeigt live, was noch fehlt. Werte nie ins Repository schreiben.

**Betrieb (geheim):** `DATABASE_URL` (Neon), `IBAN_ENCRYPTION_KEY` (32 Bytes, Base64), `ADMIN_PASSWORD`, `CRON_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`.

**Betrieb (öffentlich):** `SITE_URL`, `MAIL_FROM`, `MAIL_REPLY_TO`, `ALLOW_INDEXING=1` zum Start, `LEGAL_REVIEWED=1` nach Prüfung durch die Kanzlei.

**Firmendaten (Pflicht):** `COMPANY_NAME`, `COMPANY_LEGAL_FORM`, `COMPANY_STREET`, `COMPANY_ZIP_CITY`, `COMPANY_EMAIL`, `COMPANY_MANAGER`, `COMPANY_UID`, `COMPANY_TRADE`, `COMPANY_AUTHORITY`, `COMPANY_PRINT_SHOP`, `COMPANY_DELIVERY_DAYS`, `COMPANY_LEGAL_DATE`.

**Firmendaten (optional):** `COMPANY_PHONE`, `COMPANY_FN`, `COMPANY_FB_COURT`, `COMPANY_SEAT`, `COMPANY_CHAMBER`, `COMPANY_CHAMBER_GROUP`, `COMPANY_OWNERS`, `COMPANY_PRIVACY_EMAIL`, `COMPANY_DPO`.

**Stripe-Dashboard:** Zahlungsarten Karten, EPS, Apple Pay und Google Pay aktivieren. Webhook auf `https://<domain>/api/stripe/webhook` mit API-Version `2025-08-27.basil` und den Ereignissen `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`.

**Ende-zu-Ende-Test:** Server im Produktionsmodus starten und `E2E_BASE=http://localhost:3060 npm run test:e2e` ausführen. Der Test kauft eine Karte, lädt die Rechnung, löst ein und legt eine Wunschseite an, am Desktop und am Handy.
