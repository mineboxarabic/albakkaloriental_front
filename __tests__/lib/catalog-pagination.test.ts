import { describe, expect, it } from "vitest";
import { paginateCatalog, catalogPageHref } from "@/lib/catalog-pagination";

const products = Array.from({ length: 1000 }, (_, i) => i + 1);
describe("catalogue pagination", () => {
  it("bounds initial rendering to 24 products without losing the full result count", () => {
    const result = paginateCatalog(products);
    expect(result.items).toEqual(products.slice(0, 24));
    expect(result).toMatchObject({ page: 1, totalPages: 42, total: 1000, start: 1, end: 24 });
  });
  it("makes every result accessible exactly once, including the last partial page", () => {
    const all = Array.from({ length: 42 }, (_, i) => paginateCatalog(products, String(i + 1)).items).flat();
    expect(all).toEqual(products);
    expect(paginateCatalog(products, "42")).toMatchObject({ start: 985, end: 1000 });
  });
  it.each(["0", "-1", "1.5", "x", "Infinity", "1e3", "999999999999999999999999999999", "", ["2", "3"]])("handles an invalid page %j", (page) => {
    expect(paginateCatalog(products, page).page).toBe(1);
  });
  it("clamps stale URLs to the last available page after filtering", () => {
    expect(paginateCatalog(products.slice(0, 30), "42")).toMatchObject({ page: 2, totalPages: 2, start: 25, end: 30 });
  });
  it("handles an empty catalogue without a negative offset", () => {
    expect(paginateCatalog([], "42")).toMatchObject({ items: [], page: 1, totalPages: 1, start: 0, end: 0, total: 0 });
  });
  it("keeps all filters and Unicode queries across page links", () => {
    const params = { category: "Épicerie salée", marque: "Duru", q: "أرز", sort: "price-desc", tag: "basmati", page: "9" };
    const url = new URL(catalogPageHref("/pro/products", params, 2), "https://example.com");
    expect(Object.fromEntries(url.searchParams)).toEqual({ ...params, page: "2" });
    expect(new URL(catalogPageHref("/products", params, 1), "https://example.com").searchParams.has("page")).toBe(false);
  });
});
