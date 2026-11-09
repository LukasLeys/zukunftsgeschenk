"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem } from "@/lib/cart-types";
import { CartContext, type CartContextValue } from "./context";
import { CartDrawer } from "./CartDrawer";

const STORAGE_KEY = "zg-cart-v1";
const MAX_ITEMS = 20;

function load(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (x): x is CartItem =>
        !!x && typeof x === "object" && typeof (x as CartItem).motif === "string" && typeof (x as CartItem).amount === "number",
    );
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* privater Modus oder Speicher voll: Warenkorb lebt nur in dieser Sitzung */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);

  useEffect(() => {
    setItems(load());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (ready) save(items);
  }, [items, ready]);

  const add = useCallback<CartContextValue["add"]>((item, opts) => {
    setItems((prev) => (prev.length >= MAX_ITEMS ? prev : [...prev, item]));
    setLastAdded(item);
    if (opts?.open !== false) setOpen(true);
  }, []);
  const remove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setLastAdded(null);
  }, []);
  const clear = useCallback(() => {
    setItems([]);
    setLastAdded(null);
  }, []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => {
    setOpen(false);
    setLastAdded(null);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({ items, count: items.length, ready, add, remove, clear, isOpen, open, close, lastAdded }),
    [items, ready, add, remove, clear, isOpen, open, close, lastAdded],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export type { CartContextValue };
export default CartProvider;
