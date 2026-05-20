import type { ProductCard } from "@/lib/catalog";

export const DISPLAY_FONT = "'Satoshi', var(--font-poppins), sans-serif";

export const PRODUCT_PLACEHOLDER = "/Assets/img/product-placeholder.jpg";

export function productImage(imageUrl: string | null | undefined): string {
  return imageUrl && imageUrl.length > 0 ? imageUrl : PRODUCT_PLACEHOLDER;
}

export const COLORS = {
  primary: "#3F561F",
  bg: "#FAF8F2",
  beige: "#F0EBDD",
  text: "#171717",
  muted: "#6B665D",
  border: "#DDD8CC",
  red: "#D52B14",
  yellow: "#F2C400",
} as const;

export function buildWeightLabel(p: Pick<ProductCard, "baseUnit" | "unitsPerPack">): string {
  const unitMap: Record<string, string> = {
    KILOGRAM: "kg",
    LITER: "L",
    PIECE: "u.",
  };
  const u = unitMap[p.baseUnit] ?? p.baseUnit.toLowerCase();
  return p.unitsPerPack > 1 ? `${p.unitsPerPack} × ${u}` : u;
}
