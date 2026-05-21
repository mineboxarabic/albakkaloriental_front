import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "catalog_session";

function secret(): Uint8Array | null {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 8) return null;
  return new TextEncoder().encode(raw);
}

async function isPro(token: string): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.role === "B2B_CLIENT";
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/pro/login" || pathname.startsWith("/pro/login/")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const allowed = token ? await isPro(token) : false;

  if (!allowed) {
    const url = req.nextUrl.clone();
    url.pathname = "/pro/login";
    if (pathname && pathname !== "/pro") {
      url.searchParams.set("next", pathname);
    } else {
      url.searchParams.delete("next");
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/pro/:path*"],
};
