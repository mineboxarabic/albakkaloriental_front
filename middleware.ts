import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "catalog_session";

function secret(): Uint8Array | null {
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.length < 16) return null;
  return new TextEncoder().encode(raw);
}

async function getProSession(token: string): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.type === "pro";
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /pro/login is public.
  if (pathname === "/pro/login" || pathname.startsWith("/pro/login/")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const isPro = token ? await getProSession(token) : false;

  if (!isPro) {
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
