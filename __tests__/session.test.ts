// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
    set: () => undefined,
  }),
}));

beforeAll(() => {
  process.env.JWT_SECRET =
    "test-secret-do-not-use-in-production-pls-just-tests-ok";
});

describe("session", () => {
  it("signs and verifies a retail session", async () => {
    const { signSession, verifySessionToken } = await import("@/lib/session");
    const token = await signSession({
      type: "retail",
      customerId: "ret_1",
      name: "Jordane",
      phone: "0600000000",
    });
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.type).toBe("retail");
    if (verified?.type === "retail") {
      expect(verified.customerId).toBe("ret_1");
      expect(verified.phone).toBe("0600000000");
    }
  });

  it("signs and verifies a pro session with pricing level", async () => {
    const { signSession, verifySessionToken } = await import("@/lib/session");
    const token = await signSession({
      type: "pro",
      userId: "usr_1",
      customerId: "cus_1",
      email: "pro@example.com",
      companyName: "Acme",
      pricingLevel: "D",
    });
    const verified = await verifySessionToken(token);
    expect(verified?.type).toBe("pro");
    if (verified?.type === "pro") {
      expect(verified.companyName).toBe("Acme");
      expect(verified.pricingLevel).toBe("D");
    }
  });

  it("returns null for a tampered or invalid token", async () => {
    const { verifySessionToken } = await import("@/lib/session");
    expect(await verifySessionToken("not.a.jwt")).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
  });

  it("rejects tokens signed with a different secret", async () => {
    const { signSession } = await import("@/lib/session");
    const token = await signSession({
      type: "retail",
      customerId: "ret_2",
      name: "X",
      phone: "0",
    });

    const original = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "completely-different-secret-for-this-test-yes";
    vi.resetModules();
    const { verifySessionToken } = await import("@/lib/session");
    const result = await verifySessionToken(token);
    expect(result).toBeNull();
    process.env.JWT_SECRET = original;
    vi.resetModules();
  });
});
