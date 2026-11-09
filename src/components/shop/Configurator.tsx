"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FORMATS, motifById, type FormatId, type Paper } from "@/lib/catalog";
import type { CartItem } from "@/lib/cart-types";
import { GiftCard, PAPER_LABEL, SHAPE_LABEL, paperSwatch, type CardEnvelope } from "@/components/GiftCard";
import { AmountPicker } from "@/components/AmountPicker";
import { Icon, type IconName } from "@/components/Icon";
import { useCart } from "@/components/cart/useCart";
import { HangTag } from "@/components/HangTag";
import { eur, eurCents } from "@/components/format";
import { IbanField, ibanError } from "@/components/eltern/IbanField";
import { normalizeIban } from "@/lib/iban";
import { DEFAULT_DELIVERY_LOCAL, dateToViennaLocal, viennaLocalToDate } from "./datetime";
import s from "./shop.module.css";

export interface ConfiguratorProps {
  motifId: string;
  initial: { paper: Paper; amount: number; childName: string; format: FormatId };
  /** Weihnachtsaktion aktiv (vom Server berechnet, damit Server und Client gleich zeichnen). */
  promo: boolean;
  /** Slug einer Wunschseite: Die IBAN der Eltern ist hinterlegt, der Bank-QR kommt auf die Karte. */
  wishSlug?: string;
}

const MSG_MAX = 240;
const NAME_MAX = 40;
const SENDER_MAX = 60;
const PARENT_MAX = 70;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ZICON: Record<FormatId, IconName> = { mail: "mail", print: "env", premium: "seal" };

type Field = "amount" | "name" | "sender" | "pname" | "iban" | "email" | "when";
const FIELD_ID: Record<Field, string> = {
  amount: "cfg-amt-custom",
  name: "cfg-name",
  sender: "cfg-from",
  pname: "cfg-pname",
  iban: "cfg-iban",
  email: "cfg-to",
  when: "cfg-at",
};

export function envelopeFor(format: FormatId, promo: boolean): CardEnvelope {
  if (format === "premium") return "gold";
  if (format === "print") return promo ? "gold" : "white";
  return "none";
}

export function Configurator({ motifId, initial, promo, wishSlug }: ConfiguratorProps) {
  const m = motifById(motifId)!;
  const { add } = useCart();

  const [paper, setPaper] = useState<Paper>(initial.paper);
  const [amount, setAmount] = useState(initial.amount);
  const [amountErr, setAmountErr] = useState<string | null>(null);
  const [childName, setChildName] = useState(initial.childName);
  const [message, setMessage] = useState("");
  const [sender, setSender] = useState("");
  const [format, setFormat] = useState<FormatId>(initial.format);
  const [recipient, setRecipient] = useState("");
  const [when, setWhen] = useState<"now" | "date">("date");
  const [at, setAt] = useState(DEFAULT_DELIVERY_LOCAL);
  const [minAt, setMinAt] = useState<string | undefined>(undefined);
  const [side, setSide] = useState<"front" | "inside">("front");
  const [knowsIban, setKnowsIban] = useState(false);
  const [parentName, setParentName] = useState("");
  const [parentIban, setParentIban] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Frühester Wunschtermin: jetzt (erst im Browser setzen, sonst weicht der Server ab)
  useEffect(() => setMinAt(dateToViennaLocal(new Date())), []);

  const onAmountError = useCallback((e: string | null) => setAmountErr(e), []);

  const fmt = FORMATS.find((f) => f.id === format)!;
  const envelope = envelopeFor(format, promo);
  const hasRecipient = recipient.trim() !== "";
  // Variante „IBAN bekannt“. Bei Wunschseiten ist die Bankverbindung schon hinterlegt.
  const ibanKnown = !wishSlug && knowsIban;
  const bankQr = Boolean(wishSlug) || ibanKnown;

  const errors = useMemo(() => {
    const e: Partial<Record<Field, string>> = {};
    if (amountErr) e.amount = amountErr;
    if (!childName.trim()) e.name = "Bitte gib den Namen des Kindes ein.";
    if (!sender.trim()) e.sender = "Bitte schreib dazu, von wem die Karte ist. Zum Beispiel: Von Oma Gerti.";
    if (ibanKnown) {
      const pn = parentName.trim().length;
      if (pn < 2 || pn > PARENT_MAX) e.pname = "Bitte trag den Namen so ein, wie das Konto lautet. Mindestens 2 Zeichen.";
      const ie = ibanError(parentIban, true, "schenkende");
      if (ie) e.iban = ie;
    }
    if (format === "mail" && hasRecipient && !EMAIL_RE.test(recipient.trim()))
      e.email = "Diese E-Mail-Adresse stimmt noch nicht. Bitte prüf die Schreibweise oder lass das Feld leer.";
    if (format === "mail" && hasRecipient && when === "date") {
      const d = viennaLocalToDate(at);
      if (!d) e.when = "Bitte wähle Datum und Uhrzeit.";
      else if (d.getTime() < Date.now() + 60_000) e.when = "Dieser Zeitpunkt ist schon vorbei. Bitte wähle einen späteren Termin.";
    }
    return e;
  }, [amountErr, childName, sender, ibanKnown, parentName, parentIban, format, hasRecipient, recipient, when, at]);

  const show = (f: Field) => (submitted ? errors[f] : undefined);

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setSubmitted(true);
    const order: Field[] = ["amount", "name", "sender", "pname", "iban", "email", "when"];
    const first = order.find((f) => errors[f]);
    if (first) {
      const el = formRef.current?.querySelector<HTMLElement>(`#${FIELD_ID[first]}`);
      if (el && el.offsetParent !== null) el.focus();
      else formRef.current?.querySelector<HTMLElement>(`#cfg-amt-${amount}`)?.focus();
      return;
    }
    const item: CartItem = {
      motif: m.id,
      paper,
      format,
      amount,
      childName: childName.trim(),
      message: message.trim(),
      sender: sender.trim(),
    };
    if (format === "mail" && hasRecipient) {
      item.recipientEmail = recipient.trim();
      if (when === "date") item.deliveryAt = viennaLocalToDate(at)!.toISOString();
    }
    if (wishSlug) item.wishSlug = wishSlug;
    else if (ibanKnown) {
      item.parentName = parentName.trim();
      item.parentIban = normalizeIban(parentIban);
    }
    add(item);
  }

  const capEnv = envelope === "gold" ? ", im Goldkuvert" : envelope === "white" ? ", mit weißem Kuvert" : ", als PDF";
  const caption = side === "front"
    ? `Vorderseite. ${m.name}, ${SHAPE_LABEL[m.shape]} in ${PAPER_LABEL[paper]}${capEnv}.`
    : bankQr
      ? "Innenseite mit deiner Botschaft und dem Bank-QR-Code für die Überweisung."
      : "Innenseite mit deiner Botschaft und dem Weg zum Geld.";

  return (
    <form ref={formRef} className={s.cfg} id="cfgForm" noValidate onSubmit={onSubmit} aria-label={`${m.name} gestalten`}>
      <div className={`cfg-form ${s.cfgFields}`}>
        <fieldset className="fs">
          <legend>Papierfarbe</legend>
          <div className="chips">
            {m.papers.map((p) => (
              <label className="chip" key={p}>
                <input type="radio" name="cfg-paper" value={p} checked={paper === p} onChange={() => setPaper(p)} />
                <span className={s.paperChip}>
                  <i className={s.sw} style={paperSwatch(p)} aria-hidden="true" />
                  {PAPER_LABEL[p]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <AmountPicker
          id="cfg-amt"
          legend="Betrag für die Eltern"
          value={amount}
          onChange={setAmount}
          onErrorChange={onAmountError}
          showErrors={submitted}
        />

        <div>
          <label className="lab" htmlFor="cfg-name">
            Name des Kindes
          </label>
          <input
            className="field"
            id="cfg-name"
            type="text"
            maxLength={NAME_MAX}
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="zum Beispiel Lena"
            autoComplete="off"
            aria-invalid={show("name") ? true : undefined}
            aria-describedby="cfg-name-err"
          />
          <p className="err" id="cfg-name-err" aria-live="polite">
            {show("name") ?? ""}
          </p>
        </div>

        <div>
          <label className="lab" htmlFor="cfg-msg">
            Deine Botschaft <span className={s.opt}>(freiwillig)</span>
          </label>
          <textarea
            className="field"
            id="cfg-msg"
            rows={4}
            maxLength={MSG_MAX}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MSG_MAX))}
            placeholder="Für deine Zukunft. Wachs mit!"
            aria-describedby="cfg-msg-hint cfg-msg-count"
          />
          <div className={s.msgRow}>
            <p className="hint" id="cfg-msg-hint">
              Steht innen in der Karte. Leer gelassen schreiben wir „{m.line}“.
            </p>
            <p className="counter" id="cfg-msg-count" aria-live="polite">
              {message.length} von {MSG_MAX} Zeichen
            </p>
          </div>
        </div>

        <div>
          <label className="lab" htmlFor="cfg-from">
            Absender
          </label>
          <input
            className="field"
            id="cfg-from"
            type="text"
            maxLength={SENDER_MAX}
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="Von Oma Gerti"
            autoComplete="off"
            aria-invalid={show("sender") ? true : undefined}
            aria-describedby="cfg-from-err"
          />
          <p className="err" id="cfg-from-err" aria-live="polite">
            {show("sender") ?? ""}
          </p>
        </div>

        {wishSlug ? null : (
          <div className={s.ibanKnown}>
            <label className="check" htmlFor="cfg-knows">
              <input
                id="cfg-knows"
                type="checkbox"
                checked={knowsIban}
                onChange={(e) => setKnowsIban(e.target.checked)}
                aria-describedby="cfg-knows-hint"
              />
              <span>Ich kenne die Bankverbindung der Eltern</span>
            </label>
            <p className="hint" id="cfg-knows-hint">
              Dann steht der Bank-QR-Code gleich auf der Karte. Die Eltern müssen nichts einlösen. Den Namen bitte so
              eintragen, wie das Konto lautet, weil Banken Name und IBAN abgleichen.
            </p>
            {knowsIban ? (
              <div className={s.ibanFields} id="cfg-bank">
                <div>
                  <label className="lab" htmlFor="cfg-pname">
                    Kontoinhaber:in
                  </label>
                  <input
                    className="field"
                    id="cfg-pname"
                    type="text"
                    maxLength={PARENT_MAX}
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="zum Beispiel Anna Muster"
                    autoComplete="off"
                    aria-invalid={show("pname") ? true : undefined}
                    aria-describedby="cfg-pname-err"
                  />
                  <p className="err" id="cfg-pname-err" aria-live="polite">
                    {show("pname") ?? ""}
                  </p>
                </div>
                <IbanField
                  id="cfg-iban"
                  label="IBAN der Eltern"
                  audience="schenkende"
                  value={parentIban}
                  onChange={setParentIban}
                  showErrors={submitted}
                />
              </div>
            ) : null}
          </div>
        )}

        <fieldset className="fs">
          <legend>Zustellart</legend>
          <div className="zopts">
            {FORMATS.map((f) => (
              <label className="zopt" key={f.id}>
                <input type="radio" name="cfg-z" value={f.id} checked={format === f.id} onChange={() => setFormat(f.id)} />
                <Icon name={ZICON[f.id]} className="zi" style={f.id === "premium" ? { color: "var(--gold-d)" } : undefined} />
                <b>{f.label}</b>
                <span className="zprice">{eurCents(f.priceCents)}</span>
                <small>
                  {f.id === "print" ? `${SHAPE_LABEL[m.shape]} mit Kuvert, per Post in Österreich, Versand inklusive.` : f.detail}
                  {f.id === "print" && promo ? " Bis 17. Dezember gratis im Goldkuvert." : ""}
                </small>
              </label>
            ))}
          </div>
          <p className="hint">Preise vorläufig. Der Geschenkbetrag ist nicht im Preis.</p>
        </fieldset>

        {format === "mail" ? (
          <div className="when">
            <div>
              <label className="lab" htmlFor="cfg-to">
                E-Mail der Empfänger <span className={s.opt}>(freiwillig)</span>
              </label>
              <input
                className="field"
                id="cfg-to"
                type="email"
                inputMode="email"
                autoComplete="off"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="familie@beispiel.at"
                aria-invalid={show("email") ? true : undefined}
                aria-describedby="cfg-to-hint cfg-to-err"
              />
              <p className="hint" id="cfg-to-hint">
                {hasRecipient
                  ? "Wir schicken die Karte zum gewählten Zeitpunkt an diese Adresse. Du bekommst das PDF trotzdem auch."
                  : "Leer gelassen bekommst du das PDF gleich nach dem Kauf und gibst es selbst weiter."}
              </p>
              <p className="err" id="cfg-to-err" aria-live="polite">
                {show("email") ?? ""}
              </p>
            </div>
            {hasRecipient ? (
              <>
                <fieldset className="fs">
                  <legend>Wann soll die E-Mail ankommen?</legend>
                  <div className="seg">
                    <label>
                      <input type="radio" name="cfg-when" value="now" checked={when === "now"} onChange={() => setWhen("now")} />
                      <span>Sofort</span>
                    </label>
                    <label>
                      <input type="radio" name="cfg-when" value="date" checked={when === "date"} onChange={() => setWhen("date")} />
                      <span>Wunschtermin</span>
                    </label>
                  </div>
                </fieldset>
                {when === "date" ? (
                  <div>
                    <label className="lab" htmlFor="cfg-at">
                      Datum und Uhrzeit
                    </label>
                    <input
                      className={`field ${s.dt}`}
                      id="cfg-at"
                      type="datetime-local"
                      step={900}
                      min={minAt}
                      value={at}
                      onChange={(e) => setAt(e.target.value)}
                      aria-invalid={show("when") ? true : undefined}
                      aria-describedby="cfg-at-hint cfg-at-err"
                    />
                    <p className="hint" id="cfg-at-hint">
                      Österreichische Zeit. Vorgeschlagen ist der Heilige Abend um 17 Uhr.
                    </p>
                    <p className="err" id="cfg-at-err" aria-live="polite">
                      {show("when") ?? ""}
                    </p>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={s.side}>
        <div className={s.pv}>
          <div className="pv-tabs" role="group" aria-label="Ansicht der Vorschau">
            <button type="button" aria-pressed={side === "front"} onClick={() => setSide("front")}>
              Vorderseite
            </button>
            <button type="button" aria-pressed={side === "inside"} onClick={() => setSide("inside")}>
              Innenseite
            </button>
          </div>
          <div className={`pv-stage ${s.pvStage}`}>
            <HangTag className={s.pvTag} top={childName.trim() ? `Für ${childName.trim()}` : "Dein Geschenk"} big={eur(amount)} />
            <GiftCard
              motif={m.id}
              paper={paper}
              amount={amount}
              childName={childName}
              sender={sender}
              message={side === "inside" ? message : undefined}
              side={side}
              envelope={envelope}
              size="lg"
              badge={format === "mail" ? "PDF" : undefined}
              qr={
                side === "inside" && bankQr ? (
                  <span className={s.qrPh}>
                    <Icon name="qr" />
                    <b>Bank-QR</b>
                  </span>
                ) : undefined
              }
              label={`Live-Vorschau. ${caption}`}
            />
          </div>
          <p className="pv-cap" aria-live="polite">
            {caption}
          </p>
        </div>

        <div className={s.buy}>
          <div className="sumbox">
            <div className="sumrow">
              <span>Kartenpreis, {fmt.short}</span>
              <b>{eurCents(fmt.priceCents)}</b>
            </div>
            {format === "print" && promo ? (
              <div className="sumrow promo">
                <span>Weihnachtsaktion: Goldkuvert</span>
                <b>gratis</b>
              </div>
            ) : null}
            <div className="sumrow gift">
              <span>Geschenk an die Eltern, überweist du direkt</span>
              <b className="num">{eur(amount)}</b>
            </div>
          </div>
          {submitted && Object.keys(errors).length ? (
            <p className={`err ${s.formErr}`} role="alert">
              Fast fertig. Bitte ergänze noch die markierten Angaben.
            </p>
          ) : null}
          <button className={`btn ${s.addBtn}`} type="submit">
            In den Warenkorb <Icon name="bag" />
          </button>
        </div>
      </div>
    </form>
  );
}

export default Configurator;
