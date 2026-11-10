// Häufige Fragen für /faq: alle FAQ_ITEMS der Startseite plus Ergänzungen, nach Themen gruppiert.
// Antworten als reiner Text, damit Suche und FAQPage-JSON-LD denselben Inhalt nutzen.
import { FAQ_ITEMS } from "@/components/Faq";

export type FaqGroupId = "schenken" | "eltern" | "depot" | "bestellung" | "datenschutz";

export interface FaqEntry {
  id: string;
  q: string;
  a: string;
  link?: { href: string; label: string };
}

export interface FaqGroup {
  id: FaqGroupId;
  label: string;
  items: FaqEntry[];
}

const GROUP_LABEL: Record<FaqGroupId, string> = {
  schenken: "Fürs Schenken",
  eltern: "Für Eltern",
  depot: "Zum Zukunftsdepot",
  bestellung: "Bestellung & Versand",
  datenschutz: "Datenschutz",
};

/** Zuordnung der Startseiten-Fragen zu Themen. Unbekannte Fragen landen bei „Fürs Schenken“. */
const BASE_GROUP: Record<string, FaqGroupId> = {
  "Warum darf Oma nicht selbst einzahlen?": "schenken",
  "Geht das Geld über euch?": "schenken",
  "Wie lange gilt die Karte?": "schenken",
  "Gibt es Karten zur Erstkommunion und Firmung?": "schenken",
  "Was, wenn das Depot erst im Juli 2027 startet?": "eltern",
  "Was, wenn die Eltern noch kein Depot haben?": "eltern",
  "Wem gehört das Geld?": "depot",
  "Kostet das Depot etwas?": "depot",
  "Was kostet die Karte, was der Betrag?": "bestellung",
  "Kann die E-Mail-Karte zu einem bestimmten Zeitpunkt ankommen?": "bestellung",
};

const EXTRA: (Omit<FaqEntry, "id"> & { group: FaqGroupId })[] = [
  // Fürs Schenken
  {
    group: "schenken",
    q: "Wie viel kann ich schenken?",
    a: "Du wählst den Betrag selbst, von 10 € bis 5.000 €. Die Eltern dürfen laut Entwurf aber höchstens 5.000 € pro Kind und Jahr ins Depot einzahlen. Das gilt für alle Geschenke und eigene Einzahlungen zusammen.",
  },
  {
    group: "schenken",
    q: "Muss ich die IBAN der Eltern kennen?",
    a: "Nein. Die Eltern geben ihre IBAN beim Einlösen selbst ein. Danach bekommst du den Bank-QR-Code per E-Mail. Kennst du die IBAN schon, kann der QR-Code auch gleich in die Karte.",
    link: { href: "/so-funktionierts#varianten", label: "Die zwei weiteren Wege" },
  },
  {
    group: "schenken",
    q: "Kann ich auch einem älteren Kind etwas schenken?",
    a: "Ja. Das Zukunftsdepot ist laut Entwurf für alle Kinder unter 18 Jahren gedacht. Den Startbonus von 500 € gibt es aber nur für die Geburtsjahrgänge 2027 und 2028.",
  },
  // Für Eltern
  {
    group: "eltern",
    q: "Wie lösen wir die Karte ein?",
    a: "In der Karte stehen ein Einlösecode und ein QR-Code. Damit öffnet ihr unsere Einlöseseite. Dort tragt ihr euren Namen, eure E-Mail-Adresse und eure IBAN ein. Die schenkende Person bekommt dann einen Bank-QR-Code und überweist direkt an euch.",
    link: { href: "/einloesen", label: "Zur Einlöseseite" },
  },
  {
    group: "eltern",
    q: "Was ist eine Wunschseite?",
    a: "Eine eigene Seite für euer Kind, die ihr mit Familie und Freunden teilt. Ihr hinterlegt einmal eure IBAN. Wer über die Wunschseite schenkt, kann gleich danach überweisen. Die IBAN steckt im Bank-QR-Code, teilt den Link also nur mit Menschen, denen ihr vertraut.",
    link: { href: "/wunschseite", label: "Wunschseite anlegen" },
  },
  {
    group: "eltern",
    q: "Bekommt unser Kind den Startbonus?",
    a: "Laut Entwurf bekommen Kinder der Geburtsjahrgänge 2027 und 2028 einmalig 500 €. Voraussetzung sind ein Wohnsitz in Österreich und die Staatsbürgerschaft oder ein gleichgestellter Aufenthaltstitel. Lebt das Kind nicht 15 Jahre bis zur Volljährigkeit in Österreich, wird der Bonus zurückgefordert.",
  },
  {
    group: "eltern",
    q: "Prüft ihr, ob wir das Geld ins Depot einzahlen?",
    a: "Nein. Das Geld liegt auf eurem Konto, und nur ihr könnt es ins Zukunftsdepot einzahlen. Die Schenkenden haben es dafür gedacht und vertrauen darauf, dass ihr es für euer Kind anlegt.",
  },
  // Zum Zukunftsdepot
  {
    group: "depot",
    q: "Ab wann gibt es das Zukunftsdepot?",
    a: "Das Zukunftsdepot startet voraussichtlich ab Juli 2027. Laut Entwurf ist der 1. Juli 2027 geplant, eine Verschiebung bis 1. Dezember 2027 ist möglich. Derzeit ist das Zukunftsdepot ein Gesetzesentwurf (157/ME) und noch nicht beschlossen.",
    link: { href: "/zukunftsdepot", label: "Mehr zum Zukunftsdepot" },
  },
  {
    group: "depot",
    q: "Worin wird das Geld angelegt?",
    a: "Laut Entwurf nur in Fonds und ETFs nach der UCITS-Richtlinie mit Risikoklasse 1 bis 5 und laufenden Kosten von höchstens 1 % pro Jahr. Alternativ im Bundesschatz. Einzelaktien, Kryptowerte und Hebelprodukte sind nicht erlaubt. Wir empfehlen keine Fonds.",
  },
  {
    group: "depot",
    q: "Was passiert mit 18?",
    a: "Bis zum 18. Geburtstag ist das Depot gesperrt. Danach verfügt das Kind selbst über das Geld. Vorher ist eine Entnahme nur in Ausnahmefällen mit Zustimmung des Gerichts möglich, dann ohne Steuervorteil.",
  },
  {
    group: "depot",
    q: "Ist Zukunftsgeschenk ein offizielles Angebot?",
    a: "Nein. Zukunftsgeschenk ist ein privates Angebot. Es ist kein Angebot der Republik Österreich oder einer Partei. Wir verkaufen Geschenkkarten und geben keine Anlageberatung.",
  },
  // Bestellung & Versand
  {
    group: "bestellung",
    q: "Wie kann ich bezahlen?",
    a: "Mit Kreditkarte, Apple Pay, Google Pay oder EPS. Die Zahlung läuft über den Zahlungsdienst Stripe. Du bezahlst dabei nur den Kartenpreis.",
  },
  {
    group: "bestellung",
    q: "Wohin verschickt ihr gedruckte Karten?",
    a: "Gedruckte Karten verschicken wir per Post innerhalb Österreichs. Die E-Mail-Karte kann an jede E-Mail-Adresse gehen. Für Weihnachten empfehlen wir, gedruckte Karten bis 17. Dezember zu bestellen.",
  },
  {
    group: "bestellung",
    q: "Kann ich meine Bestellung widerrufen?",
    a: "Unsere Karten werden mit Name, Betrag und Botschaft für dich persönlich gestaltet. Für gedruckte Karten gibt es deshalb laut Gesetz kein Rücktrittsrecht. Bei E-Mail-Karten erlischt es, wenn du in der Kasse zustimmst, dass wir die Karte sofort erstellen und zum gewählten Termin versenden. Hat sich ein Fehler eingeschlichen, melde dich bitte rasch bei uns.",
    link: { href: "/widerruf", label: "Widerrufsbelehrung" },
  },
  // Datenschutz
  {
    group: "datenschutz",
    q: "Was passiert mit der IBAN der Eltern?",
    a: "Wir speichern die IBAN verschlüsselt und verwenden sie nur für den Bank-QR-Code. 90 Tage nach dem Einlösen löschen wir sie.",
    link: { href: "/datenschutz", label: "Datenschutzerklärung" },
  },
  {
    group: "datenschutz",
    q: "Verwendet ihr Cookies?",
    a: "Nein. Wir setzen keine Cookies und keine Analysedienste ein. Den Warenkorb speichert dein Browser auf deinem Gerät.",
  },
  {
    group: "datenschutz",
    q: "Wer sieht, was auf der Karte steht?",
    a: "Die Karte sehen du, die beschenkte Familie und wir. Für gedruckte Karten bekommt unsere Druckerei den Karteninhalt und die Lieferadresse. E-Mails verschicken wir über einen E-Mail-Dienst.",
    link: { href: "/datenschutz", label: "Datenschutzerklärung" },
  },
];

const slug = (q: string) =>
  q
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/** Text aus einer Antwort der Startseite (dort meist ein String). */
const plain = (a: unknown): string => (typeof a === "string" ? a : "");

export function faqGroups(): FaqGroup[] {
  const groups: FaqGroup[] = (Object.keys(GROUP_LABEL) as FaqGroupId[]).map((id) => ({ id, label: GROUP_LABEL[id], items: [] }));
  const byId = new Map(groups.map((g) => [g.id, g]));
  for (const it of FAQ_ITEMS) {
    const a = plain(it.a);
    if (!a) continue;
    byId.get(BASE_GROUP[it.q] ?? "schenken")!.items.push({ id: slug(it.q), q: it.q, a });
  }
  for (const { group, ...e } of EXTRA) byId.get(group)!.items.push({ id: slug(e.q), ...e });
  return groups;
}
