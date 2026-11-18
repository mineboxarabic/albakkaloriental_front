// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

const SECRET = "middleware-test-secret";
const BASE = "https://portal.test";

async function token(extra: Record<string, unknown> = {}) {
  return new SignJWT({ name: "Buyer", email: "buyer@example.test", customerId: "c1", ...extra })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("u1")
    .setIssuedAt()
    .sign(new TextEncoder().encode(SECRET));
}

function request(path: string, session?: string) {
  const req = new NextRequest(new URL(path, BASE));
  if (session) req.cookies.set("b2b_session", session);
  return req;
}

function redirectPath(res: Response) {
  const location = res.headers.get("location");
  return location ? new URL(location).pathname + new URL(location).search : null;
}

beforeAll(() => {
  process.env.AUTH_SECRET = SECRET;
});

describe("pro middleware", () => {
  it("lets a normal session through", async () => {
    const res = await middleware(request("/pro/orders", await token()));
    expect(redirectPath(res)).toBeNull();
  });

  it("sends a session that still has its temporary password to the password change page", async () => {
    const session = await token({ mustChangePassword: true });
    for (const path of ["/pro/orders", "/pro/products", "/pro/account"]) {
      const res = await middleware(request(path, session));
      expect(redirectPath(res)).toBe("/pro/change-password");
    }
  });

  it("does not loop on the password change page itself", async () => {
    const res = await middleware(request("/pro/change-password", await token({ mustChangePassword: true })));
    expect(redirectPath(res)).toBeNull();
  });

  it("still sends visitors without a session to the login page", async () => {
    const res = await middleware(request("/pro/change-password"));
    expect(redirectPath(res)).toBe("/pro/login?next=%2Fpro%2Fchange-password");
  });

  it("keeps the public catalogue open to visitors", async () => {
    const res = await middleware(request("/pro/products"));
    expect(redirectPath(res)).toBeNull();
  });
});
