import { cookies } from "next/headers";
import { jwtVerify, type JWTPayload } from "jose";

/**
 * Two separate session cookies, one per portal. The cookie NAME identifies the
 * portal — the JWT itself carries no portal/role field. A user can hold both at
 * once (logged into B2C and B2B simultaneously). Tokens are issued by
 * AlimExpressApp under /api/v1/<scope>/auth/login and only stored here.
 *
 * Retail token shape: { sub, name, phone, userId? }.
 * Pro token shape:    { sub, name, email, customerId }.
 */
export const RETAIL_COOKIE = "b2c_session";
export const PRO_COOKIE = "b2b_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days (matches back-end JWT expiry)

export type RetailSession = {
  type: "retail";
  customerId: string;
  userId?: string;
  name: string;
  phone: string;
};

export type ProSession = {
  type: "pro";
  userId: string;
  customerId: string | null;
  email: string;
  name: string;
};

function getSharedSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET must be set (same value as AlimExpressApp).");
  }
  return new TextEncoder().encode(secret);
}

function toRetailSession(payload: JWTPayload): RetailSession | null {
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!sub || typeof payload.phone !== "string") return null;
  return {
    type: "retail",
    customerId: sub,
    userId: typeof payload.userId === "string" ? payload.userId : undefined,
    name: typeof payload.name === "string" ? payload.name : "",
    phone: payload.phone,
  };
}

function toProSession(payload: JWTPayload): ProSession | null {
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!sub || typeof payload.email !== "string") return null;
  return {
    type: "pro",
    userId: sub,
    customerId: typeof payload.customerId === "string" ? payload.customerId : null,
    email: payload.email,
    name: typeof payload.name === "string" ? payload.name : "",
  };
}

async function verify<T>(
  token: string,
  toSession: (p: JWTPayload) => T | null,
): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getSharedSecret());
    return toSession(payload);
  } catch {
    return null;
  }
}

async function readSession<T>(
  cookieName: string,
  toSession: (p: JWTPayload) => T | null,
): Promise<T | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  return verify(token, toSession);
}

async function writeCookie(name: string, value: string, maxAge: number): Promise<void> {
  (await cookies()).set({
    name,
    value,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export const getRetailSession = () => readSession(RETAIL_COOKIE, toRetailSession);
export const getProSession = () => readSession(PRO_COOKIE, toProSession);

export const storeRetailToken = (token: string) =>
  writeCookie(RETAIL_COOKIE, token, SESSION_MAX_AGE);
export const storeProToken = (token: string) =>
  writeCookie(PRO_COOKIE, token, SESSION_MAX_AGE);

export const clearRetailSession = () => writeCookie(RETAIL_COOKIE, "", 0);
export const clearProSession = () => writeCookie(PRO_COOKIE, "", 0);
