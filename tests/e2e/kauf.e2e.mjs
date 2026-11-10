// Ende-zu-Ende-Test im echten Browser: Kauf, Rechnung, Einlösen, Überweisen, Wunschseite.
// Aufruf: E2E_BASE=http://localhost:3060 node tests/e2e/kauf.e2e.mjs
// Der Server läuft im Produktionsmodus ohne Stripe-Schlüssel (Demo-Zahlung) und mit gesetztem IBAN_ENCRYPTION_KEY.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
// Playwright ist in der Umgebung global installiert, nicht als Projektabhängigkeit.
const { chromium, devices } = require("playwright");

const BASE = process.env.E2E_BASE ?? "http://localhost:3060";
const OUT = process.env.E2E_OUT ?? ".";
const ok = (cond, msg) => { if (!cond) throw new Error("FEHLER: " + msg); console.log("ok  " + msg); };

for (const [name, dev] of [["desktop", { viewport: { width: 1440, height: 900 } }], ["handy", devices["iPhone 13"]]]) {
  console.log(`\n== ${name}`);
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...dev, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error" && !/404/.test(m.text())) errors.push(m.text()); });

  // 1. Karte gestalten und in den Warenkorb
  await p.goto(`${BASE}/karten/stier`, { waitUntil: "networkidle" });
  await p.fill("#cfg-name", "Lena");
  await p.fill("#cfg-from", "Oma Gerti");
  await p.locator("#cfgForm button[type=submit]").first().click();
  await p.waitForTimeout(800);
  // 2. Kasse
  await p.goto(`${BASE}/kasse`, { waitUntil: "networkidle" });
  ok(await p.locator("text=Börsenstier").count() > 0, "Karte liegt im Warenkorb");
  await p.fill("#k-name", "Gerti Muster");
  await p.fill("#k-email", "oma@example.at");
  if (await p.locator("#k-sname").count()) {
    await p.fill("#k-sname", "Anna Muster");
    await p.fill("#k-street", "Hauptstraße 1");
    await p.fill("#k-zip", "1010");
    await p.fill("#k-city", "Wien");
  }
  await p.check("#k-terms");
  if (await p.locator("#k-digital").count()) await p.check("#k-digital");
  await p.locator("button:has-text('Zahlungspflichtig bestellen')").click();
  await p.waitForURL(/\/bestellung\//, { timeout: 20000 });
  await p.waitForLoadState("networkidle");
  ok(/\/bestellung\/.+\?t=/.test(p.url()), "Weiterleitung zur Bestellseite");
  await p.screenshot({ path: `${OUT}/e2e-${name}-bestellung.png`, fullPage: true });
  const html = await p.content();
  const code = (html.match(/ZG-(?!\d{4}-)[A-Z0-9]{4}-[A-Z0-9]{4}/) || [])[0];
  ok(!!code, `Einlösecode angezeigt (${code})`);
  // 3. Rechnung
  const inv = p.locator("a[href*='/rechnung']").first();
  ok(await inv.count() > 0, "Link zur Rechnung vorhanden");
  const res = await p.request.get(new URL(await inv.getAttribute("href"), BASE).toString());
  ok(res.status() === 200 && (res.headers()["content-type"] || "").includes("pdf"), "Rechnung als PDF abrufbar");
  // 4. Eltern lösen ein
  await p.goto(`${BASE}/einloesen`, { waitUntil: "networkidle" });
  await p.locator("input[id$='code'], input[name='code']").first().fill(code);
  await p.locator("button:has-text('Code prüfen')").click();
  await p.waitForTimeout(1200);
  await p.locator("input[autocomplete='name'], input[id*='name']").first().fill("Anna Muster");
  await p.locator("input[type='email']").first().fill("anna@example.at");
  await p.locator("input[id*='iban']").first().fill("AT61 1904 3002 3457 3201");
  const consent = p.locator("form input[type='checkbox']");
  for (let i = 0; i < await consent.count(); i++) await consent.nth(i).check();
  await p.locator("form button[type=submit]").last().click();
  await p.waitForTimeout(2000);
  await p.screenshot({ path: `${OUT}/e2e-${name}-eingeloest.png`, fullPage: true });
  ok(/eingelöst|Danke|geschafft/i.test(await p.content()), "Karte eingelöst");
  // 5. Wunschseite anlegen
  await p.goto(`${BASE}/wunschseite`, { waitUntil: "networkidle" });
  await p.fill("#w-childName", "Emma");
  await p.fill("#w-parentName", "Anna Muster");
  await p.fill("#w-parentEmail", "anna@example.at");
  await p.fill("#w-iban", "AT611904300234573201");
  await p.check("#w-consent");
  await p.locator("form button[type=submit]").last().click();
  await p.waitForURL(/\/fuer\//, { timeout: 15000 }).catch(() => {});
  ok(/\/fuer\//.test(p.url()), "Wunschseite angelegt");
  await p.screenshot({ path: `${OUT}/e2e-${name}-wunschseite.png`, fullPage: true });
  ok(errors.length === 0, `keine Fehler in der Konsole ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ""}`);
  await b.close();
}
console.log("\nAlle Schritte bestanden.");
