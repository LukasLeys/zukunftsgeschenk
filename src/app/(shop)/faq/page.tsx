import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { FaqBrowser } from "@/components/info/FaqBrowser";
import { CtaBox, PageIntro } from "@/components/info/InfoPage";
import { faqGroups } from "@/components/info/faq-data";

export const metadata: Metadata = {
  title: "Häufige Fragen",
  description:
    "Antworten zum Schenken, zum Einlösen für Eltern, zum Zukunftsdepot, zu Bestellung und Versand und zum Datenschutz. Das Geld geht per Bank-QR-Code direkt an die Eltern.",
};

export default function FaqPage() {
  const groups = faqGroups();
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.items.map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: { "@type": "Answer", text: it.a },
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageIntro
        title="Häufige Fragen"
        lead="Hier findest du Antworten fürs Schenken, für Eltern und zum Zukunftsdepot. Du kannst die Fragen durchsuchen oder nach Thema filtern."
        tag={{ top: "Antworten auf", big: String(total), line: "häufige Fragen" }}
      />
      <div className="faq band">
        <div className="wrap">
          <FaqBrowser groups={groups} />
          <div style={{ maxWidth: 920 }}>
            <CtaBox
              title="Noch etwas unklar?"
              text="Auf diesen Seiten erklären wir den Ablauf und das Zukunftsdepot ausführlich."
            >
              <Link className="btn" href="/so-funktionierts">
                So funktioniert&apos;s <Icon name="arrow" />
              </Link>
              <Link className="btn btn--ghost" href="/zukunftsdepot">
                Zum Zukunftsdepot
              </Link>
            </CtaBox>
          </div>
        </div>
      </div>
    </>
  );
}
