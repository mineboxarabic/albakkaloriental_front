import type { CategoryItem, ProductCard } from "@/lib/catalog";
import { localizedText, type Language } from "@/lib/language";
import { PRODUCT_PLACEHOLDER } from "@/lib/ui";

export type CategoryNavigation = CategoryItem & {
  label: string;
  value: string;
  image: string;
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
        image: categoryImage(
          category,
          parent === category ? undefined : parent,
        ),
        children: [],
      });
      return [{ ...node(parent), children: children.map(node) }];
    });
}
