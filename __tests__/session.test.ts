// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";

const { jar, setCookie } = vi.hoisted(() => ({
  jar: new Map<string, string>(),
  setCookie: vi.fn(),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => jar.has(name) ? { value: jar.get(name) } : undefined,
    set: setCookie,
  }),
}));
import { getRetailSession, getProSession, storeRetailToken, storeProToken, clearRetailSession, clearProSession } from "@/lib/session";

const secret = "isolated-auth-test-secret-at-least-32-characters";
const retail = { sub: "retail-1", name: "Test", phone: "0600000000", userId: "user-1" };
const pro = { sub: "user-1", name: "Test", email: "test@example.test", customerId: "pro-1" };
const sign = (payload: Record<string, unknown>, key = secret, expiry = "30d") =>
  new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(expiry).sign(new TextEncoder().encode(key));

beforeEach(() => {
  jar.clear();
  setCookie.mockReset();
  vi.stubEnv("AUTH_SECRET", secret);
  vi.stubEnv("BACKEND_JWT_SECRET", "");
});
afterEach(() => vi.unstubAllEnvs());

describe("portal sessions", () => {
  it("supports the legacy BACKEND_JWT_SECRET deployment variable", async () => {
    vi.stubEnv("AUTH_SECRET", "");
    vi.stubEnv("BACKEND_JWT_SECRET", secret);
    jar.set("b2c_session", await sign(retail));
    expect(await getRetailSession()).toMatchObject({ customerId: "retail-1" });
  });

  it("reads independent retail and pro sessions", async () => {
    jar.set("b2c_session", await sign(retail));
    jar.set("b2b_session", await sign(pro));
    expect(await getRetailSession()).toMatchObject({ type: "retail", customerId: "retail-1" });
    expect(await getProSession()).toMatchObject({ type: "pro", customerId: "pro-1" });
  });

  it("rejects swapped, expired, and invalidly signed cookies", async () => {
    jar.set("b2c_session", await sign(pro));
    jar.set("b2b_session", await sign(retail));
    expect(await getRetailSession()).toBeNull();
    expect(await getProSession()).toBeNull();
    jar.set("b2c_session", await sign(retail, secret, "-1s"));
    expect(await getRetailSession()).toBeNull();
    jar.set("b2c_session", await sign(retail, "a-different-secret"));
    expect(await getRetailSession()).toBeNull();
  });

  it("refuses to report login success when the secret does not match", async () => {
    await expect(storeRetailToken(await sign(retail, "other-secret"))).rejects.toThrow();
    expect(setCookie).not.toHaveBeenCalled();
  });

  it("refuses empty or wrong-portal login tokens", async () => {
    await expect(storeRetailToken("")).rejects.toThrow();
    await expect(storeProToken(await sign(retail))).rejects.toThrow();
    expect(setCookie).not.toHaveBeenCalled();
  });

  it("stores HTTP-only host-scoped cookies and logs out only the requested portal", async () => {
    const token = await sign(retail);
    await storeRetailToken(token);
    expect(setCookie).toHaveBeenCalledWith(expect.objectContaining({ name: "b2c_session", value: token, httpOnly: true, sameSite: "lax", path: "/" }));
    expect(setCookie.mock.calls[0][0]).not.toHaveProperty("domain");
    await clearRetailSession();
    expect(setCookie).toHaveBeenLastCalledWith(expect.objectContaining({ name: "b2c_session", maxAge: 0 }));
    await clearProSession();
    expect(setCookie).toHaveBeenLastCalledWith(expect.objectContaining({ name: "b2b_session", maxAge: 0 }));
  });
});
