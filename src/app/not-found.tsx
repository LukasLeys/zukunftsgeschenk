import type { Metadata } from "next";
import Link from "next/link";
import { GiftCard } from "@/components/GiftCard";
import { Icon } from "@/components/Icon";
import { ShopChrome } from "@/components/ShopChrome";

export const metadata: Metadata = { title: "Seite nicht gefunden" };

// Liegt außerhalb der Gruppe (shop) und gilt für alle unbekannten Adressen. Deshalb bringt sie den Shop-Rahmen selbst mit.
export default function NotFound() {
  return (
    <ShopChrome>
      <section className="nf band" aria-labelledby="nf-h">
        <div className="wrap nf-grid">
          <div className="paper">
            <h1 id="nf-h">Hier ist nichts eingepackt.</h1>
            <p className="lead">
              Diese Seite gibt es nicht oder nicht mehr. Vielleicht hat sich ein Tippfehler in die Adresse geschlichen.
              Die Karten und alles Wichtige findest du hier:
            </p>
            <div className="buy-row">
              <Link className="btn" href="/">
                Zur Startseite <Icon name="arrow" />
              </Link>
              <Link className="btn btn--ghost" href="/karten">
                Karten ansehen
              </Link>
            </div>
            <p className="buy-note">
              Eltern mit einem Einlösecode geht es hier weiter: <Link href="/einloesen">Karte einlösen</Link>.
            </p>
          </div>
          <div className="nf-stage">
            <div className="sun" aria-hidden="true" />
            <GiftCard
              motif="konfetti"
              paper="pink"
              amount={50}
              childName="dich"
              sender="Vom Zukunftsgeschenk-Team"
              message="Einfach so, für später"
              size="md"
              decorative
            />
          </div>
        </div>
      </section>
    </ShopChrome>
  );
}
