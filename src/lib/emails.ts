import "server-only";
import { SITE_URL } from "./env";
import { formatEUR, formatById, motifById } from "./catalog";
import type { Card, Order } from "./db/schema";

// Schlichte, robuste HTML-Mails (Tabellenlayout, Inline-Styles) im Markenstil.
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const eur = (c: number) => formatEUR(c, { cents: true, decimals: c % 100 !== 0 });

function layout(title: string, body: string) {
  return `<!doctype html><html lang="de"><body style="margin:0;background:#fff2f7;font-family:Figtree,Arial,sans-serif;color:#2a1f2d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff2f7"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:#d81b6a;padding:18px 24px;color:#ffffff;font-weight:800;font-size:18px">Zukunftsgeschenk</td></tr>
<tr><td style="padding:28px 24px 8px;font-size:17px;line-height:1.55">
<h1 style="font-size:24px;line-height:1.2;margin:0 0 14px">${esc(title)}</h1>${body}</td></tr>
<tr><td style="padding:18px 24px 26px;font-size:12px;line-height:1.5;color:#5b4a5c;border-top:1px solid #f1dde6">
Privates Angebot. Kein offizielles Angebot der Republik Österreich oder einer Partei. Die Einzahlung ins Zukunftsdepot erfolgt durch die Eltern. Keine Anlageberatung.<br>
<a href="${SITE_URL}/impressum" style="color:#b3124f">Impressum</a> · <a href="${SITE_URL}/datenschutz" style="color:#b3124f">Datenschutz</a>
</td></tr></table></td></tr></table></body></html>`;
}
const btn = (href: string, label: string) =>
  `<p style="margin:22px 0"><a href="${href}" style="background:#d81b6a;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:999px;display:inline-block">${esc(label)}</a></p>`;

export function orderConfirmation(order: Order, cards: Card[]) {
  const url = `${SITE_URL}/bestellung/${order.id}?t=${order.accessToken}`;
  const qrNow = (c: Card) => Boolean(c.ibanEnc && c.payToken && c.status === "issued");
  const rows = cards
    .map((c) => `<li style="margin:0 0 8px"><b>${esc(motifById(c.motif)?.name ?? c.motif)}</b> für ${esc(c.childName)}. Geschenkbetrag ${eur(c.amountCents)}, ${esc(formatById(c.format)?.short ?? c.format)} (${eur(c.priceCents)})${
      qrNow(c) ? `<br>Bank-QR-Code ist auf der Karte. <a href="${SITE_URL}/ueberweisen/${c.payToken}" style="color:#b3124f">Jetzt ${eur(c.amountCents)} überweisen</a>` : ""
    }</li>`)
    .join("");
  const waiting = cards.some((c) => !qrNow(c));
  const consent = order.digitalConsent
    ? `<p style="font-size:14px;color:#5b4a5c">Ihr habt zugestimmt, dass wir die digitale Karte sofort erstellen und zum gewählten Termin versenden. Damit ist euer Rücktrittsrecht für E-Mail-Karten erloschen (§ 18 Abs. 1 Z 11 FAGG).</p>`
    : "";
  const html = layout("Danke für eure Bestellung!", `<p>Hallo ${esc(order.buyerName)},</p>
<p>eure Karten sind bestellt. Bezahlt habt ihr nur die Karten: <b>${eur(order.totalCents)}</b> (inkl. 20 % USt.). Den Geschenkbetrag überweist ihr später direkt an die Eltern.</p>
<ul style="padding-left:20px">${rows}</ul>${btn(url, "Bestellung ansehen und Karten laden")}
<p style="font-size:14px;color:#5b4a5c">Rechnungsnummer ${esc(order.invoiceNumber ?? "folgt")}.${waiting ? " Sobald die Eltern eine Karte einlösen, bekommt ihr den Bank-QR-Code zum Überweisen per E-Mail." : ""}</p>${consent}`);
  const textConsent = order.digitalConsent ? " Ihr habt zugestimmt, dass wir die digitale Karte sofort erstellen und zum gewählten Termin versenden. Damit ist euer Rücktrittsrecht für E-Mail-Karten erloschen (§ 18 Abs. 1 Z 11 FAGG)." : "";
  return { subject: `Eure Bestellung ${order.invoiceNumber ?? ""} bei Zukunftsgeschenk`.trim(), html, text: `Danke für eure Bestellung. Karten ansehen: ${url}${textConsent}` };
}

export function cardDelivery(card: Card) {
  const url = `${SITE_URL}/karte/${card.code}`;
  const html = layout(`Ein Zukunftsgeschenk für ${card.childName}`, `<p>${esc(card.sender)} schenkt ${esc(card.childName)} <b>${eur(card.amountCents)}</b> fürs Zukunftsdepot.</p>
${card.message ? `<p style="border-left:3px solid #ffd23f;padding-left:12px;font-style:italic">${esc(card.message)}</p>` : ""}
${btn(url, "Karte öffnen")}
${card.ibanEnc
  ? `<p style="font-size:15px">Liebe Eltern, eure Bankverbindung ist bei dieser Karte schon hinterlegt. Ihr müsst nichts einlösen. Das Geld kommt direkt von den Schenkenden auf euer Konto.</p>`
  : `<p style="font-size:15px">Liebe Eltern, mit dem Code <b>${esc(card.code)}</b> löst ihr die Karte unter <a href="${SITE_URL}/einloesen" style="color:#b3124f">zukunftsgeschenk.at/einloesen</a> ein und gebt eure IBAN an. Das Geld kommt dann direkt von den Schenkenden auf euer Konto. Die Karte ist unbefristet einlösbar.</p>`}`);
  return { subject: `${card.sender} schenkt ${card.childName} ein Stück Zukunft`, html, text: `Karte öffnen: ${url}. Einlösecode: ${card.code}` };
}

export function redeemedToGiver(card: Card, buyerName: string) {
  const url = `${SITE_URL}/ueberweisen/${card.payToken}`;
  const html = layout("Die Karte wurde eingelöst", `<p>Hallo ${esc(buyerName)},</p>
<p>${esc(card.parentName ?? "Die Eltern")} ${card.parentName ? "hat" : "haben"} eure Karte für <b>${esc(card.childName)}</b> eingelöst. Jetzt fehlt nur noch die Überweisung von <b>${eur(card.amountCents)}</b>.</p>
<p>Auf der folgenden Seite findet ihr den Bank-QR-Code. Scannt ihn mit eurer Banking-App (zum Beispiel George), alles ist schon ausgefüllt.</p>
${btn(url, "Bank-QR-Code öffnen")}
<p style="font-size:14px;color:#5b4a5c">Das Geld geht direkt an die Eltern, nicht über uns.</p>`);
  return { subject: `Eingelöst: Jetzt ${eur(card.amountCents)} für ${card.childName} überweisen`, html, text: `Bank-QR-Code öffnen: ${url}` };
}

export function redeemedToParent(card: Card) {
  const html = layout("Eingelöst. Danke!", `<p>Hallo ${esc(card.parentName ?? "")},</p>
<p>ihr habt die Karte <b>${esc(card.code)}</b> für ${esc(card.childName)} eingelöst. ${esc(card.sender)} bekommt jetzt den Bank-QR-Code und überweist ${eur(card.amountCents)} direkt auf euer Konto.</p>
<p>Sobald das Zukunftsdepot startet, voraussichtlich ab Juli 2027, könnt ihr den Betrag einzahlen. Bis 5.000 € pro Kind und Jahr sind möglich.</p>
<p style="font-size:14px;color:#5b4a5c">Eure IBAN speichern wir verschlüsselt und löschen sie 90 Tage nach der Einlösung.</p>`);
  return { subject: `Karte für ${card.childName} eingelöst`, html, text: `Karte ${card.code} eingelöst.` };
}

export function transferredToParent(card: Card) {
  const html = layout("Die Überweisung ist unterwegs", `<p>${esc(card.sender)} hat gemeldet, dass ${eur(card.amountCents)} für ${esc(card.childName)} an euch überwiesen wurden. Schaut in den nächsten Tagen auf euer Konto.</p>`);
  return { subject: `${card.sender} hat überwiesen`, html, text: `${card.sender} hat ${eur(card.amountCents)} überwiesen.` };
}

export function transferReminder(card: Card) {
  const url = `${SITE_URL}/ueberweisen/${card.payToken}`;
  const html = layout("Kleine Erinnerung", `<p>Die Karte für ${esc(card.childName)} wurde vor einer Woche eingelöst. Falls ihr die ${eur(card.amountCents)} noch nicht überwiesen habt: Der Bank-QR-Code wartet hier.</p>${btn(url, "Bank-QR-Code öffnen")}`);
  return { subject: `Erinnerung: Überweisung für ${card.childName}`, html, text: url };
}

export function wishPageCreated(slug: string, childName: string, editToken: string) {
  const url = `${SITE_URL}/fuer/${slug}`;
  const html = layout(`Die Wunschseite für ${childName} ist online`, `<p>Teilt diesen Link mit der Familie:</p><p style="font-size:20px;font-weight:700"><a href="${url}" style="color:#b3124f">${url}</a></p>
<p>Wer über eure Wunschseite eine Karte kauft, bekommt euren Bank-QR-Code direkt mit. Ihr müsst nichts mehr einlösen.</p>
<p>Die Seite wird nach 12 Monaten automatisch gelöscht. Ihr könnt sie jederzeit vorher löschen.</p>
${btn(`${url}/bearbeiten?t=${editToken}`, "Wunschseite bearbeiten")}`);
  return { subject: `Wunschseite für ${childName}`, html, text: `${url} Die Seite wird nach 12 Monaten automatisch gelöscht. Ihr könnt sie jederzeit vorher löschen.` };
}

export function paymentFailed(order: Order) {
  const url = `${SITE_URL}/karten`;
  const html = layout("Die Zahlung hat nicht geklappt", `<p>Hallo ${esc(order.buyerName)},</p>
<p>deine Bank hat die Zahlung über ${eur(order.totalCents)} nicht bestätigt. Es wurde nichts abgebucht, und die Bestellung ist nicht gültig.</p>
<p>Wenn du die Karten noch verschenken willst, bestell sie bitte noch einmal.</p>${btn(url, "Zu den Karten")}`);
  return { subject: "Die Zahlung für deine Bestellung hat nicht geklappt", html, text: `Hallo ${order.buyerName}, deine Bank hat die Zahlung über ${eur(order.totalCents)} nicht bestätigt. Es wurde nichts abgebucht. Karten neu bestellen: ${url}` };
}
