"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { useCart } from "./cart/useCart";

export function HeaderControls({ links }: { links: readonly { href: string; label: string }[] }) {
  const pathname = usePathname();
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);

  // Menü schließt bei Seitenwechsel
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuBtn.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!nav.current?.contains(t) && !menuBtn.current?.contains(t)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <nav ref={nav} className={menuOpen ? "nav open" : "nav"} id="mainNav" aria-label="Hauptnavigation">
        {links.map((l) => (
          <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined} onClick={() => setMenuOpen(false)}>
            {l.label}
          </Link>
        ))}
      </nav>
      <button
        ref={menuBtn}
        className="menubtn"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="mainNav"
        onClick={() => setMenuOpen((o) => !o)}
      >
        <Icon name={menuOpen ? "x" : "menu"} className="ic" />
        <span className="lbl">Menü</span>
      </button>
      <button className="cartbtn" type="button" aria-controls="drawer" aria-haspopup="dialog" onClick={open}>
        <Icon name="bag" className="ic" />
        <span className="lbl">Warenkorb</span>
        <span className="count" data-n={count} aria-hidden="true">
          {count}
        </span>
        <span className="sr">
          , {count} {count === 1 ? "Karte" : "Karten"} im Warenkorb
        </span>
      </button>
    </>
  );
}

export default HeaderControls;
