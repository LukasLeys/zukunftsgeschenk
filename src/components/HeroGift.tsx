"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";
import { AmountPicker } from "./AmountPicker";
import { GiftCard } from "./GiftCard";
import { Icon } from "./Icon";
import { Unwrap } from "./Unwrap";
import { eur } from "./format";

export interface HeroGiftProps {
  /** Kartenpreis „ab“, fertig formatiert (z. B. „4,90 €“). */
  fromPrice: string;
  /** Weihnachtsaktion läuft (Goldkuvert-Zeile anzeigen). */
  promo: boolean;
}

const EXAMPLE_NAME = "Lena";

/** Startseiten-Hero: eingepacktes Geschenk mit Kaufkarte, Live-Anhänger und Kartenvorschau. */
export function HeroGift({ fromPrice, promo }: HeroGiftProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(100);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const onErrorChange = useCallback((e: string | null) => setError(e), []);

  const shownName = name.trim() || EXAMPLE_NAME;
  const href = `/karten/sterne?betrag=${amount}${name.trim() ? `&name=${encodeURIComponent(name.trim())}` : ""}`;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (error) {
      setShowErrors(true);
      document.getElementById("hero-amt-custom")?.focus();
      return;
    }
    router.push(href);
  }

  return (
    <Unwrap tagName={shownName} tagAmount={eur(amount)} aria-labelledby="hero-h">
      <div className="wrap hero-grid">
        <form className="buy" action="/karten/sterne" method="get" onSubmit={submit} noValidate>
          <h1 id="hero-h">
            Schenk ein Stück <span className="hl">Zukunft.</span>
          </h1>
          <p className="lead">
            Die Geschenkkarte fürs Zukunftsdepot. Du schenkst den Eltern Geld mit einer schönen Karte, sie zahlen es
            voraussichtlich ab Juli 2027 ins Depot des Kindes ein.
          </p>
          <AmountPicker
            id="hero-amt"
            value={amount}
            onChange={setAmount}
            onErrorChange={onErrorChange}
            showErrors={showErrors}
          />
          <input type="hidden" name="betrag" value={amount} />
          <div className="hero-go">
            <label className="lab" htmlFor="hero-name">
              Vorname des Kindes <span className="muted">(optional)</span>
            </label>
            <div className="hero-go-row">
              <input
                className="field"
                id="hero-name"
                name="name"
                type="text"
                maxLength={24}
                autoComplete="off"
                placeholder="z. B. Lena"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button className="btn" type="submit">
                Karte gestalten <Icon name="arrow" />
              </button>
            </div>
          </div>
          <p className="buy-note">
            Bei uns zahlst du nur die Karte, ab <b>{fromPrice}</b>. Den Betrag überweist du per Bank-QR-Code{" "}
            <b>direkt an die Eltern, nie über uns.</b>
          </p>
          {promo ? (
            <Link className="promo-link" href="#weihnachten">
              <span className="pl-seal">
                <Icon name="gift" />
              </span>
              <span className="pl-txt">
                <b>Bis 17. Dezember gratis:</b> Goldkuvert zur gedruckten Karte
              </span>
            </Link>
          ) : null}
        </form>

        <div className="product" data-unwrap-anchor="">
          <div className="sun" aria-hidden="true" />
          <div className="prod-stage">
            <GiftCard
              motif="sterne"
              paper="pink"
              amount={amount}
              childName={shownName}
              sender="Von Oma Gerti"
              envelope="gold"
              size="md"
            />
          </div>
          <p className="prod-cap">
            <i />
            Klappkarte A6 „Sternenpapier“ · im Goldkuvert
          </p>
        </div>
      </div>
    </Unwrap>
  );
}

export default HeroGift;
