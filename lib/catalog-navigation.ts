import type { CategoryItem, ProductCard } from "@/lib/catalog";
import { localizedText, type Language } from "@/lib/language";
import { PRODUCT_PLACEHOLDER } from "@/lib/ui";

export type CategoryNavigation = CategoryItem & {
  label: string;
  value: string;
  image: string;
  /**
   * "cover" for styled category photography, "contain" when the image is a
   * product packshot borrowed from the category (see representativeImage).
   */
  imageFit: "cover" | "contain";
  children: CategoryNavigation[];
};
type CategoryProduct = Pick<
  ProductCard,
  "name" | "sku" | "category" | "marques"
> &
  Partial<ProductCard>;
const ARTWORK = new Set([
  "epicerie-salee",
  "epicerie-sucree",
  "boissons",
  "laitiers",
  "charcuterie",
  "maison-hygiene",
]);
export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .toLocaleLowerCase()
    .trim();
}
export function matchesCategory(
  product: Partial<ProductCard>,
  query: string,
): boolean {
  const key = normalizeSearch(query);
  const fields = [
    product.category,
    product.categoryAr,
    product.categoryCode,
    product.subcategory,
    product.subcategoryAr,
    product.subcategoryCode,
  ];
  if (fields.some((value) => value && normalizeSearch(value) === key))
    return true;
  // Only legacy responses encode several categories as comma-separated text.
  return (
    !product.categoryCode &&
    !product.subcategory &&
    Boolean(
      product.category
        ?.split(",")
        .some((value) => normalizeSearch(value) === key),
    )
  );
}
export function matchesProductSearch(
  product: CategoryProduct,
  query: string,
): boolean {
  const key = normalizeSearch(query);
  const fields = [
    product.name,
    product.nameFr,
    product.nameAr,
    product.sku,
    product.category,
    product.categoryAr,
    product.subcategory,
    product.subcategoryAr,
    ...(product.marques ?? []),
    ...(product.tags ?? []),
  ];
  return fields.some((value) => value && normalizeSearch(value).includes(key));
}
export function categoryValue(category: CategoryItem): string {
  return category.code || category.name;
}
export function categoryImage(
  category: CategoryItem,
  parent?: CategoryItem,
): string {
  if (category.imageUrl) return category.imageUrl;
  if (category.code && ARTWORK.has(category.code))
    return `/images/categories/${category.code}.webp`;
  if (parent) return categoryImage(parent);
  return PRODUCT_PLACEHOLDER;
}

/**
 * Photo of a product sold in the category, used when the category has neither
 * an admin-uploaded image nor dedicated artwork, so every category (including
 * subcategories and categories created later in the back office) gets its own
 * picture instead of the parent's photo or the grey placeholder.
 */
export function representativeImage(
  category: CategoryItem,
  products: Partial<ProductCard>[],
): string | null {
  const value = categoryValue(category);
  const candidates = products.filter(
    (product) =>
      typeof product.imageUrl === "string" &&
      /^(https?:\/\/|\/)/.test(product.imageUrl) &&
      matchesCategory(product, value),
  );
  // Prefer something the customer can actually order.
  const pick =
    candidates.find((product) => !product.isOutOfStock) ?? candidates[0];
  return pick?.imageUrl ?? null;
}

function navigationImage(
  category: CategoryItem,
  products: Partial<ProductCard>[],
  parent?: CategoryItem,
): Pick<CategoryNavigation, "image" | "imageFit"> {
  if (category.imageUrl) return { image: category.imageUrl, imageFit: "cover" };
  if (category.code && ARTWORK.has(category.code))
    return {
      image: `/images/categories/${category.code}.webp`,
      imageFit: "cover",
    };
  const productImage = representativeImage(category, products);
  if (productImage) return { image: productImage, imageFit: "contain" };
  const image = categoryImage(category, parent);
  return { image, imageFit: "cover" };
}
export function buildCategoryNavigation(
  categories: CategoryItem[],
  products: Partial<ProductCard>[],
  language: Language,
): CategoryNavigation[] {
  const used = (category: CategoryItem) =>
    products.some((product) =>
      matchesCategory(product, categoryValue(category)),
    );
  const order = (a: CategoryItem, b: CategoryItem) =>
    (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
    a.name.localeCompare(b.name, "fr");
  return categories
    .filter((category) => !category.parentId)
    .sort(order)
    .flatMap((parent) => {
      const children = categories
        .filter((child) => child.parentId === parent.id && used(child))
        .sort(order);
      if (!used(parent) && children.length === 0) return [];
      const node = (category: CategoryItem): CategoryNavigation => ({
        ...category,
        label: localizedText(category.name, category.nameAr, language),
        value: categoryValue(category),
        ...navigationImage(
          category,
          products,
          parent === category ? undefined : parent,
        ),
        children: [],
      });
      return [{ ...node(parent), children: children.map(node) }];
    });
}
