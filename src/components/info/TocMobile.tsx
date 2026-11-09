"use client";

import { useRef } from "react";
import { Icon } from "@/components/Icon";
import type { TocItem } from "./InfoPage";
import s from "./info.module.css";

/** Inhaltsverzeichnis am Handy: bleibt unter der Kopfzeile stehen und klappt nach dem Sprung wieder zu. */
export function TocMobile({ items }: { items: TocItem[] }) {
  const box = useRef<HTMLDetailsElement>(null);
  const close = () => {
    if (box.current) box.current.open = false;
  };
  return (
    <details ref={box} className={s.tocMobile}>
      <summary>
        Auf dieser Seite ({items.length} Abschnitte)
        <Icon name="down" />
      </summary>
      <nav aria-label="Auf dieser Seite">
        <ol>
          {items.map((it) => (
            <li key={it.id}>
              <a href={`#${it.id}`} onClick={close}>
                {it.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}

export default TocMobile;
