import "server-only";
import { backendFetch } from "@/lib/api-client";

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
  };
}

async function fetchCatalog(audience: CatalogAudience): Promise<BackendCatalogProduct[]> {
  const path =
    audience === "retail" ? "/api/v1/retail/catalog" : "/api/v1/b2b/catalog";
  const data = await backendFetch<{ products: BackendCatalogProduct[] }>(path, {
    auth: "required",
  });
  return data.products;
}

export async function getProducts(opts: {
  audience: CatalogAudience;
  category?: string;
  take?: number;
  skip?: number;
}): Promise<ProductCard[]> {
  const all = await fetchCatalog(opts.audience);
  const filtered = opts.category
    ? all.filter((p) => p.category === opts.category)
    : all;
  const skip = opts.skip ?? 0;
  const take = opts.take ?? filtered.length;
  return filtered.slice(skip, skip + take).map(toProductCard);
}

export async function getProduct(
  id: string,
  audience: CatalogAudience,
): Promise<ProductCard | null> {
  const all = await fetchCatalog(audience);
  const found = all.find((p) => p.id === id);
  return found ? toProductCard(found) : null;
}

export async function getCategories(audience: CatalogAudience): Promise<string[]> {
  const all = await fetchCatalog(audience);
  return Array.from(new Set(all.map((p) => p.category))).sort();
}

// Upcoming deliveries: temporarily returns an empty list until the back-end
// exposes a public read endpoint over the new Delivery v2 model.
// Tracked as F.K in backlog.md.
export type UpcomingDelivery = {
  id: string;
  city: string;
  scheduledDate: Date;
  note: string | null;
};

export async function getUpcomingDeliveries(
  _limit = 6,
): Promise<UpcomingDelivery[]> {
  return [];
}
