// Rechenmodelle. Unverbindlich: angenommene Rendite, keine Kosten, keine Inflation.

export const DEFAULT_RATE = 0.067;
export const DEPOT_START_YEAR = 2027;
export const ANNUAL_LIMIT = 5000;
export const KEST = 0.275;

/** Startbonus laut Ministerialentwurf 157/ME nur für die Geburtsjahrgänge 2027 und 2028. */
export const startBonus = (birthYear: number) => (birthYear === 2027 || birthYear === 2028 ? 500 : 0);

export interface DepotRow {
  year: number;
  age: number;
  paid: number;
  value: number;
  gain: number;
  kestSaving: number;
}

export interface DepotResult {
  birthYear: number;
  startYear: number;
  years: number;
  bonus: number;
  monthly: number;
  oneOff: number;
  maxOneOff: number;
  rows: DepotRow[];
  end: DepotRow;
}

/** Depot-Rechner: Monatsrate (max. 416,67 €), Einmalzahlung im ersten Jahr, 6,7 % p. a. monatlich verzinst. */
export function depotModel(birthYear: number, monthlyInput: number, oneOffInput: number, rate = DEFAULT_RATE): DepotResult {
  const startYear = Math.max(DEPOT_START_YEAR, birthYear);
  const years = Math.max(0, birthYear + 18 - startYear);
  const bonus = startBonus(birthYear);
  const monthly = Math.max(0, Math.min(416.67, monthlyInput));
  const monthlyYear = Math.min(ANNUAL_LIMIT, Math.round(12 * monthly * 100) / 100);
  const maxOneOff = Math.round(Math.max(0, ANNUAL_LIMIT - monthlyYear) * 100) / 100;
  const oneOff = Math.round(Math.max(0, Math.min(maxOneOff, oneOffInput)) * 100) / 100;
  const r = Math.pow(1 + rate, 1 / 12) - 1;

  let value = bonus + oneOff;
  let paid = value;
  let privateValue = oneOff;
  let privatePaid = oneOff;
  const saving = (pv: number, pp: number) => Math.max(0, pv - pp) * KEST;
  const rows: DepotRow[] = [
    { year: 0, age: Math.max(0, startYear - birthYear), paid, value, gain: 0, kestSaving: 0 },
  ];
  for (let yr = 1; yr <= years; yr++) {
    let annual = yr === 1 ? oneOff : 0;
    for (let m = 0; m < 12; m++) {
      const deposit = Math.max(0, Math.round(Math.min(monthly, ANNUAL_LIMIT - annual) * 100) / 100);
      annual = Math.round((annual + deposit) * 100) / 100;
      paid += deposit;
      privatePaid += deposit;
      value = (value + deposit) * (1 + r);
      privateValue = (privateValue + deposit) * (1 + r);
    }
    rows.push({
      year: yr,
      age: Math.min(18, startYear - birthYear + yr),
      paid,
      value,
      gain: value - paid,
      kestSaving: saving(privateValue, privatePaid),
    });
  }
  return { birthYear, startYear, years, bonus, monthly, oneOff, maxOneOff, rows, end: rows[rows.length - 1] };
}

export interface GiftResult {
  years: number;
  given: number;
  value: number;
  gain: number;
  perYear: { year: number; age: number; given: number; value: number }[];
}

/**
 * Gutschein-Rechner: Geld kann frühestens ab 2027 ins Depot.
 * Einmal: G·(1+p)^n. Jährlich: Geschenk zu jedem Weihnachten ab 2027, jeweils ein volles Jahr verzinst.
 */
export function giftModel(amount: number, birthYear: number, yearly: boolean, rate = DEFAULT_RATE): GiftResult {
  const g = Math.max(0, Math.min(ANNUAL_LIMIT, amount));
  const startYear = Math.max(DEPOT_START_YEAR, birthYear);
  const n = Math.max(0, birthYear + 18 - startYear);
  const perYear: GiftResult["perYear"] = [];
  let value = 0;
  let given = 0;
  for (let k = 0; k <= n; k++) {
    if (k > 0) value *= 1 + rate;
    if (k < n || n === 0) {
      if (k === 0 || yearly) {
        value += g;
        given += g;
      }
    }
    perYear.push({ year: startYear + k, age: startYear + k - birthYear, given, value });
  }
  return { years: n, given, value, gain: value - given, perYear };
}
