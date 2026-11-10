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
