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

export function buildUnitLabel(baseUnit: string, includePieceUnit = false): string {
  const unitMap: Record<string, string> = {
    KILOGRAM: "kg",
    LITER: "L",
    PIECE: includePieceUnit ? "u." : "",
  };
  return unitMap[baseUnit] ?? baseUnit.toLowerCase();
}

export function buildQuantityLabel(
  quantity: number,
  baseUnit: string,
  includePieceUnit = false,
): string {
  const unitLabel = buildUnitLabel(baseUnit, includePieceUnit);
  return unitLabel ? `${quantity} ${unitLabel}` : String(quantity);
}
