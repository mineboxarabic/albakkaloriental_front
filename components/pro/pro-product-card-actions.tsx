"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart, type CartSaleUnit } from "@/components/cart-context";
import { useLanguage } from "@/components/language-provider";
import { COLORS, buildUnitLabel } from "@/lib/ui";
import { formatPriceEUR } from "@/lib/catalog-pricing";

type Props = {
  productId: string;
  name: string;
  imageUrl: string | null;
  unitsPerPack: number;
  baseUnit?: string;
  packPrice: number;
  unitPrice: number | null;
  isOutOfStock: boolean;
  availableStock?: number | null;
};

const MAX_LINE_QTY = 999;
// Tint for a sale unit that is already in the quote.
const IN_QUOTE_BG = "rgba(63, 86, 31, 0.07)";

/**
 * One row per sale unit (carton first, then unit, matching the cart and
 * product page). The + button adds; once the line exists the row becomes a
 * stepper with + in the same place, so repeated taps keep adding.
 */
export function ProProductCardActions({
  productId,
  name,
  imageUrl,
  unitsPerPack,
  baseUnit = "PIECE",
  packPrice,
  unitPrice,
  isOutOfStock,
  availableStock,
}: Props) {
  const { t } = useLanguage();
  const stock = availableStock ?? null;

  return (
    <div
      className="divide-y divide-[#DDD8CC] overflow-hidden rounded-sm border"
      style={{ borderColor: COLORS.border }}
    >
      <SaleUnitRow
        saleUnit="PACK"
        label={t("Par carton")}
        price={packPrice}
        emphasis
        maxQty={stock === null || unitsPerPack <= 0 ? MAX_LINE_QTY : Math.floor(stock / unitsPerPack)}
        {...{ productId, name, imageUrl, unitsPerPack, baseUnit, isOutOfStock }}
      />
      {unitPrice !== null && (
        <SaleUnitRow
          saleUnit="UNIT"
          label={t("À l'unité")}
          price={unitPrice}
          maxQty={stock === null ? MAX_LINE_QTY : stock}
          {...{ productId, name, imageUrl, unitsPerPack, baseUnit, isOutOfStock }}
        />
      )}
    </div>
  );
}

function SaleUnitRow({
  saleUnit,
  label,
  price,
  emphasis = false,
  maxQty,
  productId,
  name,
  imageUrl,
  unitsPerPack,
  baseUnit,
  isOutOfStock,
}: {
  saleUnit: CartSaleUnit;
  label: string;
  price: number;
  emphasis?: boolean;
  maxQty: number;
  productId: string;
  name: string;
  imageUrl: string | null;
  unitsPerPack: number;
  baseUnit: string;
  isOutOfStock: boolean;
}) {
  const { items, addItem, updateQty } = useCart();
  const { t, language } = useLanguage();
  const line = items.find((i) => i.productId === productId && i.saleUnit === saleUnit);
  const qty = line?.quantity ?? 0;
  const purchasable = price > 0 && !isOutOfStock;
  const cap = Math.min(MAX_LINE_QTY, Math.max(maxQty, 0));
  const isPack = saleUnit === "PACK";

  const addLabel = isPack ? t("Ajouter un carton au devis") : t("Ajouter une unité au devis");
  const lessLabel =
    qty <= 1 ? t("Retirer du devis") : isPack ? t("Retirer un carton") : t("Retirer une unité");
  const unitWord = isPack
    ? t(qty > 1 ? "cartons" : "carton")
    : baseUnit === "PIECE"
      ? t(qty > 1 ? "unités" : "unité")
      : buildUnitLabel(baseUnit, true, language);

  const add = () => {
    if (!purchasable || qty >= cap) return;
    if (line) {
      void updateQty(line.lineId, qty + 1);
      return;
    }
    void addItem({ productId, name, imageUrl, unitPrice: price, saleUnit, unitsPerPack }, 1);
  };

  const plusButton = (
    <button
      type="button"
      onClick={add}
      disabled={!purchasable || qty >= cap}
      aria-label={purchasable ? addLabel : t("En rupture")}
      className="grid h-9 w-8 shrink-0 place-items-center rounded-sm text-white transition-[transform,background-color] active:scale-90 disabled:cursor-not-allowed disabled:active:scale-100 sm:w-9"
      style={{ background: purchasable && qty < cap ? COLORS.primary : "#A8A39A" }}
    >
      <Plus className="h-4 w-4" strokeWidth={2.6} />
    </button>
  );

  if (line && qty > 0) {
    return (
      <div
        role="group"
        aria-label={`${label} · ${name}`}
        className="flex min-h-12 items-center gap-1 py-1.5 pe-1.5 ps-1.5 sm:gap-1.5"
        style={{ background: IN_QUOTE_BG }}
      >
        <button
          type="button"
          onClick={() => void updateQty(line.lineId, qty - 1)}
          aria-label={lessLabel}
          className="grid h-9 w-8 shrink-0 place-items-center rounded-sm border bg-white transition-transform active:scale-90 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-90 sm:w-9"
          style={{ borderColor: COLORS.primary, color: COLORS.primary }}
        >
          {qty <= 1 ? (
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
          ) : (
            <Minus className="h-4 w-4" strokeWidth={2.6} />
          )}
        </button>
        <output aria-live="polite" className="min-w-0 flex-1 text-center leading-none">
          <span className="block text-[16px] font-extrabold tabular-nums" style={{ color: COLORS.primary }}>
            {qty}
          </span>
          <span className="mt-0.5 block truncate text-[10px] font-semibold sm:text-[10.5px]" style={{ color: COLORS.muted }}>
            {unitWord}
          </span>
        </output>
        {plusButton}
      </div>
    );
  }

  return (
    <div className="flex min-h-12 items-center gap-2 bg-white py-1.5 pe-1.5 ps-2.5">
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[10.5px] font-semibold" style={{ color: COLORS.muted }}>
          {label}
        </div>
        <div
          className="ltr-isolate truncate text-[15px] font-extrabold"
          style={{ color: purchasable ? (emphasis ? COLORS.primary : COLORS.text) : COLORS.muted }}
        >
          {price > 0 ? formatPriceEUR(price) : t("En rupture")}
        </div>
      </div>
      {!isOutOfStock && plusButton}
    </div>
  );
}
