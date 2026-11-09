// Produktkachel eines Motivs für Kartenshop und „Ähnliche Karten“. Server-tauglich, ohne JavaScript bedienbar.
import Link from "next/link";
import type { CSSProperties } from "react";
import { FORMATS, OCCASIONS, type Motif } from "@/lib/catalog";
import { GiftCard, PAPER_LABEL, SHAPE_LABEL, paperSwatch } from "@/components/GiftCard";
import { Icon } from "@/components/Icon";
import { showcaseFor } from "@/components/showcase";
import { eurCents } from "@/components/format";
import s from "./shop.module.css";

export const FROM_PRICE = eurCents(Math.min(...FORMATS.map((f) => f.priceCents)));
export const occasionLabel = (id: string) => OCCASIONS.find((o) => o.id === id)?.label ?? "";

/** Anlass im Satz: „Karten zur Taufe“. */
export const OCCASION_PHRASE: Record<string, string> = {
  weihnachten: "zu Weihnachten",
  zukunft: "rund um Aktien und Geld",
  ostern: "zu Ostern",
  schule: "für die Schule",
  geburt: "zur Geburt",
  taufe: "zur Taufe",
  geburtstag: "zum Geburtstag",
  kommunion: "zur Erstkommunion",
  firmung: "zur Firmung",
  neutral: "für jeden Anlass",
};

export function MotifTile({ motif: m, feature = false, level = 3, query = "" }: { motif: Motif; feature?: boolean; level?: 2 | 3 | 4; query?: string }) {
  const sc = showcaseFor(m.id);
  const H = level === 2 ? "h2" : level === 4 ? "h4" : "h3";
  const href = `/karten/${m.id}`;
  const withQuery = (extra?: string) => `${href}?${[extra, query].filter(Boolean).join("&")}`.replace(/\?$/, "");
  return (
    <article className={feature ? `item feature ${s.tile}` : `item ${s.tile}`}>
      <div className={`stage st-${sc.stage}`}>
        <GiftCard
          motif={m.id}
          paper={m.papers[0]}
          amount={sc.amount}
          childName={sc.childName}
          sender={sc.sender}
          envelope={sc.envelope ?? "none"}
          size="sm"
          decorative
          style={feature ? ({ "--bw": "190px" } as CSSProperties) : undefined}
        />
      </div>
      <div className="iinfo">
        <H className={s.tileTitle}>
          <Link href={withQuery()}>{m.name}</Link>
        </H>
        <p className="meta">
          {occasionLabel(m.occasion)} · {SHAPE_LABEL[m.shape]}
        </p>
        <p className="price">ab {FROM_PRICE}</p>
        <div className={`dots ${s.dots}`} role="group" aria-label={`Papierfarben von ${m.name}`}>
          {m.papers.map((p) => (
            <Link
              key={p}
              className="dot"
              href={withQuery(`papier=${p}`)}
              aria-label={`${m.name} in ${PAPER_LABEL[p]} gestalten`}
              title={PAPER_LABEL[p]}
              style={paperSwatch(p)}
            >
              <i />
            </Link>
          ))}
        </div>
        <div className="btn-holder">
          <Link className="btn btn--sm" href={withQuery()} tabIndex={-1} aria-hidden="true">
            Gestalten <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default MotifTile;
