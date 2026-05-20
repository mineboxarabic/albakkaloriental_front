import "server-only";
import { ProductVisibility } from "@prisma/client";
import prisma from "@/lib/prisma";

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
  priceLevelC: number | null;
  priceLevelD: number | null;
  priceLevelE: number | null;
  priceLevelF: number | null;
};

const productCardSelect = {
  id: true,
  name: true,
  sku: true,
  category: true,
  imageUrl: true,
  unitsPerPack: true,
  baseUnit: true,
  sellingPrice: true,
  priceLevelC: true,
  priceLevelD: true,
  priceLevelE: true,
  priceLevelF: true,
} as const;

function visibilityFilter(audience: CatalogAudience) {
  const values: ProductVisibility[] =
    audience === "retail"
      ? [ProductVisibility.RETAIL, ProductVisibility.BOTH]
      : [ProductVisibility.WHOLESALE, ProductVisibility.BOTH];
  return { visibility: { in: values } };
}

export async function getProducts(opts: {
  audience: CatalogAudience;
  category?: string;
  take?: number;
  skip?: number;
}): Promise<ProductCard[]> {
  const { audience, category, take, skip } = opts;
  return prisma.product.findMany({
    where: {
      ...visibilityFilter(audience),
      ...(category ? { category } : {}),
    },
    select: productCardSelect,
    orderBy: { name: "asc" },
    take,
    skip,
  });
}

export async function getProduct(
  id: string,
  audience: CatalogAudience,
): Promise<ProductCard | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: productCardSelect,
  });
  if (!product) return null;
  // Enforce visibility for the audience.
  const visibility = await prisma.product.findUnique({
    where: { id },
    select: { visibility: true },
  });
  if (!visibility) return null;
  if (audience === "retail" && visibility.visibility === "WHOLESALE") return null;
  if (audience === "pro" && visibility.visibility === "RETAIL") return null;
  return product;
}

export async function getCategories(
  audience: CatalogAudience,
): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: visibilityFilter(audience),
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

export type UpcomingDelivery = {
  id: string;
  city: string;
  scheduledDate: Date;
  note: string | null;
};

export async function getUpcomingDeliveries(
  limit = 6,
): Promise<UpcomingDelivery[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.deliverySchedule.findMany({
    where: { isActive: true, scheduledDate: { gte: today } },
    orderBy: { scheduledDate: "asc" },
    take: limit,
    select: { id: true, city: true, scheduledDate: true, note: true },
  });
}

