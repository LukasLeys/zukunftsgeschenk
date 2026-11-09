"use client";

import { useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import s from "./admin.module.css";

/**
 * Formular um die Drucktabelle: Kontrollkästchen name="id" für die Auswahl,
 * Zeilenknöpfe name="only" value=<id> für eine einzelne Karte.
 */
export function ShipForm({ children, undo = false, bulkLabel, toolbar, count }: { children: ReactNode; undo?: boolean; bulkLabel: string; toolbar?: ReactNode; count: number }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const boxes = () => Array.from(form.current?.querySelectorAll<HTMLInputElement>('input[name="id"]') ?? []);
  const sync = () => {
    const all = boxes();
    all.forEach((b) => b.closest("tr")?.setAttribute("data-selected", String(b.checked)));
    setSelected(all.filter((b) => b.checked).length);
  };
  const toggleAll = () => {
    const all = boxes();
    const on = all.some((b) => !b.checked);
    all.forEach((b) => (b.checked = on));
    sync();
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const ids = submitter?.name === "only" ? [submitter.value] : boxes().filter((b) => b.checked).map((b) => b.value);
    if (!ids.length) {
      setMsg({ ok: false, text: "Bitte zuerst Karten auswählen." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/druck/versendet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, undo }) });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      setMsg(res.ok ? { ok: true, text: data.message ?? "Erledigt" } : { ok: false, text: data.error ?? `Fehler ${res.status}` });
      if (res.ok) start(() => router.refresh());
    } catch {
      setMsg({ ok: false, text: "Keine Verbindung. Bitte nochmals versuchen." });
    } finally {
      setBusy(false);
    }
  }

  const working = busy || pending;
  return (
    <form ref={form} onSubmit={submit} onChange={sync} aria-busy={working}>
      <div className={s.toolbar}>
        <button type="button" className={s.btn} onClick={toggleAll} disabled={!count}>
          Alle auswählen
        </button>
        <button type="submit" className={`${s.btn} ${undo ? "" : s.btnPrimary}`} disabled={!selected || working}>
          {working ? "Speichert …" : `${bulkLabel}${selected ? ` (${selected})` : ""}`}
        </button>
        <span role="status" aria-live="polite" className={msg ? (msg.ok ? s.msg : s.msgErr) : undefined}>
          {msg?.text}
        </span>
        {toolbar && <div className={s.pageActions}>{toolbar}</div>}
      </div>
      {children}
    </form>
  );
}
