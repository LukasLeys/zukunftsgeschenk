"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./admin.module.css";

const LINKS = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/bestellungen", label: "Bestellungen" },
  { href: "/admin/karten", label: "Karten" },
  { href: "/admin/druck", label: "Druck", count: "print" as const },
  { href: "/admin/postausgang", label: "Postausgang", count: "mail" as const },
  { href: "/admin/start", label: "Startbereitschaft" },
];

/** Schlanke Admin-Navigation mit Zählern für offene Arbeit. */
export function AdminNav({ counts }: { counts: { print: number; mail: number } }) {
  const path = usePathname() ?? "/admin";
  return (
    <nav className={s.nav} aria-label="Admin">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        const n = l.count ? counts[l.count] : 0;
        return (
          <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}>
            {l.label}
            {n > 0 && (
              <span className={s.navCount} aria-label={l.count === "print" ? `${n} offen` : `${n} fällig`}>
                {n}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
