"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ANNUAL_LIMIT, depotModel, type DepotRow } from "@/lib/calc";
import { Icon } from "../Icon";
import { eur } from "../format";
import { axisLabel, niceScale, ticks, useWidth } from "./chart";

export interface DepotCalculatorProps {
  /** Präfix für Feld-IDs. Standard „d“. */
  id?: string;
  defaultBirthYear?: number;
  defaultMonthly?: number;
  /** Erklärsatz über dem Rechner anzeigen (Standard: ja). */
  intro?: boolean;
}

const STEP_MAX = 417; // höchste Stufe = 416,67 € (5.000 € im Jahr)
const toMonthly = (step: number) => (step >= STEP_MAX ? 416.67 : step);
const maxOneOffFor = (monthly: number) => Math.max(0, Math.floor(ANNUAL_LIMIT - 12 * monthly + 1e-9));
const EXAMPLES = [
  { step: 50, label: "50 € pro Monat" },
  { step: 150, label: "150 € pro Monat" },
  { step: STEP_MAX, label: "5.000 € pro Jahr" },
];

/** Depot-Rechner: Wie könnte sich das ganze Zukunftsdepot bis 18 entwickeln? (Modell, 6,7 % p. a.) */
export function DepotCalculator({ id = "d", defaultBirthYear = 2027, defaultMonthly = 100, intro = true }: DepotCalculatorProps) {
  const [birthYear, setBirthYear] = useState(defaultBirthYear);
  const [step, setStep] = useState(defaultMonthly);
  const [onceText, setOnceText] = useState("0");

  const monthly = toMonthly(step);
  const maxOnce = maxOneOffFor(monthly);
  const once = Math.min(maxOnce, Math.max(0, Math.round(Number(onceText) || 0)));
  const res = useMemo(() => depotModel(birthYear, monthly, once), [birthYear, monthly, once]);
  const end = res.end;

  const examples = useMemo(
    () =>
      EXAMPLES.map((e) => {
        const r = depotModel(2027, toMonthly(e.step), 0);
        return { ...e, value: Math.round(r.end.value / 1000) * 1000, paid: r.end.paid };
      }),
    [],
  );

  const yearOpts = useMemo(() => Array.from({ length: 36 }, (_, i) => 2010 + i), []);

  return (
    <>
      {intro ? (
        <p className="lead" style={{ marginBottom: 26 }}>
          Wähle den Geburtsjahrgang. Gerechnet wird mit 6,7 % angenommener Jahresrendite, dem staatlichen Startbonus von
          500 € für die Jahrgänge 2027 und 2028 und höchstens 5.000 € privaten Einzahlungen pro Jahr.
        </p>
      ) : null}
      <div className="calc-grid">
        <form className="inputs" noValidate onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="lab" htmlFor={`${id}-year`}>
              Geburtsjahr des Kindes
            </label>
            <select className="field" id={`${id}-year`} value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))}>
              {yearOpts.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <p className="info-line" aria-live="polite">
            Jahrgang {birthYear}:{" "}
            {res.bonus ? "500 € Startbonus im Modell vorgesehen." : "kein Startbonus im Modell (laut Entwurf nur Jahrgänge 2027 und 2028)."}{" "}
            Sparbeginn {res.startYear}, Laufzeit {res.years} {res.years === 1 ? "Jahr" : "Jahre"}.
          </p>
          <div>
            <div className="rowlab">
              <label className="lab" htmlFor={`${id}-month`}>
                Monatlicher Sparbetrag
              </label>
              <output htmlFor={`${id}-month`}>{eur(monthly, 2)}</output>
            </div>
            <input
              className="range"
              type="range"
              id={`${id}-month`}
              min={0}
              max={STEP_MAX}
              step={1}
              value={step}
              aria-valuetext={eur(monthly, 2)}
              style={{ "--p": `${(step / STEP_MAX) * 100}%` } as CSSProperties}
              onChange={(e) => {
                const s = Number(e.target.value);
                setStep(s);
                const m = maxOneOffFor(toMonthly(s));
                if ((Number(onceText) || 0) > m) setOnceText(String(m));
              }}
            />
            <p className="hint">Höchste Stufe: 416,67 € pro Monat (= 5.000 € im Jahr).</p>
          </div>
          <div>
            <label className="lab" htmlFor={`${id}-once`}>
              Einmalige Einzahlung bei Sparbeginn
            </label>
            <input
              className="field field--eur"
              id={`${id}-once`}
              type="number"
              inputMode="numeric"
              min={0}
              max={maxOnce}
              step={1}
              value={onceText}
              aria-describedby={`${id}-once-hint`}
              onChange={(e) => setOnceText(e.target.value)}
              onBlur={() => setOnceText(String(once))}
            />
            <p className="hint" id={`${id}-once-hint`}>
              Bei dieser Monatsrate maximal {eur(maxOnce)} einmalig möglich.
            </p>
          </div>
          <div className="examples">
            <p>Beispiele, Jahrgang 2027</p>
            <div className="ex-btns">
              {examples.map((e) => (
                <button
                  key={e.step}
                  className="ex-btn"
                  type="button"
                  aria-label={`${e.label}: Depotwert rund ${eur(e.value)}, eingezahlt ${eur(e.paid)}. Im Rechner übernehmen.`}
                  onClick={() => {
                    setBirthYear(2027);
                    setStep(e.step);
                    setOnceText("0");
                  }}
                >
                  <span>{e.label}</span>
                  <b>rund {eur(e.value)}</b>
                </button>
              ))}
            </div>
          </div>
        </form>
        <div>
          <div className="result" aria-live="polite">
            <p className="result-label">Voraussichtlicher Depotwert zum 18. Geburtstag</p>
            <p className="big">{eur(end.value)}</p>
            <dl className="kv">
              <div>
                <dt>Einzahlungen inkl. Startbonus</dt>
                <dd>{eur(end.paid)}</dd>
              </div>
              <div>
                <dt>Steuerfreier Wertzuwachs</dt>
                <dd>{eur(end.gain)}</dd>
              </div>
              <div>
                <dt>Geschätzte KESt-Ersparnis (27,5 %)</dt>
                <dd>{eur(end.kestSaving)}</dd>
              </div>
            </dl>
          </div>
          <div className="chart-wrap">
            <p className="chart-title">So könnte sich das Depot entwickeln</p>
            <DepotChart rows={res.rows} />
            <div className="legend">
              <span>
                <i style={{ background: "#d81b6a" }} />
                Depotwert (Kursgewinne KESt-frei)
              </span>
              <span>
                <i style={{ background: "#2a1f2d" }} />
                Einzahlungen
              </span>
            </div>
          </div>
        </div>
      </div>
      <details className="yr">
        <summary>
          Jährlicher Verlauf <Icon name="down" />
        </summary>
        <div className="tbl-scroll">
          <table>
            <caption className="sr">Modellwerte zum Ende jedes Sparjahres; Jahr 0 zeigt das Startkapital.</caption>
            <thead>
              <tr>
                <th scope="col">Jahr</th>
                <th scope="col">Alter (ca.)</th>
                <th scope="col">Einzahlungen</th>
                <th scope="col">Depotwert</th>
                <th scope="col">Wertzuwachs</th>
                <th scope="col">KESt-Ersparnis</th>
              </tr>
            </thead>
            <tbody>
              {res.rows.map((r) => (
                <tr key={r.year}>
                  <td>{r.year}</td>
                  <td>{r.age}</td>
                  <td>{eur(r.paid)}</td>
                  <td>{eur(r.value)}</td>
                  <td>{eur(r.gain)}</td>
                  <td>{eur(r.kestSaving)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p className="foot-note">
        Unverbindliche Modellrechnung auf Grundlage des Gesetzesentwurfs (Stand Nov. 2026). 6,7 % angenommene
        Jahresrendite, keine Kosten, keine Inflation. Keine Renditegarantie, Werte können schwanken. Modellannahmen:
        Sparbeginn frühestens 2027 in ganzen Jahren, Einzahlung monatlich zu Monatsbeginn, einmalige Einzahlung beim
        Sparbeginn; private Einzahlungen höchstens 5.000 € pro Jahr, der Startbonus zählt nicht mit. KESt-Ersparnis
        vereinfacht als 27,5 % des Wertzuwachses aus privaten Einzahlungen.
      </p>
    </>
  );
}

function DepotChart({ rows }: { rows: DepotRow[] }) {
  const [ref, W0] = useWidth<HTMLDivElement>();
  const W = Math.max(260, W0);
  const H = 260, ml = 50, mr = 12, mt = 16, mb = 32;
  const pw = W - ml - mr, ph = H - mt - mb;
  const n = Math.max(1, rows.length - 1);
  const { max, step } = niceScale(Math.max(1, ...rows.map((r) => r.value)), 4);
  const x = (i: number) => ml + (i / n) * pw;
  const y = (v: number) => mt + ph - (v / max) * ph;
  const pv = rows.map((r, i) => `${x(i).toFixed(1)},${y(r.value).toFixed(1)}`);
  const pp = rows.map((r, i) => `${x(i).toFixed(1)},${y(r.paid).toFixed(1)}`);
  const L = rows.length - 1;
  const mid = Math.round(n / 2);
  const last = rows[L];

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`Diagramm: Depotwert und Einzahlungen über ${n} Jahre, maßstabsgetreu. Am Ende rund ${eur(last.value)} Depotwert bei ${eur(last.paid)} Einzahlungen.`}
    >
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
        {ticks(max, step).map((v) => (
          <g key={v}>
            <line x1={ml} x2={W - mr} y1={y(v)} y2={y(v)} stroke={v === 0 ? "#2a1f2d" : "#f1e2b8"} strokeWidth={v === 0 ? 1.5 : 1} />
            <text x={ml - 8} y={y(v) + 5} textAnchor="end">
              {axisLabel(v)}
            </text>
          </g>
        ))}
        <path d={`M${x(0)},${y(0)} L${pv.join(" L")} L${x(L)},${y(0)}Z`} fill="#ffd23f" fillOpacity=".55" />
        <polyline points={pp.join(" ")} fill="none" stroke="#2a1f2d" strokeWidth="2.5" strokeDasharray="7 5" strokeLinejoin="round" />
        <polyline points={pv.join(" ")} fill="none" stroke="#d81b6a" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(L)} cy={y(last.value)} r="6" fill="#fff" stroke="#d81b6a" strokeWidth="3" />
        <text x={x(0)} y={H - 8} textAnchor="start">
          0 J.
        </text>
        <text x={x(mid)} y={H - 8} textAnchor="middle">
          {mid} J.
        </text>
        <text x={x(n)} y={H - 8} textAnchor="end">
          {n} J.
        </text>
      </svg>
    </div>
  );
}

export default DepotCalculator;
