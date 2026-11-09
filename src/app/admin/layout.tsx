import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/Icon";
import { AdminNav } from "@/components/admin/AdminNav";
import { navCounts } from "@/components/admin/queries";
import { isDemoMail, isDemoPayments } from "@/lib/env";
import s from "@/components/admin/admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Betrieb", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

// Der Admin-Bereich liegt außerhalb der Gruppe (shop): kein Pflichthinweis, kein Shop-Kopf, keine Fußzeile.
// Er zeigt nur seine eigene, schlanke Kopfleiste.

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const counts = await navCounts();
  const demoPay = isDemoPayments();
  const demoMail = isDemoMail();
  return (
    <div className={s.shell}>
      <a className="skip" href="#main">
        Zum Inhalt springen
      </a>
      <header className={s.bar}>
        <div className={s.barIn}>
          <Link className={s.mark} href="/admin">
            <BrandMark />
            Zukunftsgeschenk <small>Betrieb</small>
          </Link>
          <AdminNav counts={counts} />
          <div className={s.barEnd}>
            {demoPay && <span className={s.envTag} title="Kein STRIPE_SECRET_KEY gesetzt">Demo-Zahlung</span>}
            {demoMail && <span className={s.envTag} title="Kein RESEND_API_KEY gesetzt. Mails landen nur im Postausgang.">Demo-Mail</span>}
            <Link href="/">Zum Shop</Link>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className={s.main}>
        {children}
      </main>
    </div>
  );
}
