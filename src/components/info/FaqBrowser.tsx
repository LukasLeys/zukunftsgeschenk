"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { InfoIcon } from "./InfoIcon";
import type { FaqGroup, FaqGroupId } from "./faq-data";
import s from "./info.module.css";

const norm = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss");

/** Fragenliste mit Suche und Themenfilter. Ohne JavaScript sind alle Fragen sichtbar. */
export function FaqBrowser({ groups }: { groups: FaqGroup[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<FaqGroupId | "alle">("alle");
  const searchId = useId();
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  const q = norm(query.trim());
  const shown = useMemo(
    () =>
      groups
        .filter((g) => topic === "alle" || g.id === topic)
        .map((g) => ({
          ...g,
          items: q ? g.items.filter((it) => norm(`${it.q} ${it.a}`).includes(q)) : g.items,
        }))
        .filter((g) => g.items.length > 0),
    [groups, topic, q],
  );
  const count = shown.reduce((n, g) => n + g.items.length, 0);
  const filtered = q !== "" || topic !== "alle";

  const reset = () => {
    setQuery("");
    setTopic("alle");
  };

  return (
    <>
      <div className={s.faqTools}>
        <form role="search" onSubmit={(e) => e.preventDefault()}>
          <label className="lab" htmlFor={searchId}>
            In den Fragen suchen
          </label>
          <div className={s.search}>
            <InfoIcon name="search" />
            <input
              id={searchId}
              className="field"
              type="search"
              value={query}
              placeholder="z. B. IBAN, Versand, Startbonus"
              autoComplete="off"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </form>
        <div className={`filters ${s.faqFilters}`} role="group" aria-label="Nach Thema filtern">
          <button type="button" aria-pressed={topic === "alle"} onClick={() => setTopic("alle")}>
            Alle Themen
          </button>
          {groups.map((g) => (
            <button key={g.id} type="button" aria-pressed={topic === g.id} onClick={() => setTopic(g.id)}>
              {g.label}
            </button>
          ))}
        </div>
        <p className={s.faqCount} aria-live="polite">
          {filtered ? `${count} von ${total} Fragen` : `${total} Fragen in ${groups.length} Themen`}
        </p>
      </div>

      {shown.length === 0 ? (
        <div className={s.faqEmpty}>
          <p>
            <b>Dazu haben wir keine Frage gefunden.</b>
          </p>
          <p>Versuch es mit einem anderen Wort, zum Beispiel „Karte“, „Depot“ oder „Überweisung“.</p>
          <button type="button" className={`btn btn--ghost btn--sm ${s.resetBtn}`} onClick={reset}>
            Alle Fragen zeigen
          </button>
        </div>
      ) : (
        shown.map((g) => (
          <section key={g.id} id={g.id} className={s.faqGroup} aria-labelledby={`${g.id}-h`}>
            <h2 id={`${g.id}-h`}>{g.label}</h2>
            <div className="faq-list">
              {g.items.map((it) => (
                <details key={q ? `${it.id}-offen` : it.id} id={it.id} open={q ? true : undefined}>
                  <summary>
                    {it.q}
                    <Icon name="plus" />
                  </summary>
                  <div className="a">
                    <p>{it.a}</p>
                    {it.link ? (
                      <p className={s.faqMore}>
                        <Link href={it.link.href}>{it.link.label}</Link>
                      </p>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}

export default FaqBrowser;
