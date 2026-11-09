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
            voraussichtlich ab Juli 2027 ins Depot des Kindes ein. <b>Das Geld geht direkt an die Eltern, nie über uns.</b>
          </p>
          <AmountPicker
            id="hero-amt"
            value={amount}
            onChange={setAmount}
            onErrorChange={onErrorChange}
            showErrors={showErrors}
          />
          <input type="hidden" name="betrag" value={amount} />
          <div className="hero-name">
            <label className="lab" htmlFor="hero-name">
              Vorname des Kindes <span className="muted">(optional)</span>
            </label>
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
          </div>
          <div className="buy-row">
            <button className="btn" type="submit">
              Karte gestalten <Icon name="arrow" />
            </button>
            <span className="from-price">
              Karte ab <b>{fromPrice}</b>
            </span>
          </div>
          <p className="buy-note">
            Bei uns zahlst du nur die Karte. Der Betrag ist <b>dein Geschenk an die Eltern</b>. Du überweist ihn per
            Bank-QR-Code direkt.
          </p>
          {promo ? (
            <Link className="promo-link" href="#weihnachten">
              <span className="pl-seal">
                <Icon name="gift" />
              </span>
              Bis 17. Dezember: Goldkuvert gratis zu jeder gedruckten Karte
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
