"use client";

import Link from "next/link";
import { useEffect } from "react";
import { GiftCard } from "@/components/GiftCard";
import { Icon } from "@/components/Icon";

// Fehlerseite für alle Shop-Seiten. Kopf und Fußzeile kommen aus dem Layout der Gruppe (shop).
export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="nf band" aria-labelledby="err-h">
      <div className="wrap nf-grid">
        <div className="paper">
          <h1 id="err-h">Da hat sich etwas verheddert.</h1>
          <p className="lead">
            Diese Seite konnte gerade nicht geladen werden. Das liegt an uns, nicht an dir. Bitte versuch es gleich noch einmal.
          </p>
          <div className="buy-row">
            <button type="button" className="btn" onClick={() => reset()}>
              Noch einmal versuchen <Icon name="arrow" />
            </button>
            <Link className="btn btn--ghost" href="/">
              Zur Startseite
            </Link>
          </div>
          {error.digest && <p className="buy-note">Fehlernummer für Rückfragen: {error.digest}</p>}
        </div>
        <div className="nf-stage">
          <div className="sun" aria-hidden="true" />
          <GiftCard
            motif="konfetti"
            paper="gelb"
            amount={50}
            childName="dich"
            sender="Vom Zukunftsgeschenk-Team"
            message="Gleich wieder da"
            size="md"
            decorative
          />
        </div>
      </div>
    </section>
  );
}
