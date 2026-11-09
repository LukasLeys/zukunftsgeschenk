import type { Metadata } from "next";
import Link from "next/link";
import { getWishPage } from "@/lib/shop";
import { safeEqual } from "@/lib/crypto";
import { OCCASIONS, type Occasion } from "@/lib/catalog";
import { Icon } from "@/components/Icon";
import { WishEdit } from "@/components/eltern/WishEdit";
import s from "@/components/eltern/eltern.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wunschseite bearbeiten",
  robots: { index: false, follow: false },
};

const isOccasion = (o: string): o is Occasion => OCCASIONS.some((x) => x.id === o);

export default async function WishEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const t = (Array.isArray(sp.t) ? sp.t[0] : sp.t) ?? "";
  const w = await getWishPage(slug).catch(() => null);
  const ok = Boolean(w && t && safeEqual(t, w.editToken));

  return (
    <div className={`band ${s.page}`}>
      <div className={`wrap ${s.flow} ${s.narrow}`}>
        <div className={`paper ${s.sheet}`}>
          {ok && w ? (
            <>
              <h1 className={s.h1}>Wunschseite für {w.childName} bearbeiten</h1>
              <p className="lead">
                Hier ändert ihr den Anlass und eure Nachricht an die Familie. Der Link zur Seite bleibt gleich.
              </p>
              <WishEdit
                slug={w.slug}
                token={t}
                childName={w.childName}
                initialMessage={w.message}
                initialOccasion={isOccasion(w.occasion) ? w.occasion : "neutral"}
              />
            </>
          ) : (
            <>
              <h1 className={s.h1}>Dieser Link passt nicht.</h1>
              <p className="lead">
                Zum Bearbeiten braucht ihr den Link aus der E-Mail, die wir beim Anlegen der Wunschseite geschickt haben. Bitte
                öffnet ihn direkt aus der E-Mail. Vielleicht wurde die Seite auch schon gelöscht.
              </p>
              <div className="buy-row">
                <Link className="btn btn--ghost" href="/wunschseite">
                  Neue Wunschseite anlegen
                </Link>
                <Link className="sec-link" href="/">
                  Zur Startseite <Icon name="arrow" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
