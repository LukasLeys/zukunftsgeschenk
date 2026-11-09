import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

// Achtung Präfix-Regel: "/karte/" mit Schrägstrich, sonst wäre auch "/karten" gesperrt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/bestellung", "/karte/", "/ueberweisen/", "/fuer/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
