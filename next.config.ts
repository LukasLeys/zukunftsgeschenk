import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Eigenes Build-Verzeichnis pro Prozess möglich (parallele Entwicklung): NEXT_DIST_DIR=.next-a
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["@electric-sql/pglite"],
  poweredByHeader: false,
  // Schriften für die Vorschaubilder (Open Graph), die zur Laufzeit gerendert werden, z. B. Wunschseiten.
  outputFileTracingIncludes: { "/**": ["./src/app/_og/*.ttf"] },
};

export default nextConfig;
