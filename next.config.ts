import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy. Next.js braucht 'unsafe-inline' für seine eigenen Inline-Skripte (Hydration)
// und für das kleine Skript in app/layout.tsx. Nonces würden jede Seite dynamisch machen.
// Stripe Checkout ist eine Weiterleitung, auf unseren Seiten läuft kein Fremd-Skript.
// Im Entwicklungsmodus braucht React Refresh zusätzlich 'unsafe-eval' und eine WebSocket-Verbindung.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  // Eigenes Build-Verzeichnis pro Prozess möglich (parallele Entwicklung): NEXT_DIST_DIR=.next-a
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["@electric-sql/pglite"],
  poweredByHeader: false,
  // Schriften für die Vorschaubilder (Open Graph), die zur Laufzeit gerendert werden, z. B. Wunschseiten.
  outputFileTracingIncludes: { "/**": ["./src/app/_og/*.ttf"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
