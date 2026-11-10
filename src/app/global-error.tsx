"use client";

import { useEffect } from "react";
import { BrandMark } from "@/components/Icon";
import "./globals.css";

// Letzte Rückfallebene, wenn sogar das Grundlayout fehlschlägt. Ersetzt app/layout.tsx und bringt
// deshalb html und body selbst mit. Bewusst schlicht: kein Warenkorb, keine Schriften aus dem Layout.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="de-AT">
      <body>
        <main id="main" className="nf band" aria-labelledby="gerr-h" style={{ minHeight: "100vh" }}>
          <div className="wrap">
            <div className="paper" style={{ maxWidth: 720, marginInline: "auto" }}>
              <p style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, marginBottom: 18 }}>
                <BrandMark width={32} height={32} /> Zukunftsgeschenk
              </p>
              <h1 id="gerr-h">Da hat sich etwas verheddert.</h1>
              <p className="lead">
                Der Shop konnte gerade nicht geladen werden. Das liegt an uns, nicht an dir. Bitte versuch es in ein paar Minuten noch
                einmal.
              </p>
              <div className="buy-row">
                <button type="button" className="btn" onClick={() => reset()}>
                  Noch einmal versuchen
                </button>
                {/* Absichtlich ein normaler Link mit vollem Neuladen: der Router ist hier vielleicht selbst kaputt. */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a className="btn btn--ghost" href="/">
                  Zur Startseite
                </a>
              </div>
              {error.digest && <p className="buy-note">Fehlernummer für Rückfragen: {error.digest}</p>}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
