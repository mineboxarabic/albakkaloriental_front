// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/api-client", () => ({
  backendFetch: fetchMock,
  ApiClientError: class extends Error {},
}));
import { getProducts, getProduct, getCategoryItems } from "@/lib/catalog";
const product = {
  id: "rice",
  name: "Riz basmati",
  nameAr: "أرز بسمتي",
  sku: "RICE-1",
  description: "Riz à grains longs.",
  descriptionAr: "أرز طويل الحبة.",
  category: "Épicerie salée",
  categoryAr: "البقالة المالحة",
  categoryCode: "epicerie-salee",
  subcategory: "Riz, pâtes et légumes secs",
  subcategoryAr: "الأرز والمعكرونة والبقوليات",
  subcategoryCode: "riz-pates",
  tags: ["basmati"],
  visibility: "BOTH",
  retailStatus: "VISIBLE",
  wholesaleStatus: "VISIBLE",
  imageUrl: null,
  unitsPerPack: 1,
  baseUnit: "PIECE",
  sellingPrice: 3,
  price: 2.5,
};
describe("bilingual catalog contract", () => {
  it.each(["retail", "pro"] as const)(
    "retains translations, descriptions and tags for %s",
    async (audience) => {
      fetchMock.mockResolvedValue({ products: [product] });
      const result = await getProduct("rice", audience, "ar");
      expect(result).toMatchObject({
        name: "أرز بسمتي",
        nameFr: "Riz basmati",
        nameAr: "أرز بسمتي",
        description: "أرز طويل الحبة.",
        tags: ["basmati"],
        categoryLabel: "البقالة المالحة",
        subcategoryCode: "riz-pates",
        effectivePrice: 2.5,
      });
    },
  );
  it.each([
    "riz-pates",
    "Riz, pâtes et légumes secs",
    "الأرز والمعكرونة والبقوليات",
    "epicerie-salee",
  ])(
    "filters category identity %s without splitting comma-containing names",
    async (category) => {
      fetchMock.mockResolvedValue({ products: [product] });
      expect(
        (await getProducts({ audience: "retail", category })).products,
      ).toHaveLength(1);
    },
  );
  it("falls back to French for empty Arabic fields without inventing descriptions", async () => {
    fetchMock.mockResolvedValue({
      products: [
        { ...product, nameAr: "  ", description: null, descriptionAr: null },
      ],
    });
    expect(await getProduct("rice", "retail", "ar")).toMatchObject({
      name: "Riz basmati",
      description: null,
    });
  });
  it("keeps the category tree metadata and admin image", async () => {
    fetchMock.mockResolvedValue({
      categories: [
        {
          id: "food",
          name: "Épicerie salée",
          nameAr: "البقالة المالحة",
          code: "epicerie-salee",
          parentId: null,
          imageUrl: "https://cdn.example/custom.jpg",
          sortOrder: 4,
          isFeatured: true,
        },
      ],
    });
    expect(await getCategoryItems()).toEqual([
      expect.objectContaining({
        code: "epicerie-salee",
        nameAr: "البقالة المالحة",
        imageUrl: "https://cdn.example/custom.jpg",
        sortOrder: 4,
      }),
    ]);
  });
});
