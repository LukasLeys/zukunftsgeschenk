import type { MetadataRoute } from "next";
import { MOTIFS } from "@/lib/catalog";
import { SITE_URL } from "@/lib/env";

// Öffentliche Seiten. Persönliche Seiten (Bestellung, Karte, Überweisen, Wunschseiten) und /admin bleiben draußen.
const PAGES: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, freq: "weekly" },
  { path: "/karten", priority: 0.9, freq: "weekly" },
  { path: "/so-funktionierts", priority: 0.8, freq: "monthly" },
  { path: "/rechner", priority: 0.8, freq: "monthly" },
  { path: "/zukunftsdepot", priority: 0.8, freq: "weekly" },
  { path: "/faq", priority: 0.7, freq: "monthly" },
  { path: "/einloesen", priority: 0.6, freq: "yearly" },
  { path: "/wunschseite", priority: 0.5, freq: "yearly" },
  { path: "/impressum", priority: 0.2, freq: "yearly" },
  { path: "/agb", priority: 0.2, freq: "yearly" },
  { path: "/datenschutz", priority: 0.2, freq: "yearly" },
  { path: "/widerruf", priority: 0.2, freq: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...PAGES.map((p) => ({ url: `${SITE_URL}${p.path === "/" ? "" : p.path}`, lastModified: now, changeFrequency: p.freq, priority: p.priority })),
    ...MOTIFS.map((m) => ({ url: `${SITE_URL}/karten/${m.id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
