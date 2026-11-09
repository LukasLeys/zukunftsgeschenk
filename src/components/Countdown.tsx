"use client";

import { useEffect, useState } from "react";
import { XMAS_DEADLINE } from "@/lib/catalog";

type Parts = { d: number; h: number; m: number } | "over" | null;

function parts(deadline: Date): Parts {
  const ms = deadline.getTime() - Date.now();
  if (ms <= 0) return "over";
  const min = Math.floor(ms / 60000);
  return { d: Math.floor(min / 1440), h: Math.floor((min % 1440) / 60), m: min % 60 };
}

const TZ = "Europe/Vienna";
const dateText = (d: Date) =>
  `${new Intl.DateTimeFormat("de-AT", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(d)}, ${new Intl.DateTimeFormat("de-AT", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TZ }).format(d)}`;

export interface CountdownProps {
  /** Standard: Bestellschluss der Weihnachtsaktion (XMAS_DEADLINE). */
  deadline?: Date;
  /** Text nach Ablauf. */
  overText?: string;
}

/** Countdown in Tagen, Stunden, Minuten (aktualisiert alle 20 s). Vor dem Laden: Striche statt veralteter Zahlen. */
export function Countdown({ deadline = XMAS_DEADLINE, overText = "Die Aktion ist vorbei." }: CountdownProps) {
  const [p, setP] = useState<Parts>(null);

  useEffect(() => {
    const tick = () => setP(parts(deadline));
    tick();
    const t = window.setInterval(tick, 20000);
    return () => window.clearInterval(t);
  }, [deadline]);

  const over = p === "over";
  const v = p && p !== "over" ? p : null;
  const show = (n: number | undefined, pad: boolean) => (n === undefined ? "–" : pad ? String(n).padStart(2, "0") : String(n));
  const label = v ? `Noch ${v.d} Tage, ${v.h} Stunden und ${v.m} Minuten` : undefined;

  return (
    <>
      <div className="cdown" role="timer" aria-label={label} aria-describedby="cdText">
        <div>
          <b aria-hidden="true">{over ? "0" : show(v?.d, false)}</b>
          <span aria-hidden="true">Tage</span>
        </div>
        <div>
          <b aria-hidden="true">{over ? "00" : show(v?.h, true)}</b>
          <span aria-hidden="true">Stunden</span>
        </div>
        <div>
          <b aria-hidden="true">{over ? "00" : show(v?.m, true)}</b>
          <span aria-hidden="true">Minuten</span>
        </div>
      </div>
      <p className={over ? "tiny cdown-done" : "tiny"} id="cdText">
        {over ? overText : `bis ${dateText(deadline)} Uhr`}
      </p>
    </>
  );
}

export default Countdown;
