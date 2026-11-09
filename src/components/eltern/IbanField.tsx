"use client";

import { useId, useRef, useState } from "react";
import { IBAN_LENGTHS, formatIban, isValidIban, normalizeIban } from "@/lib/iban";
import { Icon } from "@/components/Icon";
import s from "./eltern.module.css";

/** Länderbezeichnung für die Fehlermeldung. Die Längen kommen aus lib/iban. */
const LAND: Record<string, string> = {
  AT: "österreichische",
  DE: "deutsche",
  CH: "Schweizer",
  LI: "liechtensteinische",
  IT: "italienische",
  SI: "slowenische",
  HU: "ungarische",
  CZ: "tschechische",
  SK: "slowakische",
  NL: "niederländische",
  BE: "belgische",
  LU: "luxemburgische",
  FR: "französische",
  ES: "spanische",
};

/** Wer die IBAN einträgt: die Eltern selbst (ihr) oder Schenkende für die Eltern (du). */
export type IbanAudience = "eltern" | "schenkende";

const TEXT: Record<IbanAudience, { empty: string; wrong: string; hint: string }> = {
  eltern: {
    empty: "Bitte gebt eure IBAN ein. Sie steht auf der Bankkarte oder im Online-Banking.",
    wrong: "Diese IBAN stimmt nicht. Bitte vergleicht sie Zeichen für Zeichen mit eurer Bankkarte oder dem Online-Banking.",
    hint: "Steht auf eurer Bankkarte oder im Online-Banking. Leerzeichen sind egal.",
  },
  schenkende: {
    empty: "Bitte gib die IBAN der Eltern ein.",
    wrong: "Diese IBAN stimmt nicht. Bitte vergleich sie Zeichen für Zeichen mit deiner Vorlage.",
    hint: "Zum Beispiel aus einer früheren Überweisung an die Eltern. Leerzeichen sind egal.",
  },
};

/** Fehlertext für eine IBAN oder null. `complete` = auch unfertige Eingaben bewerten (nach Verlassen/Absenden). */
export function ibanError(raw: string, complete: boolean, audience: IbanAudience = "eltern"): string | null {
  const v = normalizeIban(raw);
  if (!v) return complete ? TEXT[audience].empty : null;
  if (/[^A-Z0-9]/.test(v)) return "Eine IBAN besteht nur aus Buchstaben und Ziffern.";
  if (v.length >= 2 && !/^[A-Z]{2}/.test(v)) return "Eine IBAN beginnt mit zwei Buchstaben für das Land, in Österreich mit AT.";
  if (v.length >= 4 && !/^[A-Z]{2}\d{2}/.test(v)) return "Nach den zwei Buchstaben kommen zwei Ziffern, zum Beispiel AT61.";
  const cc = v.slice(0, 2);
  const len = IBAN_LENGTHS[cc];
  const what = LAND[cc] ? `Eine ${LAND[cc]} IBAN` : `Eine IBAN aus ${cc}`;
  if (len && v.length > len) return `${what} hat ${len} Zeichen. Eingegeben sind ${v.length}.`;
  const ready = complete || (len ? v.length === len : v.length >= 15);
  if (!ready) return null;
  if (len && v.length < len) return `${what} hat ${len} Zeichen. Bisher sind es ${v.length}.`;
  if (!isValidIban(v)) return TEXT[audience].wrong;
  return null;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Fehler vom Server oder nach dem Absenden erzwingen. */
  showErrors?: boolean;
  serverError?: string | null;
  label?: string;
  id?: string;
  /** Standard: Eltern tragen ihre eigene IBAN ein. */
  audience?: IbanAudience;
}

/** IBAN-Eingabe mit Anzeige in Vierergruppen und Prüfung während der Eingabe. */
export function IbanField({ value, onChange, showErrors, serverError, label = "IBAN", id, audience = "eltern" }: Props) {
  const auto = useId();
  const fid = id ?? `iban-${auto}`;
  const ref = useRef<HTMLInputElement>(null);
  const [touched, setTouched] = useState(false);
  const err = serverError || ibanError(value, touched || Boolean(showErrors), audience);
  const ok = !err && isValidIban(value);

  return (
    <div className={s.field}>
      <label className="lab" htmlFor={fid}>
        {label}
      </label>
      <div className={s.ibanRow}>
        <input
          ref={ref}
          id={fid}
          name="iban"
          className={`field ${s.iban}`}
          value={value}
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={42}
          placeholder="AT00 0000 0000 0000 0000"
          aria-invalid={err ? true : undefined}
          aria-describedby={`${fid}-hint ${fid}-err`}
          onChange={(e) => {
            const el = e.target;
            const caret = el.selectionStart ?? el.value.length;
            const before = normalizeIban(el.value.slice(0, caret)).length;
            const next = formatIban(el.value.replace(/[^A-Za-z0-9\s]/g, ""));
            onChange(next);
            // Cursor an derselben Zeichenposition halten, auch wenn Leerzeichen eingefügt werden
            requestAnimationFrame(() => {
              const node = ref.current;
              if (!node || document.activeElement !== node) return;
              let pos = 0;
              let seen = 0;
              while (pos < next.length && seen < before) {
                if (next[pos] !== " ") seen++;
                pos++;
              }
              node.setSelectionRange(pos, pos);
            });
          }}
          onBlur={() => setTouched(true)}
        />
        {ok ? (
          <span className={s.ibanOk} aria-hidden="true">
            <Icon name="check" />
          </span>
        ) : null}
      </div>
      <p className="hint" id={`${fid}-hint`}>
        {ok ? "IBAN geprüft, die Prüfziffer passt." : TEXT[audience].hint}
      </p>
      <p className="err" id={`${fid}-err`} aria-live="polite">
        {err ?? ""}
      </p>
    </div>
  );
}
