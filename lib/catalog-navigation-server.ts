import "server-only";
import {
  getCategoryItems,
  getProducts,
  type CatalogAudience,
} from "@/lib/catalog";
import { buildCategoryNavigation } from "@/lib/catalog-navigation";
import type { Language } from "@/lib/language";

export async function getCatalogNavigation(
  audience: CatalogAudience,
  language: Language,
) {
  return (await getCatalogShell(audience, language)).navigation;
}

/**
 * Everything the shop layout needs from the catalogue in one round trip:
 * category navigation plus, in Arabic, the Arabic product names keyed by id
 * so cart lines (which the cart API only returns in French) read in Arabic.
 */
export async function getCatalogShell(
  audience: CatalogAudience,
  language: Language,
) {
  const [categories, { products }] = await Promise.all([
    getCategoryItems(),
    getProducts({ audience, language }),
  ]);
  return {
    navigation: buildCategoryNavigation(categories, products, language),
    productNames: localizedProductNames(products, language),
  };
}

export function localizedProductNames(
  products: { id: string; name: string; nameAr?: string | null }[],
  language: Language,
): Record<string, string> {
  if (language !== "ar") return {};
  return Object.fromEntries(
    products
      .filter((product) => product.nameAr?.trim())
      .map((product) => [product.id, product.nameAr!.trim()]),
  );
}

/** Arabic product names for server pages that list order lines. */
export async function getLocalizedProductNames(
  audience: CatalogAudience,
  language: Language,
): Promise<Record<string, string>> {
  if (language !== "ar") return {};
  const { products } = await getProducts({ audience, language });
  return localizedProductNames(products, language);
}
