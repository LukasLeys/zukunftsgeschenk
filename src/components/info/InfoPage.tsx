import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";
import s from "./info.module.css";

export interface TagProps {
  top: string;
  big: string;
  line: string;
}

/** Seitenkopf der Info-Seiten: weißes Papier auf zartem Gelb, rechts ein gelber Anhänger (Dekoration). */
export function PageIntro({
  title,
  lead,
  tag,
  meta,
  actions,
}: {
  title: ReactNode;
  lead: ReactNode;
  tag: TagProps;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className={`band ${s.intro}`} aria-labelledby="page-h">
      <div className={`wrap ${s.introGrid}`}>
        <div className={`paper ${s.introPaper}`}>
          <h1 id="page-h">{title}</h1>
          <p className="lead">{lead}</p>
          {meta ? <div className={s.introMeta}>{meta}</div> : null}
          {actions ? <div className={s.introActions}>{actions}</div> : null}
        </div>
        <div className={s.deco} aria-hidden="true">
          <span className={s.thread} />
          <div className={s.tag}>
            <span className={s.tagRing} />
            <div className={s.tagIn}>
              <p className={s.tagTop}>{tag.top}</p>
              <p className={tag.big.length > 6 ? `${s.tagBig} ${s.tagBigLong}` : s.tagBig}>{tag.big}</p>
              <p className={s.tagLine}>{tag.line}</p>
              <div className={s.tagFoot} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export interface TocItem {
  id: string;
  label: string;
}

/** Inhaltsverzeichnis: am Desktop seitlich mitlaufend, am Handy als aufklappbare Liste. */
function Toc({ items }: { items: TocItem[] }) {
  return (
    <>
      <nav className={s.toc} aria-label="Auf dieser Seite">
        <p className={s.tocTitle}>Auf dieser Seite</p>
        <ol>
          {items.map((it) => (
            <li key={it.id}>
              <a href={`#${it.id}`}>{it.label}</a>
            </li>
          ))}
        </ol>
      </nav>
      <details className={s.tocMobile}>
        <summary>
          Auf dieser Seite ({items.length} Abschnitte)
          <Icon name="down" />
        </summary>
        <nav aria-label="Auf dieser Seite">
          <ol>
            {items.map((it) => (
              <li key={it.id}>
                <a href={`#${it.id}`}>{it.label}</a>
              </li>
            ))}
          </ol>
        </nav>
      </details>
    </>
  );
}

/** Inhaltsbereich mit Inhaltsverzeichnis links. */
export function InfoBody({
  toc,
  children,
  legal,
  before,
}: {
  toc?: TocItem[];
  children: ReactNode;
  legal?: boolean;
  before?: ReactNode;
}) {
  return (
    <div className={`band ${s.body}`}>
      {before ? <div className="wrap">{before}</div> : null}
      <div className={`wrap ${toc ? s.layout : `${s.layout} ${s.layoutWide}`}`}>
        {toc ? (
          <div>
            <Toc items={toc} />
          </div>
        ) : null}
        <div className={legal ? `${s.article} ${s.legal}` : s.article}>{children}</div>
      </div>
    </div>
  );
}

/** Abschnitt mit Sprungmarke und Überschrift. */
export function Section({ id, title, children }: { id: string; title: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className={s.section} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`}>{title}</h2>
      {children}
    </section>
  );
}

/** Aufzählung mit gelben Punkten. */
export function List({ children }: { children: ReactNode }) {
  return <ul className={s.list}>{children}</ul>;
}

/** Hinweiskasten. */
export function Note({ children, tone = "gelb" }: { children: ReactNode; tone?: "gelb" | "rosa" }) {
  return (
    <div className={tone === "rosa" ? `${s.note} ${s.noteRosa}` : s.note}>
      <Icon name="info" />
      <div>{children}</div>
    </div>
  );
}

/** Abschluss-Kasten mit Handlungsaufforderung. */
export function CtaBox({ title, text, children }: { title: string; text: ReactNode; children: ReactNode }) {
  return (
    <aside className={s.ctaBox} aria-label={title}>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className={s.ctaBtns}>{children}</div>
    </aside>
  );
}

export { s as infoStyles };
