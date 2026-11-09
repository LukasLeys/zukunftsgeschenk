import "server-only";
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";
import { qrMatrix } from "./qr";
import { motifById, formatEUR } from "./catalog";
import type { Card } from "./db/schema";

const C = {
  pink: rgb(0xd8 / 255, 0x1b / 255, 0x6a / 255),
  gelb: rgb(1, 0xd2 / 255, 0x3f / 255),
  rosa: rgb(1, 0xe4 / 255, 0xee / 255),
  tinte: rgb(0x2a / 255, 0x1f / 255, 0x2d / 255),
  gold: rgb(0xc9 / 255, 0xa2 / 255, 0x4a / 255),
  weiss: rgb(1, 1, 1),
};
const PAPER = { pink: C.pink, gelb: C.gelb, rosa: C.rosa, tinte: C.tinte, gold: C.gold } as const;
const mm = (v: number) => (v * 72) / 25.4;

function drawQr(page: PDFPage, text: string, x: number, y: number, size: number) {
  const m = qrMatrix(text);
  const cell = size / m.size;
  page.drawRectangle({ x: x - 4, y: y - 4, width: size + 8, height: size + 8, color: C.weiss });
  for (let r = 0; r < m.size; r++)
    for (let c = 0; c < m.size; c++)
      if (m.get(c, r)) page.drawRectangle({ x: x + c * cell, y: y + size - (r + 1) * cell, width: cell + 0.2, height: cell + 0.2, color: C.tinte });
}

function wrap(text: string, font: PDFFont, size: number, max: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(t, size) > max && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

/** Erzeugt die Karte als PDF: Seite 1 Vorderseite, Seite 2 Innenseite mit Einlösecode (und optional Bank-QR). */
export async function cardPdf(card: Card, opts: { redeemUrl: string; epcPayload?: string }) {
  const doc = await PDFDocument.create();
  doc.setTitle(`Zukunftsgeschenk für ${card.childName}`);
  doc.setAuthor("Zukunftsgeschenk");
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const W = mm(148), H = mm(105); // A6 quer
  const paper = PAPER[(card.paper as keyof typeof PAPER) ?? "pink"] ?? C.pink;
  const dark = card.paper === "tinte" || card.paper === "pink";
  const ink = dark ? C.weiss : C.tinte;
  const motif = motifById(card.motif);

  // Vorderseite
  const p1 = doc.addPage([W, H]);
  p1.drawRectangle({ x: 0, y: 0, width: W, height: H, color: paper });
  for (let i = 0; i < 40; i++) {
    const x = ((i * 53) % 100) / 100 * W, y = ((i * 37) % 100) / 100 * H;
    p1.drawCircle({ x, y, size: i % 3 === 0 ? 2.4 : 1.4, color: dark ? C.gelb : C.pink, opacity: 0.55 });
  }
  p1.drawRectangle({ x: mm(14), y: mm(14), width: W - mm(28), height: H - mm(28), color: C.weiss });
  p1.drawText((motif?.line ?? "Für deine Zukunft").slice(0, 48), { x: mm(22), y: H - mm(30), size: 13, font: bold, color: C.pink });
  p1.drawText(`Für ${card.childName}`, { x: mm(22), y: H - mm(42), size: 15, font: bold, color: C.tinte });
  p1.drawText(formatEUR(card.amountCents, { cents: true, decimals: card.amountCents % 100 !== 0 }), { x: mm(22), y: H - mm(68), size: 44, font: bold, color: C.tinte });
  p1.drawText("für dein Zukunftsdepot", { x: mm(22), y: H - mm(76), size: 11, font: reg, color: C.tinte });
  p1.drawText(card.sender, { x: mm(22), y: mm(20), size: 11, font: reg, color: C.tinte });
  p1.drawText("Zukunftsgeschenk", { x: W - mm(22) - bold.widthOfTextAtSize("Zukunftsgeschenk", 9), y: mm(20), size: 9, font: bold, color: C.pink });

  // Innenseite
  const p2 = doc.addPage([W, H]);
  p2.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.weiss });
  p2.drawRectangle({ x: 0, y: H - mm(6), width: W, height: mm(6), color: paper });
  let y = H - mm(18);
  for (const l of wrap(card.message || "Für deine Zukunft. Damit du später einmal frei wählen kannst.", reg, 11, mm(78)).slice(0, 7)) {
    p2.drawText(l, { x: mm(12), y, size: 11, font: reg, color: ink === C.weiss ? C.tinte : C.tinte });
    y -= 15;
  }
  p2.drawText(card.sender, { x: mm(12), y: y - 6, size: 11, font: bold, color: C.tinte });
  p2.drawText("Für die Eltern: So kommt das Geld an", { x: mm(12), y: mm(32), size: 9, font: bold, color: C.pink });
  const steps = opts.epcPayload
    ? ["Der Bank-QR-Code rechts ist schon ausgefüllt.", "Die Schenkenden überweisen damit direkt an euch."]
    : ["Code auf zukunftsgeschenk.at/einloesen eingeben,", "IBAN angeben. Die Schenkenden überweisen direkt an euch."];
  steps.forEach((s, i) => p2.drawText(s, { x: mm(12), y: mm(26) - i * 11, size: 8.5, font: reg, color: C.tinte }));
  p2.drawText(`Einlösecode ${card.code} · unbefristet einlösbar`, { x: mm(12), y: mm(10), size: 8.5, font: bold, color: C.tinte });
  drawQr(p2, opts.epcPayload ?? opts.redeemUrl, W - mm(46), mm(30), mm(34));
  p2.drawText(opts.epcPayload ? "Bank-QR zum Überweisen" : "Scannen zum Einlösen", { x: W - mm(46), y: mm(24), size: 7.5, font: reg, color: C.tinte });
  return doc.save();
}
