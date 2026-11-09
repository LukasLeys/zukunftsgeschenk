"use client";

import { useContext } from "react";
import { CartContext, type CartContextValue } from "./context";

/** Zugriff auf den Warenkorb. Nur innerhalb von <CartProvider> (steckt im Root-Layout). */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart muss innerhalb von <CartProvider> verwendet werden.");
  return ctx;
}

export type { CartContextValue };
export type { CartItem } from "@/lib/cart-types";
