import Link from "next/link";
import { BrandMark } from "./Icon";
import { HeaderControls } from "./HeaderControls";

export const NAV_LINKS = [
  { href: "/karten", label: "Karten" },
  { href: "/so-funktionierts", label: "So funktioniert's" },
  { href: "/rechner", label: "Rechner" },
  { href: "/zukunftsdepot", label: "Zukunftsdepot" },
  { href: "/einloesen", label: "Einlösen" },
  { href: "/faq", label: "FAQ" },
] as const;

/** Wortmarke mit Bildzeichen. `className` z. B. für die Fußzeile. */
export function Brand({ label = "Zukunftsgeschenk, zur Startseite" }: { label?: string }) {
  return (
    <Link className="brand" href="/" aria-label={label}>
      <BrandMark />
      Zukunftsgeschenk
    </Link>
  );
}

/** Kopfzeile: Wortmarke, Navigation, mobiles Menü, Warenkorb-Knopf. */
export function Header() {
  return (
    <header className="head band" id="head">
      <div className="wrap">
        <Brand />
        <HeaderControls links={NAV_LINKS} />
      </div>
    </header>
  );
}

export default Header;
