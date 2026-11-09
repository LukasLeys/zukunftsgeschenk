import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Eigenes Build-Verzeichnis pro Prozess möglich (parallele Entwicklung): NEXT_DIST_DIR=.next-a
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["@electric-sql/pglite"],
  poweredByHeader: false,
};

export default nextConfig;
