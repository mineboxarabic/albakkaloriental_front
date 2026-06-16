import "server-only";
import { backendFetch, ApiClientError } from "@/lib/api-client";

export { getTierPrice, formatPriceEUR, type TierPriceInput } from "@/lib/catalog-pricing";

export type CatalogAudience = "retail" | "pro";

export type ProductCard = {
  id: string;
  name: string;
  sku: string;
  category: string;
  marques: string[];
  imageUrl: string | null;
  unitsPerPack: number;
  baseUnit: string;
  sellingPrice: number;
  unitSellingPrice: number | null;
  priceLevelC: number | null;
  priceLevelD: number | null;
  priceLevelE: number | null;
  priceLevelF: number | null;
  /**
   * Effective price for the viewer (already resolved by the back-end:
   * retail = sellingPrice, B2B = priceLevel{C|D|E|F} of the customer).
   */
  effectivePrice: number;
  isOutOfStock: boolean;
};

type BackendCatalogProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  marques?: string[];
  imageUrl: string | null;
  unitsPerPack: number;
  baseUnit: string;
  visibility: "RETAIL" | "WHOLESALE" | "BOTH";
  sellingPrice: number;
  unitSellingPrice: number | null;
  priceLevelC: number | null;
  priceLevelD: number | null;
  priceLevelE: number | null;
  priceLevelF: number | null;
  price: number;
  /** B2C out-of-stock is manual (admin-set). B2B uses real stock via isOutOfStock. */
  retailStatus?: "VISIBLE" | "OUT_OF_STOCK" | "HIDDEN";
  wholesaleStatus?: "VISIBLE" | "HIDDEN";
  /** Legacy names kept for compatibility with older catalog API responses. */
  b2cStatus?: "VISIBLE" | "OUT_OF_STOCK" | "HIDDEN";
  b2bStatus?: "VISIBLE" | "HIDDEN";
  /** Still sent by B2B endpoint: computed from real stock quantity. */
  isOutOfStock?: boolean;
  isActive?: boolean;
};

function toProductCard(p: BackendCatalogProduct, audience: CatalogAudience): ProductCard {
  const isOutOfStock =
    audience === "retail"
      ? getRetailStatus(p) === "OUT_OF_STOCK"
      : (p.isOutOfStock ?? false);
  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    marques: p.marques ?? [],
    imageUrl: p.imageUrl,
    unitsPerPack: p.unitsPerPack,
    baseUnit: p.baseUnit,
    sellingPrice: p.sellingPrice,
    unitSellingPrice: p.unitSellingPrice,
    priceLevelC: p.priceLevelC,
    priceLevelD: p.priceLevelD,
    priceLevelE: p.priceLevelE,
    priceLevelF: p.priceLevelF,
    effectivePrice: p.price,
    isOutOfStock,
  };
}

function getRetailStatus(
  p: BackendCatalogProduct,
): "VISIBLE" | "OUT_OF_STOCK" | "HIDDEN" {
  return p.retailStatus ?? p.b2cStatus ?? "VISIBLE";
}

function getWholesaleStatus(p: BackendCatalogProduct): "VISIBLE" | "HIDDEN" {
  return p.wholesaleStatus ?? p.b2bStatus ?? "VISIBLE";
}

function isVisibleForAudience(
  p: BackendCatalogProduct,
  audience: CatalogAudience,
): boolean {
  return audience === "retail"
    ? p.visibility === "RETAIL" || p.visibility === "BOTH"
    : p.visibility === "WHOLESALE" || p.visibility === "BOTH";
}

function isHidden(p: BackendCatalogProduct, audience: CatalogAudience): boolean {
  if (p.isActive === false || !isVisibleForAudience(p, audience)) return true;

  return audience === "retail"
    ? getRetailStatus(p) === "HIDDEN"
    : getWholesaleStatus(p) === "HIDDEN";
}

async function fetchCatalog(
  audience: CatalogAudience,
): Promise<{ products: BackendCatalogProduct[]; backendDown: boolean }> {
  const path =
    audience === "retail" ? "/api/v1/retail/catalog" : "/api/v1/b2b/catalog";
  // Both audiences browse with optional auth: the back-end returns prices when a
  // valid session is present and a price-stripped catalog otherwise (B2B guests).
  try {
    const data = await backendFetch<{ products: BackendCatalogProduct[] }>(path, {
      auth: "optional",
    });
    return { products: data.products, backendDown: false };
  } catch (err) {
    // 401 = no/expired session; not a server failure, just unauthenticated
    if (err instanceof ApiClientError && err.status === 401) {
      return { products: [], backendDown: false };
    }
    return { products: [], backendDown: true };
  }
}

export async function getProducts(opts: {
  audience: CatalogAudience;
  category?: string;
  marque?: string;
  take?: number;
  skip?: number;
}): Promise<{ products: ProductCard[]; backendDown: boolean }> {
  const { products: all, backendDown } = await fetchCatalog(opts.audience);
  const visible = all.filter((p) => !isHidden(p, opts.audience));
  const categoryFilter = opts.category?.trim().toLowerCase();
  const byCategory = categoryFilter
    ? visible.filter((p) => {
        const productCategories = p.category
          ? p.category.split(",").map((c) => c.trim().toLowerCase())
          : [];
        return productCategories.includes(categoryFilter);
      })
    : visible;
  const marqueFilter = opts.marque?.trim().toLowerCase();
  const filtered = marqueFilter
    ? byCategory.filter((p) =>
        (p.marques ?? []).some((m) => m.trim().toLowerCase() === marqueFilter),
      )
    : byCategory;
  const skip = opts.skip ?? 0;
  const take = opts.take ?? filtered.length;
  return {
    products: filtered.slice(skip, skip + take).map((p) => toProductCard(p, opts.audience)),
    backendDown,
  };
}

export async function getProduct(
  id: string,
  audience: CatalogAudience,
): Promise<ProductCard | null> {
  const { products: all } = await fetchCatalog(audience);
  const found = all.find((p) => p.id === id);
  if (!found || isHidden(found, audience)) return null;
  return toProductCard(found, audience);
}

export type MarqueItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  productCount: number;
};

/** Public brand list (id, name, logo, product count). Shared by retail + pro. */
export async function getMarques(): Promise<MarqueItem[]> {
  try {
    const data = await backendFetch<{ marques: MarqueItem[] }>(
      "/api/v1/public/marques",
      { auth: "none" },
    );
    return data.marques;
  } catch (err) {
    console.error("Failed to fetch marques:", err);
    return [];
  }
}

export type CategoryItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  isFeatured: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCategories(audience: CatalogAudience): Promise<string[]> {
  try {
    const data = await backendFetch<{ categories: { name: string }[] }>(
      "/api/v1/public/categories",
      { auth: "none" },
    );
    return data.categories.map((c) => c.name);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return [];
  }
}

/**
 * Featured categories (admin-curated via the dashboard) for the homepage.
 * Returns only categories flagged isFeatured, with their logo/image.
 * Silently degrades to [] if the back-end is unreachable.
 */
export async function getFeaturedCategories(): Promise<CategoryItem[]> {
  try {
    const data = await backendFetch<{ categories: CategoryItem[] }>(
      "/api/v1/public/categories",
      { auth: "none" },
    );
    return data.categories.filter((c) => c.isFeatured);
  } catch (err) {
    console.error("Failed to fetch featured categories:", err);
    return [];
  }
}

// Upcoming deliveries: public read on Delivery v2 (multi-cities, ordered).
// Silently degrades to [] if the back-end is unreachable so the home page
// stays useful.
export type UpcomingDeliveryCity = {
  id: string;
  name: string;
  position: number;
};

export type UpcomingDelivery = {
  id: string;
  scheduledDate: Date;
  comment: string | null;
  cities: UpcomingDeliveryCity[];
};

type BackendUpcomingDelivery = {
  id: string;
  scheduledDate: string;
  comment: string | null;
  cities: UpcomingDeliveryCity[];
};

export async function getUpcomingDeliveries(
  limit = 6,
): Promise<UpcomingDelivery[]> {
  try {
    const data = await backendFetch<{ deliveries: BackendUpcomingDelivery[] }>(
      `/api/v1/public/deliveries/upcoming?limit=${limit}`,
      { auth: "none" },
    );
    return data.deliveries.map((d) => ({
      id: d.id,
      scheduledDate: new Date(d.scheduledDate),
      comment: d.comment,
      cities: d.cities,
    }));
  } catch {
    return [];
  }
}
