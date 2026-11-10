"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Lädt die Seite still neu, solange eine Zahlung auf Bestätigung wartet. Hört nach einer Weile auf. */
export function AutoRefresh({ every = 8000, max = 40 }: { every?: number; max?: number }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = window.setInterval(() => {
      if (++n > max || document.hidden) {
        if (n > max) window.clearInterval(id);
        return;
      }
      router.refresh();
    }, every);
    return () => window.clearInterval(id);
  }, [router, every, max]);
  return null;
}
