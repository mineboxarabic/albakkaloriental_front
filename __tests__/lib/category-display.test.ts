import { describe, expect, it } from "vitest";
import {
  normalizeCategoryKey,
  getCategoryDisplay,
  getDisplayCategories,
  getOrderedCategoryNames,
} from "@/lib/category-display";
import { PRODUCT_PLACEHOLDER } from "@/lib/ui";

describe("normalizeCategoryKey", () => {
  it("trims, strips accents, collapses spaces and uppercases", () => {
    expect(normalizeCategoryKey("  Épices  ")).toBe("EPICES");
    expect(normalizeCategoryKey("riz  et   pates")).toBe("RIZ ET PATES");
    expect(normalizeCategoryKey("Boissons")).toBe("BOISSONS");
  });
});

describe("getCategoryDisplay", () => {
  it("marks a configured category with its order", () => {
    const d = getCategoryDisplay("Boissons");
    expect(d).toMatchObject({ name: "Boissons", order: 20, isConfigured: true });
  });

  it("falls back for an unknown category", () => {
    const d = getCategoryDisplay("Bricolage");
    expect(d).toMatchObject({
      name: "Bricolage",
      order: 1000,
      isConfigured: false,
      image: PRODUCT_PLACEHOLDER,
    });
  });
});

describe("getDisplayCategories", () => {
  it("dedupes by normalized key", () => {
    const result = getDisplayCategories(["Boissons", "BOISSONS "]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Boissons");
  });

  it("sorts by configured order then French name", () => {
    // Huiles=50, Boissons=20, Confiseries=10 → Confiseries, Boissons, Huiles
    expect(getOrderedCategoryNames(["Huiles", "Boissons", "Confiseries"])).toEqual([
      "Confiseries",
      "Boissons",
      "Huiles",
    ]);
  });

  it("places unconfigured categories last, alphabetically", () => {
    const names = getOrderedCategoryNames(["Zèbre", "Boissons", "Avocat"]);
    expect(names[0]).toBe("Boissons"); // configured, order 20
    expect(names.slice(1)).toEqual(["Avocat", "Zèbre"]); // both order 1000, fr-sorted
  });
});
