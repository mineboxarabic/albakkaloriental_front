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
  const [categories, { products }] = await Promise.all([
    getCategoryItems(),
    getProducts({ audience }),
  ]);
  return buildCategoryNavigation(categories, products, language);
}
