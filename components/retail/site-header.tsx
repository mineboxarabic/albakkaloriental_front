"use client";

import Link from "next/link";
import { Search, Heart, ShoppingCart, Menu, Truck, User } from "lucide-react";
import { getOrderedCategoryNames } from "@/lib/category-display";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { useCart } from "@/components/cart-context";
import { useSession } from "@/components/session-provider";

const DEFAULT_NAV_ITEMS = ["CONFISERIES", "BOISSONS", "ÉPICES", "PRODUITS FRAIS", "HUILES", "CONSERVES", "RIZ ET PÂTES"];

function formatEUR(n: number) {
  return `${n.toFixed(2).replace(".", ",")} €`;
}

function firstName(full: string | null) {
  if (!full) return null;
  const p = full.trim().split(/\s+/)[0];
  return p || null;
}

export function SiteHeader({ categories = [] }: { categories?: string[] }) {
  const { itemCount, total } = useCart();
  const { isConnected, name } = useSession();
  const fn = firstName(name);
  const uniqueCategories = getOrderedCategoryNames(categories.length > 0 ? categories : DEFAULT_NAV_ITEMS);
  const navItems = uniqueCategories.slice(0, 6);
  const extraItems = uniqueCategories.slice(6);

  return (
    <>
      {/* Top utility bar */}
      <div
        className="w-full text-[12px]"
        style={{ background: COLORS.primary, color: "#FAF8F2" }}
      >
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-2">
          <div className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Livraison à domicile dans toute la France</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Besoin d&apos;aide ? 09 70 70 70 70</span>
            <Link className="hover:underline" href="/pro/login">
              Espace pro
            </Link>
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
        <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-6 py-5">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden>
              <path
                d="M17 4c-3 6-7 9-12 10 1 8 6 14 12 16 6-2 11-8 12-16-5-1-9-4-12-10z"
                fill={COLORS.primary}
              />
              <path
                d="M17 10c-1 3-4 5-7 6 1 4 4 8 7 9 3-1 6-5 7-9-3-1-6-3-7-6z"
                fill="#FAF8F2"
              />
            </svg>
            <div className="leading-tight">
              <div
                className="text-[20px] font-extrabold tracking-tight"
                style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
              >
                LE BAKKAL
              </div>
              <div
                className="text-[10px] tracking-[0.35em] font-medium"
                style={{ color: COLORS.muted }}
              >
                ORIENTAL
              </div>
            </div>
          </Link>

          <form action="/products" method="get" className="mx-4 flex-1">
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

          <Link
            href={isConnected ? "/account" : "/login"}
            className="grid h-11 w-11 shrink-0 place-items-center"
            style={{ color: COLORS.text }}
            aria-label={isConnected ? "Mon compte" : "Se connecter"}
          >
            {isConnected ? (
              <User className="h-[22px] w-[22px]" strokeWidth={1.8} />
            ) : (
              <Heart className="h-[22px] w-[22px]" strokeWidth={1.8} />
            )}
          </Link>

          <Link
            href="/cart"
            className="flex h-11 shrink-0 items-center gap-2.5"
            style={{ color: COLORS.text }}
            aria-label="Panier"
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
            <span className="text-[14px] font-semibold" style={{ color: COLORS.text }}>
              {formatEUR(total)}
            </span>
          </Link>
        </div>

        <nav className="border-t" style={{ borderColor: COLORS.border, background: "#FFFFFF" }}>
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
    </>
  );
}
