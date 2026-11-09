import Link from "next/link";
import { Brand } from "./Header";
import { LEGAL_NOTICE_REST } from "./LegalBar";

const FOOTER_GROUPS = [
  {
    title: "Hilfe",
    links: [
      { href: "/so-funktionierts", label: "So funktioniert's" },
      { href: "/faq", label: "FAQ" },
      { href: "/wunschseite", label: "Wunschseite anlegen" },
      { href: "/einloesen", label: "Für Eltern: Einlösen" },
    ],
  },
  {
    title: "Rechtliches",
    links: [
      { href: "/impressum", label: "Impressum" },
      { href: "/agb", label: "AGB" },
      { href: "/datenschutz", label: "Datenschutz" },
      { href: "/widerruf", label: "Widerruf" },
    ],
  },
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
          <nav aria-label="Hilfe und Rechtliches">
            {FOOTER_GROUPS.map((g) => (
              <div key={g.title}>
                <p className="foot-h">{g.title}</p>
                <ul>
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
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
