"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  FileText,
  Package,
  Box,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/components/cart-context";
import { checkoutPro } from "@/actions/pro-order";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { COLORS, DISPLAY_FONT, productImage } from "@/lib/ui";

const TAX_RATE = 20;

export default function ProCartPage() {
  const { items, updateQty, removeItem, clearCart, total, itemCount } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const totalHT = total;
  const totalTVA = Number((total * (TAX_RATE / 100)).toFixed(2));
  const totalTTC = Number((total + totalTVA).toFixed(2));

  const onGenerate = () => {
    setError(null);
    if (items.length === 0) {
      setError("Votre panier est vide.");
      return;
    }
    startTransition(async () => {
      const res = await checkoutPro({ notes: notes || undefined });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      clearCart();
      router.push(`/pro/proforma/${res.orderId}`);
    });
  };

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/pro/products" className="hover:underline">Catalogue pro</Link>{" "}
        <span className="mx-1">›</span>
        <span style={{ color: COLORS.text }}>Mon panier</span>
      </nav>
      <h1
        className="mt-2 text-[28px] font-extrabold tracking-tight"
        style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
      >
        Mon panier professionnel
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
        {itemCount === 0
          ? "Votre panier est vide."
          : `${itemCount} ${itemCount > 1 ? "articles" : "article"} dans votre panier.`}
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
            Aucun article dans votre devis
          </div>
          <p className="mt-1 max-w-[380px] text-[13px]" style={{ color: COLORS.muted }}>
            Parcourez le catalogue professionnel et ajoutez les références dont
            vous avez besoin.
          </p>
          <Link
            href="/pro/products"
            className="mt-5 inline-flex items-center rounded-sm px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white shadow-sm"
            style={{ background: COLORS.primary }}
          >
            Voir le catalogue
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-12 gap-6">
          <section className="col-span-8">
            <div
              className="overflow-hidden rounded-sm border bg-white"
              style={{ borderColor: COLORS.border }}
            >
              <div
                className="grid grid-cols-12 items-center px-4 py-3 text-[10.5px] font-bold tracking-[0.14em]"
                style={{ color: COLORS.muted, background: "#FAF8F2" }}
              >
                <div className="col-span-6">PRODUIT</div>
                <div className="col-span-2 text-center">UNITÉ</div>
                <div className="col-span-2 text-center">QUANTITÉ</div>
                <div className="col-span-2 text-right">TOTAL HT</div>
              </div>

              <ul>
                {items.map((it) => {
                  const saleUnit = it.saleUnit ?? "PACK";
                  const lineTotal = it.unitPrice * it.quantity;
                  return (
                    <li
                      key={it.lineId}
                      className="grid grid-cols-12 items-center gap-3 border-t px-4 py-4"
                      style={{ borderColor: COLORS.border }}
                    >
                      <div className="col-span-6 flex items-center gap-3">
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
                        <div className="leading-tight">
                          <Link
                            href={`/pro/products/${it.productId}`}
                            className="line-clamp-2 text-[13.5px] font-semibold"
                            style={{ color: COLORS.text }}
                          >
                            {it.name}
                          </Link>
                          <div className="mt-1 text-[11.5px]" style={{ color: COLORS.muted }}>
                            {formatPriceEUR(it.unitPrice)} HT / {saleUnit === "PACK" ? "carton" : "unité"}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 flex justify-center">
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
                          {saleUnit === "PACK" ? "Carton" : "Unité"}
                        </span>
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <div
                          className="flex items-center overflow-hidden rounded-sm border"
                          style={{ borderColor: COLORS.border }}
                        >
                          <button
                            type="button"
                            aria-label="Diminuer"
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
                            aria-label="Augmenter"
                            onClick={() => updateQty(it.lineId, it.quantity + 1)}
                            className="grid h-9 w-9 place-items-center transition hover:bg-[#FAF8F2]"
                            style={{ color: COLORS.text }}
                          >
                            <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                          </button>
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <span className="text-[14px] font-extrabold" style={{ color: COLORS.text }}>
                          {formatPriceEUR(lineTotal)}
                        </span>
                        <button
                          type="button"
                          aria-label={`Supprimer ${it.name}`}
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
                Continuer mes achats
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="text-[12px] font-bold uppercase tracking-[0.1em] underline-offset-2 hover:underline"
                style={{ color: COLORS.muted }}
              >
                Vider le panier
              </button>
            </div>

            <div
              className="mt-6 rounded-sm border bg-white p-5"
              style={{ borderColor: COLORS.border }}
            >
              <label className="text-[11px] font-bold tracking-[0.14em]" style={{ color: COLORS.text }}>
                NOTES POUR LE DEVIS (OPTIONNEL)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Demandes particulières, délai souhaité, instructions de livraison…"
                className="mt-2 w-full rounded-sm border p-3 text-[13.5px] outline-none focus:border-[#3F561F]"
                style={{ borderColor: COLORS.border, color: COLORS.text }}
              />
            </div>
          </section>

          <aside className="col-span-4">
            <div
              className="rounded-sm border bg-white p-5"
              style={{ borderColor: COLORS.border }}
            >
              <div
                className="text-[11px] font-bold tracking-[0.14em]"
                style={{ color: COLORS.text }}
              >
                RÉCAPITULATIF
              </div>

              <dl className="mt-4 space-y-2 text-[13px]" style={{ color: COLORS.text }}>
                <Row label="Sous-total HT" value={formatPriceEUR(totalHT)} />
                <Row label={`TVA ${TAX_RATE}%`} value={formatPriceEUR(totalTVA)} />
              </dl>

              <div
                className="mt-4 flex items-center justify-between border-t pt-4"
                style={{ borderColor: COLORS.border }}
              >
                <span className="text-[14px] font-bold" style={{ color: COLORS.text }}>
                  Total TTC
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
                  className="mt-4 rounded-sm border-l-4 px-3 py-2 text-[12px]"
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
                {pending ? "Génération du devis..." : (
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4" strokeWidth={2} />
                    Générer un devis
                  </span>
                )}
              </button>

              <p className="mt-3 text-center text-[11px]" style={{ color: COLORS.muted }}>
                Le devis est valable 30 jours. Vous pourrez le valider ou le modifier.
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
