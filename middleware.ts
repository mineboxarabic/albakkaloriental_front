import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "catalog_session";

function secret(): Uint8Array | null {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 32) return null;
  return new TextEncoder().encode(raw);
}

async function isPro(token: string): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.role === "B2B_CLIENT" || payload.role === "ADMIN";
  } catch {
    return false;
  }
}

// Public pro routes: browsing the wholesale catalog needs no login.
// Prices are stripped server-side for anonymous visitors; everything else
// under /pro/* (cart, orders, quotes, invoices, account, proforma) stays gated.
function isPublicProPath(pathname: string): boolean {
  if (pathname === "/pro/login" || pathname.startsWith("/pro/login/")) return true;
  if (pathname === "/pro" || pathname === "/pro/products") return true;
  if (pathname.startsWith("/pro/products/")) return true;
  if (pathname === "/pro/marques" || pathname.startsWith("/pro/marques/")) return true;
  if (pathname === "/pro/categories" || pathname.startsWith("/pro/categories/")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicProPath(pathname)) {
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
