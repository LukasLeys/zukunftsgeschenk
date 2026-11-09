"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { FORMATS, motifById, xmasActive } from "@/lib/catalog";
import type { CartItem } from "@/lib/cart-types";
import { Icon } from "../Icon";
import { GiftCard } from "../GiftCard";
import { eur, eurCents } from "../format";
import { useCart } from "./useCart";

const priceCents = (i: CartItem) => FORMATS.find((f) => f.id === i.format)?.priceCents ?? 0;

function formatLine(i: CartItem): string {
  if (i.format === "mail") {
    if (!i.deliveryAt) return "Per E-Mail (PDF), sofort";
    const d = new Date(i.deliveryAt);
    if (Number.isNaN(d.getTime())) return "Per E-Mail (PDF)";
    const date = new Intl.DateTimeFormat("de-AT", { day: "numeric", month: "numeric", year: "numeric", timeZone: "Europe/Vienna" }).format(d);
    const time = new Intl.DateTimeFormat("de-AT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Vienna" }).format(d);
    return `Per E-Mail (PDF), am ${date} um ${time} Uhr`;
  }
  if (i.format === "print" && xmasActive()) return "Gedruckt, Goldkuvert gratis";
  return FORMATS.find((f) => f.id === i.format)?.label ?? i.format;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/** Seitliche Warenkorb-Schublade. Wird vom CartProvider einmal pro Seite gerendert. */
export function CartDrawer() {
  const { items, isOpen, close, remove, lastAdded } = useCart();
  const panel = useRef<HTMLElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add("drawer-open");
    closeBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const f = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !panel.current.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("drawer-open");
      const back = lastFocus.current;
      if (back && document.contains(back)) back.focus();
    };
  }, [isOpen, close]);

  const total = items.reduce((s, i) => s + priceCents(i), 0);
  const empty = items.length === 0;
  const lastMotif = lastAdded ? motifById(lastAdded.motif)?.name ?? "Deine Karte" : "";

  return (
    <>
      <div className="scrim" hidden={!isOpen} onClick={close} />
      <aside
        ref={panel}
        className="drawer"
        id="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawerTitle"
        hidden={!isOpen}
      >
        <div className="drawer-top" aria-hidden="true" />
        <div className="drawer-hd">
          <h2 id="drawerTitle">Dein Warenkorb</h2>
          <button ref={closeBtn} className="iconbtn" type="button" aria-label="Warenkorb schließen" onClick={close}>
            <Icon name="x" />
          </button>
        </div>
        <div className="drawer-body">
          {lastAdded ? (
            <p className="drawer-ok" role="status">
              <Icon name="check" />
              <span>
                {lastMotif} für {lastAdded.childName} liegt im Warenkorb. Die {eur(lastAdded.amount)} überweist du später
                direkt an die Eltern.
              </span>
            </p>
          ) : null}
          {empty ? (
            <p className="empty">Noch leer. Such dir eine Karte aus und gestalte sie. Das dauert nur ein paar Minuten.</p>
          ) : (
            <ul className="cart-list">
              {items.map((i, k) => (
                <li key={`${i.motif}-${k}`}>
                  <span className="mini" aria-hidden="true">
                    <GiftCard
                      motif={i.motif}
                      paper={i.paper}
                      amount={i.amount}
                      childName={i.childName}
                      sender={i.sender}
                      size="sm"
                      decorative
                      style={{ "--k": motifById(i.motif)?.shape === "post" ? 0.3 : 0.34 } as CSSProperties}
                    />
                  </span>
                  <div>
                    <b>{motifById(i.motif)?.name ?? i.motif}</b>
                    <span>{formatLine(i)}</span>
                    <span>
                      Für {i.childName} · {eur(i.amount)} Geschenk an die Eltern
                    </span>
                    <button
                      className="rm"
                      type="button"
                      onClick={() => {
                        remove(k);
                        closeBtn.current?.focus();
                      }}
                      aria-label={`${motifById(i.motif)?.name ?? "Karte"} für ${i.childName} entfernen`}
                    >
                      Entfernen
                    </button>
                  </div>
                  <span className="pr">{eurCents(priceCents(i))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="drawer-ft">
          <div className="sum">
            <span>Kartenpreis gesamt</span>
            <span>{eurCents(total)}</span>
          </div>
          <p className="tiny">
            Der Geschenkbetrag ist nicht im Preis. Den überweist ihr direkt an die Eltern. Preise vorläufig.
          </p>
          {empty ? (
            <button className="btn" type="button" disabled>
              Zur Kasse <Icon name="arrow" />
            </button>
          ) : (
            <Link className="btn" href="/kasse" onClick={close}>
              Zur Kasse <Icon name="arrow" />
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

export default CartDrawer;
