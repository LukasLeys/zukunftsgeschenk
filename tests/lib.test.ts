import { describe, it, expect } from "vitest";
import { depotModel, giftModel, startBonus } from "../src/lib/calc";
import { isValidIban, epcPayload, formatIban } from "../src/lib/iban";
import { normalizeCode } from "../src/lib/codes";

describe("Depot-Rechner", () => {
  it("entspricht der Kontrollrechnung: 2027, 100 €/Monat → 42.673 €", () => {
    const r = depotModel(2027, 100, 0);
    expect(Math.round(r.end.value)).toBe(42673);
    expect(Math.round(r.end.paid)).toBe(22100);
    expect(Math.round(r.end.kestSaving)).toBe(5353);
    expect(r.years).toBe(18);
  });
  it("begrenzt die Einmalzahlung auf das Jahreslimit", () => {
    expect(depotModel(2027, 100, 9999).oneOff).toBe(3800);
    expect(depotModel(2027, 416.67, 1000).maxOneOff).toBe(0);
  });
  it("Startbonus nur für 2027 und 2028", () => {
    expect(startBonus(2026)).toBe(0);
    expect(startBonus(2027)).toBe(500);
    expect(startBonus(2028)).toBe(500);
    expect(startBonus(2029)).toBe(0);
  });
  it("Kinder, die vor 2027 geboren sind, haben kürzere Laufzeit", () => {
    expect(depotModel(2020, 100, 0).years).toBe(11);
  });
});

describe("Gutschein-Rechner", () => {
  it("100 € einmal, Jahrgang 2027, 6,7 % → rund 321 €", () => {
    expect(Math.round(giftModel(100, 2027, false).value)).toBe(321);
  });
  it("jährlich schenkt zu jedem Weihnachten bis vor dem 18. Geburtstag", () => {
    const r = giftModel(100, 2027, true);
    expect(r.given).toBe(1800);
    expect(r.value).toBeGreaterThan(1800);
  });
});

describe("IBAN und EPC", () => {
  it("prüft österreichische IBANs", () => {
    expect(isValidIban("AT61 1904 3002 3457 3201")).toBe(true);
    expect(isValidIban("AT61 1904 3002 3457 3202")).toBe(false);
    expect(isValidIban("DE89 3704 0044 0532 0130 00")).toBe(true);
  });
  it("baut einen EPC069-12 Payload", () => {
    const p = epcPayload({ name: "Anna Muster", iban: "at611904300234573201", amountCents: 10000, remittance: "Zukunftsgeschenk für Lena" });
    expect(p.split("\n")).toEqual(["BCD", "002", "1", "SCT", "", "Anna Muster", "AT611904300234573201", "EUR100.00", "", "", "Zukunftsgeschenk für Lena"]);
    expect(formatIban("at611904300234573201")).toBe("AT61 1904 3002 3457 3201");
  });
  it("normalisiert Einlösecodes", () => {
    expect(normalizeCode("zg 7k4p 29xm")).toBe("ZG-7K4P-29XM");
  });
});
