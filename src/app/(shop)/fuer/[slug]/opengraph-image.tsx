// Vorschaubild der Wunschseite: Eltern teilen den Link in der Familiengruppe.
import { ImageResponse } from "next/og";
import { getWishPage } from "@/lib/shop";
import { motifById } from "@/lib/catalog";
import { C, OG_SIZE, OG_TYPE, OgBrand, OgCard, PaperFill, ogFonts } from "../../../_og/render";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Wunschseite: Geld fürs Zukunftsdepot schenken, direkt an die Eltern";

/** Motiv je Anlass für das Vorschaubild. */
const MOTIF: Record<string, string> = {
  weihnachten: "sterne", zukunft: "kurve", geburt: "mobile", taufe: "kerze", geburtstag: "kuchen",
  ostern: "osterei", kommunion: "kelch", firmung: "taube", schule: "schultuete", neutral: "pfeil",
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = await getWishPage(slug).catch(() => null);
  const name = w?.childName ?? "dein Patenkind";
  const m = motifById(MOTIF[w?.occasion ?? "neutral"] ?? "pfeil")!;
  const fonts = await ogFonts();
  const shortName = name.length > 14 ? `${name.slice(0, 13)}…` : name;

  return new ImageResponse(
    (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex" }}>
        <PaperFill paper="pink" width={OG_SIZE.width} height={OG_SIZE.height} tile={128} />
        <div
          style={{
            position: "absolute", left: 48, top: 48, width: 700, height: 534, display: "flex", flexDirection: "column",
            justifyContent: "space-between", padding: "44px 48px 42px", backgroundColor: C.white, borderRadius: 26,
            boxShadow: "0 30px 60px -24px rgba(42,31,45,.55)",
          }}
        >
          <OgBrand size={30} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Bricolage Grotesque", fontSize: 72, lineHeight: 1, letterSpacing: "-0.04em", color: C.tinte }}>
              {`Ein Stück Zukunft für ${shortName}`}
            </div>
            <div style={{ fontFamily: "Figtree", fontWeight: 500, fontSize: 29, lineHeight: 1.35, color: C.tinte2, marginTop: 22 }}>
              Hier kannst du Geld fürs Zukunftsdepot schenken. Es geht per Bank-QR-Code direkt an die Eltern.
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", fontFamily: "Figtree", fontWeight: 700, fontSize: 23, lineHeight: 1, color: C.tinte, backgroundColor: C.gelb, borderRadius: 999, padding: "12px 20px" }}>
              Wunschseite der Eltern
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 838, top: 116, display: "flex" }}>
          <OgCard motif={m} paper={m.papers.includes("gelb") ? "gelb" : m.papers[0] === "pink" ? "tinte" : m.papers[0]} width={m.shape === "post" ? 300 : 260} amount={shortName} childName="" sender="Von dir" rotate={5} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
