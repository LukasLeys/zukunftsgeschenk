// Embleme der Geschenkkarten. 48er-Raster, Farben kommen über --e1/--e2 der Innenfläche.
// Server-tauglich, keine Hooks.
import type { CSSProperties } from "react";
import type { Emblem } from "@/lib/catalog";

const HEART = "M24 43C8 33 4 25 4 18C4 11 9 7 14 7C19 7 22 10 24 13C26 10 29 7 34 7C39 7 44 11 44 18C44 25 40 33 24 43Z";
const LEAF = "M24 24C18 20 13.5 16 13.5 11.5C13.5 8 16 5.5 19 5.5C21.5 5.5 23.4 7 24 9C24.6 7 26.5 5.5 29 5.5C32 5.5 34.5 8 34.5 11.5C34.5 16 30 20 24 24Z";
const CLOUD = "M3 44a4.6 4.6 0 0 1 2.4-8.6 6.4 6.4 0 0 1 12.2-1.2 4.8 4.8 0 0 1 2.4 9.8z";
const E1 = "var(--e1)";
const E2 = "var(--e2)";

function Star({ cx, cy, r, fill, stroke, sw }: { cx: number; cy: number; r: number; fill: string; stroke?: string; sw?: number }) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.44 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return (
    <polygon
      points={pts.join(" ")}
      style={{ fill, stroke: stroke ?? "none", strokeWidth: sw, strokeLinejoin: "round" }}
    />
  );
}

const f = (c: string): CSSProperties => ({ fill: c });
const s = (c: string, w: number, extra: CSSProperties = {}): CSSProperties => ({ fill: "none", stroke: c, strokeWidth: w, ...extra });
const fs = (fc: string, sc: string, w: number): CSSProperties => ({ fill: fc, stroke: sc, strokeWidth: w });
const round: CSSProperties = { strokeLinecap: "round", strokeLinejoin: "round" };
const txt = (size: number): CSSProperties => ({ fill: "var(--e1)", fontFamily: "var(--display)", fontWeight: 800, fontSize: size });

export function EmblemArt({ emblem }: { emblem: Emblem }) {
  switch (emblem) {
    case "star":
      return <Star cx={24} cy={25} r={21} fill={E2} stroke={E1} sw={2.6} />;
    case "stars":
      return (
        <>
          <Star cx={24} cy={20} r={15} fill={E2} stroke={E1} sw={2.4} />
          <Star cx={9} cy={39} r={6.5} fill={E1} />
          <Star cx={39} cy={40} r={5.5} fill={E1} />
        </>
      );
    case "tree":
      return (
        <>
          <path d="M15 23l9-9 9 9M10 33l14-14 14 14M5 43l19-19 19 19" style={s(E1, 4.4, round)} />
          <Star cx={24} cy={7} r={6} fill={E2} stroke={E1} sw={1.6} />
        </>
      );
    case "mobile":
      return (
        <>
          <path d="M5 5h38" style={s(E1, 3, { strokeLinecap: "round" })} />
          <path d="M11 5v14M24 5v20M37 5v11" style={s(E1, 1.6)} />
          <circle cx="11" cy="24" r="5" style={fs(E2, E1, 2)} />
          <Star cx={24} cy={33} r={8.5} fill={E2} stroke={E1} sw={2} />
          <path d="M38 16a7 7 0 1 0 5.5 11.5A5.5 5.5 0 0 1 38 16z" style={{ ...fs(E2, E1, 2), strokeLinejoin: "round" }} />
        </>
      );
    case "moon":
      return (
        <>
          <path d="M28 5a19 19 0 1 0 15 31A16 16 0 0 1 28 5z" style={f(E1)} />
          <Star cx={38} cy={10} r={4.5} fill={E1} />
          <Star cx={43} cy={22} r={3} fill={E1} />
          <Star cx={8} cy={8} r={3} fill={E1} />
        </>
      );
    case "candle":
      return (
        <>
          <rect x="17" y="20" width="14" height="25" rx="2" style={fs(E2, E1, 2.4)} />
          <path d="M17 29h14M17 36h14" style={s(E1, 1.6)} />
          <path d="M24 3c4.5 5.5 5.5 8.5 5.5 10.5a5.5 5.5 0 0 1-11 0C18.5 11.5 19.5 8.5 24 3z" style={f(E1)} />
          <path d="M24 16v4" style={s(E1, 2)} />
        </>
      );
    case "cake":
      return (
        <>
          <rect x="6" y="26" width="36" height="17" rx="3" style={fs(E2, E1, 2.4)} />
          <path d="M6 33c4 3.5 8-3 12 0s8-3 12 0 8 2 12-1" style={s(E1, 2.4, { strokeLinecap: "round" })} />
          <path d="M15 26v-9M24 26v-9M33 26v-9" style={s(E1, 3, { strokeLinecap: "round" })} />
          <g style={f(E1)}>
            <ellipse cx="15" cy="11" rx="2.6" ry="3.8" />
            <ellipse cx="24" cy="11" rx="2.6" ry="3.8" />
            <ellipse cx="33" cy="11" rx="2.6" ry="3.8" />
          </g>
        </>
      );
    case "chalice":
      return (
        <>
          <circle cx="24" cy="7" r="5.5" style={fs(E2, E1, 2)} />
          <path d="M11 12h26c0 10-5.5 16-13 16S11 22 11 12z" style={f(E1)} />
          <path d="M24 28v9M14 44h20M17 44c0-3.5 3-6.5 7-6.5s7 3 7 6.5" style={s(E1, 2.6, round)} />
        </>
      );
    case "dove":
      return (
        <>
          <path
            d="M5 29c8 1 14-3 18-9 1-6 5-10 10-10 3 0 5 2 6 4l5 1-5 2.5c0 9-7 16-17 17-7 1-13-1-17-5.5z"
            style={{ ...fs(E2, E1, 2.2), strokeLinejoin: "round" }}
          />
          <path d="M15 27c4-7 10-11 17-12" style={s(E1, 2, { strokeLinecap: "round" })} />
          <circle cx="35" cy="14" r="1.6" style={f(E1)} />
          <path d="M20 40l-3 6M26 40l-1 6" style={s(E1, 2.2, { strokeLinecap: "round" })} />
          <Star cx={9} cy={9} r={4.5} fill={E1} />
        </>
      );
    case "arrow":
      return (
        <>
          <path d="M24 3L43 22H31.5v18h-15V22H5z" style={f(E1)} />
          <path d="M13 45h22" style={s(E2, 4, { strokeLinecap: "round" })} />
        </>
      );
    case "confetti":
      return (
        <>
          <g style={f(E1)}>
            <rect x="5" y="9" width="9" height="4.5" rx="1.5" transform="rotate(-28 9 11)" />
            <rect x="33" y="35" width="9" height="4.5" rx="1.5" transform="rotate(24 37 37)" />
            <circle cx="40" cy="10" r="3.4" />
            <circle cx="8" cy="38" r="2.6" />
          </g>
          <g style={fs(E2, E1, 1.4)}>
            <circle cx="24" cy="24" r="7" />
            <rect x="31" y="17" width="8" height="4" rx="1.4" transform="rotate(40 35 19)" />
          </g>
          <Star cx={15} cy={27} r={5} fill={E1} />
          <Star cx={31} cy={6} r={4.5} fill={E2} stroke={E1} sw={1.2} />
        </>
      );
    /* ---------- Weihnachten ---------- */
    case "bauble":
      return (
        <>
          <circle cx="24" cy="5" r="3" style={s(E1, 2)} />
          <rect x="19" y="8" width="10" height="6" rx="1.5" style={f(E1)} />
          <circle cx="24" cy="29.5" r="16" style={fs(E2, E1, 2.6)} />
          <path d="M9.5 27l4.8 4 4.8-4 4.9 4 4.8-4 4.9 4 4.8-4" style={s(E1, 2.4, round)} />
          <g style={f(E1)}>
            <circle cx="17" cy="38" r="1.8" />
            <circle cx="24" cy="40" r="1.8" />
            <circle cx="31" cy="38" r="1.8" />
            <circle cx="24" cy="20" r="2" />
          </g>
        </>
      );
    case "sack":
      return (
        <>
          <path d="M14 19C7 27 6 44 24 44s17-17 10-25z" style={{ ...fs(E2, E1, 2.4), strokeLinejoin: "round" }} />
          <path d="M15 18c-3-4-3-9 0-11 2 2.5 4.5 3 6.5 0 1.5 2.5 3.5 2.5 5 0 2 3 4.5 2.5 6.5 0 3 2 3 7 0 11z" style={{ ...fs(E2, E1, 2.2), strokeLinejoin: "round" }} />
          <rect x="12.5" y="16" width="23" height="4.5" rx="2.2" style={f(E1)} />
          <Star cx={24} cy={32} r={7} fill={E1} />
        </>
      );
    case "wreath":
      return (
        <>
          {[
            [10.5, 22, true],
            [19.5, 25, true],
            [28.5, 25, false],
            [37.5, 22, false],
          ].map(([x, top, lit]) => (
            <g key={x as number}>
              <rect x={(x as number) - 3} y={top as number} width="6" height={38 - (top as number)} rx="1" style={fs(E2, E1, 1.8)} />
              {lit ? <ellipse cx={x as number} cy={(top as number) - 4} rx="2.4" ry="3.4" style={f(E1)} /> : null}
            </g>
          ))}
          <ellipse cx="24" cy="38.5" rx="20" ry="6.5" style={s(E1, 5)} />
          <g style={f(E2)}>
            <circle cx="9" cy="40" r="1.6" />
            <circle cx="24" cy="45" r="1.6" />
            <circle cx="39" cy="40" r="1.6" />
          </g>
        </>
      );
    case "gingerbread":
      return (
        <>
          <path d="M24 13V3" style={s(E1, 2, { strokeLinecap: "round" })} />
          <path d={HEART} style={{ ...fs(E2, E1, 2.4), strokeLinejoin: "round" }} />
          <path d={HEART} transform="translate(24 25) scale(.74) translate(-24 -25)" style={s(E1, 2, { strokeDasharray: "2.2 2.8", strokeLinecap: "round" })} />
          <Star cx={24} cy={25} r={5.5} fill={E1} />
        </>
      );
    /* ---------- Aktien & Geld ---------- */
    case "chart":
      return (
        <>
          <path d="M9 37l8-9 6 4 9-13 8-7V43H9z" style={f(E2)} />
          <path d="M5 4v39h39" style={s(E1, 2.4, round)} />
          <path d="M9 37l8-9 6 4 9-13 8-7" style={s(E1, 3.4, round)} />
          <path d="M33.5 10.5L41 11l-.5 7.5" style={s(E1, 3.4, round)} />
        </>
      );
    case "candlechart":
      return (
        <>
          {[
            [8, 27, 31, 39, 43, false],
            [18.5, 21, 25, 33, 37, true],
            [29, 13, 17, 29, 33, false],
            [39.5, 3, 7, 20, 24, true],
          ].map(([x, wt, bt, bb, wb, solid]) => (
            <g key={x as number}>
              <path d={`M${x} ${wt}V${wb}`} style={s(E1, 2, { strokeLinecap: "round" })} />
              <rect x={(x as number) - 3.6} y={bt as number} width="7.2" height={(bb as number) - (bt as number)} rx="1.2" style={solid ? f(E1) : fs(E2, E1, 2)} />
            </g>
          ))}
          <path d="M3 46h42" style={s(E1, 1.6, { strokeLinecap: "round" })} />
        </>
      );
    case "coins":
      return (
        <>
          {[
            [3, 2],
            [18, 4],
            [33, 7],
          ].map(([x, n]) =>
            Array.from({ length: n }, (_, i) => (
              <rect key={`${x}-${i}`} x={x} y={39.6 - i * 4.7} width="12" height="4.4" rx="2.2" style={fs(E2, E1, 1.8)} />
            )),
          )}
          <Star cx={9} cy={28} r={4.5} fill={E1} />
          <Star cx={24} cy={14} r={3.2} fill={E1} />
        </>
      );
    case "snowball":
      return (
        <>
          <path d="M2 45h44" style={s(E1, 2.4, { strokeLinecap: "round" })} />
          <circle cx="5.5" cy="41.5" r="3.5" style={fs(E2, E1, 2)} />
          <circle cx="15" cy="37" r="8" style={fs(E2, E1, 2.2)} />
          <circle cx="31" cy="27" r="18" style={fs(E2, E1, 2.6)} />
          <g style={f(E1)}>
            <circle cx="24" cy="19" r="2.2" />
            <circle cx="35" cy="16" r="1.8" />
            <circle cx="37" cy="31" r="2.4" />
            <circle cx="27" cy="35" r="1.6" />
            <circle cx="14" cy="34.5" r="1.5" />
          </g>
          <Star cx={7} cy={10} r={5} fill={E1} />
        </>
      );
    case "globe":
      return (
        <>
          <circle cx="24" cy="25" r="19" style={fs(E2, E1, 2.4)} />
          <ellipse cx="24" cy="25" rx="8" ry="19" style={s(E1, 1.8)} />
          <path d="M5 25h38M8 15.5h32M8 34.5h32" style={s(E1, 1.8)} />
          <Star cx={41} cy={6} r={5} fill={E1} />
        </>
      );
    case "moneytree":
      return (
        <>
          <path d="M24 44V20M24 33l-7-7M24 29l8-7" style={s(E1, 3, round)} />
          <path d="M14 44.5h20" style={s(E1, 2.4, { strokeLinecap: "round" })} />
          {[
            [24, 9.5],
            [13, 15],
            [35, 15],
            [15.5, 26],
            [32.5, 22],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="5.6" style={fs(E2, E1, 2)} />
              <circle cx={x} cy={y} r="2.4" style={s(E1, 1.2)} />
            </g>
          ))}
        </>
      );
    case "bull":
      return (
        <>
          <path d="M13 11C6 11 2 7 3 2c3 4 7 5 11 5M35 11c7 0 11-4 10-9-3 4-7 5-11 5" style={{ ...fs(E1, E1, 1.6), strokeLinejoin: "round" }} />
          <ellipse cx="9.5" cy="16.5" rx="5.5" ry="2.8" transform="rotate(20 9.5 16.5)" style={fs(E2, E1, 2)} />
          <ellipse cx="38.5" cy="16.5" rx="5.5" ry="2.8" transform="rotate(-20 38.5 16.5)" style={fs(E2, E1, 2)} />
          <path d="M16 8h16c3.5 0 5.5 3 5 6.5L34 32c-1 6.5-5 10-10 10s-9-3.5-10-10l-3-17.5C10.5 11 12.5 8 16 8z" style={{ ...fs(E2, E1, 2.4), strokeLinejoin: "round" }} />
          <ellipse cx="24" cy="34.5" rx="8.5" ry="5.8" style={f(E1)} />
          <g style={f(E2)}>
            <circle cx="20.8" cy="34.5" r="1.5" />
            <circle cx="27.2" cy="34.5" r="1.5" />
          </g>
          <g style={f(E1)}>
            <circle cx="18.5" cy="21" r="1.9" />
            <circle cx="29.5" cy="21" r="1.9" />
          </g>
        </>
      );
    case "chest":
      return (
        <>
          <rect x="5" y="22" width="38" height="21" rx="2" style={fs(E2, E1, 2.4)} />
          <path d="M5 22v-6C5 10.5 9.5 7 15.5 7h17C38.5 7 43 10.5 43 16v6z" style={f(E1)} />
          <path d="M14 22v21M34 22v21" style={s(E1, 2.4)} />
          <rect x="19.5" y="18" width="9" height="10" rx="1.6" style={fs(E2, E1, 2)} />
          <path d="M24 21.5v3" style={s(E1, 2, { strokeLinecap: "round" })} />
          <Star cx={24} cy={36} r={4} fill={E1} />
        </>
      );
    case "acorn":
      return (
        <>
          <path d="M24 9c0-3 1.5-5.5 4.5-7" style={s(E1, 2.6, { strokeLinecap: "round" })} />
          <path d="M11 20h26c0 12-5.5 21.5-13 24-7.5-2.5-13-12-13-24z" style={{ ...fs(E2, E1, 2.4), strokeLinejoin: "round" }} />
          <path d="M7 21c0-8 7.5-12.5 17-12.5S41 13 41 21z" style={f(E1)} />
          <g style={f(E2)}>
            <circle cx="15" cy="16" r="1.4" />
            <circle cx="21" cy="13" r="1.4" />
            <circle cx="27" cy="13" r="1.4" />
            <circle cx="33" cy="16" r="1.4" />
            <circle cx="24" cy="17.5" r="1.4" />
          </g>
          <path d="M20 26c0 6 1.5 10 4 13" style={s(E1, 1.8, { strokeLinecap: "round" })} />
        </>
      );
    case "key":
      return (
        <>
          <path d="M23 23l19.5 19.5" style={s(E1, 4.6, { strokeLinecap: "round" })} />
          <path d="M33.5 33.5L29.5 37.5M39 39l-4 4" style={s(E1, 4)} />
          <circle cx="15.5" cy="15.5" r="12" style={fs(E2, E1, 2.6)} />
          <text x="15.5" y="19.3" textAnchor="middle" style={txt(11)}>
            18
          </text>
        </>
      );
    /* ---------- Geburt ---------- */
    case "onesie":
      return (
        <>
          <path
            d="M17 6c0 3 3 5 7 5s7-2 7-5l6 2 8 8-5 6-4-3v15c0 3-3 4.5-5 5l-1 5h-4l-2-4-2 4h-4l-1-5c-2-.5-5-2-5-5V19l-4 3-5-6 8-8z"
            style={{ ...fs(E2, E1, 2.2), strokeLinejoin: "round" }}
          />
          <g style={f(E1)}>
            <circle cx="24" cy="18" r="1.7" />
            <circle cx="24" cy="24" r="1.7" />
          </g>
          <Star cx={24} cy={32} r={4.4} fill={E1} />
        </>
      );
    case "feet":
      return (
        <>
          <ellipse cx="15.5" cy="34" rx="6" ry="9" transform="rotate(-10 15.5 34)" style={f(E1)} />
          <g style={f(E1)}>
            <circle cx="9.6" cy="23.8" r="1.5" />
            <circle cx="12.2" cy="21.6" r="1.7" />
            <circle cx="15.4" cy="20.4" r="1.9" />
            <circle cx="19.3" cy="20.6" r="2.4" />
          </g>
          <ellipse cx="32.5" cy="21" rx="6" ry="9" transform="rotate(10 32.5 21)" style={fs(E2, E1, 1.8)} />
          <g style={fs(E2, E1, 1.2)}>
            <circle cx="28.7" cy="7.6" r="2.4" />
            <circle cx="32.6" cy="7.4" r="1.9" />
            <circle cx="35.8" cy="8.6" r="1.7" />
            <circle cx="38.4" cy="10.8" r="1.5" />
          </g>
        </>
      );
    case "pram":
      return (
        <>
          <path d="M6 20h34c0 9-7 15-17 15S6 29 6 20z" style={{ ...fs(E2, E1, 2.4), strokeLinejoin: "round" }} />
          <path d="M6 20A17 17 0 0 1 23 3v17z" style={f(E1)} />
          <path d="M40 20l3.5-8H47" style={s(E1, 2.4, round)} />
          <circle cx="14" cy="40.5" r="4.5" style={fs(E2, E1, 2.4)} />
          <circle cx="32" cy="40.5" r="4.5" style={fs(E2, E1, 2.4)} />
        </>
      );
    /* ---------- Taufe ---------- */
    case "rainbow":
      return (
        <>
          <path d="M6 36a18 18 0 0 1 36 0" style={s(E1, 4.2)} />
          <path d="M12 36a12 12 0 0 1 24 0" style={s(E2, 4.2)} />
          <path d="M18 36a6 6 0 0 1 12 0" style={s(E1, 4.2)} />
          <path d={CLOUD} style={{ ...fs("#fff", E1, 2), strokeLinejoin: "round" }} />
          <path d={CLOUD} transform="translate(48 0) scale(-1 1)" style={{ ...fs("#fff", E1, 2), strokeLinejoin: "round" }} />
          <Star cx={24} cy={9} r={4.5} fill={E1} />
        </>
      );
    case "shell":
      return (
        <>
          <path d="M24 41L6 20C10 9.5 17 5 24 5s14 4.5 18 15z" style={{ ...fs(E2, E1, 2.4), strokeLinejoin: "round" }} />
          <path d="M24 41L11.5 12.5M24 41L17.5 8M24 41V5.5M24 41l6.5-33M24 41l12.5-28.5" style={s(E1, 1.8, { strokeLinecap: "round" })} />
          <path d="M18.5 40.5h11l-2.5 5h-6z" style={f(E1)} />
        </>
      );
    /* ---------- Geburtstag ---------- */
    case "balloons":
      return (
        <>
          <path d="M15 26c1 7 6 12 9 19M31 23c-1 8-4 15-7 22M38 33c-4 3-10 7-14 12" style={s(E1, 1.5, { strokeLinecap: "round" })} />
          <ellipse cx="15" cy="16" rx="8" ry="10" style={fs(E2, E1, 2.2)} />
          <ellipse cx="31" cy="13" rx="8" ry="10" style={f(E1)} />
          <ellipse cx="39" cy="27.5" rx="5" ry="6.2" style={fs(E2, E1, 2)} />
          <g style={f(E1)}>
            <path d="M13.5 27.5h3l-1.5-2z" />
            <path d="M29.5 24.5h3l-1.5-2z" />
          </g>
        </>
      );
    case "crown":
      return (
        <>
          <path d="M7 35L4.5 13l10.5 10L24 7l9 16 10.5-10L41 35z" style={{ ...fs(E2, E1, 2.4), strokeLinejoin: "round" }} />
          <rect x="6" y="35" width="36" height="7" rx="1.6" style={f(E1)} />
          <g style={f(E1)}>
            <circle cx="4.5" cy="12" r="2.8" />
            <circle cx="24" cy="6" r="2.8" />
            <circle cx="43.5" cy="12" r="2.8" />
          </g>
          <g style={f(E2)}>
            <circle cx="15" cy="38.5" r="1.6" />
            <circle cx="24" cy="38.5" r="1.6" />
            <circle cx="33" cy="38.5" r="1.6" />
          </g>
          <Star cx={24} cy={27} r={4.5} fill={E1} />
        </>
      );
    case "gift":
      return (
        <>
          <rect x="7" y="21" width="34" height="23" rx="2" style={fs(E2, E1, 2.4)} />
          <rect x="4" y="14" width="40" height="8" rx="2" style={fs(E2, E1, 2.4)} />
          <rect x="21" y="14" width="6" height="30" style={f(E1)} />
          <path d="M24 14c-5-9-12-9-12-4 0 3 5 4 12 4zM24 14c5-9 12-9 12-4 0 3-5 4-12 4z" style={{ ...s(E1, 2.4), strokeLinejoin: "round" }} />
        </>
      );
    case "one":
      return (
        <>
          <path d="M29 12V7.5" style={s(E1, 2, { strokeLinecap: "round" })} />
          <ellipse cx="29" cy="4.6" rx="2.5" ry="3.5" style={f(E1)} />
          <path d="M17.5 19.5L27 12h4.5v30h-7.5V22l-6.5 3.5z" style={{ ...fs(E2, E1, 2.4), strokeLinejoin: "round" }} />
          <path d="M24.5 30h6M24.5 36h6" style={s(E1, 1.6)} />
          <path d="M12 44.5h24" style={s(E1, 3, { strokeLinecap: "round" })} />
          <Star cx={11} cy={10} r={4} fill={E1} />
          <Star cx={40} cy={22} r={3.5} fill={E1} />
        </>
      );
    case "bunting":
      return (
        <>
          <path d="M3 8q21 12 42 0M6 28q18 10 36 0" style={s(E1, 1.8, { strokeLinecap: "round" })} />
          {[
            [7.2, 10.2, 10, 0],
            [15.6, 13, 10, 1],
            [24, 14, 10, 0],
            [32.4, 13, 10, 1],
            [40.8, 10.2, 10, 0],
            [13.2, 31.2, 9, 1],
            [24, 33, 9, 0],
            [34.8, 31.2, 9, 1],
          ].map(([x, y, h, alt]) => (
            <path key={`${x}-${y}`} d={`M${x - 3.6} ${y}h7.2l-3.6 ${h}z`} style={alt ? f(E1) : { ...fs(E2, E1, 1.6), strokeLinejoin: "round" }} />
          ))}
        </>
      );
    /* ---------- Ostern ---------- */
    case "egg":
      return (
        <>
          <path d="M24 4C14 4 8 20 8 29c0 9 7 15 16 15s16-6 16-15C40 20 34 4 24 4z" style={fs(E2, E1, 2.4)} />
          <path d="M9 26l5-4 5 4 5-4 5 4 5-4 5 4" style={s(E1, 2.4, round)} />
          <g style={f(E1)}>
            <circle cx="17" cy="34" r="1.9" />
            <circle cx="24" cy="36" r="1.9" />
            <circle cx="31" cy="34" r="1.9" />
            <circle cx="24" cy="13" r="2.2" />
          </g>
        </>
      );
    case "bunny":
      return (
        <>
          <ellipse cx="17.5" cy="13" rx="4.8" ry="11" transform="rotate(-12 17.5 13)" style={fs(E2, E1, 2.4)} />
          <ellipse cx="30.5" cy="13" rx="4.8" ry="11" transform="rotate(12 30.5 13)" style={fs(E2, E1, 2.4)} />
          <ellipse cx="17.5" cy="13" rx="1.8" ry="7" transform="rotate(-12 17.5 13)" style={f(E1)} />
          <ellipse cx="30.5" cy="13" rx="1.8" ry="7" transform="rotate(12 30.5 13)" style={f(E1)} />
          <circle cx="24" cy="32" r="13" style={fs(E2, E1, 2.4)} />
          <g style={f(E1)}>
            <circle cx="19" cy="29.5" r="1.8" />
            <circle cx="29" cy="29.5" r="1.8" />
            <path d="M21.6 34h4.8L24 36.6z" />
          </g>
          <path d="M8 34h7M8 38l7-1.5M40 34h-7M40 38l-7-1.5" style={s(E1, 1.4, { strokeLinecap: "round" })} />
        </>
      );
    case "nest":
      return (
        <g transform="translate(0 -3) scale(1.04)">
          <ellipse cx="16" cy="25" rx="6" ry="7.5" transform="rotate(-10 16 25)" style={fs(E2, E1, 2)} />
          <ellipse cx="31" cy="23" rx="6.5" ry="8" transform="rotate(8 31 23)" style={fs(E2, E1, 2)} />
          <path d="M26 21l2.5 2 2.5-2 2.5 2 2.5-2" style={s(E1, 1.6, round)} />
          <circle cx="15" cy="23" r="1.6" style={f(E1)} />
          <path d="M4 29c2 11 10 16 20 16s18-5 20-16z" style={f(E1)} />
          <path d="M8 34c6 2 26 2 32 0M11 39c5 1.6 21 1.6 26 0" style={s(E2, 1.4, { strokeLinecap: "round" })} />
        </g>
      );
    /* ---------- Erstkommunion und Firmung ---------- */
    case "grapes":
      return (
        <>
          <path d="M24 16V8c0-2 2-4 5-4" style={s(E1, 2.2, { strokeLinecap: "round" })} />
          <path d="M25 9c5-6 14-5 17-1-4 5-12 6-17 1z" style={{ ...fs(E2, E1, 2), strokeLinejoin: "round" }} />
          {[
            [15.5, 20, 1],
            [24, 20, 0],
            [32.5, 20, 1],
            [19.8, 27.5, 0],
            [28.2, 27.5, 1],
            [24, 35, 1],
          ].map(([x, y, alt]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="4.3" style={alt ? f(E1) : fs(E2, E1, 1.8)} />
          ))}
        </>
      );
    case "fish":
      return (
        <>
          <path d="M4 21c7-11 21-13 30 0-9 13-23 11-30 0z" style={{ ...fs(E2, E1, 2.4), strokeLinejoin: "round" }} />
          <path d="M33 21l11-9-2 9 2 9z" style={{ ...fs(E1, E1, 1.6), strokeLinejoin: "round" }} />
          <circle cx="11.5" cy="19" r="1.9" style={f(E1)} />
          <path d="M18 15q3 6 0 12M24 14q3 7 0 14" style={s(E1, 1.6, { strokeLinecap: "round" })} />
          <path d="M5 40q4-3 8 0t8 0 8 0 8 0 8 0" style={s(E1, 2.2, round)} />
          <Star cx={40} cy={4.5} r={3.6} fill={E1} />
        </>
      );
    case "flame":
      return (
        <>
          <path d="M24 3c3 8 13 13 13 26 0 8-6 15-13 15s-13-7-13-15c0-7 4-10 6-14 1 5 3 7 5 7-1-6-1-12 2-19z" style={f(E1)} />
          <path d="M24 24c2 5 7 7 7 12 0 4-3 7-7 7s-7-3-7-7c0-4 4-6 7-12z" style={f(E2)} />
          <Star cx={41} cy={9} r={4} fill={E2} />
          <Star cx={8} cy={14} r={3} fill={E2} />
        </>
      );
    case "compass":
      return (
        <>
          <path d="M24 2v4M24 42v4M2 24h4M42 24h4" style={s(E1, 2.6, { strokeLinecap: "round" })} />
          <circle cx="24" cy="24" r="17" style={fs(E2, E1, 2.4)} />
          <path d="M24 10l4.5 14h-9z" style={f(E1)} />
          <path d="M24 38l4.5-14h-9z" style={{ ...s(E1, 2), strokeLinejoin: "round" }} />
          <circle cx="24" cy="24" r="2.4" style={fs(E2, E1, 1.8)} />
        </>
      );
    /* ---------- Schule ---------- */
    case "cone":
      return (
        <>
          <path d="M9 15l30-6-12 36z" style={{ ...fs(E2, E1, 2.4), strokeLinejoin: "round" }} />
          <path d="M14 25l22.5-4.5M19.5 35l13-2.6" style={s(E1, 1.8, { strokeLinecap: "round" })} />
          <Star cx={22} cy={28} r={3.6} fill={E1} />
          <path d="M9 15c1-7 5-10 9-8 3-5 9-5 11-1 4-3 9-1 10 3z" style={f(E1)} />
          <Star cx={29} cy={4} r={3.2} fill={E2} />
        </>
      );
    case "backpack":
      return (
        <>
          <path d="M18 12V8c0-3.5 12-3.5 12 0v4" style={s(E1, 2.4)} />
          <rect x="10" y="12" width="28" height="32" rx="6" style={fs(E2, E1, 2.4)} />
          <path d="M10 22c0-6 4-10 10-10h8c6 0 10 4 10 10v5H10z" style={f(E1)} />
          <rect x="20.5" y="23.5" width="7" height="6.5" rx="1.2" style={fs(E2, E1, 1.6)} />
          <rect x="15" y="33" width="18" height="8" rx="2" style={s(E1, 1.8)} />
          <Star cx={24} cy={17.5} r={3} fill={E2} />
        </>
      );
    case "certificate":
      return (
        <>
          <rect x="7" y="4" width="28" height="36" rx="2" style={s(E1, 2.4)} />
          <path d="M13 12h16M13 18h16M13 24h10" style={s(E1, 2, { strokeLinecap: "round" })} />
          <path d="M30.5 39l-3 7.5 3.8-1.8 1.8 3.8 1.9-7.5M37.5 39l3 7.5-3.8-1.8-1.8 3.8-1.9-7.5" style={{ ...fs(E1, E1, 1), strokeLinejoin: "round" }} />
          <circle cx="34" cy="33" r="8.5" style={fs(E2, E1, 2.2)} />
          <text x="34" y="37.2" textAnchor="middle" style={txt(12)}>
            1
          </text>
        </>
      );
    case "pencil":
      return (
        <>
          <g transform="rotate(-45 24 24)">
            <rect x="3" y="19" width="6" height="10" rx="1.6" style={f(E1)} />
            <rect x="9" y="19" width="25" height="10" style={fs(E2, E1, 2.2)} />
            <path d="M9 24h25" style={s(E1, 1.2)} />
            <path d="M34 19l11 5-11 5z" style={{ ...s(E1, 2.2), strokeLinejoin: "round" }} />
            <path d="M41.5 22.4L45 24l-3.5 1.6z" style={f(E1)} />
          </g>
          <Star cx={36} cy={38} r={5} fill={E1} />
          <Star cx={10} cy={10} r={3} fill={E1} />
        </>
      );
    /* ---------- Einfach so ---------- */
    case "clover":
      return (
        <>
          <path d="M24 24c4 9 7 15 13 21" style={s(E1, 2.6, { strokeLinecap: "round" })} />
          {[45, 135, 225, 315].map((r) => (
            <path key={r} d={LEAF} transform={`rotate(${r} 24 24)`} style={{ ...fs(E2, E1, 2), strokeLinejoin: "round" }} />
          ))}
          <circle cx="24" cy="24" r="2.2" style={f(E1)} />
        </>
      );
    case "heart":
      return (
        <>
          <path d={HEART} style={f(E1)} />
          <path d="M11 17c0-3 2-5 4.5-5.4" style={s(E2, 2.6, { strokeLinecap: "round" })} />
          <Star cx={40} cy={6} r={4.5} fill={E1} />
        </>
      );
    case "flower":
      return (
        <>
          <path d="M24 28v18" style={s(E1, 2.6, { strokeLinecap: "round" })} />
          <path d="M24 39c4-6 11-6 14-4-3 5-9 6-14 4z" style={f(E1)} />
          {[0, 60, 120, 180, 240, 300].map((r) => (
            <ellipse key={r} cx="24" cy="10.5" rx="5.4" ry="7.6" transform={`rotate(${r} 24 18.5)`} style={fs(E2, E1, 2)} />
          ))}
          <circle cx="24" cy="18.5" r="5" style={f(E1)} />
        </>
      );
    case "sun":
      return (
        <>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            const c = Math.cos(a);
            const si = Math.sin(a);
            return (
              <path
                key={i}
                d={`M${(24 + 14 * c).toFixed(2)} ${(24 + 14 * si).toFixed(2)}L${(24 + 21 * c).toFixed(2)} ${(24 + 21 * si).toFixed(2)}`}
                style={s(E1, 3, { strokeLinecap: "round" })}
              />
            );
          })}
          <circle cx="24" cy="24" r="10" style={fs(E2, E1, 2.4)} />
          <path d="M19.5 26.5c2.5 3 6.5 3 9 0" style={s(E1, 2, { strokeLinecap: "round" })} />
        </>
      );
  }
}

