"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  FileText,
  FileSignature,
  Receipt,
  ShoppingCart,
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { useCart } from "@/components/cart-context";
import { logoutPro } from "@/actions/pro-auth";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";

const NAV = [
  { label: "Catalogue", href: "/pro/products", icon: Package },
  { label: "Commandes", href: "/pro/orders", icon: FileText },
  { label: "Devis", href: "/pro/quotes", icon: FileSignature },
  { label: "Factures", href: "/pro/invoices", icon: Receipt },
];

export function ProSiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  if (pathname === "/pro/login" || pathname?.startsWith("/pro/login/")) {
    return null;
  }

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <header
      className="w-full border-b"
      style={{
        background: "linear-gradient(180deg, #1E2A0E 0%, #2B3B14 100%)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="mx-auto flex max-w-[1180px] items-center gap-8 px-6 py-3">
        <Link href="/pro/products" className="flex items-center gap-2 shrink-0">
          <svg width="28" height="28" viewBox="0 0 34 34" fill="none" aria-hidden>
            <path
              d="M17 4c-3 6-7 9-12 10 1 8 6 14 12 16 6-2 11-8 12-16-5-1-9-4-12-10z"
              fill="#FAF8F2"
            />
            <path
              d="M17 10c-1 3-4 5-7 6 1 4 4 8 7 9 3-1 6-5 7-9-3-1-6-3-7-6z"
              fill={COLORS.primary}
            />
          </svg>
          <div className="leading-tight">
            <div
              className="text-[15px] font-extrabold tracking-tight text-white"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              LE BAKKAL
            </div>
            <div
              className="flex items-center gap-1 text-[8.5px] tracking-[0.35em] text-white/70"
            >
              <Shield className="h-2 w-2" strokeWidth={2.4} /> ORIENTAL · PRO
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-[12px] font-semibold tracking-wide transition"
                style={{
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.75)",
                }}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                {label.toUpperCase()}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/pro/cart"
            className="relative flex h-10 items-center gap-2 rounded-sm px-3 text-[12px] font-semibold tracking-wide transition hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={2} />
            PANIER
            {itemCount > 0 && (
              <span
                className="grid h-5 min-w-[22px] place-items-center rounded-full px-1.5 text-[10.5px] font-bold leading-none text-white"
                style={{ background: COLORS.red }}
              >
                {itemCount}
              </span>
            )}
          </Link>

          <Link
            href="/pro/account"
            aria-label="Mon compte"
            className="grid h-10 w-10 place-items-center rounded-sm transition hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            <User className="h-4 w-4" strokeWidth={2} />
          </Link>

          <form action={logoutPro}>
            <button
              type="submit"
              aria-label="Se déconnecter"
              className="grid h-10 w-10 place-items-center rounded-sm transition hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
