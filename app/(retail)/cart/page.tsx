"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { COLORS, DISPLAY_FONT, productImage } from "@/lib/ui";
import {
  MIN_ORDER_EUR,
  FREE_DELIVERY_THRESHOLD_EUR,
  MAX_QTY_PER_PRODUCT,
  deliveryFee,
} from "@/lib/order-rules";

export default function CartPage() {
  const { items, updateQty, removeItem, clearCart, total, itemCount } = useCart();

  const fee = deliveryFee(total);
  const grandTotal = total + fee;
  const belowMinimum = total > 0 && total < MIN_ORDER_EUR;
  const nudgeFreeDelivery = total >= MIN_ORDER_EUR && total < FREE_DELIVERY_THRESHOLD_EUR;

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <header className="mb-6">
        <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
          <Link href="/" className="hover:underline">Accueil</Link>{" "}
          <span className="mx-1">›</span>
          <span style={{ color: COLORS.text }}>Mon panier</span>
        </nav>
        <h1
          className="mt-2 text-[28px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          Mon panier
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
          {itemCount === 0
            ? "Votre panier est vide."
            : `${itemCount} ${itemCount > 1 ? "articles" : "article"} dans votre panier.`}
        </p>
      </header>

      {items.length === 0 ? (
        <div
          className="grid place-items-center rounded-xl border bg-white px-6 py-16 text-center"
          style={{ borderColor: COLORS.border }}
        >
          <div
            className="grid h-16 w-16 place-items-center rounded-full"
            style={{ background: COLORS.beige, color: COLORS.primary }}
          >
            <ShoppingBag className="h-7 w-7" strokeWidth={1.6} />
          </div>
          <div
            className="mt-4 text-[17px] font-bold"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            Votre panier est vide
          </div>
          <p className="mt-1 max-w-[340px] text-[13px]" style={{ color: COLORS.muted }}>
            Parcourez le catalogue pour trouver vos produits orientaux préférés.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex items-center rounded-md px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm"
            style={{ background: COLORS.primary }}
          >
            Voir nos produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          <section className="col-span-8">
            <div
              className="overflow-hidden rounded-lg border bg-white"
              style={{ borderColor: COLORS.border }}
            >
              <ul>
                {items.map((it, idx) => (
                  <li
                    key={it.lineId}
                    className="flex items-center gap-4 px-4 py-4"
                    style={{
                      borderTop: idx === 0 ? "none" : `1px solid ${COLORS.border}`,
                    }}
                  >
                    <Link
                      href={`/products/${it.productId}`}
                      className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-md"
                      style={{ background: COLORS.beige }}
                    >
                      <Image
                        src={productImage(it.imageUrl)}
                        alt={it.name}
                        width={120}
                        height={120}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    <div className="flex-1">
                      <Link
                        href={`/products/${it.productId}`}
                        className="line-clamp-2 text-[14px] font-semibold leading-snug"
                        style={{ color: COLORS.text }}
                      >
                        {it.name}
                      </Link>
                      <div className="mt-1 text-[12px]" style={{ color: COLORS.muted }}>
                        {formatPriceEUR(it.unitPrice)} l&apos;unité
                      </div>
                    </div>

                    <div
                      className="flex items-center overflow-hidden rounded-md border"
                      style={{ borderColor: COLORS.border }}
                    >
                      <button
                        type="button"
                        aria-label="Diminuer la quantité"
                        onClick={() => updateQty(it.lineId, it.quantity - 1)}
                        className="grid h-9 w-9 place-items-center transition hover:bg-[#FAF8F2]"
                        style={{ color: COLORS.text }}
                      >
                        <Minus className="h-4 w-4" strokeWidth={2.2} />
                      </button>
                      <div
                        className="grid h-9 w-10 place-items-center text-[14px] font-bold"
                        style={{ color: COLORS.text }}
                      >
                        {it.quantity}
                      </div>
                      <button
                        type="button"
                        aria-label="Augmenter la quantité"
                        onClick={() => updateQty(it.lineId, it.quantity + 1)}
                        disabled={it.quantity >= MAX_QTY_PER_PRODUCT}
                        className="grid h-9 w-9 place-items-center transition hover:bg-[#FAF8F2] disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ color: COLORS.text }}
                      >
                        <Plus className="h-4 w-4" strokeWidth={2.2} />
                      </button>
                    </div>

                    <div
                      className="w-24 text-right text-[14px] font-extrabold"
                      style={{ color: COLORS.text }}
                    >
                      {formatPriceEUR(it.unitPrice * it.quantity)}
                    </div>

                    <button
                      type="button"
                      aria-label={`Supprimer ${it.name} du panier`}
                      onClick={() => removeItem(it.lineId)}
                      className="grid h-9 w-9 place-items-center rounded-md transition hover:bg-[#FAF8F2]"
                      style={{ color: COLORS.muted }}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Link
                href="/products"
                className="inline-flex items-center rounded-md border px-4 py-2 text-[13px] font-semibold"
                style={{ borderColor: COLORS.border, color: COLORS.text }}
              >
                Continuer mes achats
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="text-[12.5px] font-semibold underline-offset-2 hover:underline"
                style={{ color: COLORS.muted }}
              >
                Vider le panier
              </button>
            </div>
          </section>

          <aside className="col-span-4">
            <div
              className="rounded-lg border bg-white p-5"
              style={{ borderColor: COLORS.border }}
            >
              <div
                className="text-[12px] font-bold tracking-wide"
                style={{ color: COLORS.text }}
              >
                RÉCAPITULATIF
              </div>

              <dl className="mt-4 space-y-2 text-[13px]" style={{ color: COLORS.text }}>
                <div className="flex items-center justify-between">
                  <dt style={{ color: COLORS.muted }}>Sous-total</dt>
                  <dd className="font-semibold">{formatPriceEUR(total)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt style={{ color: COLORS.muted }}>Livraison</dt>
                  <dd
                    className="font-semibold"
                    style={{ color: fee === 0 ? COLORS.primary : COLORS.text }}
                  >
                    {fee === 0 ? "Gratuite" : formatPriceEUR(fee)}
                  </dd>
                </div>
              </dl>

              {nudgeFreeDelivery && (
                <div
                  className="mt-3 rounded-md px-3 py-2 text-[11.5px]"
                  style={{ background: "#FEF9C3", color: "#854D0E" }}
                >
                  Plus {formatPriceEUR(FREE_DELIVERY_THRESHOLD_EUR - total)} pour la livraison gratuite
                </div>
              )}

              {belowMinimum && (
                <div
                  className="mt-3 rounded-md px-3 py-2 text-[11.5px]"
                  style={{ background: "#FCE9E5", color: "#7A1709" }}
                >
                  Minimum de commande&nbsp;: {formatPriceEUR(MIN_ORDER_EUR)}
                </div>
              )}

              <div
                className="mt-4 flex items-center justify-between border-t pt-4"
                style={{ borderColor: COLORS.border }}
              >
                <span className="text-[14px] font-bold" style={{ color: COLORS.text }}>
                  Total
                </span>
                <span className="text-[20px] font-extrabold" style={{ color: COLORS.primary }}>
                  {formatPriceEUR(grandTotal)}
                </span>
              </div>

              {belowMinimum ? (
                <button
                  type="button"
                  disabled
                  className="mt-5 grid h-11 w-full cursor-not-allowed place-items-center rounded-md text-[14px] font-semibold text-white opacity-40 shadow-sm"
                  style={{ background: COLORS.primary }}
                >
                  Valider mon panier
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="mt-5 grid h-11 place-items-center rounded-md text-[14px] font-semibold text-white shadow-sm"
                  style={{ background: COLORS.primary }}
                >
                  Valider mon panier
                </Link>
              )}

              <p className="mt-3 text-center text-[11.5px]" style={{ color: COLORS.muted }}>
                Paiement à la livraison disponible.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
