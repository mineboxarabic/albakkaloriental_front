"use client";
import { TranslatedText } from "@/components/translated-text";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingCart,
  Check,
  Package,
  Box,
  Lock,
} from "lucide-react";
type PricingLevel = "C" | "D" | "E" | "F";
import { useCart, type CartSaleUnit } from "@/components/cart-context";
import {
  formatPriceEUR,
  resolveProPrice,
  supportsUnitSale,
  type ProPriceInput,
} from "@/lib/catalog-pricing";
import { COLORS, buildQuantityLabel } from "@/lib/ui";
import { useLanguage } from "@/components/language-provider";

type Props = {
  productId: string;
  name: string;
  imageUrl: string | null;
  unitsPerPack: number;
  pricing: ProPriceInput;
  pricingLevel: PricingLevel | null;
  isOutOfStock?: boolean;
  availableStock?: number;
  baseUnit?: string;
  authenticated?: boolean;
};

export function AddToProCartButton({
  productId,
  name,
  imageUrl,
  unitsPerPack,
  pricing,
  pricingLevel,
  isOutOfStock = false,
  availableStock = 0,
  baseUnit = "PIECE",
  authenticated = true,
}: Props) {
  const allowsUnit = supportsUnitSale(pricing);
  const [saleUnit, setSaleUnit] = useState<CartSaleUnit>("PACK");
  const [qty, setQty] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const { t, language } = useLanguage();

  const unitPrice = useMemo(
    () => resolveProPrice(pricing, saleUnit, pricingLevel),
    [pricing, saleUnit, pricingLevel],
  );
  const lineTotal = unitPrice * qty;

  const maxQtyForUnit = useMemo(
    () =>
      saleUnit === "PACK" && unitsPerPack > 0
        ? Math.floor(availableStock / unitsPerPack)
        : availableStock,
    [saleUnit, availableStock, unitsPerPack],
  );
  const stockLabel =
    saleUnit === "PACK"
      ? t(
          maxQtyForUnit > 1
            ? "{count} cartons disponibles"
            : "{count} carton disponible",
          { count: maxQtyForUnit },
        )
      : t(maxQtyForUnit > 1 ? "{quantity} disponibles" : "{quantity} disponible", {
          quantity: buildQuantityLabel(maxQtyForUnit, baseUnit, true, language),
        });

  if (!authenticated) {
    return (
      <div className="flex flex-col gap-4">
        <div
          className="flex items-center gap-3 rounded-sm border px-4 py-3"
          style={{ borderColor: COLORS.border, background: "#FAF8F2" }}
        >
          <Lock
            className="h-5 w-5 shrink-0"
            strokeWidth={2}
            style={{ color: COLORS.primary }}
          />
          <p className="text-[13px] font-medium" style={{ color: COLORS.text }}>
            <TranslatedText
              value={
                "Connectez-vous à votre compte professionnel pour voir les prix et commander."
              }
            />{" "}
          </p>
        </div>
        <Link
          href={`/pro/login?next=/pro/products/${productId}`}
          className="grid h-12 place-items-center rounded-sm text-[13px] font-bold uppercase tracking-[0.12em] text-white shadow-md transition active:scale-[0.98]"
          style={{ background: COLORS.primary }}
        >
          <TranslatedText value={"Se connecter"} />{" "}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {allowsUnit && (
        <div
          className="flex overflow-hidden rounded-sm border"
          style={{ borderColor: COLORS.border }}
        >
          <ToggleButton
            active={saleUnit === "PACK"}
            onClick={() => setSaleUnit("PACK")}
            icon={<Package className="h-4 w-4" strokeWidth={2} />}
            label={t("Par carton")}
            sub={t("{count} unités / carton", { count: unitsPerPack })}
          />
          <ToggleButton
            active={saleUnit === "UNIT"}
            onClick={() => setSaleUnit("UNIT")}
            icon={<Box className="h-4 w-4" strokeWidth={2} />}
            label={t("À l'unité")}
            sub={t("Vente au détail")}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="leading-tight">
          <div
            className="text-[11px] uppercase tracking-[0.12em]"
            style={{ color: COLORS.muted }}
          >
            <TranslatedText value={"Prix"} />{" "}
            {saleUnit === "PACK" ? t("par carton") : t("à l'unité")}
          </div>
          <div
            className="mt-1 text-[24px] font-extrabold"
            style={{ color: COLORS.primary }}
          >
            {formatPriceEUR(unitPrice)}
          </div>
        </div>

        <div
          className="flex items-center overflow-hidden rounded-sm border"
          style={{ borderColor: COLORS.border }}
        >
          <button
            type="button"
            aria-label={t("Diminuer la quantité")}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-11 w-11 place-items-center transition hover:bg-[#FAF8F2]"
            style={{ color: COLORS.text }}
          >
            <Minus className="h-4 w-4" strokeWidth={2.2} />
          </button>
          <div
            aria-live="polite"
            className="grid h-11 w-14 place-items-center text-[15px] font-bold"
            style={{ color: COLORS.text }}
          >
            {qty}
          </div>
          <button
            type="button"
            aria-label={t("Augmenter la quantité")}
            onClick={() =>
              setQty((q) => Math.min(Math.max(maxQtyForUnit, 1), q + 1))
            }
            className="grid h-11 w-11 place-items-center transition hover:bg-[#FAF8F2]"
            style={{ color: COLORS.text }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {!isOutOfStock && (
        <p className="text-[11.5px]" style={{ color: COLORS.muted }}>
          {stockLabel}
        </p>
      )}

      <div
        className="flex items-center justify-between rounded-sm border px-4 py-2.5"
        style={{ borderColor: COLORS.border, background: "#FAF8F2" }}
      >
        <span className="text-[12px]" style={{ color: COLORS.muted }}>
          <TranslatedText value={"Sous-total pour cette ligne"} />{" "}
        </span>
        <span
          className="text-[16px] font-extrabold"
          style={{ color: COLORS.text }}
        >
          {formatPriceEUR(lineTotal)}
        </span>
      </div>

      {isOutOfStock ? (
        <div
          className="grid h-12 place-items-center rounded-sm text-[13px] font-bold uppercase tracking-[0.12em] text-white"
          style={{ background: "#999" }}
        >
          <TranslatedText value={"Produit en rupture"} />{" "}
        </div>
      ) : (
        <button
          type="button"
          onClick={async () => {
            setError(null);
            const res = await addItem(
              {
                productId,
                name,
                imageUrl,
                unitPrice,
                saleUnit,
                unitsPerPack,
              },
              qty,
            );
            if (res.ok) {
              setConfirmed(true);
              window.setTimeout(() => setConfirmed(false), 1400);
            } else {
              setError(t(res.error || "Une erreur est survenue."));
            }
          }}
          className="grid h-12 place-items-center rounded-sm text-[13px] font-bold uppercase tracking-[0.12em] text-white shadow-md transition active:scale-[0.98]"
          style={{ background: confirmed ? "#2E3F17" : COLORS.primary }}
        >
          {confirmed ? (
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" strokeWidth={2.4} />
              <TranslatedText value={"Ajouté au panier"} />{" "}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" strokeWidth={2} />
              <TranslatedText value={"Ajouter au devis"} />{" "}
            </span>
          )}
        </button>
      )}
      {error && (
        <div
          className="text-[12.5px] font-medium text-center"
          style={{ color: COLORS.red }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center gap-3 px-4 py-3 text-start transition"
      style={{
        background: active ? COLORS.primary : "#FFFFFF",
        color: active ? "#FFFFFF" : COLORS.text,
      }}
    >
      <span
        className="grid h-9 w-9 place-items-center rounded-sm"
        style={{
          background: active ? "rgba(255,255,255,0.15)" : COLORS.beige,
          color: active ? "#FFFFFF" : COLORS.primary,
        }}
      >
        {icon}
      </span>
      <span className="leading-tight">
        <span className="block text-[13px] font-bold">{label}</span>
        <span
          className="block text-[11px]"
          style={{ color: active ? "rgba(255,255,255,0.75)" : COLORS.muted }}
        >
          {sub}
        </span>
      </span>
    </button>
  );
}
