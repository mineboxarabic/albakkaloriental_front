import { describe, expect, it } from "vitest";
import {
  buildCategoryNavigation,
  matchesProductSearch,
  categoryImage,
} from "@/lib/catalog-navigation";
const categories = [
  {
    id: "food",
    name: "Épicerie salée",
    nameAr: "البقالة المالحة",
    code: "epicerie-salee",
    parentId: null,
    imageUrl: null,
    isFeatured: false,
  },
  {
    id: "rice",
    name: "Riz, pâtes et légumes secs",
    nameAr: "الأرز والمعكرونة والبقوليات",
    code: "riz-pates",
    parentId: "food",
    imageUrl: null,
    isFeatured: false,
  },
  {
    id: "old",
    name: "Unused old category",
    parentId: null,
    imageUrl: null,
    isFeatured: false,
  },
];
const products = [
  {
    name: "Riz",
    nameAr: "أرز",
    sku: "X-1",
    category: "Épicerie salée",
    categoryCode: "epicerie-salee",
    subcategory: "Riz, pâtes et légumes secs",
    subcategoryCode: "riz-pates",
    marques: ["Duru"],
    tags: ["basmati"],
  },
];
describe("catalog navigation", () => {
  it("groups used subcategories beneath their parent, with canonical links and translated labels", () => {
    const result = buildCategoryNavigation(categories, products, "ar");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      label: "البقالة المالحة",
      value: "epicerie-salee",
      image: "/images/categories/epicerie-salee.webp",
    });
    expect(result[0].children[0]).toMatchObject({
      label: "الأرز والمعكرونة والبقوليات",
      value: "riz-pates",
    });
  });
  it.each(["ارز", "أَرْز", "duru", "BASMATI", "x-1", "riz"])(
    "searches translations, brand, SKU and tags for %s",
    (query) => {
      expect(matchesProductSearch(products[0], query)).toBe(true);
    },
  );
  it("preserves admin images, inherits parent artwork and uses a neutral fallback for unknown categories", () => {
    expect(
      categoryImage({
        ...categories[0],
        imageUrl: "https://cdn.example/image.jpg",
      }),
    ).toBe("https://cdn.example/image.jpg");
    expect(categoryImage(categories[1], categories[0])).toBe(
      "/images/categories/epicerie-salee.webp",
    );
    expect(categoryImage(categories[2])).toBe(
      "/Assets/img/product-placeholder.jpg",
    );
  });
});
