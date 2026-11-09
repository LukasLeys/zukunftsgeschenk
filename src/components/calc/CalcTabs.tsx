"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { DepotCalculator } from "./DepotCalculator";
import { GiftCalculator } from "./GiftCalculator";

export interface CalcTabsProps {
  /** Welcher Rechner zuerst offen ist. */
  initial?: "gift" | "depot";
}

/** Beide Rechner in einer Karte mit Umschalter (Startseite, /rechner). */
export function CalcTabs({ initial = "gift" }: CalcTabsProps) {
  const [tab, setTab] = useState<"gift" | "depot">(initial);
  const refs = { gift: useRef<HTMLButtonElement>(null), depot: useRef<HTMLButtonElement>(null) };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const next = tab === "gift" ? "depot" : "gift";
      const target = e.key === "Home" ? "gift" : e.key === "End" ? "depot" : next;
      setTab(target);
      refs[target].current?.focus();
    }
  };

  return (
    <div className="calc">
      <div className="tabs" role="tablist" aria-label="Rechner wählen">
        <button
          ref={refs.gift}
          className="tab"
          role="tab"
          id="tab-g"
          type="button"
          aria-controls="panel-g"
          aria-label="Geschenk-Rechner"
          aria-selected={tab === "gift"}
          tabIndex={tab === "gift" ? 0 : -1}
          onClick={() => setTab("gift")}
          onKeyDown={onKey}
        >
          Geschenk
          <span className="tab-x">-Rechner</span>
        </button>
        <button
          ref={refs.depot}
          className="tab"
          role="tab"
          id="tab-d"
          type="button"
          aria-controls="panel-d"
          aria-label="Depot-Rechner"
          aria-selected={tab === "depot"}
          tabIndex={tab === "depot" ? 0 : -1}
          onClick={() => setTab("depot")}
          onKeyDown={onKey}
        >
          Depot
          <span className="tab-x">-Rechner</span>
        </button>
      </div>
      <div className="panel" role="tabpanel" id="panel-g" aria-labelledby="tab-g" hidden={tab !== "gift"}>
        <GiftCalculator />
      </div>
      <div className="panel" role="tabpanel" id="panel-d" aria-labelledby="tab-d" hidden={tab !== "depot"}>
        <DepotCalculator />
      </div>
    </div>
  );
}

export default CalcTabs;
