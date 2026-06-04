import { PRODUCT_PLACEHOLDER } from "@/lib/ui";

export type CategoryDisplay = {
  name: string;
  image: string;
  order: number;
  isConfigured: boolean;
};

type CategoryDisplayConfig = {
  image: string;
  order: number;
};

export const FALLBACK_CATEGORY_NAMES = [
  "CONFISERIES",
  "BOISSONS",
  "EPICES",
  "PRODUITS FRAIS",
  "HUILES",
  "CONSERVES",
  "RIZ ET PATES",
] as const;

const CATEGORY_DISPLAY_BY_KEY: Record<string, CategoryDisplayConfig> = {
  CONFISERIES: {
    image: PRODUCT_PLACEHOLDER,
    order: 10,
  },
  BOISSONS: {
    image: PRODUCT_PLACEHOLDER,
    order: 20,
  },
  EPICES: {
    image: PRODUCT_PLACEHOLDER,
    order: 30,
  },
  "PRODUITS FRAIS": {
    image: PRODUCT_PLACEHOLDER,
    order: 40,
  },
  HUILES: {
    image: PRODUCT_PLACEHOLDER,
    order: 50,
  },
  CONSERVES: {
    image: PRODUCT_PLACEHOLDER,
    order: 60,
  },
  "RIZ ET PATES": {
    image: PRODUCT_PLACEHOLDER,
    order: 70,
  },
};

export function normalizeCategoryKey(category: string): string {
  return category
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toUpperCase();
}

export function getCategoryDisplay(category: string): CategoryDisplay {
  const name = category.trim();
  const config = CATEGORY_DISPLAY_BY_KEY[normalizeCategoryKey(name)];

  return {
    name,
    image: config?.image ?? PRODUCT_PLACEHOLDER,
    order: config?.order ?? 1000,
    isConfigured: Boolean(config),
  };
}

export function getDisplayCategories(categories: readonly string[]): CategoryDisplay[] {
  const seen = new Set<string>();

  return categories
    .map((category) => getCategoryDisplay(category))
    .filter((category) => {
      const key = normalizeCategoryKey(category.name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name, "fr", { sensitivity: "base" });
    });
}

export function getOrderedCategoryNames(categories: readonly string[]): string[] {
  return getDisplayCategories(categories).map((category) => category.name);
}
