// Bausteine für die Vorschaubilder (Open Graph), die WhatsApp, Signal, Facebook und Co. beim Teilen zeigen.
// Gerendert mit next/og (Satori). Satori kennt keine CSS-Variablen und kein Grid, deshalb hier eigene, schlichte Karten.
import { Fragment, isValidElement, type ReactNode } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { EmblemArt } from "@/components/emblems";
import type { Emblem, Motif, Panel, Paper } from "@/lib/catalog";
import { PAT_GELB, PAT_GOLD, PAT_PINK, PAT_ROSA, PAT_TINTE } from "./patterns";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

export const C = {
  pink: "#d81b6a",
  pinkD: "#b3124f",
  gelb: "#ffd23f",
  gelbLL: "#fffaeb",
  rosa: "#fff2f7",
  rosa2: "#ffe4ee",
  tinte: "#2a1f2d",
  tinte2: "#5b4a5c",
  gold: "#c9a24a",
  white: "#ffffff",
};

const PAPER: Record<Paper, { color: string; pat: string }> = {
  pink: { color: C.pink, pat: PAT_PINK },
  gelb: { color: C.gelb, pat: PAT_GELB },
  rosa: { color: C.rosa2, pat: PAT_ROSA },
  tinte: { color: C.tinte, pat: PAT_TINTE },
  gold: { color: C.gold, pat: PAT_GOLD },
};

const PANEL: Record<Panel, { bg: string; text: string; e1: string; e2: string; amt: string }> = {
  white: { bg: C.white, text: C.tinte, e1: C.pink, e2: C.gelb, amt: C.tinte },
  tinte: { bg: C.tinte, text: C.white, e1: C.gelb, e2: C.pink, amt: C.gelb },
  pink: { bg: C.pink, text: C.white, e1: C.white, e2: C.gelb, amt: C.white },
  gelb: { bg: C.gelb, text: C.tinte, e1: C.pink, e2: C.white, amt: C.tinte },
};

/** Schriften aus src/app/_og (Bricolage Grotesque für Titel, Figtree für Text). */
export async function ogFonts() {
  const dir = join(process.cwd(), "src/app/_og");
  const [display, sans, sansBold] = await Promise.all([
    readFile(join(dir, "bricolage-800.ttf")),
    readFile(join(dir, "figtree-500.ttf")),
    readFile(join(dir, "figtree-700.ttf")),
  ]);
  return [
    { name: "Bricolage Grotesque", data: display, weight: 800 as const, style: "normal" as const },
    { name: "Figtree", data: sans, weight: 500 as const, style: "normal" as const },
    { name: "Figtree", data: sansBold, weight: 700 as const, style: "normal" as const },
  ];
}

/* ---------- Emblem als SVG-Datei ---------- */
const ATTR: Record<string, string> = { textAnchor: "text-anchor" };
const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const esc = (v: unknown) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function styleString(style: Record<string, unknown>) {
  return Object.entries(style)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${kebab(k)}:${k === "fontSize" && typeof v === "number" ? `${v}px` : v}`)
    .join(";");
}

interface EmblemText {
  x: number;
  y: number;
  size: number;
  text: string;
}

/** Kleiner Serialisierer für die Emblem-Elemente (nur SVG, keine Hooks).
 *  Text-Elemente landen in `texts`, weil das Bild-SVG keine Schriften laden kann. */
function toSvg(node: ReactNode, texts: EmblemText[] = []): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return esc(node);
  if (Array.isArray(node)) return node.map((n) => toSvg(n, texts)).join("");
  if (!isValidElement(node)) return "";
  const { type } = node;
  const props = node.props as Record<string, unknown> & { children?: ReactNode };
  if (type === Fragment) return toSvg(props.children, texts);
  if (typeof type === "function") return toSvg((type as (p: unknown) => ReactNode)(props), texts);
  if (type === "text") {
    const st = (props.style ?? {}) as { fontSize?: number };
    texts.push({ x: Number(props.x), y: Number(props.y), size: Number(st.fontSize ?? 10), text: String(props.children ?? "") });
    return "";
  }
  const attrs = Object.entries(props)
    .filter(([k, v]) => k !== "children" && v !== undefined)
    .map(([k, v]) =>
      k === "style" ? `style="${esc(styleString(v as Record<string, unknown>))}"` : `${ATTR[k] ?? k}="${esc(v)}"`,
    )
    .join(" ");
  return `<${String(type)}${attrs ? ` ${attrs}` : ""}>${toSvg(props.children, texts)}</${String(type)}>`;
}

/** Emblem als Daten-URI mit den Farben der Innenfläche, dazu enthaltene Texte. */
export function emblemParts(emblem: Emblem, panel: Panel = "white") {
  const p = PANEL[panel];
  const texts: EmblemText[] = [];
  const body = toSvg(<EmblemArt emblem={emblem} />, texts)
    .replaceAll("var(--e1)", p.e1)
    .replaceAll("var(--e2)", p.e2)
    .replaceAll("var(--display)", "Bricolage Grotesque, sans-serif");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 52 52" width="208" height="208">${body}</svg>`;
  return { uri: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, texts, color: p.e1 };
}

/** Emblem für Satori: Bild plus darübergelegte Ziffern (z. B. „18“ am Schlüssel). */
function OgEmblem({ emblem, panel, size }: { emblem: Emblem; panel?: Panel; size: number }) {
  const { uri, texts, color } = emblemParts(emblem, panel);
  const k = size / 52; // viewBox -2 -2 52 52
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={uri} width={size} height={size} alt="" />
      {texts.map((t, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (t.x + 2) * k - size / 2,
            top: (t.y + 2) * k - t.size * k * 0.86,
            width: size,
            display: "flex",
            justifyContent: "center",
            fontFamily: "Bricolage Grotesque",
            fontSize: t.size * k,
            lineHeight: 1,
            color,
          }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ---------- Geschenkpapier ---------- */
/** Fläche mit Papier-Rapport. Satori kennt kein background-repeat mit Daten-URIs, darum Kacheln. */
export function PaperFill({ paper, width, height, tile = 96 }: { paper: Paper; width: number; height: number; tile?: number }) {
  const { color, pat } = PAPER[paper];
  const cols = Math.ceil(width / tile);
  const rows = Math.ceil(height / tile);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width, height, display: "flex", flexWrap: "wrap", backgroundColor: color, overflow: "hidden" }}>
      {Array.from({ length: cols * rows }, (_, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={pat} width={tile} height={tile} alt="" />
      ))}
    </div>
  );
}

/* ---------- Karte ---------- */
export interface OgCardProps {
  motif: Motif;
  paper?: Paper;
  width: number;
  amount: string;
  childName: string;
  sender: string;
  showLine?: boolean;
  rotate?: number;
}

export function OgCard({ motif, paper = motif.papers[0], width, amount, childName, sender, showLine = true, rotate = 0 }: OgCardProps) {
  const ratio = motif.shape === "post" ? 0.705 : motif.shape === "square" ? 1 : motif.shape === "tag" ? 1.5 : 1.41;
  const W = width;
  const H = Math.round(W * ratio);
  const unit = Math.min(W, H) / 100; // entspricht cqmin
  const inset = motif.shape === "tag" ? { top: H * 0.17, side: W * 0.09 } : { top: unit * 8, side: unit * 8 };
  const panel = PANEL[motif.panel ?? "white"];
  const post = motif.shape === "post";
  const emb = post ? H * 0.38 : unit * 25;
  const amtSize = post ? H * 0.21 : unit * Math.min(19, 118 / Math.max(amount.length, 1));

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        display: "flex",
        borderRadius: motif.shape === "tag" ? 6 : 4,
        overflow: "hidden",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        boxShadow: "0 2px 4px rgba(42,31,45,.25), 0 28px 44px -18px rgba(42,31,45,.6)",
      }}
    >
      <PaperFill paper={paper} width={W} height={H} tile={Math.max(56, Math.round(W / 3.2))} />
      {motif.shape === "tag" ? (
        <div
          style={{
            position: "absolute",
            left: W / 2 - unit * 5,
            top: H * 0.06,
            width: unit * 10,
            height: unit * 10,
            borderRadius: 999,
            backgroundColor: C.white,
            border: `${unit * 1.6}px solid ${C.gold}`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: inset.side,
          right: inset.side,
          top: inset.top,
          bottom: motif.shape === "tag" ? inset.side : inset.top,
          display: "flex",
          flexDirection: post ? "row" : "column",
          alignItems: "center",
          justifyContent: post ? "flex-start" : "center",
          gap: post ? W * 0.045 : unit * 1.4,
          padding: post ? `0 ${W * 0.05}px` : unit * 4,
          backgroundColor: panel.bg,
          color: panel.text,
          borderRadius: unit * 1.4,
          textAlign: post ? "left" : "center",
        }}
      >
        <OgEmblem emblem={motif.emblem} panel={motif.panel} size={emb} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: post ? "flex-start" : "center", minWidth: 0 }}>
          {childName ? (
            <div style={{ fontFamily: "Figtree", fontWeight: 700, fontSize: post ? H * 0.066 : unit * 5.4, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {`Für ${childName}`}
            </div>
          ) : null}
          {amount ? (
            <div style={{ fontFamily: "Bricolage Grotesque", fontSize: amtSize, lineHeight: 1, letterSpacing: "-0.045em", color: panel.amt, margin: `${unit * 0.8}px 0` }}>
              {amount}
            </div>
          ) : null}
          {showLine ? (
            <div style={{ fontFamily: "Bricolage Grotesque", fontSize: post ? H * 0.07 : unit * 5.6, lineHeight: 1.2, maxWidth: post ? W * 0.5 : W * 0.7 }}>
              {motif.line}
            </div>
          ) : null}
          {sender ? (
            <div style={{ fontFamily: "Figtree", fontWeight: 500, fontSize: post ? H * 0.062 : unit * 5, opacity: 0.86, marginTop: unit * 0.8 }}>
              {sender}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Kleines Markenzeichen: Geschenk-Symbol und Name. */
export function OgBrand({ color = C.tinte, size = 34 }: { color?: string; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.4 }}>
      <svg width={size * 1.2} height={size * 1.2} viewBox="0 0 40 40">
        <rect x="4" y="15" width="32" height="22" rx="4" fill={C.pink} />
          <rect x="17" y="15" width="6" height="22" fill={C.gelb} />
          <rect x="4" y="21" width="32" height="5" fill={C.gelb} />
        <path d="M11 13l9-8.5 9 8.5" fill="none" stroke={C.pink} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ fontFamily: "Bricolage Grotesque", fontSize: size, letterSpacing: "-0.03em", color }}>Zukunftsgeschenk</div>
    </div>
  );
}
