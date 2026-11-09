import Link from "next/link";
import type { ReactNode } from "react";
import s from "./admin.module.css";
import { CARD_STATUS, ORDER_STATUS, type Tone } from "./server";

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`${s.badge} ${s[tone]}`}>{children}</span>;
}

export function OrderStatus({ status }: { status: string }) {
  const st = ORDER_STATUS[status] ?? { label: status, tone: "plain" as Tone };
  return <Badge tone={st.tone}>{st.label}</Badge>;
}

export function CardStatus({ status, orderStatus }: { status: string; orderStatus?: string }) {
  if (orderStatus === "cancelled") return <Badge tone="off">storniert</Badge>;
  const st = CARD_STATUS[status] ?? { label: status, tone: "plain" as Tone };
  return <Badge tone={st.tone}>{st.label}</Badge>;
}

export function PageHead({ title, sub, crumb, children }: { title: ReactNode; sub?: ReactNode; crumb?: { href: string; label: string }; children?: ReactNode }) {
  return (
    <div className={s.pageHead}>
      <div>
        {crumb && (
          <p className={s.crumb}>
            <Link href={crumb.href}>{crumb.label}</Link>
          </p>
        )}
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className={s.pageActions}>{children}</div>}
    </div>
  );
}

export function SectionHead({ title, sub, children }: { title: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className={s.sectionHead}>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
      {children && <div className={s.pageActions}>{children}</div>}
    </div>
  );
}

/** Segment-Filter als Links (funktioniert ohne JavaScript). */
export function Seg({ items, label }: { items: { href: string; label: string; count?: number; active: boolean }[]; label: string }) {
  return (
    <div className={s.seg} role="group" aria-label={label}>
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={i.active ? "true" : undefined} scroll={false}>
          {i.label}
          {i.count !== undefined && <span>{i.count}</span>}
        </Link>
      ))}
    </div>
  );
}

export function EmptyRow({ cols, children }: { cols: number; children: ReactNode }) {
  return (
    <tr className={s.empty}>
      <td colSpan={cols}>{children}</td>
    </tr>
  );
}
