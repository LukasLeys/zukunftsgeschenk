import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LegalBar } from "@/components/LegalBar";
import { CartProvider } from "@/components/cart/CartProvider";

/** Rahmen des öffentlichen Shops: Pflichthinweis, Kopf, Inhalt, Fußzeile und Warenkorb. Admin nutzt ihn nicht. */
export function ShopChrome({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <a className="skip" href="#main">
        Zum Inhalt springen
      </a>
      <LegalBar />
      <Header />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}
