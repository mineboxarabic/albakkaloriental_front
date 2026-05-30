import { cookies } from "next/headers";
import { jwtVerify, type JWTPayload } from "jose";

/**
 * Cookie holding the JWT (Bearer) issued by AlimExpressApp under
 * /api/v1/<scope>/auth/login. The token's payload tells us whether the
 * session is retail (B2C) or pro (B2B). No server-side signing happens
 * here anymore: this front is just a client of the back-end and stores
 * its tokens.
 */
export const SESSION_COOKIE = "catalog_session";
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

export type CatalogSession = RetailSession | ProSession;

function getSharedSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET must be set (same value as AlimExpressApp).",
    );
  }
  return new TextEncoder().encode(secret);
}

function payloadToSession(payload: JWTPayload): CatalogSession | null {
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!sub) return null;

  if (payload.role === "B2C_CLIENT") {
    return {
      type: "retail",
      customerId: sub,
      userId: typeof payload.userId === "string" ? payload.userId : undefined,
      name: typeof payload.name === "string" ? payload.name : "",
      phone: typeof payload.phone === "string" ? payload.phone : "",
    };
  }

  if (payload.role === "B2B_CLIENT" || payload.role === "ADMIN") {
    return {
      type: "pro",
      userId: sub,
      customerId:
        typeof payload.customerId === "string" ? payload.customerId : null,
      email: typeof payload.email === "string" ? payload.email : "",
      name: typeof payload.name === "string" ? payload.name : "",
    };
  }

  return null;
}

export async function verifySessionToken(
  token: string,
): Promise<CatalogSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSharedSecret());
    return payloadToSession(payload);
  } catch {
    return null;
  }
}

export async function getSession(): Promise<CatalogSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function storeBackendToken(token: string): Promise<void> {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
