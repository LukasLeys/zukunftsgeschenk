import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { InfoIcon } from "./InfoIcon";
import s from "./info.module.css";

export interface TimelineItem {
  when: string;
  title: string;
  text?: ReactNode;
  /** done = vorbei, now = aktuell, plan = geplant/später */
  state?: "done" | "now" | "plan";
  badge?: string;
}

/** Senkrechte Zeitleiste auf einem Satinband. */
export function Timeline({ items, label }: { items: TimelineItem[]; label: string }) {
  return (
    <ol className={s.timeline} aria-label={label}>
      {items.map((it) => {
        const st = it.state ?? "plan";
        const cls = [s.tlItem, st === "done" ? s.tlDone : "", st === "now" ? s.tlNow : ""].filter(Boolean).join(" ");
        return (
          <li key={it.when + it.title} className={cls}>
            <span className={s.tlDot} aria-hidden="true">
              {st === "done" ? <Icon name="check" /> : st === "now" ? <InfoIcon name="hourglass" /> : <InfoIcon name="calendar" />}
            </span>
            <p className={s.tlWhen}>
              <span>{it.when}</span>
              {it.badge ? <span className={s.tlBadge}>{it.badge}</span> : null}
            </p>
            <p className={s.tlTitle}>{it.title}</p>
            {it.text ? <p className={s.tlText}>{it.text}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}

export default Timeline;
