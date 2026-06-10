import Image from "next/image";
import Link from "next/link";
import { Package, Box, AlertCircle } from "lucide-react";
type PricingLevel = "C" | "D" | "E" | "F";
import type { ProductCard as ProductCardData } from "@/lib/catalog";
import {
  formatPriceEUR,
  resolveProPrice,
  supportsUnitSale,
} from "@/lib/catalog-pricing";
import { COLORS, buildWeightLabel, productImage } from "@/lib/ui";

export function ProProductCard({
  product,
  pricingLevel,
}: {
  product: ProductCardData;
  pricingLevel: PricingLevel | null;
}) {
  const packPrice = resolveProPrice(product, "PACK", pricingLevel);
  const hasUnit = supportsUnitSale(product);
  const unitPrice = hasUnit ? resolveProPrice(product, "UNIT", pricingLevel) : null;
  const isOutOfStock = product.isOutOfStock;

  return (
    <article
      className="relative flex flex-col overflow-hidden rounded-sm border bg-white transition hover:shadow-md"
      style={{ borderColor: COLORS.border, opacity: isOutOfStock ? 0.85 : 1 }}
    >
      {isOutOfStock && (
        <span
          className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10px] font-bold tracking-[0.1em] text-white"
          style={{ background: COLORS.red }}
        >
          <AlertCircle className="h-3 w-3" strokeWidth={2.4} />
          RUPTURE
        </span>
      )}
      <Link
        href={`/pro/products/${product.id}`}
        className="block h-[140px] w-full"
        style={{ background: COLORS.beige }}
      >
        <Image
          src={productImage(product.imageUrl)}
          alt={product.name}
          width={240}
          height={240}
          className="h-full w-full object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-3">
        <div
          className="text-[10.5px] font-bold tracking-[0.12em]"
          style={{ color: COLORS.muted }}
        >
          {product.sku}
        </div>
        <Link
          href={`/pro/products/${product.id}`}
          className="line-clamp-2 min-h-[34px] text-[12.5px] font-semibold leading-tight"
          style={{ color: COLORS.text }}
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: COLORS.muted }}>
          <Package className="h-3 w-3" strokeWidth={2} />
          {product.unitsPerPack > 1
            ? `Carton de ${product.unitsPerPack} ${buildUnitNoun(product.baseUnit)}`
            : buildWeightLabel(product)}
        </div>

        {/* Mobile: simple label/value rows */}
        <div
          className="mt-1 flex flex-col gap-1.5 rounded-sm border px-3 py-2.5 sm:hidden"
          style={{ borderColor: COLORS.border }}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span
              className="text-[10px] font-bold tracking-[0.1em]"
              style={{ color: COLORS.muted }}
            >
              CARTON
            </span>
            <span className="text-[15px] font-extrabold leading-none" style={{ color: COLORS.primary }}>
              {formatPriceEUR(packPrice)}
            </span>
          </div>
          {hasUnit && unitPrice != null && (
            <div
              className="flex items-baseline justify-between gap-2 border-t pt-1.5"
              style={{ borderColor: COLORS.border }}
            >
              <span
                className="text-[10px] font-bold tracking-[0.1em]"
                style={{ color: COLORS.muted }}
              >
                UNITÉ
              </span>
              <span className="text-[14px] font-extrabold leading-none" style={{ color: COLORS.text }}>
                {formatPriceEUR(unitPrice)}
              </span>
            </div>
          )}
        </div>

        {/* sm+ : boxed tiles */}
        <div
          className="mt-1 hidden gap-px overflow-hidden rounded-sm border sm:grid"
          style={{
            borderColor: COLORS.border,
            background: COLORS.border,
            gridTemplateColumns: hasUnit ? "1fr 1fr" : "1fr",
          }}
        >
          <PriceBlock
            icon={<Package className="h-3 w-3" strokeWidth={2} />}
            label="PAR CARTON"
            price={packPrice}
            primary
          />
          {hasUnit && unitPrice != null && (
            <PriceBlock
              icon={<Box className="h-3 w-3" strokeWidth={2} />}
              label="À L'UNITÉ"
              price={unitPrice}
            />
          )}
        </div>

        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="mt-1 grid h-9 cursor-not-allowed place-items-center rounded-sm text-[11.5px] font-bold uppercase tracking-[0.1em] text-white"
            style={{ background: "#999" }}
          >
            Indisponible
          </button>
        ) : (
          <Link
            href={`/pro/products/${product.id}`}
            className="mt-1 grid h-9 place-items-center rounded-sm text-[11.5px] font-bold uppercase tracking-[0.1em] text-white"
            style={{ background: COLORS.primary }}
          >
            Ajouter au devis
          </Link>
        )}
      </div>
    </article>
  );
}

function PriceBlock({
  icon,
  label,
  price,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  price: number;
  primary?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center gap-0.5 px-2 py-2"
      style={{ background: "#FFFFFF" }}
    >
      <div
        className="flex items-center gap-1 text-[9.5px] font-bold tracking-[0.1em]"
        style={{ color: COLORS.muted }}
      >
        {icon}
        {label}
      </div>
      <div
        className="text-[14px] font-extrabold leading-none"
        style={{ color: primary ? COLORS.primary : COLORS.text }}
      >
        {formatPriceEUR(price)}
      </div>
    </div>
  );
}

function buildUnitNoun(baseUnit: string): string {
  switch (baseUnit) {
    case "KILOGRAM":
      return "kg";
    case "LITER":
      return "L";
    case "PIECE":
      return "u.";
    default:
      return baseUnit.toLowerCase();
  }
}
