import type { ElementType, ReactNode, HTMLAttributes } from "react";

export type TornPaper = "pink" | "nacht" | "rosa" | "gelb" | "weiss";

export interface TornProps extends HTMLAttributes<HTMLElement> {
  /** HTML-Element, Standard „section“. */
  as?: ElementType;
  /** Fläche unter der Zackenkante. pink = Geschenkpapier, nacht = Fußzeilen-Papier. */
  paper?: TornPaper;
  /** Zweite Rissform (b), damit zwei Risse auf einer Seite nicht gleich aussehen. */
  variant?: "a" | "b";
  children: ReactNode;
}

/**
 * Abschnittswechsel mit gerissener Papierkante oben (sparsam einsetzen, höchstens 2 pro Seite).
 * Der Abschnitt schiebt sich 30 px unter den vorigen; die Kante zeigt Faserweiß, dann die Papierfläche.
 * Typisch mit `className="band"` und einem `.wrap`-Container darin.
 */
export function Torn({ as: Tag = "section", paper = "pink", variant = "a", className, children, ...rest }: TornProps) {
  const cls = ["torn", variant === "b" ? "torn--b" : "", `torn--${paper}`, className].filter(Boolean).join(" ");
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}

export default Torn;
