"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import s from "./eltern.module.css";

/**
 * Kopiert `value` in die Zwischenablage. Ohne Clipboard-API (oder bei Fehler) wird der Text im Ziel-Element
 * markiert, damit man ihn selbst kopieren kann.
 */
export function CopyButton({ value, targetId, label }: { value: string; targetId?: string; label: string }) {
  const [state, setState] = useState<"idle" | "ok" | "manual">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function selectTarget() {
    const el = targetId ? document.getElementById(targetId) : null;
    if (!el) return;
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.focus();
      el.select();
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  async function copy() {
    clearTimeout(timer.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(value);
      setState("ok");
    } catch {
      selectTarget();
      setState("manual");
    }
    timer.current = setTimeout(() => setState("idle"), 4000);
  }

  return (
    <span className={s.copyWrap}>
      <button type="button" className={`${s.copy} ${state === "ok" ? s.copyOk : ""}`} onClick={copy} aria-label={`${label} kopieren`}>
        {state === "ok" ? (
          <Icon name="check" />
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
            </g>
          </svg>
        )}
        <span>{state === "ok" ? "Kopiert" : "Kopieren"}</span>
      </button>
      <span className="sr" aria-live="polite">
        {state === "ok" ? `${label} kopiert` : state === "manual" ? `${label} ist markiert. Jetzt mit Strg und C kopieren.` : ""}
      </span>
      {state === "manual" ? <span className={s.copyManual}>Markiert. Jetzt kopieren (Strg + C oder lange tippen).</span> : null}
    </span>
  );
}
