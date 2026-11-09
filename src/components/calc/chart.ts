"use client";

import { useEffect, useRef, useState } from "react";
import { fmtNumber } from "../format";

/** Misst die Breite eines Elements (für maßstabsgetreue SVG-Diagramme in echter Pixelbreite). */
export function useWidth<T extends HTMLElement>(fallback = 520) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** „Schöne“ Achsenteilung. */
export function niceScale(v: number, steps: number) {
  if (v <= 0) return { max: 1, step: 1 };
  const raw = v / steps;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  const nm = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
  const step = nm * p;
  return { max: Math.ceil(v / step - 1e-9) * step, step };
}

export const axisLabel = (v: number) => (v >= 10000 ? `${fmtNumber(v / 1000)}k` : fmtNumber(v));

export function ticks(max: number, step: number) {
  const out: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) out.push(v);
  return out;
}
