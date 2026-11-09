"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import s from "./admin.module.css";

type Variant = "default" | "primary" | "danger";

/** POST-Aktion gegen eine Admin-Route (JSON), danach Seite neu laden. Mit optionaler Rückfrage. */
export function ActionButton({
  url,
  body,
  label,
  pendingLabel = "Läuft …",
  confirm,
  variant = "default",
  small,
  disabled,
  title,
}: {
  url: string;
  body?: unknown;
  label: string;
  pendingLabel?: string;
  confirm?: string;
  variant?: Variant;
  small?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    if (confirm && !window.confirm(confirm)) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) setMsg({ ok: false, text: data.error ?? data.message ?? `Fehler ${res.status}` });
      else {
        setMsg({ ok: true, text: data.message ?? "Erledigt" });
        start(() => router.refresh());
      }
    } catch {
      setMsg({ ok: false, text: "Keine Verbindung. Bitte nochmals versuchen." });
    } finally {
      setBusy(false);
    }
  }

  const cls = [s.btn, variant === "primary" && s.btnPrimary, variant === "danger" && s.btnDanger, small && s.btnSm].filter(Boolean).join(" ");
  const working = busy || pending;
  return (
    <span className={s.actionWrap}>
      <button type="button" className={cls} onClick={run} disabled={disabled || working} aria-busy={working} title={title}>
        {working ? pendingLabel : label}
      </button>
      <span role="status" aria-live="polite" className={msg ? (msg.ok ? s.msg : s.msgErr) : undefined}>
        {msg?.text}
      </span>
    </span>
  );
}
