import { containsPhrase, getTokenMatchScore, normalizeSearchText, tokenizeSearchQuery } from "@/lib/text-search";

export type SearchableCatalogProduct = {
  name: string;
  nameFr?: string;
  nameAr?: string | null;
  sku: string;
  category: string;
  categoryAr?: string | null;
  subcategory?: string | null;
  subcategoryAr?: string | null;
  marques: string[];
  tags?: string[];
};

interface WeightedField {
  value: string;
  weight: number;
}

interface IndexedProduct {
  names: string[];
  sku: string;
  fields: WeightedField[];
}

const EXACT_SKU_SCORE = 9_500;
const EXACT_NAME_SCORE = 9_000;
const NAME_PREFIX_SCORE = 8_000;
const NAME_PHRASE_BONUS = 150;

const indexCache = new WeakMap<SearchableCatalogProduct, IndexedProduct>();

function weighted(values: Array<string | null | undefined>, weight: number): WeightedField[] {
  return values
    .map((value) => normalizeSearchText(value ?? ""))
    .filter(Boolean)
    .map((value) => ({ value, weight }));
}

/** Catalog cards are rebuilt per request, so each one is normalized once per search. */
function getIndex(product: SearchableCatalogProduct): IndexedProduct {
  const cached = indexCache.get(product);
  if (cached) return cached;

  const nameFields = weighted([product.name, product.nameFr, product.nameAr], 50);
  const names = [...new Set(nameFields.map((field) => field.value))];
  const index: IndexedProduct = {
    names,
    sku: normalizeSearchText(product.sku),
    fields: [
      ...names.map((value) => ({ value, weight: 50 })),
      ...weighted([product.sku], 40),
      ...weighted([...product.marques, ...(product.tags ?? [])], 20),
      ...weighted([product.category, product.categoryAr, product.subcategory, product.subcategoryAr], 10),
    ],
  };
  indexCache.set(product, index);
  return index;
}

function getBestFieldScore(fields: WeightedField[], token: string): number | null {
  let best: number | null = null;
  for (const field of fields) {
    const score = getTokenMatchScore(field.value, token);
    if (score !== null && (best === null || score + field.weight > best)) best = score + field.weight;
  }
  return best;
}

/**
 * Relevance of a catalog product for a French or Arabic query, whatever language the
 * catalog is displayed in. Null means the product does not match.
 */
export function getCatalogSearchScore(product: SearchableCatalogProduct, search: string): number | null {
  const tokens = tokenizeSearchQuery(search);
  if (tokens.length === 0) return 0;

  const query = normalizeSearchText(search);
  const { names, sku, fields } = getIndex(product);

  if (query === sku) return EXACT_SKU_SCORE;
  if (names.includes(query)) return EXACT_NAME_SCORE;

  const prefixed = names.filter((name) => name.startsWith(query));
  if (prefixed.length > 0) return NAME_PREFIX_SCORE - Math.min(Math.min(...prefixed.map((name) => name.length)), 200);

  let score = 0;
  for (const token of tokens) {
    const tokenScore = getBestFieldScore(fields, token);
    if (tokenScore === null) return null;
    score += tokenScore;
  }

  return score + (names.some((name) => containsPhrase(name, tokens)) ? NAME_PHRASE_BONUS : 0);
}

/** Keeps the products matching the query, closest match first; ties keep their incoming order. */
export function searchCatalogProducts<T extends SearchableCatalogProduct>(products: T[], search: string): T[] {
  if (tokenizeSearchQuery(search).length === 0) return products;

  return products
    .map((product, position) => ({ product, position, score: getCatalogSearchScore(product, search) }))
    .filter((entry): entry is { product: T; position: number; score: number } => entry.score !== null)
    .sort((left, right) => right.score - left.score || left.position - right.position)
    .map(({ product }) => product);
}
