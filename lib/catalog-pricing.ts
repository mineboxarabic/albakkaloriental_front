import type { PricingLevel } from "@prisma/client";

export type TierPriceInput = {
  sellingPrice: number;
  priceLevelC: number | null;
  priceLevelD: number | null;
  priceLevelE: number | null;
  priceLevelF: number | null;
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
