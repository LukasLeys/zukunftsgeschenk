"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { Occasion } from "@/lib/catalog";
import { Icon } from "@/components/Icon";
import { MessageField, OccasionChips } from "./WishForm";
import s from "./eltern.module.css";

export function WishEdit({
  slug,
  token,
  childName,
  initialMessage,
  initialOccasion,
}: {
  slug: string;
  token: string;
  childName: string;
  initialMessage: string;
  initialOccasion: Occasion;
}) {
  const [message, setMessage] = useState(initialMessage);
  const [occasion, setOccasion] = useState<Occasion>(initialOccasion);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const api = `/api/wunschseite/${encodeURIComponent(slug)}?t=${encodeURIComponent(token)}`;

  async function save(ev: FormEvent) {
    ev.preventDefault();
    setSaving(true);
    setSaved(false);
    setErr(null);
    try {
      const r = await fetch(api, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), occasion }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(j.error ?? "Das Speichern hat nicht geklappt. Bitte versucht es noch einmal.");
        return;
      }
      setMessage(j.message ?? message);
      setSaved(true);
    } catch {
      setErr("Die Verbindung hat nicht geklappt. Bitte versucht es gleich noch einmal.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    setErr(null);
    try {
      const r = await fetch(api, { method: "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(j.error ?? "Das Löschen hat nicht geklappt. Bitte versucht es noch einmal.");
        return;
      }
      setDeleted(true);
    } catch {
      setErr("Die Verbindung hat nicht geklappt. Bitte versucht es gleich noch einmal.");
    } finally {
      setDeleting(false);
    }
  }

  if (deleted) {
    return (
      <div role="status">
        <h2 className={s.h2}>Die Wunschseite ist gelöscht.</h2>
        <p className={s.p}>
          Der Link funktioniert ab sofort nicht mehr, und eure IBAN ist von dieser Seite entfernt. Karten, die schon über die Seite
          gekauft wurden, bleiben gültig.
        </p>
        <div className="buy-row">
          <Link className="btn btn--ghost" href="/wunschseite">
            Neue Wunschseite anlegen
          </Link>
          <Link className="sec-link" href="/">
            Zur Startseite <Icon name="arrow" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <form className={s.form} onSubmit={save} noValidate>
        <OccasionChips value={occasion} onChange={(o) => (setOccasion(o), setSaved(false))} />
        <MessageField id="e-message" value={message} onChange={(v) => (setMessage(v), setSaved(false))} />
        <p className="err" role="alert">
          {err ?? ""}
        </p>
        <div className={s.actions}>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Wird gespeichert …" : "Änderungen speichern"}
          </button>
          <Link className="sec-link" href={`/fuer/${slug}`}>
            Seite ansehen <Icon name="arrow" />
          </Link>
        </div>
        <div role="status">
          {saved ? (
            <p className={s.ok}>
              <Icon name="check" /> Gespeichert. Die Seite für {childName} zeigt jetzt die neuen Angaben.
            </p>
          ) : null}
        </div>
      </form>

      <section className={s.danger} aria-labelledby="del-h">
        <h2 className={s.h3} id="del-h">
          Seite löschen
        </h2>
        {confirmDelete ? (
          <>
            <p>
              <b>Wirklich löschen?</b> Der Link funktioniert danach nicht mehr. Das lässt sich nicht rückgängig machen. Karten, die
              schon gekauft wurden, bleiben gültig.
            </p>
            <div className={s.actions}>
              <button type="button" className={`btn ${s.dangerBtn}`} onClick={remove} disabled={deleting}>
                {deleting ? "Wird gelöscht …" : "Ja, endgültig löschen"}
              </button>
              <button type="button" className={s.textBtn} onClick={() => setConfirmDelete(false)}>
                Abbrechen
              </button>
            </div>
          </>
        ) : (
          <>
            <p>Braucht ihr die Seite nicht mehr? Dann löscht sie. Wir entfernen dabei auch eure IBAN von der Seite.</p>
            <button type="button" className={`btn btn--sm ${s.dangerBtn}`} onClick={() => setConfirmDelete(true)}>
              Seite löschen
            </button>
          </>
        )}
      </section>
    </>
  );
}
