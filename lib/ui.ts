// Latin web fonts come first and carry no Arabic glyphs, so Arabic text falls
// through to the self-hosted Arabic faces declared in app/globals.css.
const ARABIC_SANS = "var(--font-arabic)";
const ARABIC_DISPLAY = "var(--font-arabic-display)";

export const DISPLAY_FONT = `'Satoshi', var(--font-poppins), ${ARABIC_DISPLAY}, ${ARABIC_SANS}, sans-serif`;
export const BODY_FONT = `var(--font-poppins), 'Satoshi', ${ARABIC_SANS}, system-ui, sans-serif`;
// The Inter / JetBrains Mono variables were never loaded, so those stacks
// always resolved to the body font. Keep that look explicitly.
export const INTER_FONT = "inherit";
export const MONO_FONT = "inherit";

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

export function buildUnitLabel(
  baseUnit: string,
  includePieceUnit = false,
  language: "fr" | "ar" = "fr",
): string {
  const unitMap: Record<string, string> =
    language === "ar"
      ? { KILOGRAM: "كغ", LITER: "لتر", PIECE: includePieceUnit ? "قطعة" : "" }
      : { KILOGRAM: "kg", LITER: "L", PIECE: includePieceUnit ? "u." : "" };
  return unitMap[baseUnit] ?? baseUnit.toLowerCase();
}

export function buildQuantityLabel(
  quantity: number,
  baseUnit: string,
  includePieceUnit = false,
  language: "fr" | "ar" = "fr",
): string {
  const unitLabel = buildUnitLabel(baseUnit, includePieceUnit, language);
  return unitLabel ? `${quantity} ${unitLabel}` : String(quantity);
}
