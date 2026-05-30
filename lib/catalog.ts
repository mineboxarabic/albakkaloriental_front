import "server-only";
import { backendFetch, ApiClientError } from "@/lib/api-client";

export { getTierPrice, formatPriceEUR, type TierPriceInput } from "@/lib/catalog-pricing";

export type CatalogAudience = "retail" | "pro";

export type ProductCard = {
  id: string;
  name: string;
  sku: string;
  category: string;
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
  isOutOfStock?: boolean;
};

function toProductCard(p: BackendCatalogProduct): ProductCard {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
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
    isOutOfStock: p.isOutOfStock ?? false,
  };
}

async function fetchCatalog(
  audience: CatalogAudience,
): Promise<{ products: BackendCatalogProduct[]; backendDown: boolean }> {
  const path =
    audience === "retail" ? "/api/v1/retail/catalog" : "/api/v1/b2b/catalog";
  if (audience === "retail") {
    try {
      const data = await backendFetch<{ products: BackendCatalogProduct[] }>(path, {
        auth: "optional",
      });
      return { products: data.products, backendDown: false };
    } catch (err) {
      // 401 = no session cookie yet; not a server failure, just unauthenticated
      if (err instanceof ApiClientError && err.status === 401) {
        return { products: [], backendDown: false };
      }
      return { products: [], backendDown: true };
    }
  }
  const data = await backendFetch<{ products: BackendCatalogProduct[] }>(path, {
    auth: audience === "retail" ? "none" : "required",
  });
  return { products: data.products, backendDown: false };
}

export async function getProducts(opts: {
  audience: CatalogAudience;
  category?: string;
  take?: number;
  skip?: number;
}): Promise<{ products: ProductCard[]; backendDown: boolean }> {
  const { products: all, backendDown } = await fetchCatalog(opts.audience);
  const filtered = opts.category
    ? all.filter((p) => p.category === opts.category)
    : all;
  const skip = opts.skip ?? 0;
  const take = opts.take ?? filtered.length;
  return { products: filtered.slice(skip, skip + take).map(toProductCard), backendDown };
}

export async function getProduct(
  id: string,
  audience: CatalogAudience,
): Promise<ProductCard | null> {
  const { products: all } = await fetchCatalog(audience);
  const found = all.find((p) => p.id === id);
  return found ? toProductCard(found) : null;
}

export async function getCategories(audience: CatalogAudience): Promise<string[]> {
  const { products: all } = await fetchCatalog(audience);
  return Array.from(new Set(all.map((p) => p.category))).sort();
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
