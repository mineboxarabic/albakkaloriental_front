"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Menu, Truck, User, FileText, LogOut, X } from "lucide-react";
import { getOrderedCategoryNames } from "@/lib/category-display";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { useCart } from "@/components/cart-context";
import { useSession } from "@/components/session-provider";
import { logoutRetail } from "@/actions/retail-auth";

const DEFAULT_NAV_ITEMS = ["CONFISERIES", "BOISSONS", "ÉPICES", "PRODUITS FRAIS", "HUILES", "CONSERVES", "RIZ ET PÂTES"];

function formatEUR(n: number) {
  return `${n.toFixed(2).replace(".", ",")} €`;
}

function firstName(full: string | null) {
  if (!full) return null;
  const p = full.trim().split(/\s+/)[0];
  return p || null;
}

function SearchForm({ className = "" }: { className?: string }) {
  return (
    <form action="/products" method="get" className={className}>
      <div
        className="flex h-11 items-stretch overflow-hidden rounded-md border"
        style={{ borderColor: COLORS.border, background: "#FFFFFF" }}
      >
        <input
          name="q"
          type="text"
          placeholder="Rechercher un produit..."
          className="w-full bg-transparent px-4 text-[13px] outline-none placeholder:text-[#9A968C]"
          style={{ color: COLORS.text }}
        />
        <button
          type="submit"
          className="grid w-12 place-items-center text-white"
          style={{ background: COLORS.primary }}
          aria-label="Rechercher"
        >
          <Search className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </div>
    </form>
  );
}

export function SiteHeader({ categories = [] }: { categories?: string[] }) {
  const { itemCount, total, openCart } = useCart();
  const { isConnected, name } = useSession();
  const fn = firstName(name);
  const uniqueCategories = getOrderedCategoryNames(categories.length > 0 ? categories : DEFAULT_NAV_ITEMS);
  const navItems = uniqueCategories.slice(0, 6);
  const extraItems = uniqueCategories.slice(6);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Top utility bar — desktop only */}
      <div
        className="hidden w-full text-[12px] md:block"
        style={{ background: COLORS.primary, color: "#FAF8F2" }}
      >
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-2">
          <div className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Livraison à domicile dans toute la France</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Besoin d&apos;aide ? 09 70 70 70 70</span>
            {!isConnected && (
              <Link className="hover:underline" href="/pro/login">
                Espace pro
              </Link>
            )}
            {isConnected ? (
              <Link className="flex items-center gap-1.5 hover:underline" href="/account">
                <span className="inline-block h-2 w-2 rounded-full bg-white/90" />
                {fn ? `Bonjour, ${fn}` : "Mon compte"}
              </Link>
            ) : (
              <Link className="flex items-center gap-1.5 hover:underline" href="/login">
                <span className="inline-block h-2 w-2 rounded-full bg-white/90" />
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>

      <header
        className="sticky top-0 z-40 w-full border-b backdrop-blur"
        style={{ background: "rgba(255,255,255,0.96)", borderColor: "#EAE6D8" }}
      >
        <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-4 py-3 md:gap-4 md:px-6 md:py-5">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="grid h-10 w-10 shrink-0 place-items-center lg:hidden"
            style={{ color: COLORS.text }}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" strokeWidth={2} />
          </button>

          <Link
            href="/"
            className="flex items-center shrink-0"
            aria-label="Le Bakkal Oriental — accueil"
          >
            <Image
              src="/Assets/img/logo.png"
              alt="Le Bakkal Oriental"
              width={96}
              height={96}
              priority
              className="h-16 w-auto md:h-20"
            />
          </Link>

          {/* Search — inline on desktop */}
          <SearchForm className="mx-4 hidden flex-1 lg:block" />

          {/* push the actions to the right on mobile (search is on its own row) */}
          <div className="flex-1 lg:hidden" />

          {isConnected ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="grid h-11 w-11 place-items-center"
                style={{ color: COLORS.text }}
                aria-label="Mon compte"
                aria-expanded={userMenuOpen}
              >
                <User className="h-[22px] w-[22px]" strokeWidth={1.8} />
              </button>
              {/* click-away backdrop */}
              <div
                className={`fixed inset-0 z-40 ${userMenuOpen ? "" : "hidden"}`}
                onClick={() => setUserMenuOpen(false)}
                aria-hidden
              />
              <div
                className={`absolute right-0 top-full z-50 pt-2 transition-all duration-200 ease-out ${
                  userMenuOpen
                    ? "opacity-100 visible translate-y-0"
                    : "pointer-events-none opacity-0 invisible translate-y-1"
                }`}
              >
                <div
                  className="w-[220px] rounded-lg border bg-white p-2 shadow-xl"
                  style={{ borderColor: COLORS.border }}
                >
                  {fn && (
                    <div
                      className="px-3 py-2 text-[12px] font-semibold"
                      style={{ color: COLORS.muted }}
                    >
                      Bonjour, {fn}
                    </div>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[#FAF8F2]"
                    style={{ color: COLORS.text }}
                  >
                    <User className="h-4 w-4" strokeWidth={2} />
                    Mes infos
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[#FAF8F2]"
                    style={{ color: COLORS.text }}
                  >
                    <FileText className="h-4 w-4" strokeWidth={2} />
                    Mes commandes
                  </Link>
                  <div className="my-1 border-t" style={{ borderColor: COLORS.border }} />
                  <form action={logoutRetail}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[#FCE9E5]"
                      style={{ color: COLORS.red }}
                    >
                      <LogOut className="h-4 w-4" strokeWidth={2} />
                      Déconnexion
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="grid h-11 w-11 shrink-0 place-items-center"
              style={{ color: COLORS.text }}
              aria-label="Se connecter"
            >
              <User className="h-[22px] w-[22px]" strokeWidth={1.8} />
            </Link>
          )}

          <button
            type="button"
            onClick={openCart}
            className="flex h-11 shrink-0 items-center gap-2.5"
            style={{ color: COLORS.text }}
            aria-label="Ouvrir le panier"
          >
            <span className="relative grid place-items-center">
              <ShoppingCart
                className="h-[24px] w-[24px]"
                strokeWidth={1.8}
                style={{ color: COLORS.primary }}
              />
              {itemCount > 0 && (
                <span
                  className="absolute -right-2 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold leading-none text-white"
                  style={{ background: COLORS.red }}
                >
                  {itemCount}
                </span>
              )}
            </span>
            <span className="hidden text-[14px] font-semibold sm:inline" style={{ color: COLORS.text }}>
              {formatEUR(total)}
            </span>
          </button>
        </div>

        {/* Search — own row on mobile */}
        <div className="border-t px-4 py-2.5 lg:hidden" style={{ borderColor: COLORS.border }}>
          <SearchForm />
        </div>

        {/* Category nav — desktop only */}
        <nav className="hidden border-t lg:block" style={{ borderColor: COLORS.border, background: "#FFFFFF" }}>
          <div className="mx-auto flex max-w-[1180px] items-center gap-7 px-6 text-[12px] font-semibold tracking-wide">
            {/* TOUS LES RAYONS Dropdown */}
            <div className="relative group/rayons py-3">
              <Link
                href="/products"
                className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                style={{ color: COLORS.red }}
              >
                <Menu className="h-4 w-4" strokeWidth={2.4} />
                TOUS LES RAYONS
              </Link>
              <div className="absolute left-0 top-full z-50 pt-2 opacity-0 invisible translate-y-1 group-hover/rayons:opacity-100 group-hover/rayons:visible group-hover/rayons:translate-y-0 transition-all duration-200 ease-out">
                <div
                  className="w-[280px] rounded-lg border bg-white p-2 shadow-xl"
                  style={{ borderColor: COLORS.border }}
                >
                  <div className="grid gap-0.5 max-h-[350px] overflow-y-auto scrollbar-none">
                    {uniqueCategories.map((item) => (
                      <Link
                        key={item}
                        href={`/products?category=${encodeURIComponent(item)}`}
                        className="flex items-center rounded-md px-3 py-2 text-[12.5px] font-medium transition-colors hover:bg-[#FAF8F2]"
                        style={{ color: COLORS.text }}
                      >
                        {item.toUpperCase()}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/categories"
              className="py-3 hover:opacity-70 transition-opacity"
              style={{ color: COLORS.text }}
            >
              CATÉGORIES
            </Link>
            <Link
              href="/marques"
              className="py-3 hover:opacity-70 transition-opacity"
              style={{ color: COLORS.text }}
            >
              MARQUES
            </Link>

            {/* Direct Categories */}
            {navItems.map((item) => (
              <Link
                key={item}
                href={`/products?category=${encodeURIComponent(item)}`}
                className="py-3 hover:opacity-70 transition-opacity"
                style={{ color: COLORS.text }}
              >
                {item.toUpperCase()}
              </Link>
            ))}

            {/* PLUS Dropdown */}
            {extraItems.length > 0 && (
              <div className="relative group/plus py-3">
                <button
                  className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity cursor-pointer uppercase"
                  style={{ color: COLORS.text }}
                >
                  Plus
                  <span className="text-[9px] transition-transform duration-200 group-hover/plus:rotate-180">▼</span>
                </button>
                <div className="absolute right-0 top-full z-50 pt-2 opacity-0 invisible translate-y-1 group-hover/plus:opacity-100 group-hover/plus:visible group-hover/plus:translate-y-0 transition-all duration-200 ease-out">
                  <div
                    className="w-[260px] rounded-lg border bg-white p-2 shadow-xl"
                    style={{ borderColor: COLORS.border }}
                  >
                    <div className="grid gap-0.5 max-h-[350px] overflow-y-auto scrollbar-none">
                      {extraItems.map((item) => (
                        <Link
                          key={item}
                          href={`/products?category=${encodeURIComponent(item)}`}
                          className="flex items-center rounded-md px-3 py-2 text-[12.5px] font-medium transition-colors hover:bg-[#FAF8F2]"
                          style={{ color: COLORS.text }}
                        >
                          {item.toUpperCase()}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile slide-in menu */}
      <div
        className={`fixed inset-0 z-[60] overflow-hidden lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
          aria-hidden
        />
        <div
          className={`absolute left-0 top-0 flex h-full w-[300px] max-w-[85%] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
            <div
              className="flex items-center justify-between border-b px-4 py-3.5"
              style={{ borderColor: COLORS.border }}
            >
              <span
                className="text-[16px] font-extrabold tracking-tight"
                style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
              >
                MENU
              </span>
              <button
                type="button"
                onClick={closeMenu}
                className="grid h-9 w-9 place-items-center rounded-md hover:bg-[#FAF8F2]"
                style={{ color: COLORS.text }}
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              {/* Account */}
              {isConnected ? (
                <div className="grid gap-0.5">
                  {fn && (
                    <div className="px-3 pb-1 text-[12px] font-semibold" style={{ color: COLORS.muted }}>
                      Bonjour, {fn}
                    </div>
                  )}
                  <Link
                    href="/account"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[14px] font-medium hover:bg-[#FAF8F2]"
                    style={{ color: COLORS.text }}
                  >
                    <User className="h-4 w-4" strokeWidth={2} /> Mes infos
                  </Link>
                  <Link
                    href="/orders"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[14px] font-medium hover:bg-[#FAF8F2]"
                    style={{ color: COLORS.text }}
                  >
                    <FileText className="h-4 w-4" strokeWidth={2} /> Mes commandes
                  </Link>
                  <form action={logoutRetail}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[14px] font-medium hover:bg-[#FCE9E5]"
                      style={{ color: COLORS.red }}
                    >
                      <LogOut className="h-4 w-4" strokeWidth={2} /> Déconnexion
                    </button>
                  </form>
                </div>
              ) : (
                <div className="grid gap-0.5">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[14px] font-medium hover:bg-[#FAF8F2]"
                    style={{ color: COLORS.text }}
                  >
                    <User className="h-4 w-4" strokeWidth={2} /> Se connecter
                  </Link>
                  <Link
                    href="/pro/login"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[14px] font-medium hover:bg-[#FAF8F2]"
                    style={{ color: COLORS.text }}
                  >
                    Espace pro
                  </Link>
                </div>
              )}

              {/* Categories */}
              <div
                className="mt-4 mb-1 px-3 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ color: COLORS.muted }}
              >
                Rayons
              </div>
              <div className="grid gap-0.5">
                <Link
                  href="/products"
                  onClick={closeMenu}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-[14px] font-semibold hover:bg-[#FAF8F2]"
                  style={{ color: COLORS.red }}
                >
                  <Menu className="h-4 w-4" strokeWidth={2.4} /> TOUS LES RAYONS
                </Link>
                <Link
                  href="/categories"
                  onClick={closeMenu}
                  className="rounded-md px-3 py-2.5 text-[13.5px] font-medium hover:bg-[#FAF8F2]"
                  style={{ color: COLORS.text }}
                >
                  CATÉGORIES
                </Link>
                <Link
                  href="/marques"
                  onClick={closeMenu}
                  className="rounded-md px-3 py-2.5 text-[13.5px] font-medium hover:bg-[#FAF8F2]"
                  style={{ color: COLORS.text }}
                >
                  MARQUES
                </Link>
                {uniqueCategories.map((item) => (
                  <Link
                    key={item}
                    href={`/products?category=${encodeURIComponent(item)}`}
                    onClick={closeMenu}
                    className="rounded-md px-3 py-2.5 text-[13.5px] font-medium hover:bg-[#FAF8F2]"
                    style={{ color: COLORS.text }}
                  >
                    {item.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
