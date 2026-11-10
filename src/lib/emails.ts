import "server-only";
import { SITE_URL } from "./env";
import { formatEUR, formatById, motifById } from "./catalog";
import { companyAddress, companyValue, COMPANY_FIELDS, type CompanyKey } from "./company";
import { invoiceUrl, orderUrl } from "./links";
import { formatVienna } from "../components/shop/datetime";
import type { Card, Order } from "./db/schema";

// Schlichte, robuste Mails im Markenstil: HTML mit Tabellenlayout und Inline-Styles, dazu immer ein Textteil
// mit demselben Inhalt. Beides entsteht aus denselben Bausteinen, damit nichts auseinanderläuft.
// Ansprache: Schenkende mit du, Eltern mit ihr (wie auf der Website).

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const eur = (c: number) => formatEUR(c, { cents: true, decimals: c % 100 !== 0 });
const LINK = "color:#b3124f";
const host = SITE_URL.replace(/^https?:\/\//, "");

// Bausteine
type Seg = string | { b: string } | { a: string; href: string };
type Block =
  | { p: Seg[]; small?: boolean }
  | { btn: string; href: string }
  | { quote: string }
  | { list: Seg[][] };

const b = (s: string): Seg => ({ b: s });
const a = (label: string, href: string): Seg => ({ a: label, href });
const p = (...segs: Seg[]): Block => ({ p: segs });
const small = (...segs: Seg[]): Block => ({ p: segs, small: true });
const btn = (label: string, href: string): Block => ({ btn: label, href });

const segHtml = (s: Seg) => (typeof s === "string" ? esc(s) : "b" in s ? `<b>${esc(s.b)}</b>` : `<a href="${esc(s.href)}" style="${LINK}">${esc(s.a)}</a>`);
const segText = (s: Seg) => (typeof s === "string" ? s : "b" in s ? s.b : s.a === s.href ? s.href : `${s.a} (${s.href})`);

function blockHtml(x: Block) {
  if ("p" in x) return `<p${x.small ? ` style="font-size:14px;color:#5b4a5c"` : ""}>${x.p.map(segHtml).join("")}</p>`;
  if ("btn" in x)
    return `<p style="margin:22px 0"><a href="${esc(x.href)}" style="background:#d81b6a;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:999px;display:inline-block">${esc(x.btn)}</a></p>`;
  if ("quote" in x) return `<p style="border-left:3px solid #ffd23f;padding-left:12px;font-style:italic">${esc(x.quote)}</p>`;
  return `<ul style="padding-left:20px">${x.list.map((li) => `<li style="margin:0 0 8px">${li.map(segHtml).join("")}</li>`).join("")}</ul>`;
}
function blockText(x: Block) {
  if ("p" in x) return x.p.map(segText).join("");
  if ("btn" in x) return `${x.btn}: ${x.href}`;
  if ("quote" in x) return `„${x.quote}“`;
  return x.list.map((li) => `* ${li.map(segText).join("")}`).join("\n");
}

/** Firmenwert oder markierter Platzhalter wie „[UID-Nummer]“. */
const co = (k: CompanyKey) => companyValue(k) ?? `[${COMPANY_FIELDS[k].label}]`;

/** Fußzeile mit Firmendaten, als Zeilen. Fehlende Werte erscheinen als Platzhalter in eckigen Klammern. */
export function footerLines() {
  const name = companyValue("name"), form = companyValue("form");
  const seller = name && form && name.includes(form) ? name : `${co("name")} ${co("form")}`;
  const fn = companyValue("fn");
  return [
    `Zukunftsgeschenk ist ein Angebot von ${seller}, ${companyAddress() ?? `${co("street")}, ${co("zipCity")}, Österreich`}.`,
    `UID ${co("uid")}${fn ? `, FN ${fn}${companyValue("fbCourt") ? `, ${companyValue("fbCourt")}` : ""}` : ""}. Fragen an uns: ${co("email")}.`,
    "Privates Angebot. Kein offizielles Angebot der Republik Österreich oder einer Partei. Die Einzahlung ins Zukunftsdepot erfolgt durch die Eltern. Keine Anlageberatung.",
  ];
}

export interface MailContent { subject: string; html: string; text: string }

function mail(subject: string, title: string, blocks: Block[]): MailContent {
  const foot = footerLines();
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;background:#fff2f7;font-family:Figtree,Arial,sans-serif;color:#2a1f2d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff2f7"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:#d81b6a;padding:18px 24px;color:#ffffff;font-weight:800;font-size:18px">Zukunftsgeschenk</td></tr>
<tr><td style="padding:28px 24px 8px;font-size:17px;line-height:1.55">
<h1 style="font-size:24px;line-height:1.2;margin:0 0 14px">${esc(title)}</h1>
${blocks.map(blockHtml).join("\n")}</td></tr>
<tr><td style="padding:18px 24px 26px;font-size:12px;line-height:1.5;color:#5b4a5c;border-top:1px solid #f1dde6">
${foot.map(esc).join("<br>")}<br>
<a href="${SITE_URL}/impressum" style="${LINK}">Impressum</a> · <a href="${SITE_URL}/agb" style="${LINK}">AGB</a> · <a href="${SITE_URL}/datenschutz" style="${LINK}">Datenschutz</a>
</td></tr></table></td></tr></table></body></html>`;
  const text = [title, "", ...blocks.map(blockText).flatMap((t) => [t, ""]), "--", ...foot, `Impressum: ${SITE_URL}/impressum`, `Datenschutz: ${SITE_URL}/datenschutz`].join("\n");
  return { subject, html, text };
}

const transferUrl = (c: Card) => `${SITE_URL}/ueberweisen/${c.payToken}`;
/** Bankverbindung schon beim Kauf bekannt: Der Bank-QR-Code steht auf der Karte. */
const qrNow = (c: Card) => Boolean(c.ibanEnc && c.payToken && c.status === "issued");

function cardLine(c: Card): Seg[] {
  const segs: Seg[] = [
    b(motifById(c.motif)?.name ?? c.motif), ` für ${c.childName}. ${formatById(c.format)?.label ?? c.format}, ${eur(c.priceCents)}. Geschenkbetrag ${eur(c.amountCents)} an die Eltern.`,
  ];
  if (c.format === "mail" && c.recipientEmail) segs.push(` Die Karte geht ${c.deliveryAt ? `am ${formatVienna(c.deliveryAt)}` : "gleich"} an ${c.recipientEmail}.`);
  if (c.format !== "mail") segs.push(" Wir drucken die Karte und schicken sie per Post.");
  if (qrNow(c)) segs.push(" Bank-QR-Code ist auf der Karte. ", a(`Jetzt ${eur(c.amountCents)} überweisen`, transferUrl(c)));
  return segs;
}

export function orderConfirmation(order: Order, cards: Card[]) {
  const url = orderUrl(order);
  const waiting = cards.some((c) => !qrNow(c));
  const blocks: Block[] = [
    p(`Hallo ${order.buyerName},`),
    p("deine Karten sind bestellt und bezahlt. Bezahlt hast du nur die Karten: ", b(eur(order.totalCents)), " inkl. 20 % USt. Den Geschenkbetrag überweist du später selbst, direkt an die Eltern."),
    { list: cards.map(cardLine) },
    btn("Bestellung ansehen und Karten laden", url),
  ];
  if (order.invoiceNumber) blocks.push(p(a(`Rechnung ${order.invoiceNumber} als PDF laden`, invoiceUrl(order))));
  if (waiting) blocks.push(small("Sobald die Eltern eine Karte einlösen, bekommst du den Bank-QR-Code zum Überweisen per E-Mail."));
  if (order.digitalConsent)
    blocks.push(small("Du hast zugestimmt, dass wir die digitale Karte sofort erstellen und zum gewählten Termin versenden. Damit ist dein Rücktrittsrecht für E-Mail-Karten erloschen (§ 18 Abs. 1 Z 11 FAGG)."));
  const subject = order.invoiceNumber ? `Deine Bestellung ${order.invoiceNumber} bei Zukunftsgeschenk` : "Deine Bestellung bei Zukunftsgeschenk";
  return mail(subject, "Danke für deine Bestellung!", blocks);
}

export function cardDelivery(card: Card) {
  const url = `${SITE_URL}/karte/${card.code}`;
  const blocks: Block[] = [p(`${card.sender} schenkt ${card.childName} `, b(eur(card.amountCents)), " fürs Zukunftsdepot.")];
  if (card.message) blocks.push({ quote: card.message });
  blocks.push(btn("Karte öffnen", url));
  blocks.push(
    card.ibanEnc
      ? p("Liebe Eltern, eure Bankverbindung ist bei dieser Karte schon hinterlegt. Ihr müsst nichts einlösen. Das Geld kommt direkt von den Schenkenden auf euer Konto.")
      : p("Liebe Eltern, mit dem Code ", b(card.code), " löst ihr die Karte unter ", a(`${host}/einloesen`, `${SITE_URL}/einloesen?code=${card.code}`), " ein und gebt eure IBAN an. Das Geld kommt dann direkt von den Schenkenden auf euer Konto. Die Karte ist unbefristet einlösbar."),
  );
  return mail(`${card.sender} schenkt ${card.childName} ein Stück Zukunft`, `Ein Zukunftsgeschenk für ${card.childName}`, blocks);
}

export function redeemedToGiver(card: Card, buyerName: string) {
  const url = transferUrl(card);
  return mail(`Eingelöst: Jetzt ${eur(card.amountCents)} für ${card.childName} überweisen`, "Die Karte wurde eingelöst", [
    p(`Hallo ${buyerName},`),
    p(`${card.parentName ?? "Die Eltern"} ${card.parentName ? "hat" : "haben"} deine Karte für `, b(card.childName), " eingelöst. Jetzt fehlt nur noch die Überweisung von ", b(eur(card.amountCents)), "."),
    p("Auf der nächsten Seite findest du den Bank-QR-Code. Scann ihn mit deiner Banking-App, zum Beispiel George. Empfänger, IBAN, Betrag und Verwendungszweck sind schon ausgefüllt."),
    btn("Bank-QR-Code öffnen", url),
    small("Das Geld geht direkt an die Eltern. Wir bekommen davon nichts."),
  ]);
}

export function redeemedToParent(card: Card) {
  return mail(`Karte für ${card.childName} eingelöst`, "Eingelöst. Danke!", [
    p(`Hallo ${card.parentName ?? ""},`.replace(" ,", ",")),
    p("ihr habt die Karte ", b(card.code), ` für ${card.childName} eingelöst. ${card.sender} bekommt jetzt den Bank-QR-Code und überweist ${eur(card.amountCents)} direkt auf euer Konto.`),
    p("Sobald das Zukunftsdepot startet, voraussichtlich ab Juli 2027, könnt ihr den Betrag einzahlen. Bis 5.000 € pro Kind und Jahr sind möglich."),
    small("Eure IBAN speichern wir verschlüsselt und löschen sie 90 Tage nach der Einlösung."),
  ]);
}

export function transferredToParent(card: Card) {
  return mail(`${card.sender} hat überwiesen`, "Die Überweisung ist unterwegs", [
    p(`Hallo ${card.parentName ?? ""},`.replace(" ,", ",")),
    p(`${card.sender} hat gemeldet, dass ${eur(card.amountCents)} für ${card.childName} an euch überwiesen wurden. Schaut in den nächsten Tagen auf euer Konto.`),
    small("Die Meldung kommt von den Schenkenden. Wir sehen eure Kontobewegungen nicht."),
  ]);
}

export function transferReminder(card: Card) {
  return mail(`Erinnerung: Überweisung für ${card.childName}`, "Kleine Erinnerung", [
    p(`Die Karte für ${card.childName} wurde vor einer Woche eingelöst. Falls du die ${eur(card.amountCents)} noch nicht überwiesen hast: Der Bank-QR-Code wartet hier.`),
    btn("Bank-QR-Code öffnen", transferUrl(card)),
    small("Schon überwiesen? Dann vermerk es bitte auf derselben Seite. Die Eltern bekommen dann Bescheid."),
  ]);
}

export function wishPageCreated(slug: string, childName: string, editToken: string) {
  const url = `${SITE_URL}/fuer/${slug}`;
  return mail(`Wunschseite für ${childName}`, `Die Wunschseite für ${childName} ist online`, [
    p("Teilt diesen Link mit der Familie:"),
    p(b(url)),
    p("Wer über eure Wunschseite eine Karte kauft, bekommt euren Bank-QR-Code direkt mit. Ihr müsst nichts mehr einlösen."),
    p("Die Seite wird nach 12 Monaten automatisch gelöscht. Ihr könnt sie jederzeit vorher löschen."),
    btn("Wunschseite bearbeiten", `${url}/bearbeiten?t=${editToken}`),
    small("Den Link zum Bearbeiten bitte nicht weitergeben."),
  ]);
}

export function paymentFailed(order: Order) {
  return mail("Die Zahlung für deine Bestellung hat nicht geklappt", "Die Zahlung hat nicht geklappt", [
    p(`Hallo ${order.buyerName},`),
    p(`deine Bank hat die Zahlung über ${eur(order.totalCents)} nicht bestätigt. Es wurde nichts abgebucht. Die Bestellung ist damit nicht gültig, und wir versenden keine Karten.`),
    p("Wenn du die Karten noch verschenken willst, bestell sie bitte noch einmal."),
    btn("Zu den Karten", `${SITE_URL}/karten`),
  ]);
}
