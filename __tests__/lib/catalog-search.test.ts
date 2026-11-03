import { describe, expect, it } from "vitest";
import { getCatalogSearchScore, searchCatalogProducts, type SearchableCatalogProduct } from "@/lib/catalog-search";

function product(overrides: Partial<SearchableCatalogProduct> & Pick<SearchableCatalogProduct, "name">): SearchableCatalogProduct {
  return { sku: "SKU", category: "Épicerie", marques: [], ...overrides };
}

const oliveOil = product({
  name: "Huile d'Olive Vierge Extra 1L",
  nameFr: "Huile d'Olive Vierge Extra 1L",
  nameAr: "زيت الزيتون البكر الممتاز ١ لتر",
  sku: "HUI-OLI-1L",
  category: "Épicerie salée",
  categoryAr: "البقالة المالحة",
  subcategory: "Huiles et vinaigres",
  subcategoryAr: "الزيوت والخل",
  marques: ["Al Wadi"],
  tags: ["bio"],
});

describe("getCatalogSearchScore", () => {
  it("finds a name when the user leaves out the article (huile olive)", () => {
    expect(getCatalogSearchScore(oliveOil, "huile olive")).not.toBeNull();
  });

  it("finds a French name despite a typo", () => {
    expect(getCatalogSearchScore(oliveOil, "huille")).not.toBeNull();
    expect(getCatalogSearchScore(oliveOil, "viegre")).not.toBeNull();
  });

  it("finds the Arabic name with or without the article ال", () => {
    expect(getCatalogSearchScore(oliveOil, "زيت زيتون")).not.toBeNull();
    expect(getCatalogSearchScore(oliveOil, "الزيتون")).not.toBeNull();
  });

  it("finds the Arabic name while the catalog is displayed in French", () => {
    const frenchDisplay = { ...oliveOil, name: "Huile d'Olive Vierge Extra 1L" };
    expect(getCatalogSearchScore(frenchDisplay, "زيت")).not.toBeNull();
  });

  it("finds by brand, SKU, tag and Arabic subcategory", () => {
    expect(getCatalogSearchScore(oliveOil, "al wadi")).not.toBeNull();
    expect(getCatalogSearchScore(oliveOil, "hui-oli")).not.toBeNull();
    expect(getCatalogSearchScore(oliveOil, "bio")).not.toBeNull();
    expect(getCatalogSearchScore(oliveOil, "الخل")).not.toBeNull();
  });

  it("matches a size typed with Arabic digits or without a space", () => {
    expect(getCatalogSearchScore(oliveOil, "زيت ١")).not.toBeNull();
    expect(getCatalogSearchScore(oliveOil, "huile 1l")).not.toBeNull();
  });

  it("does not match an Arabic query against a product without that Arabic text", () => {
    const frenchOnly = product({ name: "Nutella 400g" });
    expect(getCatalogSearchScore(frenchOnly, "زيت")).toBeNull();
  });

  it("does not match a different pack size", () => {
    expect(getCatalogSearchScore(product({ name: "Nutella 400g" }), "nutella 750")).toBeNull();
  });
});

describe("searchCatalogProducts", () => {
  const products = [
    product({ name: "Olives vertes à l'huile" }),
    product({ name: "Huile de tournesol" }),
    product({ name: "Huile d'olive" }),
    product({ name: "Riz basmati" }),
  ];

  it("keeps only matching products, the closest match first", () => {
    const result = searchCatalogProducts(products, "huile d'olive").map((p) => p.name);
    expect(result).toEqual(["Huile d'olive", "Olives vertes à l'huile"]);
  });

  it("returns the list untouched for a blank query", () => {
    expect(searchCatalogProducts(products, "  ")).toEqual(products);
  });

  it("keeps the original order between equally relevant products", () => {
    const twins = [product({ name: "Thé vert", sku: "A" }), product({ name: "Thé vert", sku: "B" })];
    expect(searchCatalogProducts(twins, "the vert").map((p) => p.sku)).toEqual(["A", "B"]);
  });
});
