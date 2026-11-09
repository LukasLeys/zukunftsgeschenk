# Arbeitsregeln für die Seiten-Entwicklung (parallel)

Projekt: Next.js 15 App Router, TypeScript, eigenes CSS (kein Tailwind). Freigegebenes Design: `/home/user/entwuerfe/r5-1-auspacken.html` (Geschenkpapier, Pink #d81b6a / Gelb #ffd23f / Zartrosa / Tinte, Bricolage Grotesque + Figtree).

## Lesen vor dem Start
- `/home/user/PRODUCT.md` (Produktwahrheit), `/home/user/.impeccable/surfaces/zukunftsgeschenk-app-page-tsx.md` (Design-Vereinbarung)
- Qualitätsboden: `/root/.claude/plugins/synced/a676f9e4-1b3e-4827-8d6d-08d7c3fb8938_6ad2211b-b1b5-4278-95ef-1e9c902b7ce9/impeccable/skills/impeccable/reference/craft-floor.md`
- `src/app/globals.css` (Klassen-Index oben – NUR diese Klassen wiederverwenden), `src/app/page.tsx` (Startseite als Stilreferenz), `src/components/*` (Vertrag unten)
- Logik: `src/lib/catalog.ts` (MOTIFS, FORMATS, OCCASIONS, PRESET_AMOUNTS, formatEUR, xmasActive), `src/lib/calc.ts`, `src/lib/iban.ts` (isValidIban, formatIban – rein, auch im Client nutzbar), `src/lib/shop.ts` (server-only: getOrder, cardByCode, transferInfo, getWishPage, …), `src/lib/cart-types.ts` (CartItem für Client)
- API-Routen in `src/app/api/` (checkout, einloesen, ueberweisen/[token], wunschseite, karten/[code]/pdf, ueberweisen/[token]/qr, wunschseite/[slug]/qr). Die Fehlerantwort ist immer `{ error, field? }` mit Status 400/404.

## Komponenten-Vertrag (`src/components/`)
- `GiftCard` (Server, auch im Client nutzbar): `{ motif, paper, amount, childName, sender, message?, side?: "front"|"inside", envelope?: "none"|"white"|"gold", size?: "sm"|"md"|"lg", code?, qr?: ReactNode, badge?, label?, decorative?, className?, style? }`; Exporte `SHAPE_LABEL`, `PAPER_LABEL`, `paperSwatch(p)`, `EmblemArt`.
- `AmountPicker` (Client): `{ value, onChange, onErrorChange?, id?, legend?, min?, max?, presets?, customHint?, showErrors?, className? }`
- `cart/useCart()` (Client): `{ items, count, ready, add(item,{open?}), remove(i), clear(), isOpen, open(), close(), lastAdded }` – Typ `CartItem` aus `src/lib/cart-types.ts`.
- `calc/GiftCalculator` `{ id?, defaultAmount?, designHref? }`, `calc/DepotCalculator` `{ id?, defaultBirthYear?, defaultMonthly?, intro? }`, `calc/CalcTabs` `{ initial? }`
- `Torn` `{ as?, paper?: "pink"|"nacht"|"rosa"|"gelb"|"weiss", variant? }`, `Faq` `{ items, openIndex? }` + `FAQ_ITEMS`, `Countdown`, `Icon` `{ name }`, `format.ts`: `eur(x, dez)`, `eurCents(c)`, `showcase.ts` (Beispielbelegung je Motiv)

## Regeln
- **Texte (globale Kundenregel):** keine Gedankenstriche (– oder —) und keine KI-Floskeln, siehe `CLAUDE.md`.
- **Dateibesitz:** Bearbeite nur die Dateien deines Auftrags. `globals.css`, `layout.tsx`, `src/components/*` (bestehende) und `src/lib/*` NICHT ändern. Eigene Styles als CSS-Module neben der Seite (`page.module.css`) oder in `src/components/<dein-bereich>/`. Wenn du eine Änderung an geteilten Dateien brauchst: im Bericht beschreiben, nicht selbst machen.
- **Parallelbetrieb:** Starte nie `npm run build` ohne eigenes Verzeichnis. Nutze immer `NEXT_DIST_DIR=.next-<kürzel> PGLITE_DIR=.data/pglite-<kürzel> npx next dev -p <port>` bzw. `NEXT_DIST_DIR=.next-<kürzel> npx next build`. Typprüfung: `npx tsc --noEmit`. Tests: `npx vitest run` muss grün bleiben.
- **Design:** freigegebene Welt fortführen (Papier, Bänder, Anhänger, Zackenkanten sparsam), Fließtext ≥ 18 px, AA-Kontrast, sichtbarer Fokus, 390 px ohne Querscrollen, prefers-reduced-motion, deutsche Texte in österreichischer Sprache, „100 €“-Schreibweise (`eur()`).
- **Recht/Produkt:** Wir verkaufen nur die Karte; der Geschenkbetrag geht direkt an die Eltern. Keine Rendite-Versprechen, keine Fondsempfehlung, keine erfundenen Bewertungen/Siegel/Firmendaten. Karten sind unbefristet einlösbar.
- **Prüfen:** Dev-Server starten, mit Playwright (vorinstalliert) jede deiner Seiten bei 1440 und 390 px screenshotten nach `/home/user/.impeccable/review/app-<seite>-desktop.png`/`-mobile.png`, Konsole und Überlauf prüfen, Abläufe einmal per Skript durchspielen. Höchstens zwei Screenshot-Runden. Server danach beenden. Nichts committen.
