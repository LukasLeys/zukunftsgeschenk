"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

export interface UnwrapProps {
  /** Inhalt der Bühne, typischerweise `<div className="wrap hero-grid">…</div>`. */
  children: ReactNode;
  /** Text auf dem gelben Anhänger: „Für {tagName}“. */
  tagName: string;
  /** Betrag auf dem Anhänger, fertig formatiert (z. B. „100 €“). */
  tagAmount: string;
  tagLine?: string;
  /** Element in `children`, über dem Masche und Anhänger sitzen. Standard: `[data-unwrap-anchor]`. */
  anchorSelector?: string;
  id?: string;
  "aria-labelledby"?: string;
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const poly = (pts: [number, number][]) => `polygon(${pts.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(",")})`;
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Signature der Startseite: Die Bühne ist in pinkes Geschenkpapier mit Satinband, Masche und Anhänger
 * eingepackt und reißt beim Scrollen entlang einer gezackten Naht auf (clip-path, passiv + rAF).
 * Ohne JavaScript oder mit „Bewegung reduzieren“: geöffnet (nur ein Papierstreifen mit Band oben).
 * Aktiv nur, wenn <html> die Klasse `wrap-on` trägt (setzt das Inline-Skript im Root-Layout).
 */
export function Unwrap({ children, tagName, tagAmount, tagLine = "für deine Zukunft", anchorSelector = "[data-unwrap-anchor]", id = "gift", ...rest }: UnwrapProps) {
  const gift = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const g = gift.current;
    const st = stage.current;
    const w = wrap.current;
    if (!g || !st || !w) return;
    if (!root.classList.contains("wrap-on")) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      root.classList.remove("wrap-on");
      return;
    }

    const hl = w.querySelector<HTMLElement>(".half-l")!;
    const hr = w.querySelector<HTMLElement>(".half-r")!;
    const eL = hl.querySelector<HTMLElement>(".edge")!;
    const fL = hl.querySelector<HTMLElement>(".face")!;
    const eR = hr.querySelector<HTMLElement>(".edge")!;
    const fR = hr.querySelector<HTMLElement>(".face")!;

    let W = 0;
    let H = 0;
    let seam: [number, number][] = [];
    let jw: number[] = [];
    let dist = 400;
    let ticking = false;
    let lastP = -1;
    let raf = 0;

    function update() {
      ticking = false;
      const p = clamp(window.scrollY / dist);
      if (Math.abs(p - lastP) < 0.0005) return;
      lastP = p;
      w!.style.setProperty("--p", p.toFixed(4));
      w!.style.setProperty("--bp", clamp(p / 0.24).toFixed(4));
      w!.style.setProperty("--rp", smooth(clamp((p - 0.04) / 0.32)).toFixed(4));
      w!.style.setProperty("--tp", smooth(clamp((p - 0.02) / 0.36)).toFixed(4));
      const q = smooth(clamp((p - 0.1) / 0.9));
      const front = q * H * 1.7;
      const span = H * 0.62;
      const L: [number, number][] = [[-2, -2]];
      const Lw: [number, number][] = [[-2, -2]];
      const R: [number, number][] = [[W + 2, -2], [W + 2, H + 2]];
      const Rw: [number, number][] = [[W + 2, -2], [W + 2, H + 2]];
      const rs: [number, number][] = [];
      const rws: [number, number][] = [];
      seam.forEach(([x, y], i) => {
        const o = smooth(clamp((front - y) / span));
        const lx = o > 0 ? x - o * (x + 80) : x + 1.5;
        const rx = o > 0 ? x + o * (W - x + 80) : x;
        const jag = o > 0 ? jw[i] * Math.min(1, o * 7) : 0;
        L.push([Math.max(-60, lx), y]);
        Lw.push([Math.max(-60, lx + jag), y]);
        rs.push([Math.min(W + 60, rx), y]);
        rws.push([Math.min(W + 60, rx - jag), y]);
      });
      L.push([-2, H + 2]);
      Lw.push([-2, H + 2]);
      rs.reverse().forEach((v) => R.push(v));
      rws.reverse().forEach((v) => Rw.push(v));
      fL.style.clipPath = poly(L);
      eL.style.clipPath = poly(Lw);
      fR.style.clipPath = poly(R);
      eR.style.clipPath = poly(Rw);
      w!.classList.toggle("tearing", q > 0 && q < 1);
      w!.classList.toggle("gone", p >= 0.999);
    }

    function layout() {
      const head = document.getElementById("head");
      const headH = head?.offsetHeight ?? 76;
      root.style.setProperty("--headH", `${headH}px`);
      // Höhe zurücksetzen, bevor gemessen wird
      g!.style.height = "";
      st!.style.position = "";
      st!.style.top = "";
      const anchor = st!.querySelector<HTMLElement>(anchorSelector);
      const sr = st!.getBoundingClientRect();
      const pr = (anchor ?? st!).getBoundingClientRect();
      W = st!.clientWidth;
      H = st!.clientHeight;
      const mobile = window.innerWidth < 900;
      const bx = Math.round(pr.left - sr.left + pr.width / 2);
      const ry = Math.round(pr.top - sr.top + (mobile ? 92 : Math.min(120, pr.height * 0.2)));
      w!.style.setProperty("--bx", `${bx}px`);
      w!.style.setProperty("--ry", `${ry}px`);
      const r = rng(23);
      const N = Math.max(16, Math.round(H / 24));
      seam = [];
      jw = [];
      const x0 = bx + 16;
      const x1 = bx - (mobile ? 24 : 56);
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        let x = x0 + (x1 - x0) * t + (i % 2 ? 1 : -1) * (3 + r() * 11);
        if (r() < 0.16) x += (r() - 0.5) * 26;
        seam.push([x, t * H]);
        jw.push(3 + r() * 6);
      }
      // Desktop: Bühne kurz anheften, damit das Auspacken in Ruhe passiert
      const avail = window.innerHeight - headH;
      const pinned = !mobile && window.innerWidth >= 1000 && H <= avail + 4 && H >= avail - 40;
      const extra = Math.round(Math.min(560, window.innerHeight * 0.62));
      g!.style.height = pinned ? `${H + extra}px` : "";
      st!.style.position = pinned ? "sticky" : "";
      st!.style.top = pinned ? "var(--headH)" : "";
      dist = pinned ? extra : mobile ? 300 : H * 0.5;
      lastP = -1;
      update();
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(layout);
    };
    const onMotion = () => {
      if (mq.matches) {
        root.classList.remove("wrap-on");
        g.style.height = "";
        st.style.position = "";
        st.style.top = "";
        [eL, fL, eR, fR].forEach((el) => (el.style.clipPath = ""));
      }
    };

    layout();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    mq.addEventListener("change", onMotion);
    let alive = true;
    document.fonts?.ready.then(() => alive && layout());

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onMotion);
      g.style.height = "";
      st.style.position = "";
      st.style.top = "";
    };
  }, [anchorSelector]);

  const long = tagAmount.replace(/\D/g, "").length >= 4;

  return (
    <section className="gift" id={id} ref={gift} {...rest}>
      <div className="gift-stage band" ref={stage}>
        <div className="gw" ref={wrap} aria-hidden="true">
          <div className="half half-l">
            <div className="edge" />
            <div className="face" />
          </div>
          <div className="half half-r">
            <div className="edge" />
            <div className="face" />
          </div>
          <div className="ribbon rib-l" />
          <div className="ribbon rib-r" />
          <div className="tagwrap">
            <svg className="thread" viewBox="0 0 40 80">
              <path d="M20 0C12 22 28 50 20 78" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              <path d="M20 0C12 22 28 50 20 78" fill="none" stroke="#e2b6c8" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <div className="tag">
              <p className="tag-for">Für {tagName}</p>
              <p className={long ? "tag-amt num long" : "tag-amt num"}>{tagAmount}</p>
              <p className="tag-line">{tagLine}</p>
              <div className="tag-foot" />
            </div>
            <span className="tag-ring" />
          </div>
          <div className="bow">
            <BowArt />
          </div>
          <span className="hint-scroll">
            <Icon name="scroll" />
            Scrollen zum Auspacken
          </span>
        </div>
        {children}
      </div>
    </section>
  );
}

/** Satinmasche (SVG aus dem Entwurf). */
function BowArt() {
  return (
    <svg viewBox="0 0 320 220">
      <defs>
        <linearGradient id="zg-sL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".35" stopColor="#fbeef3" />
          <stop offset=".6" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e4b9cb" />
        </linearGradient>
        <linearGradient id="zg-sIn" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9a3ba" />
          <stop offset=".55" stopColor="#efd0dc" />
          <stop offset="1" stopColor="#c98aa5" />
        </linearGradient>
        <linearGradient id="zg-sT" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ecc9d7" />
          <stop offset=".45" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e0b0c4" />
        </linearGradient>
        <linearGradient id="zg-sK" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".5" stopColor="#f6dfe8" />
          <stop offset="1" stopColor="#d9a7bc" />
        </linearGradient>
      </defs>
      <g className="tails">
        <path d="M150 116L106 208l18-9 9 19 31-100z" fill="url(#zg-sT)" />
        <path d="M170 116l42 90-18-8-10 19-30-99z" fill="url(#zg-sT)" />
        <path d="M152 126l-30 64M168 126l29 62" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".9" />
        <path d="M158 122l-26 74" stroke="#d6a1b7" strokeWidth="1.4" opacity=".7" />
      </g>
      <g className="loop-l">
        <path d="M158 100C134 60 76 18 40 32 8 45 10 104 46 122c34 17 86-2 112-14z" fill="url(#zg-sL)" />
        <path d="M158 102C132 82 90 66 70 76c-14 7-8 30 14 38 26 9 54 2 74-6z" fill="url(#zg-sIn)" />
        <path d="M146 86C118 54 76 32 46 42" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        <path d="M48 112c26 14 66 10 98 0" fill="none" stroke="#e6c0cf" strokeWidth="3" strokeLinecap="round" />
        <path d="M40 32c-6 12-4 30 6 42" fill="none" stroke="#e7c3d2" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g className="loop-r">
        <g transform="translate(320 0) scale(-1 1)">
          <path d="M158 100C134 60 76 18 40 32 8 45 10 104 46 122c34 17 86-2 112-14z" fill="url(#zg-sL)" />
          <path d="M158 102C132 82 90 66 70 76c-14 7-8 30 14 38 26 9 54 2 74-6z" fill="url(#zg-sIn)" />
          <path d="M146 86C118 54 76 32 46 42" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
          <path d="M48 112c26 14 66 10 98 0" fill="none" stroke="#e6c0cf" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
      <g className="knot">
        <rect x="138" y="84" width="44" height="42" rx="13" fill="url(#zg-sK)" />
        <path d="M146 94c8-3 20-3 28 0" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <path d="M144 118c10 3 22 3 32 0" fill="none" stroke="#d29bb2" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default Unwrap;
