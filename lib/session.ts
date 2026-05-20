import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const SESSION_COOKIE = "catalog_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type RetailSession = {
  type: "retail";
  customerId: string;
  name: string;
  phone: string;
};

export type ProSession = {
  type: "pro";
  userId: string;
  customerId: string;
  email: string;
  companyName: string;
  pricingLevel: "C" | "D" | "E" | "F" | null;
};

export type CatalogSession = RetailSession | ProSession;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET is missing or too short (min 16 chars).");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(session: CatalogSession): Promise<string> {
  return new SignJWT(session as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<CatalogSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type === "retail" || payload.type === "pro") {
      return payload as unknown as CatalogSession;
    }
    return null;
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

export async function setSessionCookie(session: CatalogSession): Promise<void> {
  const token = await signSession(session);
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
