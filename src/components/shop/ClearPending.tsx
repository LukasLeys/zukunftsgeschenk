"use client";

import { useEffect } from "react";

/** Auf der Bestätigungsseite: Zwischenablage aus der Kasse löschen, die Bestellung ist bezahlt. */
export function ClearPending() {
  useEffect(() => {
    try {
      window.sessionStorage.removeItem("zg-checkout-pending");
    } catch {
      /* nichts zu tun */
    }
  }, []);
  return null;
}

export default ClearPending;
