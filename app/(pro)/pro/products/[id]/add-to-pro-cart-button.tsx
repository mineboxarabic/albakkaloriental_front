"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Check, Package, Box, Lock } from "lucide-react";
type PricingLevel = "C" | "D" | "E" | "F";
import { useCart, type CartSaleUnit } from "@/components/cart-context";
import {
  formatPriceEUR,
  resolveProPrice,
  supportsUnitSale,
  type ProPriceInput,
} from "@/lib/catalog-pricing";
import { COLORS } from "@/lib/ui";

type Props = {
  productId: string;
  name: string;
  imageUrl: string | null;
  unitsPerPack: number;
  pricing: ProPriceInput;
  pricingLevel: PricingLevel | null;
  isOutOfStock?: boolean;
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
  authenticated = true,
}: Props) {
  const allowsUnit = supportsUnitSale(pricing);
  const [saleUnit, setSaleUnit] = useState<CartSaleUnit>("PACK");
  const [qty, setQty] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  const unitPrice = useMemo(
    () => resolveProPrice(pricing, saleUnit, pricingLevel),
    [pricing, saleUnit, pricingLevel],
  );
  const lineTotal = unitPrice * qty;

  if (!authenticated) {
    return (
      <div className="flex flex-col gap-4">
        <div
          className="flex items-center gap-3 rounded-sm border px-4 py-3"
          style={{ borderColor: COLORS.border, background: "#FAF8F2" }}
        >
          <Lock className="h-5 w-5 shrink-0" strokeWidth={2} style={{ color: COLORS.primary }} />
          <p className="text-[13px] font-medium" style={{ color: COLORS.text }}>
            Connectez-vous à votre compte professionnel pour voir les prix et
            commander.
          </p>
        </div>
        <Link
          href={`/pro/login?next=/pro/products/${productId}`}
          className="grid h-12 place-items-center rounded-sm text-[13px] font-bold uppercase tracking-[0.12em] text-white shadow-md transition active:scale-[0.98]"
          style={{ background: COLORS.primary }}
        >
          Se connecter
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
            label="Par carton"
            sub={`${unitsPerPack} unités / carton`}
          />
          <ToggleButton
            active={saleUnit === "UNIT"}
            onClick={() => setSaleUnit("UNIT")}
            icon={<Box className="h-4 w-4" strokeWidth={2} />}
            label="À l'unité"
            sub="Vente au détail"
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="leading-tight">
          <div className="text-[11px] uppercase tracking-[0.12em]" style={{ color: COLORS.muted }}>
            Prix {saleUnit === "PACK" ? "par carton" : "à l'unité"}
          </div>
          <div className="mt-1 text-[24px] font-extrabold" style={{ color: COLORS.primary }}>
            {formatPriceEUR(unitPrice)}
          </div>
        </div>

        <div
          className="flex items-center overflow-hidden rounded-sm border"
          style={{ borderColor: COLORS.border }}
        >
          <button
            type="button"
            aria-label="Diminuer la quantité"
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
            aria-label="Augmenter la quantité"
            onClick={() => setQty((q) => Math.min(999, q + 1))}
            className="grid h-11 w-11 place-items-center transition hover:bg-[#FAF8F2]"
            style={{ color: COLORS.text }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div
        className="flex items-center justify-between rounded-sm border px-4 py-2.5"
        style={{ borderColor: COLORS.border, background: "#FAF8F2" }}
      >
        <span className="text-[12px]" style={{ color: COLORS.muted }}>
          Sous-total pour cette ligne
        </span>
        <span className="text-[16px] font-extrabold" style={{ color: COLORS.text }}>
          {formatPriceEUR(lineTotal)}
        </span>
      </div>

      {isOutOfStock ? (
        <div
          className="grid h-12 place-items-center rounded-sm text-[13px] font-bold uppercase tracking-[0.12em] text-white"
          style={{ background: "#999" }}
        >
          Produit en rupture
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
              setError(res.error || "Une erreur est survenue.");
            }
          }}
          className="grid h-12 place-items-center rounded-sm text-[13px] font-bold uppercase tracking-[0.12em] text-white shadow-md transition active:scale-[0.98]"
          style={{ background: confirmed ? "#2E3F17" : COLORS.primary }}
        >
          {confirmed ? (
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" strokeWidth={2.4} />
              Ajouté au panier
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" strokeWidth={2} />
              Ajouter au devis
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
      className="flex flex-1 items-center gap-3 px-4 py-3 text-left transition"
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
