import { describe, it, expect, vi, afterEach } from "vitest";
import { encrypt, encryptionKeyStatus, IBAN_NOT_READY } from "../src/lib/crypto";
import { UserError } from "../src/lib/errors";

describe("IBAN-Schlüssel im Produktivbetrieb", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("ohne Schlüssel: UserError mit 503, kein Ersatzschlüssel", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("IBAN_ENCRYPTION_KEY", "");
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(encryptionKeyStatus()).toBe("missing");
    try {
      encrypt("AT611904300234573201");
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(UserError);
      expect((e as UserError).status).toBe(503);
      expect((e as UserError).message).toBe(IBAN_NOT_READY);
    }
  });

  it("erkennt einen Schlüssel mit falscher Länge", () => {
    vi.stubEnv("IBAN_ENCRYPTION_KEY", Buffer.from("zu kurz").toString("base64"));
    expect(encryptionKeyStatus()).toBe("invalid");
  });
});
