import { describe, it, expect, beforeEach } from "vitest";
import { clientIp, rateLimit, resetRateLimits, take } from "../src/lib/ratelimit";
import { UserError } from "../src/lib/errors";

const req = (ip: string) => new Request("http://localhost/api/test", { headers: { "x-forwarded-for": `${ip}, 10.0.0.1` } });
const limit = { name: "test", max: 3, windowMs: 1000, message: "Bitte wartet kurz." };

describe("Rate-Limit", () => {
  beforeEach(() => resetRateLimits());

  it("erlaubt bis zum Limit und sperrt danach", () => {
    expect([1, 2, 3].map(() => take("k", 3, 1000, 0))).toEqual([true, true, true]);
    expect(take("k", 3, 1000, 10)).toBe(false);
  });

  it("gibt nach Ablauf des Zeitfensters wieder frei", () => {
    for (let i = 0; i < 3; i++) take("k", 3, 1000, i);
    expect(take("k", 3, 1000, 500)).toBe(false);
    expect(take("k", 3, 1000, 1001)).toBe(true);
  });

  it("zählt je IP getrennt und wirft 429 mit Meldung", () => {
    for (let i = 0; i < 3; i++) rateLimit(req("1.1.1.1"), limit, 0);
    expect(() => rateLimit(req("2.2.2.2"), limit, 0)).not.toThrow();
    try {
      rateLimit(req("1.1.1.1"), limit, 0);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(UserError);
      expect((e as UserError).status).toBe(429);
      expect((e as UserError).message).toBe("Bitte wartet kurz.");
    }
  });

  it("nimmt die erste Adresse aus x-forwarded-for", () => {
    expect(clientIp(req("203.0.113.5"))).toBe("203.0.113.5");
    expect(clientIp(new Request("http://localhost/"))).toBe("unbekannt");
  });
});
