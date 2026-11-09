import Link from "next/link";
import { Brand } from "./Header";
import { LEGAL_NOTICE_REST } from "./LegalBar";

const FOOTER_LINKS = [
  { href: "/impressum", label: "Impressum" },
  { href: "/agb", label: "AGB" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/widerruf", label: "Widerruf" },
  { href: "/wunschseite", label: "Wunschseite anlegen" },
  { href: "/einloesen", label: "Für Eltern: Einlösen" },
];

/** Fußzeile auf Nachtpapier mit Riss oben und Pflichthinweis. */
export function Footer() {
  return (
    <footer className="foot band torn torn--b torn--nacht">
      <div className="wrap">
        <Brand />
        <div className="foot-grid">
          <p className="legal">
            <b>Privates Angebot.</b> {LEGAL_NOTICE_REST}
          </p>
          <nav aria-label="Rechtliches und Service">
            {FOOTER_LINKS.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="tiny">
          Stand: Gesetzesentwurf 157/ME, Nov. 2026. Details können sich bis zum Beschluss ändern. Alle Rechenbeispiele sind
          unverbindliche Modellrechnungen ohne Renditegarantie. Preise und Aktion vorläufig. Karten sind unbefristet
          einlösbar.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
