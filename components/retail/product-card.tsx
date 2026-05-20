import Image from "next/image";
import Link from "next/link";
import type { ProductCard as ProductCardData } from "@/lib/catalog";
import { COLORS, buildWeightLabel, productImage } from "@/lib/ui";
import { QuickAddButton } from "@/components/retail/quick-add-button";
import { PriceTag } from "@/components/retail/price-tag";

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <article
      className="flex flex-col overflow-hidden rounded-lg border bg-white transition hover:shadow-sm"
      style={{ borderColor: COLORS.border }}
    >
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
          <QuickAddButton
            item={{
              productId: product.id,
              name: product.name,
              unitPrice: product.sellingPrice,
              imageUrl: product.imageUrl,
            }}
          />
        </div>
      </div>
    </article>
  );
}
