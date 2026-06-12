"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { COLORS, productImage } from "@/lib/ui";
import { MAX_QTY_PER_PRODUCT, MIN_ORDER_EUR } from "@/lib/order-rules";

export function CartDrawer() {
  const { items, total, itemCount, updateQty, removeItem, isCartOpen, closeCart } =
    useCart();
  const belowMinimum = total > 0 && total < MIN_ORDER_EUR;

  return (
    <div
      className={`fixed inset-0 z-[70] overflow-hidden ${isCartOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isCartOpen}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 flex h-full w-[400px] max-w-[90%] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: COLORS.border }}
        >
          <div
            className="flex items-center gap-2 text-[15px] font-extrabold"
            style={{ color: COLORS.text }}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={2} style={{ color: COLORS.primary }} />
            Mon panier
            {itemCount > 0 && (
              <span className="text-[13px] font-medium" style={{ color: COLORS.muted }}>
                ({itemCount})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="grid h-9 w-9 place-items-center rounded-md hover:bg-[#FAF8F2]"
            style={{ color: COLORS.text }}
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-10 w-10" strokeWidth={1.4} style={{ color: COLORS.muted }} />
            <p className="text-[14px]" style={{ color: COLORS.muted }}>
              Votre panier est vide.
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              className="mt-1 rounded-md px-4 py-2 text-[13px] font-semibold text-white"
              style={{ background: COLORS.primary }}
            >
              Voir nos produits
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <ul className="space-y-3">
                {items.map((it) => (
                  <li key={it.lineId} className="flex gap-3">
                    <Link
                      href={`/products/${it.productId}`}
                      onClick={closeCart}
                      className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md"
                      style={{ background: COLORS.beige }}
                    >
                      <Image
                        src={productImage(it.imageUrl)}
                        alt={it.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${it.productId}`}
                          onClick={closeCart}
                          className="line-clamp-2 flex-1 text-[13px] font-semibold leading-snug"
                          style={{ color: COLORS.text }}
                        >
                          {it.name}
                        </Link>
                        <span
                          className="shrink-0 text-[13px] font-extrabold"
                          style={{ color: COLORS.text }}
                        >
                          {formatPriceEUR(it.unitPrice * it.quantity)}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[12px]" style={{ color: COLORS.muted }}>
                        {formatPriceEUR(it.unitPrice)} l&apos;unité
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div
                          className="flex items-center overflow-hidden rounded-md border"
                          style={{ borderColor: COLORS.border }}
                        >
                          <button
                            type="button"
                            aria-label="Diminuer la quantité"
                            onClick={() => updateQty(it.lineId, it.quantity - 1)}
                            className="grid h-9 w-9 place-items-center hover:bg-[#FAF8F2]"
                            style={{ color: COLORS.text }}
                          >
                            <Minus className="h-3.5 w-3.5" strokeWidth={2.2} />
                          </button>
                          <div
                            className="grid h-9 w-9 place-items-center text-[13px] font-bold"
                            style={{ color: COLORS.text }}
                          >
                            {it.quantity}
                          </div>
                          <button
                            type="button"
                            aria-label="Augmenter la quantité"
                            onClick={() => updateQty(it.lineId, it.quantity + 1)}
                            disabled={it.quantity >= MAX_QTY_PER_PRODUCT}
                            className="grid h-9 w-9 place-items-center hover:bg-[#FAF8F2] disabled:cursor-not-allowed disabled:opacity-40"
                            style={{ color: COLORS.text }}
                          >
                            <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label={`Supprimer ${it.name}`}
                          onClick={() => removeItem(it.lineId)}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-md hover:bg-[#FAF8F2]"
                          style={{ color: COLORS.muted }}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t px-5 py-4" style={{ borderColor: COLORS.border }}>
              <div className="flex items-center justify-between">
                <span className="text-[13px]" style={{ color: COLORS.muted }}>
                  Sous-total
                </span>
                <span className="text-[18px] font-extrabold" style={{ color: COLORS.primary }}>
                  {formatPriceEUR(total)}
                </span>
              </div>

              {belowMinimum && (
                <div
                  className="mt-2 rounded-md px-3 py-2 text-[11.5px]"
                  style={{ background: "#FCE9E5", color: "#7A1709" }}
                >
                  Minimum de commande&nbsp;: {formatPriceEUR(MIN_ORDER_EUR)}
                </div>
              )}

              <div className="mt-3 grid grid-cols-1 gap-2">
                {belowMinimum ? (
                  <button
                    type="button"
                    disabled
                    className="grid h-11 cursor-not-allowed place-items-center rounded-md text-[14px] font-semibold text-white opacity-40"
                    style={{ background: COLORS.primary }}
                  >
                    Commander
                  </button>
                ) : (
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="grid h-11 place-items-center rounded-md text-[14px] font-semibold text-white shadow-sm"
                    style={{ background: COLORS.primary }}
                  >
                    Commander
                  </Link>
                )}
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="grid h-11 place-items-center rounded-md border text-[14px] font-semibold"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                >
                  Voir le panier
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
