"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OCCASIONS, type Occasion } from "@/lib/catalog";
import { isValidIban } from "@/lib/iban";
import { Icon } from "@/components/Icon";
import { IbanField } from "./IbanField";
import s from "./eltern.module.css";

export const MESSAGE_MAX = 400;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function OccasionChips({ value, onChange, legend = "Anlass" }: { value: Occasion; onChange: (o: Occasion) => void; legend?: string }) {
  return (
    <fieldset className="fs">
      <legend>{legend}</legend>
      <div className="chips">
        {/* „Aktien & Geld“ ist eine Motivgruppe im Shop, kein Anlass. Bestehende Seiten behalten den Wert. */}
        {OCCASIONS.filter((o) => o.id !== "zukunft" || value === "zukunft").map((o) => (
          <label className="chip" key={o.id}>
            <input type="radio" name="occasion" value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function MessageField({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  return (
    <div className={s.field}>
      <label className="lab" htmlFor={id}>
        Eure Nachricht an die Familie <span className="muted">(freiwillig)</span>
      </label>
      <textarea
        id={id}
        className="field"
        rows={4}
        value={value}
        maxLength={MESSAGE_MAX}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Zum Beispiel: Statt noch mehr Spielzeug wünschen wir uns für Lena einen Beitrag fürs Zukunftsdepot. Danke!"
        aria-describedby={`${id}-count`}
      />
      <p className="counter" id={`${id}-count`}>
        {value.length} von {MESSAGE_MAX} Zeichen
      </p>
    </div>
  );
}

export function WishForm() {
  const router = useRouter();
  const [child, setChild] = useState("");
  const [occasion, setOccasion] = useState<Occasion>("weihnachten");
  const [parents, setParents] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [iban, setIban] = useState("");
  const [consent, setConsent] = useState(false);
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [server, setServer] = useState<{ field?: string; error: string } | null>(null);

  const errs: Record<string, string> = {};
  if (!child.trim()) errs.childName = "Bitte tragt den Vornamen eures Kindes ein.";
  if (parents.trim().length < 2) errs.parentName = "Bitte tragt eure Namen ein, so wie das Konto lautet.";
  if (!EMAIL_RE.test(email.trim())) errs.parentEmail = "Bitte gebt eine gültige E-Mail-Adresse ein, zum Beispiel anna@beispiel.at.";
  if (!isValidIban(iban)) errs.iban = "";
  if (!consent) errs.consent = "Bitte bestätigt die Einwilligung.";

  const show = (k: string) => (server?.field === k ? server.error : tried ? (errs[k] ?? "") : "");

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setTried(true);
    setServer(null);
    const first = ["childName", "parentName", "parentEmail", "iban", "consent"].find((k) => k in errs);
    if (first) {
      document.getElementById(`w-${first}`)?.focus();
      return;
    }
    setSending(true);
    try {
      const r = await fetch("/api/wunschseite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: child.trim(),
          parentName: parents.trim(),
          parentEmail: email.trim(),
          message: message.trim(),
          occasion,
          iban,
          consent: true,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.slug) {
        setServer({ field: j.field, error: j.error ?? "Das Anlegen hat nicht geklappt. Bitte versucht es noch einmal." });
        return;
      }
      router.push(`/fuer/${j.slug}?neu=1`);
    } catch {
      setServer({ error: "Die Verbindung hat nicht geklappt. Eure Eingaben sind noch da. Bitte versucht es gleich noch einmal." });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <div className={s.field}>
        <label className="lab" htmlFor="w-childName">
          Vorname des Kindes
        </label>
        <input
          id="w-childName"
          className="field"
          value={child}
          onChange={(e) => setChild(e.target.value)}
          maxLength={40}
          autoComplete="off"
          aria-invalid={show("childName") ? true : undefined}
          aria-describedby="w-childName-err"
        />
        <p className="err" id="w-childName-err">
          {show("childName")}
        </p>
      </div>

      <OccasionChips value={occasion} onChange={setOccasion} />

      <div className={s.field}>
        <label className="lab" htmlFor="w-parentName">
          Eure Namen
        </label>
        <input
          id="w-parentName"
          className="field"
          value={parents}
          onChange={(e) => setParents(e.target.value)}
          maxLength={70}
          autoComplete="name"
          placeholder="Zum Beispiel Anna und Thomas Huber"
          aria-invalid={show("parentName") ? true : undefined}
          aria-describedby="w-parentName-hint w-parentName-err"
        />
        <p className="hint" id="w-parentName-hint">
          So, wie das Konto lautet. Die Bank vergleicht den Namen bei der Überweisung.
        </p>
        <p className="err" id="w-parentName-err">
          {show("parentName")}
        </p>
      </div>

      <div className={s.field}>
        <label className="lab" htmlFor="w-parentEmail">
          E-Mail-Adresse
        </label>
        <input
          id="w-parentEmail"
          className="field"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={show("parentEmail") ? true : undefined}
          aria-describedby="w-parentEmail-hint w-parentEmail-err"
        />
        <p className="hint" id="w-parentEmail-hint">
          Dorthin schicken wir den Link zum Bearbeiten. Auf der Seite selbst steht die Adresse nicht.
        </p>
        <p className="err" id="w-parentEmail-err">
          {show("parentEmail")}
        </p>
      </div>

      <MessageField id="w-message" value={message} onChange={setMessage} />

      <IbanField id="w-iban" value={iban} onChange={setIban} showErrors={tried} serverError={server?.field === "iban" ? server.error : null} label="IBAN eures Kontos" />

      <div className={s.field}>
        <label className="check" htmlFor="w-consent">
          <input
            id="w-consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={show("consent") ? true : undefined}
            aria-describedby="w-consent-err"
          />
          <span>
            Ich bin einverstanden, dass Zukunftsgeschenk unsere Namen und unsere IBAN speichert und als Bank-QR-Code an Menschen
            weitergibt, die über diese Seite schenken. Mehr dazu im <Link href="/datenschutz">Datenschutz</Link>.
          </span>
        </label>
        <p className="err" id="w-consent-err">
          {show("consent")}
        </p>
      </div>

      <ul className={s.reassure} aria-label="Datenschutz">
        <li>
          <Icon name="lock" />
          <span>Die IBAN steht nie lesbar auf der Seite. Wir speichern sie verschlüsselt und packen sie nur in den Bank-QR-Code.</span>
        </li>
        <li>
          <Icon name="direct" />
          <span>Das Geld fließt nie über uns. Es geht direkt von der Familie auf euer Konto.</span>
        </li>
        <li>
          <Icon name="mail" />
          <span>Ihr könnt die Seite jederzeit ändern oder löschen. Den Link dazu bekommt ihr per E-Mail.</span>
        </li>
      </ul>

      <p className="err" role="alert">
        {server && !["childName", "parentName", "parentEmail", "iban"].includes(server.field ?? "") ? server.error : ""}
      </p>
      <div className={s.actions}>
        <button className="btn" type="submit" disabled={sending}>
          {sending ? "Wird angelegt …" : "Wunschseite anlegen"}
          {sending ? null : <Icon name="arrow" />}
        </button>
      </div>
    </form>
  );
}
