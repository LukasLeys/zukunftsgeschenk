"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";
import s from "./eltern.module.css";

/** Zeigt Überweisungsdaten mit „Ich habe überwiesen“ oder (danach) den Dankeszustand. */
export function TransferConfirm({
  token,
  initialDone,
  pending,
  thanks,
}: {
  token: string;
  initialDone: boolean;
  pending: ReactNode;
  thanks: ReactNode;
}) {
  const [done, setDone] = useState(initialDone);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const changed = useRef(false);

  useEffect(() => {
    if (!changed.current) return;
    box.current?.querySelector<HTMLElement>("h1")?.focus();
  }, [done]);

  async function confirm() {
    setSending(true);
    setErr(null);
    try {
      const r = await fetch(`/api/ueberweisen/${encodeURIComponent(token)}`, { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(j.error ?? "Das hat nicht geklappt. Bitte versuch es noch einmal.");
        return;
      }
      changed.current = true;
      setDone(true);
      window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    } catch {
      setErr("Die Verbindung hat nicht geklappt. Bitte versuch es gleich noch einmal.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div ref={box}>
      {done ? (
        thanks
      ) : (
        <>
          {pending}
          <div className={s.confirm}>
            <button type="button" className="btn btn--ink" onClick={confirm} disabled={sending}>
              {sending ? "Wird gemeldet …" : "Ich habe überwiesen"}
              {sending ? null : <Icon name="check" />}
            </button>
            <p>Erst klicken, wenn du die Überweisung in der Banking-App bestätigt hast. Wir sagen den Eltern dann Bescheid.</p>
            <p className="err" role="alert">
              {err ?? ""}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
