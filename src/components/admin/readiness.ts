import "server-only";
import { companyStatus } from "@/lib/company";
import { encryptionKeyStatus } from "@/lib/crypto";

// Startbereitschaft: prüft, ob alles für den Verkaufsstart gesetzt ist. Gibt nie geheime Werte aus,
// nur „gesetzt“ oder „fehlt“ und kurze Hinweise.

/** ok = erledigt, bad = fehlt und blockiert den Start, warn = empfohlen oder nur für Tests geeignet. */
export type CheckState = "ok" | "bad" | "warn";

export interface Check {
  id: string;
  label: string;
  /** Name der Umgebungsvariable. */
  env: string;
  state: CheckState;
  /** Kurzer Status, z. B. „gesetzt“ oder „Testschlüssel“. */
  status: string;
  hint: string;
}

export interface CheckGroup {
  title: string;
  checks: Check[];
}

const has = (name: string) => Boolean(process.env[name]?.trim());

function siteUrlCheck(): Check {
  const raw = process.env.SITE_URL?.trim();
  const base = { id: "site", label: "Öffentliche Adresse", env: "SITE_URL" };
  if (!raw) return { ...base, state: "bad", status: "fehlt", hint: "Ohne Wert zeigen Links in E-Mails und auf Karten auf localhost." };
  let url: URL | null = null;
  try {
    url = new URL(raw);
  } catch {
    url = null;
  }
  if (!url) return { ...base, state: "bad", status: "ungültig", hint: "Bitte eine vollständige Adresse mit https:// eintragen." };
  const local = ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(url.hostname);
  if (local) return { ...base, state: "bad", status: "localhost", hint: "Zeigt auf einen lokalen Rechner. Bitte die echte Domain eintragen." };
  if (url.protocol !== "https:") return { ...base, state: "bad", status: "ohne https", hint: "Die Adresse muss mit https:// beginnen." };
  return { ...base, state: "ok", status: url.host, hint: "Links in E-Mails, PDFs und QR-Codes zeigen hierher." };
}

function stripeKeyCheck(): Check {
  const k = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  const base = { id: "stripe", label: "Stripe-Schlüssel", env: "STRIPE_SECRET_KEY" };
  if (!k) return { ...base, state: "bad", status: "fehlt", hint: "Ohne Schlüssel läuft die Demo-Zahlung. Bestellungen gelten sofort als bezahlt." };
  if (/^(sk|rk)_live_/.test(k)) return { ...base, state: "ok", status: "Live-Schlüssel", hint: "Echte Zahlungen sind aktiv." };
  if (/^(sk|rk)_test_/.test(k))
    return { ...base, state: "warn", status: "Testschlüssel", hint: "Zahlungen laufen im Testmodus von Stripe. Zum Start den Live-Schlüssel eintragen." };
  return { ...base, state: "bad", status: "unbekanntes Format", hint: "Der Schlüssel beginnt weder mit sk_live_ noch mit sk_test_." };
}

function ibanKeyCheck(): Check {
  const st = encryptionKeyStatus();
  const base = { id: "iban", label: "Schlüssel für IBANs", env: "IBAN_ENCRYPTION_KEY" };
  if (st === "ok") return { ...base, state: "ok", status: "gesetzt", hint: "Nie mehr ändern, sonst lassen sich gespeicherte IBANs nicht mehr lesen." };
  if (st === "invalid") return { ...base, state: "bad", status: "falsche Länge", hint: "Muss 32 Byte in base64 sein: openssl rand -base64 32" };
  return { ...base, state: "bad", status: "fehlt", hint: "Ohne Schlüssel sind Einlösen und Wunschseiten gesperrt. Erzeugen mit openssl rand -base64 32" };
}

function adminCheck(): Check {
  const p = process.env.ADMIN_PASSWORD ?? "";
  const base = { id: "admin", label: "Admin-Passwort", env: "ADMIN_PASSWORD" };
  if (!p) return { ...base, state: "bad", status: "fehlt", hint: "Im Produktivbetrieb ist der Admin-Bereich ohne Passwort gesperrt." };
  if (p.length < 12) return { ...base, state: "warn", status: "kurz", hint: "Gesetzt, aber kürzer als 12 Zeichen. Bitte ein langes Passwort wählen." };
  return { ...base, state: "ok", status: "gesetzt", hint: "Schützt /admin mit Benutzer und Passwort." };
}

function simple(id: string, label: string, env: string, okHint: string, missingHint: string, missingState: CheckState = "bad", missingStatus = "fehlt"): Check {
  return has(env)
    ? { id, label, env, state: "ok", status: "gesetzt", hint: okHint }
    : { id, label, env, state: missingState, status: missingStatus, hint: missingHint };
}

export function readiness(): CheckGroup[] {
  const webhook = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  return [
    {
      title: "Betrieb",
      checks: [
        simple(
          "db",
          "Datenbank",
          "DATABASE_URL",
          "Postgres ist angebunden.",
          "Es läuft die Demo-Datenbank. Auf Vercel liegt sie in /tmp und verliert bei jedem Kaltstart alle Daten.",
        ),
        ibanKeyCheck(),
        adminCheck(),
        simple("cron", "Cron-Schutz", "CRON_SECRET", "Schützt /api/cron.", "Ohne Wert laufen geplante Mails und Löschfristen nicht."),
      ],
    },
    {
      title: "Zahlung",
      checks: [
        stripeKeyCheck(),
        webhook
          ? { id: "webhook", label: "Stripe-Webhook", env: "STRIPE_WEBHOOK_SECRET", state: webhook.startsWith("whsec_") ? "ok" : "warn", status: webhook.startsWith("whsec_") ? "gesetzt" : "unbekanntes Format", hint: "Webhook in Stripe auf /api/stripe/webhook zeigen lassen." }
          : { id: "webhook", label: "Stripe-Webhook", env: "STRIPE_WEBHOOK_SECRET", state: "bad", status: "fehlt", hint: "Ohne Webhook erfährt der Shop nicht sicher, dass bezahlt wurde." },
      ],
    },
    {
      title: "E-Mail",
      checks: [
        simple("resend", "Resend-Schlüssel", "RESEND_API_KEY", "E-Mails werden verschickt.", "Ohne Schlüssel landen Mails nur im Postausgang."),
        simple("from", "Absender", "MAIL_FROM", "Absender ist eingetragen.", "Es gilt der Standardabsender. Die Domain muss bei Resend bestätigt sein.", "warn", "Standardwert"),
      ],
    },
    {
      title: "Auftritt",
      checks: [
        siteUrlCheck(),
        process.env.ALLOW_INDEXING === "1"
          ? { id: "index", label: "Suchmaschinen", env: "ALLOW_INDEXING", state: "ok", status: "erlaubt", hint: "Seiten dürfen in Suchmaschinen erscheinen." }
          : { id: "index", label: "Suchmaschinen", env: "ALLOW_INDEXING", state: "warn", status: "gesperrt", hint: "Alle Seiten stehen auf noindex. Zum Start auf 1 setzen." },
      ],
    },
    {
      title: "Firmendaten",
      checks: companyStatus().map((f) => ({
        id: `company-${f.key}`,
        label: f.label,
        env: f.env,
        state: f.set ? "ok" : f.required ? "bad" : "warn",
        status: f.set ? "gesetzt" : f.required ? "fehlt" : "optional",
        hint: f.set ? "Erscheint in Impressum, AGB und Rechnungen." : f.required ? "Pflicht für Impressum und Rechnung." : "Nur nötig, wenn es auf euch zutrifft.",
      })),
    },
  ];
}

/** Zusammenfassung für die Übersicht. */
export function readinessSummary() {
  const all = readiness().flatMap((g) => g.checks);
  return {
    total: all.length,
    ok: all.filter((c) => c.state === "ok").length,
    bad: all.filter((c) => c.state === "bad").length,
    warn: all.filter((c) => c.state === "warn").length,
  };
}
