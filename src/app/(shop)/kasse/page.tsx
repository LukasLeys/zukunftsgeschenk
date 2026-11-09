import type { Metadata } from "next";
import { xmasActive } from "@/lib/catalog";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import s from "@/components/shop/shop.module.css";

export const metadata: Metadata = {
  title: "Kasse",
  description: "Karten bezahlen. Der Geschenkbetrag ist nicht Teil der Zahlung, er geht direkt an die Eltern.",
  robots: { index: false, follow: true },
};

export default async function KassePage({ searchParams }: { searchParams: Promise<{ abbruch?: string | string[] }> }) {
  const sp = await searchParams;
  const aborted = (Array.isArray(sp.abbruch) ? sp.abbruch[0] : sp.abbruch) === "1";
  return (
    <section className={`band ${s.checkout}`} aria-labelledby="kasse-h">
      <div className="wrap">
        <h1 id="kasse-h" className={s.h1}>
          Kasse
        </h1>
        <p className={`lead ${s.ckLead}`}>
          Du bezahlst nur die Karten. Die Geschenkbeträge überweist du später selbst, direkt an die Eltern.
        </p>
        <CheckoutForm aborted={aborted} promo={xmasActive()} />
      </div>
    </section>
  );
}
