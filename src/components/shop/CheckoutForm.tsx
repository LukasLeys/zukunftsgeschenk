"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { FORMATS, motifById } from "@/lib/catalog";
import type { CartItem } from "@/lib/cart-types";
import { GiftCard } from "@/components/GiftCard";
import { Icon } from "@/components/Icon";
import { useCart } from "@/components/cart/useCart";
import { eur, eurCents } from "@/components/format";
import { maskIban } from "@/lib/iban";
import { formatVienna } from "./datetime";
import s from "./shop.module.css";

/** Zwischenablage für den Warenkorb, falls die Zahlung bei Stripe abgebrochen wird. */
export const PENDING_KEY = "zg-checkout-pending";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Field =
  | "buyerName"
  | "buyerEmail"
  | "shipping.name"
  | "shipping.street"
  | "shipping.zip"
  | "shipping.city"
  | "acceptTerms"
  | "digitalConsent";

const FIELD_ID: Record<Field, string> = {
  buyerName: "k-name",
  buyerEmail: "k-email",
  "shipping.name": "k-sname",
  "shipping.street": "k-street",
  "shipping.zip": "k-zip",
  "shipping.city": "k-city",
  acceptTerms: "k-terms",
  digitalConsent: "k-digital",
};

const MSG: Record<Field, string> = {
  buyerName: "Bitte gib deinen Vor- und Nachnamen ein.",
  buyerEmail: "Bitte gib eine gültige E-Mail-Adresse ein. Dorthin schicken wir Rechnung und Bank-QR-Code.",
  "shipping.name": "Bitte gib an, an wen wir die Karten schicken.",
  "shipping.street": "Bitte gib Straße und Hausnummer ein.",
  "shipping.zip": "Die Postleitzahl hat in Österreich vier Ziffern, zum Beispiel 1010.",
  "shipping.city": "Bitte gib den Ort ein.",
  acceptTerms: "Bitte bestätige die AGB und die Widerrufsbelehrung.",
  digitalConsent: "Ohne diese Zustimmung können wir die E-Mail-Karte nicht erstellen. Bitte setz das Häkchen oder entferne die E-Mail-Karte.",
};

const ORDER: Field[] = [
  "buyerName",
  "buyerEmail",
  "shipping.name",
  "shipping.street",
  "shipping.zip",
  "shipping.city",
  "acceptTerms",
  "digitalConsent",
];

const priceOf = (i: CartItem) => FORMATS.find((f) => f.id === i.format)?.priceCents ?? 0;

function formatLine(i: CartItem, promo: boolean): string {
  if (i.format === "mail") {
    if (!i.recipientEmail) return "Per E-Mail (PDF), du bekommst das PDF nach dem Kauf";
    if (!i.deliveryAt) return `Per E-Mail (PDF) an ${i.recipientEmail}, sofort`;
    return `Per E-Mail (PDF) an ${i.recipientEmail}, am ${formatVienna(i.deliveryAt)}`;
  }
  if (i.format === "print") return promo ? "Gedruckt mit Kuvert, Goldkuvert gratis" : "Gedruckt mit Kuvert";
  return "Premium mit Goldkuvert";
}

export function CheckoutForm({ aborted, promo }: { aborted: boolean; promo: boolean }) {
  const { items, ready, remove, clear, add } = useCart();
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [shipName, setShipName] = useState("");
  const [shipNameTouched, setShipNameTouched] = useState(false);
  const [street, setStreet] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [terms, setTerms] = useState(false);
  const [digital, setDigital] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [general, setGeneral] = useState("");
  const [sending, setSending] = useState(false);
  const [restored, setRestored] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const restoreDone = useRef(false);

  // Nach einem Abbruch bei Stripe: Warenkorb aus der Zwischenablage zurückholen
  useEffect(() => {
    if (!ready || restoreDone.current) return;
    restoreDone.current = true;
    try {
      const raw = window.sessionStorage.getItem(PENDING_KEY);
      if (!raw) return;
      window.sessionStorage.removeItem(PENDING_KEY);
      if (!aborted || items.length) return;
      const list: unknown = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const it of list as CartItem[]) if (it && typeof it.motif === "string") add(it, { open: false });
        if (list.length) setRestored(true);
      }
    } catch {
      /* Speicher nicht verfügbar: dann bleibt der Warenkorb leer */
    }
  }, [ready, aborted, items.length, add]);

  const needsShipping = items.some((i) => i.format !== "mail");
  const hasDigital = items.some((i) => i.format === "mail");
  const total = items.reduce((sum, i) => sum + priceOf(i), 0);
  const gifts = items.reduce((sum, i) => sum + i.amount, 0);

  /** Fehler eines Feldes verschwindet, sobald es bearbeitet wird. */
  const fix = (f: Field) =>
    setErrors((e) => {
      if (!e[f]) return e;
      const n = { ...e };
      delete n[f];
      return n;
    });

  function validate(): Partial<Record<Field, string>> {
    const e: Partial<Record<Field, string>> = {};
    if (buyerName.trim().length < 2) e.buyerName = MSG.buyerName;
    if (!EMAIL_RE.test(buyerEmail.trim())) e.buyerEmail = MSG.buyerEmail;
    if (needsShipping) {
      if (shipName.trim().length < 2) e["shipping.name"] = MSG["shipping.name"];
      if (street.trim().length < 3) e["shipping.street"] = MSG["shipping.street"];
      if (!/^\d{4}$/.test(zip.trim())) e["shipping.zip"] = MSG["shipping.zip"];
      if (city.trim().length < 2) e["shipping.city"] = MSG["shipping.city"];
    }
    if (!terms) e.acceptTerms = MSG.acceptTerms;
    if (hasDigital && !digital) e.digitalConsent = MSG.digitalConsent;
    return e;
  }

  function focusFirst(e: Partial<Record<Field, string>>) {
    const first = ORDER.find((f) => e[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`#${FIELD_ID[first]}`)?.focus();
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (sending) return;
    setGeneral("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      focusFirst(e);
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          items,
          shipping: needsShipping
            ? { name: shipName.trim(), street: street.trim(), zip: zip.trim(), city: city.trim(), country: "AT" }
            : null,
          acceptTerms: true,
          digitalConsent: hasDigital && digital,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string; field?: string };
      if (!res.ok || !data.url) {
        const f = data.field as Field | undefined;
        if (f && f in FIELD_ID) {
          const next = { [f]: MSG[f] };
          setErrors(next);
          focusFirst(next);
        } else if (data.field?.startsWith("items.")) {
          const n = Number(data.field.split(".")[1]) + 1;
          setGeneral(
            `Bei Karte ${Number.isFinite(n) ? n : ""} im Warenkorb fehlt noch etwas. Bitte entferne sie und gestalte sie noch einmal.`,
          );
        } else {
          setGeneral(data.error || "Das hat leider nicht geklappt. Bitte versuch es noch einmal. Es wurde nichts abgebucht.");
        }
        setSending(false);
        return;
      }
      try {
        window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(items));
      } catch {
        /* ohne Zwischenablage weiter */
      }
      clear();
      // Kurz warten, damit der leere Warenkorb gespeichert ist, dann weiter zur Zahlung bzw. Bestätigung
      window.setTimeout(() => {
        window.location.assign(data.url!);
      }, 60);
    } catch {
      setGeneral("Die Verbindung hat nicht geklappt. Bitte prüf dein Internet und versuch es noch einmal. Es wurde nichts abgebucht.");
      setSending(false);
    }
  }

  const abortNote = aborted ? (
    <div className={s.abortNote} role="status">
      <Icon name="info" />
      <p>
        <b>Zahlung abgebrochen, nichts wurde abgebucht.</b>{" "}
        {restored || items.length ? "Deine Karten liegen noch im Warenkorb." : ""}
      </p>
    </div>
  ) : null;

  if (!ready) {
    return (
      <p className={s.loading} role="status">
        Warenkorb wird geladen …
      </p>
    );
  }

  if (!items.length && sending) {
    return (
      <p className={s.loading} role="status">
        Weiter zur Zahlung …
      </p>
    );
  }

  if (!items.length) {
    return (
      <>
        {abortNote}
        <div className={`paper ${s.emptyCart}`}>
          <div>
            <h2 className={s.h2sm}>Dein Warenkorb ist noch leer.</h2>
            <p className="lead">
              Such dir eine Karte aus, trag Betrag, Namen und deine Botschaft ein und leg sie in den Warenkorb. Das dauert nur
              ein paar Minuten.
            </p>
            <div className="buy-row">
              <Link className="btn" href="/karten">
                Karten ansehen <Icon name="arrow" />
              </Link>
            </div>
          </div>
          <div className={s.emptyStage} aria-hidden="true">
            <GiftCard motif="konfetti" paper="pink" amount={50} childName="…" sender="" size="sm" decorative />
          </div>
        </div>
      </>
    );
  }

  const err = (f: Field) => errors[f];
  const inv = (f: Field) => (errors[f] ? true : undefined);

  return (
    <>
      {abortNote}
      <form ref={formRef} className={s.ck} noValidate onSubmit={onSubmit} aria-label="Bestellung abschließen">
        <section className={s.ckSum} aria-labelledby="ck-sum-h">
          <h2 id="ck-sum-h" className={s.h2sm}>
            Deine Karten
          </h2>
          <ul className={s.ckList}>
            {items.map((i, k) => {
              const m = motifById(i.motif);
              return (
                <li key={`${i.motif}-${k}`}>
                  <span className={s.thumb}>
                    <GiftCard
                      motif={i.motif}
                      paper={i.paper}
                      amount={i.amount}
                      childName={i.childName}
                      sender={i.sender}
                      size="sm"
                      decorative
                      style={{ "--k": m?.shape === "post" ? 0.38 : 0.44 } as CSSProperties}
                    />
                  </span>
                  <div className={s.ckItem}>
                    <b>
                      {m?.name ?? i.motif} für {i.childName}
                    </b>
                    <span className={s.priceInline}>Kartenpreis {eurCents(priceOf(i))}</span>
                    <span>{formatLine(i, promo)}</span>
                    <span>{i.sender}</span>
                    {i.wishSlug ? (
                      <span className={s.qrLine}>
                        <Icon name="qr" />
                        <span>Bank-QR-Code ist auf der Karte, über die Wunschseite der Eltern</span>
                      </span>
                    ) : i.parentIban ? (
                      <span className={s.qrLine}>
                        <Icon name="qr" />
                        <span>
                          Bank-QR-Code ist auf der Karte, für {i.parentName}, <span className="num">{maskIban(i.parentIban)}</span>
                        </span>
                      </span>
                    ) : null}
                    <span className={s.giftLine}>
                      <Icon name="direct" />
                      <span>
                        <b className="num">{eur(i.amount)}</b> Geschenk. Geht direkt an die Eltern, nicht Teil dieser Zahlung.
                      </span>
                    </span>
                    <button
                      className="rm"
                      type="button"
                      onClick={() => remove(k)}
                      aria-label={`${m?.name ?? "Karte"} für ${i.childName} entfernen`}
                    >
                      Entfernen
                    </button>
                  </div>
                  <span className={`num ${s.ckPrice}`}>{eurCents(priceOf(i))}</span>
                </li>
              );
            })}
          </ul>
          <Link className="sec-link" href="/karten">
            Noch eine Karte aussuchen <Icon name="arrow" />
          </Link>
          <div className={`sumbox ${s.ckTotals}`}>
            <div className="sumrow">
              <span>Kartenpreis{items.length > 1 ? `e (${items.length} Karten)` : ""}</span>
              <b>{eurCents(total)}</b>
            </div>
            {needsShipping ? (
              <div className="sumrow">
                <span>Versand in Österreich</span>
                <b>inklusive</b>
              </div>
            ) : null}
            {promo && items.some((i) => i.format === "print") ? (
              <div className="sumrow promo">
                <span>Weihnachtsaktion: Goldkuvert</span>
                <b>gratis</b>
              </div>
            ) : null}
            <div className={`sumrow ${s.payRow}`}>
              <span>Jetzt zu zahlen</span>
              <b>{eurCents(total)}</b>
            </div>
            <div className="sumrow gift">
              <span>Geschenkbeträge, überweist du später direkt an die Eltern</span>
              <b className="num">{eur(gifts)}</b>
            </div>
          </div>
          <p className="tiny">Preise vorläufig, inklusive Umsatzsteuer.</p>
        </section>

        <div className={`cfg-form ${s.ckForm}`}>
          <fieldset className="fs">
            <legend className={s.legendBig}>Deine Angaben</legend>
            <div className={s.grid2}>
              <div>
                <label className="lab" htmlFor="k-name">
                  Vor- und Nachname
                </label>
                <input
                  className="field"
                  id="k-name"
                  autoComplete="name"
                  value={buyerName}
                  maxLength={80}
                  onChange={(e) => {
                    setBuyerName(e.target.value);
                    fix("buyerName");
                    if (!shipNameTouched) {
                      setShipName(e.target.value);
                      fix("shipping.name");
                    }
                  }}
                  aria-invalid={inv("buyerName")}
                  aria-describedby="k-name-err"
                />
                <p className="err" id="k-name-err" aria-live="polite">
                  {err("buyerName") ?? ""}
                </p>
              </div>
              <div>
                <label className="lab" htmlFor="k-email">
                  E-Mail
                </label>
                <input
                  className="field"
                  id="k-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={buyerEmail}
                  onChange={(e) => {
                    setBuyerEmail(e.target.value);
                    fix("buyerEmail");
                  }}
                  aria-invalid={inv("buyerEmail")}
                  aria-describedby="k-email-hint k-email-err"
                />
                <p className="hint" id="k-email-hint">
                  Für Rechnung, Karten-PDF und später den Bank-QR-Code.
                </p>
                <p className="err" id="k-email-err" aria-live="polite">
                  {err("buyerEmail") ?? ""}
                </p>
              </div>
            </div>
          </fieldset>

          {needsShipping ? (
            <fieldset className="fs">
              <legend className={s.legendBig}>Lieferadresse</legend>
              <p className="hint" style={{ marginTop: -4, marginBottom: 14 }}>
                Wohin sollen die gedruckten Karten? An dich oder direkt an die Familie. Wir liefern nur innerhalb Österreichs.
              </p>
              <div className={s.addr}>
                <div className={s.full}>
                  <label className="lab" htmlFor="k-sname">
                    Name
                  </label>
                  <input
                    className="field"
                    id="k-sname"
                    autoComplete="shipping name"
                    value={shipName}
                    onChange={(e) => {
                      setShipName(e.target.value);
                      setShipNameTouched(true);
                      fix("shipping.name");
                    }}
                    aria-invalid={inv("shipping.name")}
                    aria-describedby="k-sname-err"
                  />
                  <p className="err" id="k-sname-err" aria-live="polite">
                    {err("shipping.name") ?? ""}
                  </p>
                </div>
                <div className={s.full}>
                  <label className="lab" htmlFor="k-street">
                    Straße und Hausnummer
                  </label>
                  <input
                    className="field"
                    id="k-street"
                    autoComplete="shipping street-address"
                    value={street}
                    onChange={(e) => {
                      setStreet(e.target.value);
                      fix("shipping.street");
                    }}
                    aria-invalid={inv("shipping.street")}
                    aria-describedby="k-street-err"
                  />
                  <p className="err" id="k-street-err" aria-live="polite">
                    {err("shipping.street") ?? ""}
                  </p>
                </div>
                <div>
                  <label className="lab" htmlFor="k-zip">
                    PLZ
                  </label>
                  <input
                    className={`field ${s.zip}`}
                    id="k-zip"
                    inputMode="numeric"
                    autoComplete="shipping postal-code"
                    maxLength={4}
                    pattern="\d{4}"
                    value={zip}
                    onChange={(e) => {
                      setZip(e.target.value.replace(/[^\d]/g, "").slice(0, 4));
                      fix("shipping.zip");
                    }}
                    aria-invalid={inv("shipping.zip")}
                    aria-describedby="k-zip-err"
                  />
                </div>
                <div>
                  <label className="lab" htmlFor="k-city">
                    Ort
                  </label>
                  <input
                    className="field"
                    id="k-city"
                    autoComplete="shipping address-level2"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      fix("shipping.city");
                    }}
                    aria-invalid={inv("shipping.city")}
                    aria-describedby="k-city-err"
                  />
                </div>
                <p className={`err ${s.full}`} id="k-zip-err" aria-live="polite">
                  {err("shipping.zip") ?? ""}
                </p>
                <p className={`err ${s.full}`} id="k-city-err" aria-live="polite">
                  {err("shipping.city") ?? ""}
                </p>
                <p className={`${s.full} ${s.country}`}>
                  <span className="muted">Land:</span> Österreich
                </p>
              </div>
            </fieldset>
          ) : (
            <p className="info-line">Alle Karten kommen per E-Mail. Eine Lieferadresse brauchen wir nicht.</p>
          )}

          <div>
            <label className="check" htmlFor="k-terms">
              <input
                id="k-terms"
                type="checkbox"
                checked={terms}
                onChange={(e) => {
                  setTerms(e.target.checked);
                  fix("acceptTerms");
                }}
                aria-invalid={inv("acceptTerms")}
                aria-describedby="k-terms-note k-terms-err"
              />
              <span>
                Ich akzeptiere die <Link href="/agb">AGB</Link> und habe die{" "}
                <Link href="/widerruf">Widerrufsbelehrung</Link> gelesen.
              </span>
            </label>
            <p className="hint" id="k-terms-note">
              {needsShipping
                ? "Gedruckte Karten werden mit Namen und Botschaft für dich angefertigt. Für sie gibt es deshalb kein Rücktrittsrecht."
                : "Die Karten werden mit Namen und Botschaft für dich angefertigt."}
            </p>
            <p className="err" id="k-terms-err" aria-live="polite">
              {err("acceptTerms") ?? ""}
            </p>
          </div>

          {hasDigital ? (
            <div>
              <label className="check" htmlFor="k-digital">
                <input
                  id="k-digital"
                  type="checkbox"
                  checked={digital}
                  onChange={(e) => {
                    setDigital(e.target.checked);
                    fix("digitalConsent");
                  }}
                  aria-invalid={inv("digitalConsent")}
                  aria-describedby="k-digital-err"
                />
                <span>
                  Ich stimme zu, dass ihr die digitale Karte sofort erstellt und zum gewählten Termin versendet. Mir ist
                  bekannt, dass ich damit mein Rücktrittsrecht für diese Karte verliere.
                </span>
              </label>
              <p className="err" id="k-digital-err" aria-live="polite">
                {err("digitalConsent") ?? ""}
              </p>
            </div>
          ) : null}

          <div className={s.payBlock}>
            {general ? (
              <p className={`err ${s.formErr}`} role="alert">
                {general}
              </p>
            ) : null}
            <button className="btn btn--block" type="submit" disabled={sending} aria-busy={sending || undefined}>
              {sending ? (
                "Einen Moment, bitte …"
              ) : (
                <>
                  <span className={s.payLabel}>Zahlungspflichtig bestellen</span>{" "}
                  <span className={s.payAmt}>
                    <span className={s.payDot} aria-hidden="true">
                      ·
                    </span>{" "}
                    <span className="num">{eurCents(total)}</span>
                    <Icon name="lock" />
                  </span>
                </>
              )}
            </button>
            <p className={s.payHint}>
              <Icon name="lock" />
              <span>
                Sichere Zahlung über Stripe mit Karte, EPS, Apple Pay oder Google Pay. Bezahlt werden nur die Karten. Die
                Geschenkbeträge von zusammen {eur(gifts)} überweist du später direkt an die Eltern.
              </span>
            </p>
          </div>
        </div>
      </form>
    </>
  );
}

export default CheckoutForm;
