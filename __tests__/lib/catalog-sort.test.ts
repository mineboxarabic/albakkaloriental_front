import { describe, expect, it } from "vitest";
import { parseSortKey, sortProducts } from "@/lib/catalog-sort";
import type { ProductCard } from "@/lib/catalog";

function makeProduct(
  overrides: Partial<ProductCard> & Pick<ProductCard, "id">,
): ProductCard {
  return {
    id: overrides.id,
    name: overrides.name ?? "Produit",
    sku: overrides.sku ?? "SKU",
    category: overrides.category ?? "Épicerie",
    imageUrl: null,
    unitsPerPack: 1,
    baseUnit: "PIECE",
    sellingPrice: overrides.effectivePrice ?? 1,
    unitSellingPrice: null,
    priceLevelC: null,
    priceLevelD: null,
    priceLevelE: null,
    priceLevelF: null,
    effectivePrice: overrides.effectivePrice ?? 1,
    isOutOfStock: overrides.isOutOfStock ?? false,
    ...overrides,
  };
}

const A = makeProduct({ id: "a", name: "Banane", effectivePrice: 3 });
const B = makeProduct({ id: "b", name: "Amande", effectivePrice: 1 });
const C = makeProduct({ id: "c", name: "Cumin", effectivePrice: 2 });

describe("parseSortKey", () => {
  it("returns the value when valid", () => {
    expect(parseSortKey("price-asc")).toBe("price-asc");
    expect(parseSortKey("name-asc")).toBe("name-asc");
  });
  it("falls back to default for unknown or missing values", () => {
    expect(parseSortKey(undefined)).toBe("default");
    expect(parseSortKey("bogus")).toBe("default");
  });
});

describe("sortProducts", () => {
  it("default preserves input order", () => {
    expect(sortProducts([A, B, C], "default").map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("sorts by price ascending", () => {
    expect(sortProducts([A, B, C], "price-asc").map((p) => p.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts by price descending", () => {
    expect(sortProducts([A, B, C], "price-desc").map((p) => p.id)).toEqual(["a", "c", "b"]);
  });

  it("sorts by name A→Z (French locale)", () => {
    expect(sortProducts([A, B, C], "name-asc").map((p) => p.id)).toEqual(["b", "a", "c"]);
  });

  it("pushes out-of-stock products to the bottom in every mode", () => {
    const outA = makeProduct({ id: "a", name: "Banane", effectivePrice: 3, isOutOfStock: true });
    const result = sortProducts([outA, B, C], "price-asc");
    expect(result.map((p) => p.id)).toEqual(["b", "c", "a"]);
    expect(result[result.length - 1].id).toBe("a");
  });

  it("does not mutate the input array", () => {
    const input = [A, B, C];
    sortProducts(input, "price-asc");
    expect(input.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });
});
