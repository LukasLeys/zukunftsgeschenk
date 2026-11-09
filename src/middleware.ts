import { NextResponse, type NextRequest } from "next/server";

// Admin-Bereich mit HTTP-Basic-Auth (ADMIN_USER / ADMIN_PASSWORD). Ohne Passwort im Produktivbetrieb gesperrt.
export function middleware(req: NextRequest) {
  const pass = process.env.ADMIN_PASSWORD ?? (process.env.NODE_ENV === "production" ? "" : "admin");
  const user = process.env.ADMIN_USER ?? "admin";
  const auth = req.headers.get("authorization") ?? "";
  if (pass && auth.startsWith("Basic ")) {
    const [u, p] = atob(auth.slice(6)).split(":");
    if (u === user && p === pass) return NextResponse.next();
  }
  return new NextResponse("Anmeldung erforderlich", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Zukunftsgeschenk Admin"' } });
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
