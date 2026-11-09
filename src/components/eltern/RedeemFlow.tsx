"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { GiftCard } from "@/components/GiftCard";
import { HangTag } from "@/components/HangTag";
import { Icon } from "@/components/Icon";
import { eur } from "@/components/format";
import type { Paper } from "@/lib/catalog";
import { isValidIban } from "@/lib/iban";
import { IbanField } from "./IbanField";
import s from "./eltern.module.css";

interface CardInfo {
  code: string;
  status: "issued" | "redeemed" | "transferred" | string;
  childName: string;
  sender: string;
  amountCents: number;
  motif: string;
  paper: Paper;
  message: string;
  ibanKnown: boolean;
  /** Karte kam über eine Wunschseite (sonst haben die Schenkenden die Bankverbindung beim Kauf angegeben). */
  viaWish?: boolean;
}

type Step = "code" | "form" | "done";

const STEPS: { id: Step; label: string }[] = [
  { id: "code", label: "Code eingeben" },
  { id: "form", label: "Bankverbindung" },
  { id: "done", label: "Fertig" },
];

/** Code wie auf der Karte darstellen: ZG-XXXX-XXXX (Groß/Klein und Leerzeichen egal). */
function prettyCode(raw: string): string {
  const c = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = c.startsWith("ZG") ? c.slice(2) : c;
  if (body.length === 8) return `ZG-${body.slice(0, 4)}-${body.slice(4)}`;
  return raw.trim().toUpperCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Ein Satz mit dem Absender, ohne doppeltes „Von“. */
function giverName(sender: string): string {
  return sender.replace(/^von\s+/i, "").trim() || "Die schenkende Person";
}

export function RedeemFlow({ initialCode = "" }: { initialCode?: string }) {
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState(initialCode);
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [card, setCard] = useState<CardInfo | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [iban, setIban] = useState("");
  const [consent, setConsent] = useState(false);
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState<string | null>(null);

  const heading = useRef<HTMLHeadingElement>(null);
  const firstFocus = useRef(true);

  useEffect(() => {
    if (firstFocus.current) {
      firstFocus.current = false;
      return;
    }
    heading.current?.focus();
  }, [step, card?.status]);

  async function check(raw: string) {
    const value = raw.trim();
    if (!value) {
      setCodeErr("Bitte gebt den Code von der Karte ein, zum Beispiel ZG-7K4P-29XM.");
      return;
    }
    setChecking(true);
    setCodeErr(null);
    try {
      const r = await fetch(`/api/einloesen?code=${encodeURIComponent(value)}`, { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setCodeErr(j.error ?? "Diesen Code kennen wir nicht. Bitte prüft die Schreibweise.");
        setCard(null);
        return;
      }
      setCard(j as CardInfo);
      setCode(j.code);
      setStep("form");
    } catch {
      setCodeErr("Die Verbindung hat nicht geklappt. Bitte versucht es gleich noch einmal.");
    } finally {
      setChecking(false);
    }
  }

  // ?code= aus dem Link auf der Karte: sofort prüfen
  useEffect(() => {
    if (initialCode) void check(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function localErrors() {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.parentName = "Bitte tragt den Namen ein, auf den das Konto läuft.";
    if (!EMAIL_RE.test(email.trim())) e.parentEmail = "Bitte gebt eine gültige E-Mail-Adresse ein, zum Beispiel anna@beispiel.at.";
    if (!isValidIban(iban)) e.iban = "";
    if (!consent) e.consent = "Bitte bestätigt die Einwilligung, damit wir eure IBAN weitergeben dürfen.";
    return e;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setTried(true);
    setFormErr(null);
    const e = localErrors();
    setFieldErr(Object.fromEntries(Object.entries(e).filter(([, v]) => v)));
    if (Object.keys(e).length) {
      const first = ["parentName", "parentEmail", "iban", "consent"].find((k) => k in e);
      const id = first === "parentName" ? "r-name" : first === "parentEmail" ? "r-mail" : first === "iban" ? "r-iban" : "r-consent";
      document.getElementById(id)?.focus();
      return;
    }
    if (!card) return;
    setSending(true);
    try {
      const r = await fetch("/api/einloesen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: card.code, parentName: name.trim(), parentEmail: email.trim(), iban, consent: true }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (j.field && ["parentName", "parentEmail", "iban"].includes(j.field)) setFieldErr({ [j.field]: j.error });
        else if (/bereits eingelöst/i.test(j.error ?? "")) setCard({ ...card, status: "redeemed", ibanKnown: false });
        else setFormErr(j.error ?? "Das Einlösen hat nicht geklappt. Bitte versucht es noch einmal.");
        return;
      }
      setStep("done");
    } catch {
      setFormErr("Die Verbindung hat nicht geklappt. Eure Eingaben sind noch da. Bitte versucht es gleich noch einmal.");
    } finally {
      setSending(false);
    }
  }

  function restart() {
    setStep("code");
    setCode("");
    setCard(null);
    setName("");
    setEmail("");
    setIban("");
    setConsent(false);
    setTried(false);
    setFieldErr({});
    setFormErr(null);
  }

  const current = STEPS.findIndex((x) => x.id === step);
  const amount = card ? eur(card.amountCents / 100) : "";
  const giver = card ? giverName(card.sender) : "";
  const cardView = card ? (
    <GiftCard
      motif={card.motif}
      paper={card.paper}
      amount={card.amountCents / 100}
      childName={card.childName}
      sender={card.sender}
      message={card.message}
      size="md"
    />
  ) : null;

  return (
    <div className={s.flow}>
      <ol className={s.stepper} aria-label="Fortschritt">
        {STEPS.map((x, i) => (
          <li key={x.id} className={i < current ? s.stepDone : i === current ? s.stepNow : undefined} aria-current={i === current ? "step" : undefined}>
            <span className={s.stepDot} aria-hidden="true">
              {i < current ? <Icon name="check" /> : i + 1}
            </span>
            <span>{x.label}</span>
          </li>
        ))}
      </ol>

      {step === "code" ? (
        <section className={`paper ${s.sheet}`} aria-labelledby="r-h">
          <h1 id="r-h" ref={heading} tabIndex={-1} className={s.h1}>
            Karte einlösen
          </h1>
          <p className="lead">
            Ihr habt eine Zukunftsgeschenk-Karte bekommen? Gebt den Einlösecode ein. Er steht innen auf der Karte oder in der
            E-Mail.
          </p>
          <form
            className={s.codeForm}
            onSubmit={(e) => {
              e.preventDefault();
              void check(code);
            }}
            noValidate
          >
            <label className="lab" htmlFor="r-code">
              Einlösecode
            </label>
            <div className={s.codeRow}>
              <input
                id="r-code"
                className={`field ${s.code}`}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onBlur={() => setCode((c) => prettyCode(c))}
                placeholder="ZG-XXXX-XXXX"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={20}
                aria-invalid={codeErr ? true : undefined}
                aria-describedby="r-code-hint r-code-err"
              />
              <button className="btn" type="submit" disabled={checking}>
                {checking ? "Wird geprüft …" : "Code prüfen"}
                {checking ? null : <Icon name="arrow" />}
              </button>
            </div>
            <p className="hint" id="r-code-hint">
              Zum Beispiel ZG-7K4P-29XM. Groß- oder Kleinschreibung und Leerzeichen sind egal.
            </p>
            <p className="err" id="r-code-err" role="alert">
              {codeErr ?? ""}
            </p>
          </form>
          <Reassure />
        </section>
      ) : null}

      {step === "form" && card && card.status !== "issued" ? (
        <section className={s.split} aria-labelledby="r-h">
          <div className={`paper ${s.sheet}`}>
            <h1 id="r-h" ref={heading} tabIndex={-1} className={s.h1}>
              Diese Karte ist schon eingelöst.
            </h1>
            <p className="lead">
              Die Karte {card.code} für {card.childName} wurde bereits eingelöst.{" "}
              {card.status === "transferred"
                ? `${giver} hat die Überweisung über ${amount} schon gemeldet.`
                : `${giver} hat den Bank-QR-Code bekommen und überweist ${amount} direkt auf das angegebene Konto.`}
            </p>
            <p className={s.p}>
              Wart ihr das selbst? Dann ist alles in Ordnung, ihr müsst nichts mehr tun. Die Bestätigung kam per E-Mail. Wenn ihr
              die Karte nicht eingelöst habt, meldet euch bitte bei uns. Die Kontaktdaten stehen im Impressum.
            </p>
            <div className="buy-row">
              <button type="button" className="btn btn--ghost" onClick={restart}>
                Anderen Code eingeben
              </button>
              <Link className="sec-link" href="/impressum">
                Zum Impressum <Icon name="arrow" />
              </Link>
            </div>
          </div>
          <div className={s.cardStage}>{cardView}</div>
        </section>
      ) : null}

      {step === "form" && card && card.status === "issued" && card.ibanKnown ? (
        <section className={s.split} aria-labelledby="r-h">
          <div className={`paper ${s.sheet}`}>
            <h1 id="r-h" ref={heading} tabIndex={-1} className={s.h1}>
              Ihr müsst nichts tun.
            </h1>
            <p className="lead">
              Bei dieser Karte ist eure Bankverbindung schon hinterlegt.{" "}
              {card.viaWish ? "Die Karte kam über eure Wunschseite." : `${giver} hat sie beim Kauf angegeben.`} {giver} hat den
              Bank-QR-Code beim Kauf bekommen und überweist {amount} direkt an euch.
            </p>
            <Next giver={giver} amount={amount} />
            <div className="buy-row">
              <button type="button" className="btn btn--ghost" onClick={restart}>
                Anderen Code eingeben
              </button>
            </div>
          </div>
          <div className={s.cardStage}>{cardView}</div>
        </section>
      ) : null}

      {step === "form" && card && card.status === "issued" && !card.ibanKnown ? (
        <section className={s.split} aria-labelledby="r-h">
          <div className={`paper ${s.sheet}`}>
            <h1 id="r-h" ref={heading} tabIndex={-1} className={s.h1}>
              {amount} für {card.childName}
            </h1>
            <p className="lead">
              Ein Geschenk von {giver}. Tragt eure Bankverbindung ein. Dann bekommt {giver} einen Bank-QR-Code und überweist das Geld direkt auf euer Konto.
            </p>
            {card.message ? (
              <blockquote className={s.quote}>
                <p>{card.message}</p>
              </blockquote>
            ) : null}

            <form className={s.form} onSubmit={submit} noValidate>
              <div className={s.field}>
                <label className="lab" htmlFor="r-name">
                  Name der Kontoinhaberin oder des Kontoinhabers
                </label>
                <input
                  id="r-name"
                  className="field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  maxLength={70}
                  aria-invalid={fieldErr.parentName ? true : undefined}
                  aria-describedby="r-name-hint r-name-err"
                />
                <p className="hint" id="r-name-hint">
                  So, wie das Konto bei der Bank lautet. Die Bank vergleicht den Namen bei der Überweisung.
                </p>
                <p className="err" id="r-name-err">
                  {tried ? (fieldErr.parentName ?? "") : ""}
                </p>
              </div>

              <div className={s.field}>
                <label className="lab" htmlFor="r-mail">
                  E-Mail-Adresse
                </label>
                <input
                  id="r-mail"
                  className="field"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={fieldErr.parentEmail ? true : undefined}
                  aria-describedby="r-mail-hint r-mail-err"
                />
                <p className="hint" id="r-mail-hint">
                  Für die Bestätigung und die Nachricht, sobald überwiesen wurde.
                </p>
                <p className="err" id="r-mail-err">
                  {tried ? (fieldErr.parentEmail ?? "") : ""}
                </p>
              </div>

              <IbanField id="r-iban" value={iban} onChange={setIban} showErrors={tried} serverError={fieldErr.iban || null} label="IBAN eures Kontos" />

              <div className={s.field}>
                <label className="check" htmlFor="r-consent">
                  <input
                    id="r-consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    aria-invalid={tried && !consent ? true : undefined}
                    aria-describedby="r-consent-err"
                  />
                  <span>
                    Ich bin einverstanden, dass Zukunftsgeschenk meinen Namen und meine IBAN als Bank-QR-Code an die schenkende
                    Person weitergibt. Mehr dazu im <Link href="/datenschutz">Datenschutz</Link>.
                  </span>
                </label>
                <p className="err" id="r-consent-err">
                  {tried && !consent ? fieldErr.consent ?? "Bitte bestätigt die Einwilligung." : ""}
                </p>
              </div>

              <Reassure />

              <p className="err" role="alert">
                {formErr ?? ""}
              </p>
              <div className={s.actions}>
                <button className="btn" type="submit" disabled={sending}>
                  {sending ? "Wird eingelöst …" : "Karte einlösen"}
                  {sending ? null : <Icon name="arrow" />}
                </button>
                <button type="button" className={s.textBtn} onClick={restart}>
                  Anderen Code eingeben
                </button>
              </div>
            </form>
          </div>
          <div className={s.cardStage}>
            {cardView}
            <p className={s.cardCap}>Code {card.code}</p>
          </div>
        </section>
      ) : null}

      {step === "done" && card ? (
        <section className={s.split} aria-labelledby="r-h">
          <div className={`paper ${s.sheet}`}>
            <span className={s.doneSeal} aria-hidden="true">
              <Icon name="check" />
            </span>
            <h1 id="r-h" ref={heading} tabIndex={-1} className={s.h1}>
              Eingelöst!
            </h1>
            <p className="lead">
              {giver} bekommt jetzt den Bank-QR-Code und überweist {amount} direkt an euch.
            </p>
            <Next giver={giver} amount={amount} />
            <div className={s.wishTeaser}>
              <h2 className={s.h3}>Bekommt ihr öfter Geld für die Zukunft eures Kindes?</h2>
              <p className={s.p}>
                Legt eine Wunschseite an. Ein Link für die ganze Familie: Wer darüber schenkt, braucht keinen Einlösecode, und
                eure Bankverbindung ist schon hinterlegt.
              </p>
              <div className="buy-row">
                <Link className="btn btn--ink" href="/wunschseite">
                  Wunschseite anlegen <Icon name="arrow" />
                </Link>
                <button type="button" className={s.textBtn} onClick={restart}>
                  Noch eine Karte einlösen
                </button>
              </div>
            </div>
          </div>
          <div className={s.cardStage}>
            <HangTag className={s.doneTag} top={`Für ${card.childName}`} big="Eingelöst" line={amount} />
            {cardView}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Next({ giver, amount }: { giver: string; amount: string }) {
  return (
    <div className={s.next}>
      <h2 className={s.h3}>So geht es weiter</h2>
      <ol className={s.nextList}>
        <li>
          <b>Bestätigung per E-Mail.</b> Ihr bekommt gleich eine E-Mail von uns.
        </li>
        <li>
          <b>Überweisung direkt auf euer Konto.</b> {giver} überweist {amount} mit dem Bank-QR-Code. Sobald die Überweisung
          gemeldet ist, sagen wir euch Bescheid.
        </li>
        <li>
          <b>Voraussichtlich ab Juli 2027 ins Zukunftsdepot.</b> So sieht es der Gesetzesentwurf vor. Sobald das Depot
          startet, könnt ihr das Geld einzahlen, bis 5.000 € pro Kind und Jahr. Bis dahin bleibt es auf eurem Konto.
        </li>
      </ol>
    </div>
  );
}

function Reassure() {
  return (
    <ul className={s.reassure} aria-label="Datenschutz">
      <li>
        <Icon name="lock" />
        <span>Wir speichern eure IBAN verschlüsselt und geben sie nur an die schenkende Person weiter.</span>
      </li>
      <li>
        <Icon name="forever" />
        <span>90 Tage nach dem Einlösen löschen wir die IBAN.</span>
      </li>
      <li>
        <Icon name="direct" />
        <span>Das Geld fließt nie über uns. Es geht direkt von der schenkenden Person auf euer Konto.</span>
      </li>
    </ul>
  );
}
