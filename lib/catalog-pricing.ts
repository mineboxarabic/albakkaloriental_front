type SaleUnit = "PACK" | "UNIT";

export function formatPriceEUR(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

/**
 * The price a pro pays for a sale unit. `effectivePrice` is the per-piece price
 * already resolved by the back end for this client (their own price, else their
 * tier), so the portal never recomputes tiers itself.
 *
 * - UNIT : the per-piece price.
 * - PACK : the per-piece price multiplied by `unitsPerPack`.
 */
export function resolveProPrice(
  product: { effectivePrice: number; unitsPerPack: number },
  saleUnit: SaleUnit,
): number {
  if (saleUnit === "UNIT") return product.effectivePrice;
  return product.effectivePrice * Math.max(1, product.unitsPerPack);
}

/**
 * Can the product be sold at the unit (loose) level?
 * True as soon as `unitsPerPack > 1`: the unit price is the per-piece price.
 */
export function supportsUnitSale(product: {
  unitsPerPack: number;
  unitSellingPrice: number | null;
}): boolean {
  return product.unitsPerPack > 1;
}
