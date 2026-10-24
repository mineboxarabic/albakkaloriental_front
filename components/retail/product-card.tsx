import { TranslatedText } from "@/components/translated-text";
import Image from "next/image";
import Link from "next/link";
import type { ProductCard as ProductCardData } from "@/lib/catalog";
import { COLORS, buildUnitLabel, productImage } from "@/lib/ui";
import { QuickAddButton } from "@/components/retail/quick-add-button";
import { PriceTag } from "@/components/retail/price-tag";
import { translate } from "@/lib/translations";
import type { Language } from "@/lib/language";

export function ProductCard({
  product,
  language = "fr",
}: {
  product: ProductCardData;
  language?: Language;
}) {
  const oos = product.isOutOfStock;
  const unitLabel = buildUnitLabel(product.baseUnit, false, language);
  return (
    <article
      className="relative flex flex-col overflow-hidden rounded-lg border bg-white transition hover:shadow-sm"
      style={{
        borderColor: COLORS.border,
        opacity: oos ? 0.75 : 1,
      }}
    >
      {oos && (
        <span
          className="absolute end-2 top-2 z-10 rounded-sm px-2 py-0.5 text-[10px] font-extrabold tracking-[0.1em]"
          style={{ background: "#D52B14", color: "#FFFFFF" }}
        >
          <TranslatedText value={"RUPTURE"} />{" "}
        </span>
      )}
      <Link
        href={`/products/${product.id}`}
        className="block h-[140px] w-full"
        style={{ background: COLORS.beige }}
      >
        <Image
          src={productImage(product.imageUrl)}
          alt={product.name}
          width={240}
          height={240}
          className="h-full w-full object-cover"
          style={{ filter: oos ? "grayscale(0.6)" : undefined }}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-3">
        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 min-h-[34px] text-[12.5px] font-semibold leading-tight"
          style={{ color: COLORS.text }}
        >
          {product.name}
        </Link>
        {unitLabel && (
          <div className="text-[11px]" style={{ color: COLORS.muted }}>
            {unitLabel}
          </div>
        )}
        <div className="mt-1 flex items-center justify-between">
          <PriceTag value={product.sellingPrice} />
          {oos ? (
            <button
              type="button"
              disabled
              className="grid h-9 w-9 place-items-center rounded-md text-[11px] font-bold"
              style={{
                background: "#F0F0F0",
                color: "#999",
                cursor: "not-allowed",
              }}
              aria-label={translate("Indisponible", language)}
              title={translate("Indisponible", language)}
            >
              —
            </button>
          ) : (
            <QuickAddButton
              item={{
                productId: product.id,
                name: product.name,
                unitPrice: product.sellingPrice,
                imageUrl: product.imageUrl,
              }}
            />
          )}
        </div>
      </div>
    </article>
  );
}
