"use client";

import { createContext } from "react";
import type { CartItem } from "@/lib/cart-types";

export interface CartContextValue {
  items: CartItem[];
  count: number;
  /** true, sobald der gespeicherte Warenkorb aus localStorage geladen ist. */
  ready: boolean;
  /** Karte hinzufügen. Standard: Schublade öffnet sich mit Bestätigung. */
  add: (item: CartItem, opts?: { open?: boolean }) => void;
  /** Position entfernen (Index in `items`). */
  remove: (index: number) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** Zuletzt hinzugefügte Karte (für die Bestätigung in der Schublade), sonst null. */
  lastAdded: CartItem | null;
}

export const CartContext = createContext<CartContextValue | null>(null);
