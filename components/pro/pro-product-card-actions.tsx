"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCart, type CartSaleUnit } from "@/components/cart-context";
import { TranslatedText } from "@/components/translated-text";
import { useLanguage } from "@/components/language-provider";
import { COLORS } from "@/lib/ui";
import { formatPriceEUR } from "@/lib/catalog-pricing";

type Props = {
  productId: string;
  name: string;
  imageUrl: string | null;
  unitsPerPack: number;
  packPrice: number;
  unitPrice: number | null;
  isOutOfStock: boolean;
};

export function ProProductCardActions({
  productId,
  name,
  imageUrl,
  unitsPerPack,
  packPrice,
  unitPrice,
  isOutOfStock,
}: Props) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [adding, setAdding] = useState<CartSaleUnit | null>(null);
  const [added, setAdded] = useState<CartSaleUnit | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function add(saleUnit: CartSaleUnit, price: number) {
    if (adding || isOutOfStock || price <= 0) return;
    setAdding(saleUnit);
    setAdded(null);
    setError(null);
    const result = await addItem(
      { productId, name, imageUrl, unitPrice: price, saleUnit, unitsPerPack },
      1,
    );
    setAdding(null);
    if (!result.ok) {
      setError(t(result.error || "Une erreur est survenue."));
      return;
    }
    setAdded(saleUnit);
    window.setTimeout(() => setAdded((current) => current === saleUnit ? null : current), 1400);
  }

  const buttonClass = "flex min-h-10 flex-1 items-center justify-center gap-1 rounded-sm px-2 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className="mt-1 flex gap-2">
      <button
        type="button"
        onClick={() => add("UNIT", unitPrice ?? 0)}
        disabled={!unitPrice || unitPrice <= 0 || isOutOfStock || adding !== null}
        aria-label={unitPrice && unitPrice > 0 ? "Ajouter une unité au devis" : undefined}
        className={buttonClass}
        style={{
          background: unitPrice && unitPrice > 0 && !isOutOfStock ? COLORS.primary : "#999",
          color: "#FFFFFF",
        }}
      >
        {unitPrice && unitPrice > 0 && !isOutOfStock ? (
          added === "UNIT" ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />
        ) : null}
        <span>{unitPrice && unitPrice > 0 && !isOutOfStock ? (
          <><TranslatedText value={"Unité"} /> · {formatPriceEUR(unitPrice)}</>
        ) : <TranslatedText value={"En rupture"} />}</span>
      </button>

      <button
        type="button"
        onClick={() => add("PACK", packPrice)}
        disabled={packPrice <= 0 || isOutOfStock || adding !== null}
        aria-label={packPrice > 0 ? "Ajouter un carton au devis" : undefined}
        className={buttonClass}
        style={{
          background: packPrice > 0 && !isOutOfStock ? COLORS.primary : "#999",
          color: "#FFFFFF",
        }}
      >
        {packPrice > 0 && !isOutOfStock ? (
          added === "PACK" ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />
        ) : null}
        <span>{packPrice > 0 && !isOutOfStock ? (
          <><TranslatedText value={"Carton"} /> · {formatPriceEUR(packPrice)}</>
        ) : <TranslatedText value={"En rupture"} />}</span>
      </button>
      {error && (
        <p role="alert" className="sr-only">{error}</p>
      )}
    </div>
  );
}
