import type { ProductCard } from "@/lib/catalog";

export type SortKey = "default" | "price-asc" | "price-desc" | "name-asc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Pertinence" },
  { value: "price-asc", label: "Prix : croissant" },
  { value: "price-desc", label: "Prix : décroissant" },
  { value: "name-asc", label: "Nom : A → Z" },
];

const SORT_KEYS = new Set<SortKey>(SORT_OPTIONS.map((o) => o.value));

/** Coerce an unknown search-param value into a valid SortKey (defaults to "default"). */
export function parseSortKey(value: string | undefined): SortKey {
  return value && SORT_KEYS.has(value as SortKey) ? (value as SortKey) : "default";
}

/**
 * Returns a sorted copy of `products`. In every mode, in-stock products come
 * before out-of-stock ones so buyable items stay in view first.
 */
export function sortProducts(products: ProductCard[], sort: SortKey): ProductCard[] {
  const sorted = [...products];
  sorted.sort((a, b) => {
    if (a.isOutOfStock !== b.isOutOfStock) return a.isOutOfStock ? 1 : -1;
    switch (sort) {
      case "price-asc":
        return a.effectivePrice - b.effectivePrice;
      case "price-desc":
        return b.effectivePrice - a.effectivePrice;
      case "name-asc":
        return a.name.localeCompare(b.name, "fr");
      default:
        return 0;
    }
  });
  return sorted;
}
