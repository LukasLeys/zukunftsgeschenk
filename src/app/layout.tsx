import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  axes: ["opsz"],
  display: "swap",
});

const sans = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-figtree",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zukunftsgeschenk: die Geschenkkarte fürs Zukunftsdepot",
    template: "%s · Zukunftsgeschenk",
  },
  description:
    "Schenk ein Stück Zukunft: gestaltete Geschenkkarten, mit denen Familie und Freunde Geld fürs Zukunftsdepot eines Kindes schenken. Das Geld geht per Bank-QR-Code direkt an die Eltern, nie über uns. Privates Angebot, kein offizielles Angebot der Republik Österreich.",
  applicationName: "Zukunftsgeschenk",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  viewportFit: "cover",
};

// Läuft vor dem ersten Zeichnen: Auspack-Effekt nur mit JavaScript und ohne „Bewegung reduzieren“.
const WRAP_SCRIPT =
  "try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('wrap-on')}catch(e){}";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de-AT" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: WRAP_SCRIPT }} />
      </head>
      {/* Nur Grundgerüst. Shop-Rahmen in app/(shop)/layout.tsx, Admin-Rahmen in app/admin/layout.tsx. */}
      <body>{children}</body>
    </html>
  );
}
