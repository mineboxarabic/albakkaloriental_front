"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  Package,
  Box,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/components/cart-context";
import { checkoutPro } from "@/actions/pro-order";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { COLORS, DISPLAY_FONT, productImage } from "@/lib/ui";
import { useLanguage } from "@/components/language-provider";

const TAX_RATE = 20;

export default function ProCartPage() {
  const { items, updateQty, removeItem, clearCart, total, itemCount } = useCart();
  const router = useRouter();
  const { t, isRtl } = useLanguage();
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const totalHT = total;
  const totalTVA = Number((total * (TAX_RATE / 100)).toFixed(2));
  const totalTTC = Number((total + totalTVA).toFixed(2));

  const onGenerate = () => {
    setError(null);
    if (items.length === 0) {
      setError(t("Votre panier est vide."));
      return;
    }
    startTransition(async () => {
      const res = await checkoutPro({ notes: notes || undefined });
      if (!res.ok) {
        setError(t(res.error));
        return;
      }
      clearCart();
      router.push(`/pro/orders/${res.orderId}`);
    });
  };

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/pro/products" className="hover:underline">{t("Catalogue pro")}</Link>{" "}
        <span className="mx-1">›</span>
        <span style={{ color: COLORS.text }}>{t("Mon panier")}</span>
      </nav>
      <h1
        className="mt-2 text-[24px] font-extrabold tracking-tight sm:text-[28px]"
        style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
      >
        {t("Mon panier professionnel")}
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
        {itemCount === 0
          ? t("Votre panier est vide.")
          : t(
              itemCount > 1
                ? "{count} articles dans votre panier."
                : "{count} article dans votre panier.",
              { count: itemCount },
            )}
      </p>

      {items.length === 0 ? (
        <div
          className="mt-6 grid place-items-center rounded-sm border bg-white px-6 py-16 text-center"
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
            {t("Aucun article dans votre devis")}
          </div>
          <p className="mt-1 max-w-[380px] text-[13px]" style={{ color: COLORS.muted }}>
            {t(
              "Parcourez le catalogue professionnel et ajoutez les références dont vous avez besoin.",
            )}
          </p>
          <Link
            href="/pro/products"
            className="mt-5 inline-flex items-center rounded-sm px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white shadow-sm"
            style={{ background: COLORS.primary }}
          >
            {t("Voir le catalogue")}
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="lg:col-span-8">
            <div
              className="overflow-hidden rounded-sm border bg-white"
              style={{ borderColor: COLORS.border }}
            >
              <div
                className="hidden grid-cols-12 items-center px-4 py-3 text-[10.5px] font-bold tracking-[0.14em] md:grid"
                style={{ color: COLORS.muted, background: "#FAF8F2" }}
              >
                <div className="col-span-6">{t("PRODUIT")}</div>
                <div className="col-span-2 text-center">
                  {isRtl ? "وحدة البيع" : "UNITÉ"}
                </div>
                <div className="col-span-2 text-center">{t("QUANTITÉ")}</div>
                <div className="col-span-2 text-end">{t("TOTAL HT")}</div>
              </div>

              <ul>
                {items.map((it) => {
                  const saleUnit = it.saleUnit ?? "PACK";
                  const lineTotal = it.unitPrice * it.quantity;
                  const unitBadge = (
                    <span
                      className="inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]"
                      style={{
                        background: saleUnit === "PACK" ? COLORS.beige : "#FFFFFF",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                    >
                      {saleUnit === "PACK" ? (
                        <Package className="h-3 w-3" strokeWidth={2} />
                      ) : (
                        <Box className="h-3 w-3" strokeWidth={2} />
                      )}
                      {saleUnit === "PACK" ? t("Carton") : t("Unité")}
                    </span>
                  );
                  const stepper = (
                    <div
                      className="flex items-center overflow-hidden rounded-sm border"
                      style={{ borderColor: COLORS.border }}
                    >
                      <button
                        type="button"
                        aria-label={t("Diminuer la quantité")}
                        onClick={() => updateQty(it.lineId, it.quantity - 1)}
                        className="grid h-9 w-9 place-items-center transition hover:bg-[#FAF8F2]"
                        style={{ color: COLORS.text }}
                      >
                        <Minus className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </button>
                      <div
                        className="grid h-9 w-10 place-items-center text-[13.5px] font-bold"
                        style={{ color: COLORS.text }}
                      >
                        {it.quantity}
                      </div>
                      <button
                        type="button"
                        aria-label={t("Augmenter la quantité")}
                        onClick={() => updateQty(it.lineId, it.quantity + 1)}
                        className="grid h-9 w-9 place-items-center transition hover:bg-[#FAF8F2]"
                        style={{ color: COLORS.text }}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </button>
                    </div>
                  );
                  return (
                    <li
                      key={it.lineId}
                      className="border-t px-4 py-4 md:grid md:grid-cols-12 md:items-center md:gap-3"
                      style={{ borderColor: COLORS.border }}
                    >
                      <div className="flex items-start gap-3 md:col-span-6 md:items-center">
                        <Link
                          href={`/pro/products/${it.productId}`}
                          className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-sm"
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
                        <div className="min-w-0 flex-1 leading-tight">
                          <Link
                            href={`/pro/products/${it.productId}`}
                            className="line-clamp-2 text-[13.5px] font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            {it.name}
                          </Link>
                          <div className="mt-1 text-[11.5px]" style={{ color: COLORS.muted }}>
                            {t(
                              saleUnit === "PACK"
                                ? "{price} HT / carton"
                                : "{price} HT / unité",
                              { price: formatPriceEUR(it.unitPrice) },
                            )}
                          </div>
                          <div className="mt-1.5 md:hidden">{unitBadge}</div>
                        </div>
                        {/* Mobile line total + remove */}
                        <div className="flex flex-col items-end gap-2 md:hidden">
                          <span className="text-[14px] font-extrabold" style={{ color: COLORS.text }}>
                            {formatPriceEUR(lineTotal)}
                          </span>
                          <button
                            type="button"
                            aria-label={t("Supprimer {name}", { name: it.name })}
                            onClick={() => removeItem(it.lineId)}
                            className="grid h-9 w-9 place-items-center rounded-sm transition hover:bg-[#FAF8F2]"
                            style={{ color: COLORS.muted }}
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                          </button>
                        </div>
                      </div>

                      {/* Mobile stepper row */}
                      <div className="mt-3 md:hidden">{stepper}</div>

                      {/* Desktop columns */}
                      <div className="hidden justify-center md:col-span-2 md:flex">{unitBadge}</div>
                      <div className="hidden justify-center md:col-span-2 md:flex">{stepper}</div>
                      <div className="hidden items-center justify-end gap-2 md:col-span-2 md:flex">
                        <span className="text-[14px] font-extrabold" style={{ color: COLORS.text }}>
                          {formatPriceEUR(lineTotal)}
                        </span>
                        <button
                          type="button"
                          aria-label={t("Supprimer {name}", { name: it.name })}
                          onClick={() => removeItem(it.lineId)}
                          className="grid h-8 w-8 place-items-center rounded-sm transition hover:bg-[#FAF8F2]"
                          style={{ color: COLORS.muted }}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Link
                href="/pro/products"
                className="inline-flex items-center rounded-sm border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em]"
                style={{ borderColor: COLORS.border, color: COLORS.text }}
              >
                {t("Continuer mes achats")}
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="text-[12px] font-bold uppercase tracking-[0.1em] underline-offset-2 hover:underline"
                style={{ color: COLORS.muted }}
              >
                {t("Vider le panier")}
              </button>
            </div>

            <div
              className="mt-6 rounded-sm border bg-white p-5"
              style={{ borderColor: COLORS.border }}
            >
              <label className="text-[11px] font-bold tracking-[0.14em]" style={{ color: COLORS.text }}>
                {t("NOTES POUR LE DEVIS (OPTIONNEL)")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder={t(
                  "Demandes particulières, délai souhaité, instructions de livraison…",
                )}
                className="mt-2 w-full rounded-sm border p-3 text-[13.5px] outline-none focus:border-[#3F561F]"
                style={{ borderColor: COLORS.border, color: COLORS.text }}
              />
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div
              className="rounded-sm border bg-white p-5 lg:sticky lg:top-24"
              style={{ borderColor: COLORS.border }}
            >
              <div
                className="text-[11px] font-bold tracking-[0.14em]"
                style={{ color: COLORS.text }}
              >
                {t("RÉCAPITULATIF")}
              </div>

              <dl className="mt-4 space-y-2 text-[13px]" style={{ color: COLORS.text }}>
                <Row label={t("Sous-total HT")} value={formatPriceEUR(totalHT)} />
                <Row
                  label={t("TVA {rate}%", { rate: TAX_RATE })}
                  value={formatPriceEUR(totalTVA)}
                />
              </dl>

              <div
                className="mt-4 flex items-center justify-between border-t pt-4"
                style={{ borderColor: COLORS.border }}
              >
                <span className="text-[14px] font-bold" style={{ color: COLORS.text }}>
                  {t("Total TTC")}
                </span>
                <span
                  className="text-[22px] font-extrabold"
                  style={{ color: COLORS.primary }}
                >
                  {formatPriceEUR(totalTTC)}
                </span>
              </div>

              {error && (
                <div
                  className="mt-4 rounded-sm border-s-4 px-3 py-2 text-[12px]"
                  style={{
                    background: "#FCE9E5",
                    borderColor: COLORS.red,
                    color: "#7A1709",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={onGenerate}
                disabled={pending}
                className="mt-5 grid h-11 w-full place-items-center rounded-sm text-[12.5px] font-bold uppercase tracking-[0.12em] text-white shadow-md disabled:opacity-70"
                style={{ background: COLORS.primary }}
              >
                {pending ? t("Envoi de la commande...") : (
                  <span className="inline-flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" strokeWidth={2} />
                    {t("Commander")}
                  </span>
                )}
              </button>

              <p className="mt-3 text-center text-[11px]" style={{ color: COLORS.muted }}>
                {t(
                  "Votre commande sera transmise pour validation. Un devis vous sera ensuite envoyé à signer avant la livraison.",
                )}
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt style={{ color: COLORS.muted }}>{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
