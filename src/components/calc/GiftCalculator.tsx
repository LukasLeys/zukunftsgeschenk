"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { DEFAULT_RATE, giftModel } from "@/lib/calc";
import { AmountPicker } from "../AmountPicker";
import { Icon } from "../Icon";
import { eur, roundNice } from "../format";
import { axisLabel, niceScale, ticks, useWidth } from "./chart";

export interface GiftCalculatorProps {
  /** Präfix für Feld-IDs, falls zwei Rechner auf einer Seite stehen. Standard „g“. */
  id?: string;
  defaultAmount?: number;
  /** Ziel des Buttons; `betrag` wird angehängt. Standard „/karten/sterne“. */
  designHref?: string;
}

const RATES = [
  { v: 0.03, label: "3 %" },
  { v: 0.05, label: "5 %" },
  { v: DEFAULT_RATE, label: "6,7 %" },
];

/** Gutschein-Rechner: Was wird aus einem Geschenk bis zum 18. Geburtstag? (Modell, keine Garantie) */
export function GiftCalculator({ id = "g", defaultAmount = 100, designHref = "/karten/sterne" }: GiftCalculatorProps) {
  const thisYear = new Date().getFullYear();
  const [amount, setAmount] = useState(defaultAmount);
  const [birthYear, setBirthYear] = useState(thisYear);
  const [yearly, setYearly] = useState(false);
  const [rate, setRate] = useState(DEFAULT_RATE);

  const res = useMemo(() => giftModel(amount, birthYear, yearly, rate), [amount, birthYear, yearly, rate]);
  const value = roundNice(res.value);
  const years = useMemo(() => {
    const out: { y: number; label: string }[] = [];
    for (let y = thisYear + 2; y >= thisYear - 16; y--) {
      const age = thisYear - y;
      out.push({ y, label: y > thisYear ? `${y} – Geburt erwartet` : age === 0 ? `${y} – heuer geboren` : `${y} – ${age} ${age === 1 ? "Jahr" : "Jahre"} alt` });
    }
    return out;
  }, [thisYear]);

  return (
    <>
      <div className="calc-grid">
        <form className="inputs" noValidate onSubmit={(e) => e.preventDefault()}>
          <AmountPicker
            id={`${id}-amt`}
            legend="Gutscheinbetrag"
            value={amount}
            onChange={setAmount}
            min={1}
            customHint="€ (max. 5.000)"
          />
          <div>
            <label className="lab" htmlFor={`${id}-year`}>
              Geburtsjahr des Kindes
            </label>
            <select className="field" id={`${id}-year`} value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))}>
              {years.map((o) => (
                <option key={o.y} value={o.y}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <fieldset className="fs">
            <legend>Wie oft schenkst du?</legend>
            <div className="seg">
              <label>
                <input type="radio" name={`${id}-mode`} checked={!yearly} onChange={() => setYearly(false)} />
                <span>Einmal</span>
              </label>
              <label>
                <input type="radio" name={`${id}-mode`} checked={yearly} onChange={() => setYearly(true)} />
                <span>Jedes Weihnachten wieder</span>
              </label>
            </div>
          </fieldset>
          <fieldset className="fs">
            <legend>Angenommene Rendite pro Jahr</legend>
            <div className="seg">
              {RATES.map((r) => (
                <label key={r.v}>
                  <input type="radio" name={`${id}-rate`} checked={rate === r.v} onChange={() => setRate(r.v)} />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
            <p className="hint">
              6,7 % ist dieselbe Modellannahme wie im Depot-Rechner. Niemand kann die Rendite vorhersagen – rechne ruhig
              auch vorsichtig.
            </p>
          </fieldset>
        </form>

        <div className="result">
          <p className="sentence" aria-live="polite">
            {yearly ? (
              <>
                Jedes Weihnachten <b>{eur(amount)}</b>, {res.years}-mal geschenkt, kann bis zum 18. Geburtstag auf rund{" "}
                <b>{eur(value)}</b> wachsen.
              </>
            ) : (
              <>
                Dein Gutschein über <b>{eur(amount)}</b> kann bis zum 18. Geburtstag auf rund <b>{eur(value)}</b> wachsen.
              </>
            )}
          </p>
          <p className="big" aria-hidden="true">
            {eur(value)}
          </p>
          <dl className="kv">
            <div>
              <dt>Geschenkt gesamt</dt>
              <dd>{eur(res.given)}</dd>
            </div>
            <div>
              <dt>Möglicher Wertzuwachs</dt>
              <dd>{eur(Math.max(0, value - res.given))}</dd>
            </div>
            <div>
              <dt>Zeit im Depot</dt>
              <dd>{res.years === 1 ? "1 Jahr" : `${res.years} Jahre`}</dd>
            </div>
          </dl>
          <div className="chart-wrap">
            <p className="chart-title">Jahr für Jahr</p>
            <GiftChart perYear={res.perYear} value={value} />
            <div className="legend">
              <span>
                <i style={{ background: "#2a1f2d" }} />
                Geschenkt
              </span>
              <span>
                <i className="lg-paper" />
                Möglicher Wertzuwachs
              </span>
            </div>
          </div>
          <Link className="btn" href={`${designHref}?betrag=${amount}`} style={{ marginTop: 20 }}>
            Diesen Gutschein gestalten <Icon name="arrow" />
          </Link>
        </div>
      </div>
      <p className="foot-note">
        Unverbindliches Rechenbeispiel auf Grundlage des Gesetzesentwurfs (Stand Nov. 2026). Keine Renditegarantie, Werte
        können schwanken. Ohne Kosten und Inflation gerechnet. Das Geld kann frühestens ab Juli 2027 ins Depot; gerechnet
        wird ab 2027 bis zum 18. Geburtstag. Mehr als 5.000 € pro Kind und Jahr dürfen die Eltern nicht einzahlen.
      </p>
    </>
  );
}

function GiftChart({ perYear, value }: { perYear: { year: number; given: number; value: number }[]; value: number }) {
  const [ref, W0] = useWidth<HTMLDivElement>();
  const pid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const s = perYear.slice(1);
  const W = Math.max(260, W0);
  const H = 220, ml = 56, mr = 8, mt = 26, mb = 30;
  const pw = W - ml - mr, ph = H - mt - mb;

  if (!s.length) {
    return (
      <div ref={ref}>
        <p className="hint">Das Kind ist 2027 schon 18 – das Geschenk kann nicht mehr ins Depot.</p>
      </div>
    );
  }
  const { max, step } = niceScale(Math.max(...s.map((x) => x.value)), 4);
  const y = (v: number) => mt + ph - (v / max) * ph;
  const band = pw / s.length;
  const bw = Math.max(3, band * 0.66);
  const last = s[s.length - 1];
  const lx = ml + (s.length - 1) * band + band / 2;

  return (
    <div ref={ref} role="img" aria-label={`Säulendiagramm: Wert des Geschenks am Ende jedes Jahres, maßstabsgetreu. Zum 18. Geburtstag rund ${eur(value)}.`}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
        <defs>
          <pattern id={`wp${pid}`} width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="#d81b6a" />
            <circle cx="4" cy="4" r="1.5" fill="#ffd23f" />
            <circle cx="12" cy="12" r="1.1" fill="#ffd23f" />
          </pattern>
        </defs>
        {ticks(max, step).map((v) => (
          <g key={v}>
            <line x1={ml} x2={W - mr} y1={y(v)} y2={y(v)} stroke={v === 0 ? "#2a1f2d" : "#f1e2b8"} strokeWidth={v === 0 ? 1.5 : 1} />
            <text x={ml - 8} y={y(v) + 5} textAnchor="end">
              {axisLabel(v)}
            </text>
          </g>
        ))}
        {s.map((d, i) => {
          const x = ml + i * band + (band - bw) / 2;
          const yp = y(Math.min(d.given, d.value));
          const yv = y(d.value);
          return (
            <g key={d.year}>
              <rect x={x.toFixed(1)} y={yp.toFixed(1)} width={bw.toFixed(1)} height={(mt + ph - yp).toFixed(1)} fill="#2a1f2d" />
              <rect x={x.toFixed(1)} y={yv.toFixed(1)} width={bw.toFixed(1)} height={Math.max(0, yp - yv).toFixed(1)} fill={`url(#wp${pid})`} />
            </g>
          );
        })}
        <text x={Math.min(lx, W - mr)} y={y(last.value) - 8} textAnchor="end" style={{ fontWeight: 800, fill: "#2a1f2d" }}>
          ≈ {eur(value)}
        </text>
        <text x={ml + band / 2} y={H - 8} textAnchor="start">
          2027
        </text>
        <text x={W - mr} y={H - 8} textAnchor="end">
          18. Geburtstag
        </text>
      </svg>
    </div>
  );
}

export default GiftCalculator;
