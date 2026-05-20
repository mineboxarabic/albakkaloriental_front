"use client";

import Link from "next/link";
import { Search, Heart, ShoppingCart, Menu, Truck } from "lucide-react";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { useCart } from "@/components/cart-context";

const NAV_ITEMS = ["ÉPICERIE", "BOISSONS", "PRODUITS FRAIS", "SURGELÉS", "HYGIÈNE & MAISON"];

function formatEUR(n: number) {
  return `${n.toFixed(2).replace(".", ",")} €`;
}

export function SiteHeader() {
  const { itemCount, total } = useCart();

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
            <Link className="flex items-center gap-1.5 hover:underline" href="/login">
              <span className="inline-block h-2 w-2 rounded-full bg-white/90" />
              Mon compte
            </Link>
          </div>
        </div>
      </div>

      <header className="w-full" style={{ background: "#FFFFFF" }}>
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

          <button
            type="button"
            className="grid h-11 w-11 shrink-0 place-items-center"
            style={{ color: COLORS.text }}
            aria-label="Favoris"
          >
            <Heart className="h-[22px] w-[22px]" strokeWidth={1.8} />
          </button>

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
          <div className="mx-auto flex max-w-[1180px] items-center gap-7 px-6 py-3 text-[12px] font-semibold tracking-wide">
            <Link
              href="/products"
              className="flex items-center gap-2"
              style={{ color: COLORS.red }}
            >
              <Menu className="h-4 w-4" strokeWidth={2.4} />
              TOUS LES RAYONS
            </Link>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item}
                href={`/products?category=${encodeURIComponent(item)}`}
                className="hover:opacity-70"
                style={{ color: COLORS.text }}
              >
                {item}
              </Link>
            ))}
            <Link href="/products?promo=1" style={{ color: COLORS.red }}>
              PROMOTIONS
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
