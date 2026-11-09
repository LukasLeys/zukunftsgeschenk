// Vorschaubild für geteilte Links (WhatsApp, Signal, Facebook, LinkedIn). 1200 × 630.
import { ImageResponse } from "next/og";
import { MOTIFS, motifById } from "@/lib/catalog";
import { C, OG_SIZE, OG_TYPE, OgBrand, OgCard, PaperFill, ogFonts } from "./_og/render";

export const alt = "Zukunftsgeschenk: gestaltete Geschenkkarten fürs Zukunftsdepot. Das Geld geht direkt an die Eltern.";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  const fonts = await ogFonts();
  const mobile = motifById("mobile")!;
  const sterne = motifById("sterne")!;
  const kurve = motifById("kurve")!;

  return new ImageResponse(
    (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex" }}>
        <PaperFill paper="pink" width={OG_SIZE.width} height={OG_SIZE.height} tile={128} />

        {/* Weißes Blatt mit Botschaft */}
        <div
          style={{
            position: "absolute",
            left: 48,
            top: 48,
            width: 640,
            height: 534,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "44px 48px 42px",
            backgroundColor: C.white,
            borderRadius: 26,
            boxShadow: "0 30px 60px -24px rgba(42,31,45,.55)",
          }}
        >
          <OgBrand size={32} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Bricolage Grotesque", fontSize: 76, lineHeight: 0.98, letterSpacing: "-0.04em", color: C.tinte }}>
              Schenk ein Stück Zukunft.
            </div>
            <div style={{ fontFamily: "Figtree", fontWeight: 500, fontSize: 29, lineHeight: 1.35, color: C.tinte2, marginTop: 22 }}>
              Geschenkkarten fürs Zukunftsdepot. Das Geld geht per Bank-QR-Code direkt an die Eltern.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {[
              [`${MOTIFS.length} Motive`, C.gelb],
              ["Ab 4,90 €", C.rosa2],
              ["Druck oder E-Mail", C.rosa2],
            ].map(([label, bg]) => (
              <div
                key={label}
                style={{ display: "flex", flexShrink: 0, fontFamily: "Figtree", fontWeight: 700, fontSize: 23, lineHeight: 1, color: C.tinte, backgroundColor: bg, borderRadius: 999, padding: "12px 20px" }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Kartenfächer */}
        <div style={{ position: "absolute", left: 712, top: 205, display: "flex" }}>
          <OgCard motif={mobile} paper="gelb" width={214} amount="500 €" childName="Emma" sender="Von Oma und Opa" showLine={false} rotate={-11} />
        </div>
        <div style={{ position: "absolute", left: 968, top: 232, display: "flex" }}>
          <OgCard motif={kurve} paper="tinte" width={196} amount="250 €" childName="Elias" sender="Von Opa Franz" showLine={false} rotate={10} />
        </div>
        <div style={{ position: "absolute", left: 832, top: 100, display: "flex" }}>
          <OgCard motif={sterne} paper="gelb" width={242} amount="100 €" childName="Lena" sender="Von Oma Gerti" rotate={-2} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
