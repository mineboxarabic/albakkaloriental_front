import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";
import { SECURITY_HEADERS } from "@/lib/security-headers";

describe("portal security headers", () => {
  it("are sent on every route", async () => {
    const rules = await nextConfig.headers!();
    expect(rules).toContainEqual({ source: "/(.*)", headers: SECURITY_HEADERS });
  });

  it("forbid framing by other sites and MIME sniffing", () => {
    const byKey = Object.fromEntries(SECURITY_HEADERS.map(({ key, value }) => [key, value]));
    expect(byKey["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
  });
});
