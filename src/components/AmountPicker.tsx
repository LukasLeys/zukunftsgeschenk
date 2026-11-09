"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_AMOUNT_EUR, MIN_AMOUNT_EUR, PRESET_AMOUNTS } from "@/lib/catalog";
import { eur, fmtNumber } from "./format";

/** Fehlertext für einen Geschenkbetrag oder null, wenn gültig. */
export function amountError(v: number, min = MIN_AMOUNT_EUR, max = MAX_AMOUNT_EUR): string | null {
  if (!Number.isFinite(v)) return "Bitte gib einen Betrag in Euro ein.";
  if (v < min) return `Bitte mindestens ${eur(min)} eingeben.`;
  if (v > max) return `Höchstens ${eur(max)} – mehr dürfen die Eltern pro Kind und Jahr nicht ins Depot einzahlen.`;
  if (Math.round(v) !== v) return "Bitte einen ganzen Euro-Betrag eingeben.";
  return null;
}

export interface AmountPickerProps {
  /** Aktueller (gültiger) Betrag in Euro. */
  value: number;
  /** Wird nur mit gültigen Beträgen aufgerufen. */
  onChange: (amount: number) => void;
  /** Meldet den aktuellen Fehler (null = gültig), z. B. um „Weiter“ zu sperren. */
  onErrorChange?: (error: string | null) => void;
  /** Präfix für Feld-IDs; das Eingabefeld heißt `${id}-custom`. Standard „amt“. */
  id?: string;
  legend?: string;
  min?: number;
  max?: number;
  presets?: readonly number[];
  /** Hinweis neben dem eigenen Betrag. */
  customHint?: string;
  /** Fehler auch für ein leeres, unberührtes Feld anzeigen (z. B. nach Absenden). */
  showErrors?: boolean;
  className?: string;
}

/** Betragswahl: Chips 50/100/250/500 € plus „Eigener“ Betrag (10 bis 5.000 €) mit Fehlermeldung. */
export function AmountPicker({
  value,
  onChange,
  onErrorChange,
  id = "amt",
  legend = "Wie viel möchtest du schenken?",
  min = MIN_AMOUNT_EUR,
  max = MAX_AMOUNT_EUR,
  presets = PRESET_AMOUNTS,
  customHint,
  showErrors = false,
  className,
}: AmountPickerProps) {
  const [custom, setCustom] = useState(() => !presets.includes(value));
  const [text, setText] = useState(() => (presets.includes(value) ? "150" : String(value)));
  const [touched, setTouched] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Wert von außen (z. B. aus der URL) übernehmen
  useEffect(() => {
    if (presets.includes(value)) {
      setCustom((c) => (c && Number(text) === value ? c : false));
    } else if (Number(text) !== value) {
      setCustom(true);
      setText(String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const num = text.trim() === "" ? NaN : Number(text);
  const error = custom ? amountError(num, min, max) : null;

  useEffect(() => {
    onErrorChange?.(error);
  }, [error, onErrorChange]);

  const visibleError = error && (touched || showErrors || text.trim() !== "") ? error : null;
  const hint = customHint ?? `€, ${fmtNumber(min)} bis ${eur(max)} pro Kind und Jahr`;

  return (
    <fieldset className={["fs", className].filter(Boolean).join(" ")}>
      <legend>{legend}</legend>
      <div className="chips">
        {presets.map((p) => (
          <label className="chip" key={p}>
            <input
              type="radio"
              name={`${id}-choice`}
              id={`${id}-${p}`}
              value={p}
              checked={!custom && value === p}
              onChange={() => {
                setCustom(false);
                onChange(p);
              }}
            />
            <span>{eur(p)}</span>
          </label>
        ))}
        <label className="chip">
          <input
            type="radio"
            name={`${id}-choice`}
            id={`${id}-custom-choice`}
            value="custom"
            checked={custom}
            onChange={() => {
              setCustom(true);
              const n = Number(text);
              if (!amountError(n, min, max)) onChange(n);
              requestAnimationFrame(() => input.current?.focus());
            }}
          />
          <span>Eigener</span>
        </label>
      </div>
      <div className="custom" hidden={!custom}>
        <label className="sr" htmlFor={`${id}-custom`}>
          Eigener Betrag in Euro
        </label>
        <input
          ref={input}
          className="field field--eur"
          id={`${id}-custom`}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={text}
          aria-invalid={visibleError ? true : undefined}
          aria-describedby={`${id}-err`}
          onChange={(e) => {
            setText(e.target.value);
            const n = e.target.value.trim() === "" ? NaN : Number(e.target.value);
            if (!amountError(n, min, max)) onChange(n);
          }}
          onBlur={() => setTouched(true)}
        />
        <span className="small muted">{hint}</span>
      </div>
      <p className="err" id={`${id}-err`} aria-live="polite">
        {visibleError ?? ""}
      </p>
    </fieldset>
  );
}

export default AmountPicker;
