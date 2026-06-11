import { formatPriceEUR } from "@/lib/catalog-pricing";
import { COLORS } from "@/lib/ui";

// B2C retail prices are public: always shown, no login required.
export function PriceTag({
  value,
  size = "card",
}: {
  value: number;
  size?: "card" | "hero";
}) {
  const cls =
    size === "hero" ? "text-[30px] font-extrabold" : "text-[14px] font-extrabold";
  const color = size === "hero" ? COLORS.primary : COLORS.text;

  return (
    <span className={cls} style={{ color }}>
      {formatPriceEUR(value)}
    </span>
  );
}
