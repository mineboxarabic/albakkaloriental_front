import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PRO_COOKIE = "b2b_session";

function secret(): Uint8Array | null {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 8) return null;
  return new TextEncoder().encode(raw);
}

// A valid pro session is simply a signature-valid b2b token in the b2b_session
// cookie. The portal is the cookie itself; the token carries no role. We sanity
// check the b2b shape (sub + email) to reject a retail token placed in this cookie.
type ProSession = { mustChangePassword: boolean };

async function readProSession(token: string): Promise<ProSession | null> {
  const key = secret();
  if (!key) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    return { mustChangePassword: payload.mustChangePassword === true };
  } catch {
    return null;
  }
}

/** Where a client still using the temporary password an admin gave them must go first. */
const CHANGE_PASSWORD_PATH = "/pro/change-password";

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
  const token = req.cookies.get(PRO_COOKIE)?.value;
  const session = token ? await readProSession(token) : null;

  if (
    session?.mustChangePassword &&
    pathname !== CHANGE_PASSWORD_PATH &&
    !pathname.startsWith("/pro/login")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = CHANGE_PASSWORD_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isPublicProPath(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
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
