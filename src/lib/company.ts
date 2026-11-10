// Firmendaten an einer Stelle. Werte kommen aus Umgebungsvariablen (Vercel), damit Impressum, AGB,
// Datenschutz, E-Mails und Rechnungen ohne Codeänderung echt werden. Fehlt ein Wert, zeigen die
// Rechtsseiten einen markierten Platzhalter, und die Startbereitschaft im Admin listet ihn als offen.

export interface CompanyField {
  /** Name der Umgebungsvariable. */
  env: string;
  /** Beschriftung, auch Text des Platzhalters. */
  label: string;
  /** Pflicht für den Verkaufsstart (Impressum, Rechnung). */
  required: boolean;
}

export const COMPANY_FIELDS = {
  name: { env: "COMPANY_NAME", label: "Firmenname", required: true },
  form: { env: "COMPANY_LEGAL_FORM", label: "Rechtsform", required: true },
  street: { env: "COMPANY_STREET", label: "Straße und Hausnummer", required: true },
  zipCity: { env: "COMPANY_ZIP_CITY", label: "PLZ und Ort", required: true },
  email: { env: "COMPANY_EMAIL", label: "E-Mail-Adresse", required: true },
  phone: { env: "COMPANY_PHONE", label: "Telefonnummer", required: false },
  manager: { env: "COMPANY_MANAGER", label: "Name der Geschäftsführung", required: true },
  uid: { env: "COMPANY_UID", label: "UID-Nummer", required: true },
  fn: { env: "COMPANY_FN", label: "Firmenbuchnummer", required: false },
  fbCourt: { env: "COMPANY_FB_COURT", label: "Firmenbuchgericht", required: false },
  seat: { env: "COMPANY_SEAT", label: "Sitz der Gesellschaft", required: false },
  trade: { env: "COMPANY_TRADE", label: "Gewerbewortlaut", required: true },
  authority: { env: "COMPANY_AUTHORITY", label: "Gewerbebehörde", required: true },
  chamber: { env: "COMPANY_CHAMBER", label: "Wirtschaftskammer", required: false },
} as const satisfies Record<string, CompanyField>;

export type CompanyKey = keyof typeof COMPANY_FIELDS;

/** Wert eines Firmenfelds oder null, wenn nicht gesetzt. */
export function companyValue(key: CompanyKey): string | null {
  const v = process.env[COMPANY_FIELDS[key].env]?.trim();
  return v ? v : null;
}

/** Alle Firmenfelder mit Status, für die Startbereitschaft. Gibt nie geheime Werte aus, Firmendaten sind öffentlich. */
export function companyStatus() {
  return (Object.keys(COMPANY_FIELDS) as CompanyKey[]).map((k) => ({
    key: k,
    ...COMPANY_FIELDS[k],
    set: companyValue(k) !== null,
  }));
}

/** Anschrift in einer Zeile oder null. */
export function companyAddress(): string | null {
  const s = companyValue("street");
  const z = companyValue("zipCity");
  return s && z ? `${s}, ${z}, Österreich` : null;
}
