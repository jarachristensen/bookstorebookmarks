import { describe, it, expect } from "vitest";
import { verifyPassphrase, createSessionToken, verifySessionToken } from "@/lib/auth";

describe("Admin Authentication", () => {
  it("should verify passphrase correctly", () => {
    expect(verifyPassphrase("curator123")).toBe(true);
    expect(verifyPassphrase("wrongpassword")).toBe(false);
  });

  it("should generate and verify valid session token", () => {
    const token = createSessionToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(verifySessionToken(token)).toBe(true);
    expect(verifySessionToken("invalid-token-123")).toBe(false);
  });
});
