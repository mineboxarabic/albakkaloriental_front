import Image from "next/image";
import Link from "next/link";
import type { ProductCard as ProductCardData } from "@/lib/catalog";
import { COLORS, buildWeightLabel, productImage } from "@/lib/ui";
import { QuickAddButton } from "@/components/retail/quick-add-button";
import { PriceTag } from "@/components/retail/price-tag";

export function ProductCard({ product }: { product: ProductCardData }) {
  const oos = product.isOutOfStock;
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
          className="absolute right-2 top-2 z-10 rounded-sm px-2 py-0.5 text-[10px] font-extrabold tracking-[0.1em]"
          style={{ background: "#D52B14", color: "#FFFFFF" }}
        >
          RUPTURE
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
        <div className="text-[11px]" style={{ color: COLORS.muted }}>
          {buildWeightLabel(product)}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <PriceTag value={product.sellingPrice} />
          {oos ? (
            <button
              type="button"
              disabled
              className="grid h-8 w-8 place-items-center rounded-md text-[11px] font-bold"
              style={{ background: "#F0F0F0", color: "#999", cursor: "not-allowed" }}
              aria-label="Indisponible"
              title="Indisponible"
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
