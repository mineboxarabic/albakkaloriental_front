"use client";

import { useState } from "react";
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
  Menu,
  X,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  if (pathname === "/pro/login" || pathname?.startsWith("/pro/login/")) {
    return null;
  }

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <>
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur"
      style={{
        background: "linear-gradient(180deg, rgba(30,42,14,0.96) 0%, rgba(43,59,20,0.96) 100%)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-4 py-3 md:px-6 lg:gap-8">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-sm text-white/90 hover:bg-white/10 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-6 w-6" strokeWidth={2} />
        </button>

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

        <nav className="hidden items-center gap-1 lg:flex">
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

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/pro/cart"
            className="relative flex h-10 items-center gap-2 rounded-sm px-2.5 text-[12px] font-semibold tracking-wide transition hover:bg-white/10 sm:px-3"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4" strokeWidth={2} />
            <span className="hidden sm:inline">PANIER</span>
            {itemCount > 0 && (
              <span
                className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full px-1 text-[10.5px] font-bold leading-none text-white sm:static sm:right-auto sm:top-auto sm:min-w-[22px] sm:px-1.5"
                style={{ background: COLORS.red }}
              >
                {itemCount}
              </span>
            )}
          </Link>

          <Link
            href="/pro/account"
            aria-label="Mon compte"
            className="hidden h-10 w-10 place-items-center rounded-sm transition hover:bg-white/10 lg:grid"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            <User className="h-4 w-4" strokeWidth={2} />
          </Link>

          <form action={logoutPro} className="hidden lg:block">
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

      {/* Mobile slide-in menu */}
      <div
        className={`fixed inset-0 z-[60] overflow-hidden lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
          aria-hidden
        />
        <div
          className={`absolute left-0 top-0 flex h-full w-[290px] max-w-[85%] flex-col text-white shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            background:
              "linear-gradient(180deg, #1E2A0E 0%, #2B3B14 70%, #3F561F 100%)",
          }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3.5"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}
          >
            <span
              className="flex items-center gap-1.5 text-[15px] font-extrabold tracking-tight"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              <Shield className="h-3.5 w-3.5" strokeWidth={2.4} /> ESPACE PRO
            </span>
            <button
              type="button"
              onClick={closeMenu}
              className="grid h-9 w-9 place-items-center rounded-sm hover:bg-white/10"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="grid gap-0.5">
              {NAV.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-semibold tracking-wide transition"
                    style={{
                      background: active ? "rgba(255,255,255,0.12)" : "transparent",
                      color: active ? "#FFFFFF" : "rgba(255,255,255,0.8)",
                    }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    {label.toUpperCase()}
                  </Link>
                );
              })}
            </div>

            <div
              className="my-3 border-t"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            />

            <div className="grid gap-0.5">
              <Link
                href="/pro/account"
                onClick={closeMenu}
                className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-semibold tracking-wide text-white/80 transition hover:bg-white/10"
              >
                <User className="h-4 w-4" strokeWidth={2} /> MON COMPTE
              </Link>
              <form action={logoutPro}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2.5 text-left text-[13.5px] font-semibold tracking-wide text-white/80 transition hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" strokeWidth={2} /> DÉCONNEXION
                </button>
              </form>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
