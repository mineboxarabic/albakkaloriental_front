"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  LayoutGrid,
  Tag,
  ChevronDown,
  FileText,
  FileSignature,
  Receipt,
  ShoppingCart,
  User,
  LogOut,
  LogIn,
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

// Sub-items of the "Catalogue" dropdown.
const CATALOGUE_SUBMENU = [
  { label: "Tous les produits", href: "/pro/products", icon: Package },
  { label: "Catégories", href: "/pro/categories", icon: LayoutGrid },
  { label: "Marques", href: "/pro/marques", icon: Tag },
];

export function ProSiteHeader({
  authenticated = true,
}: {
  authenticated?: boolean;
}) {
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
          {/* Catalogue — dropdown (Tous les produits / Catégories / Marques) */}
          <div className="relative group/cat">
            <Link
              href="/pro/products"
              className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-[12px] font-semibold tracking-wide transition"
              style={{
                background:
                  isActive("/pro/products") ||
                  isActive("/pro/categories") ||
                  isActive("/pro/marques")
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <Package className="h-3.5 w-3.5" strokeWidth={2} />
              CATALOGUE
              <ChevronDown
                className="h-3 w-3 transition-transform duration-200 group-hover/cat:rotate-180"
                strokeWidth={2.4}
              />
            </Link>
            <div className="absolute left-0 top-full z-50 pt-2 opacity-0 invisible translate-y-1 transition-all duration-200 ease-out group-hover/cat:opacity-100 group-hover/cat:visible group-hover/cat:translate-y-0">
              <div
                className="w-[210px] rounded-sm border bg-white p-1.5 shadow-xl"
                style={{ borderColor: COLORS.border }}
              >
                {CATALOGUE_SUBMENU.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-[12.5px] font-medium transition-colors hover:bg-[#FAF8F2]"
                    style={{ color: COLORS.text }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {NAV.slice(1).map(({ label, href, icon: Icon }) => {
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

          {authenticated ? (
            <>
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
            </>
          ) : (
            <Link
              href="/pro/login"
              className="hidden h-10 items-center gap-2 rounded-sm px-3 text-[12px] font-semibold tracking-wide transition hover:bg-white/10 lg:flex"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              <LogIn className="h-4 w-4" strokeWidth={2} />
              SE CONNECTER
            </Link>
          )}
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
              {/* Catalogue + sub-links */}
              <Link
                href="/pro/products"
                onClick={closeMenu}
                className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-semibold tracking-wide transition"
                style={{
                  background: isActive("/pro/products")
                    ? "rgba(255,255,255,0.12)"
                    : "transparent",
                  color: isActive("/pro/products") ? "#FFFFFF" : "rgba(255,255,255,0.8)",
                }}
              >
                <Package className="h-4 w-4" strokeWidth={2} />
                CATALOGUE
              </Link>
              <div
                className="ml-4 grid gap-0.5 border-l pl-2"
                style={{ borderColor: "rgba(255,255,255,0.15)" }}
              >
                {CATALOGUE_SUBMENU.slice(1).map(({ label, href, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMenu}
                      className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13px] font-medium tracking-wide transition"
                      style={{
                        background: active ? "rgba(255,255,255,0.12)" : "transparent",
                        color: active ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                      {label.toUpperCase()}
                    </Link>
                  );
                })}
              </div>

              {NAV.slice(1).map(({ label, href, icon: Icon }) => {
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
              {authenticated ? (
                <>
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
                </>
              ) : (
                <Link
                  href="/pro/login"
                  onClick={closeMenu}
                  className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-semibold tracking-wide text-white/80 transition hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4" strokeWidth={2} /> SE CONNECTER
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
