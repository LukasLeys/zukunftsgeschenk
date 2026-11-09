// Vorschaubild je Karte, wenn jemand den Link zu einem Motiv teilt.
import { ImageResponse } from "next/og";
import { FORMATS, MOTIFS, OCCASIONS, formatEUR, motifById, type Motif } from "@/lib/catalog";
import { showcaseFor } from "@/components/showcase";
import { C, OG_SIZE, OG_TYPE, OgBrand, OgCard, PaperFill, ogFonts } from "../../../_og/render";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Geschenkkarte fürs Zukunftsdepot";

export function generateStaticParams() {
  return MOTIFS.map((m) => ({ motif: m.id }));
}

const STAGE: Record<string, string> = { rosa: C.rosa, gelb: "#ffe78f", weiss: "#fffafc", tinte: "#3a2c3d", creme: C.gelbLL };

/** Kartenbreite je Format, damit alle Formate ähnlich viel Fläche bekommen. */
const cardWidth = (m: Motif) => (m.shape === "post" ? 470 : m.shape === "square" ? 380 : m.shape === "tag" ? 290 : 320);

export default async function Image({ params }: { params: Promise<{ motif: string }> }) {
  const { motif } = await params;
  const m = motifById(motif) ?? motifById("sterne")!;
  const sc = showcaseFor(m.id);
  const fonts = await ogFonts();
  const occasion = OCCASIONS.find((o) => o.id === m.occasion)?.label ?? "";
  const from = formatEUR(Math.min(...FORMATS.map((f) => f.priceCents)), { cents: true });
  const w = cardWidth(m);
  const stage = STAGE[sc.stage] ?? C.rosa;

  return new ImageResponse(
    (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", backgroundColor: C.white }}>
        {/* Bühne mit der Karte */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 600, height: 630, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: stage }}>
          <OgCard motif={m} width={w} amount={formatEUR(sc.amount)} childName={sc.childName} sender={sc.sender} rotate={-3} />
        </div>
        <div style={{ position: "absolute", left: 600, top: 0, width: 600, height: 18, display: "flex", overflow: "hidden" }}>
          <PaperFill paper="pink" width={600} height={18} tile={64} />
        </div>

        {/* Text */}
        <div style={{ position: "absolute", left: 650, top: 70, width: 500, height: 500, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex" }}>
              <div style={{ display: "flex", fontFamily: "Figtree", fontWeight: 700, fontSize: 24, lineHeight: 1, color: C.white, backgroundColor: C.pink, borderRadius: 999, padding: "10px 18px" }}>
                {occasion}
              </div>
            </div>
            <div style={{ fontFamily: "Bricolage Grotesque", fontSize: m.name.length > 14 ? 62 : 74, lineHeight: 1, letterSpacing: "-0.04em", color: C.tinte, marginTop: 26 }}>
              {m.name}
            </div>
            <div style={{ fontFamily: "Figtree", fontWeight: 500, fontSize: 28, lineHeight: 1.38, color: C.tinte2, marginTop: 20 }}>
              Geschenkkarte fürs Zukunftsdepot. Name, Betrag und deine Worte trägst du selbst ein. Das Geld geht direkt an die Eltern.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <OgBrand size={28} />
            <div style={{ display: "flex", fontFamily: "Bricolage Grotesque", fontSize: 34, color: C.tinte }}>{`ab ${from}`}</div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
