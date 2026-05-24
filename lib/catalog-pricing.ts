type PricingLevel = "C" | "D" | "E" | "F";
type SaleUnit = "PACK" | "UNIT";

export type TierPriceInput = {
  sellingPrice: number;
  priceLevelC: number | null;
  priceLevelD: number | null;
  priceLevelE: number | null;
  priceLevelF: number | null;
};

export type ProPriceInput = TierPriceInput & {
  unitSellingPrice: number | null;
  unitsPerPack: number;
};

/**
 * Returns the price a wholesale customer should pay based on their pricing level.
 * Falls back to `sellingPrice` when the tier price is missing or no level is supplied.
 */
export function getTierPrice(
  product: TierPriceInput,
  pricingLevel: PricingLevel | null | undefined,
): number {
  if (!pricingLevel) return product.sellingPrice;
  const tier =
    pricingLevel === "C"
      ? product.priceLevelC
      : pricingLevel === "D"
        ? product.priceLevelD
        : pricingLevel === "E"
          ? product.priceLevelE
          : product.priceLevelF;
  return tier ?? product.sellingPrice;
}

export function formatPriceEUR(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

/**
 * Resolves the unit price a pro should pay for a given sale unit + pricing level.
 *
 * - PACK : `getTierPrice(product, level)` — tier-aware (C/D/E/F with fallback to sellingPrice).
 * - UNIT : tier price (or sellingPrice fallback) divided by `unitsPerPack` — tier-aware.
 *          `unitSellingPrice` on the product is a B2C field and is ignored for pros.
 */
export function resolveProPrice(
  product: ProPriceInput,
  saleUnit: SaleUnit,
  level: PricingLevel | null | undefined,
): number {
  const packPrice = getTierPrice(product, level);
  if (saleUnit === "PACK") return packPrice;
  const packs = Math.max(1, product.unitsPerPack);
  return packPrice / packs;
}

/**
 * Can the product be sold at the unit (loose) level?
 * True as soon as `unitsPerPack > 1` — when there is no explicit `unitSellingPrice`,
 * `resolveProPrice("UNIT", …)` derives it from `sellingPrice / unitsPerPack`.
 */
export function supportsUnitSale(product: {
  unitsPerPack: number;
  unitSellingPrice: number | null;
}): boolean {
  return product.unitsPerPack > 1;
}
