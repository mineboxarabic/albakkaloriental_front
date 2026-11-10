import { TranslatedText } from "@/components/translated-text";
import Image from "next/image";
import Link from "next/link";
import { Package, AlertCircle } from "lucide-react";
import type { ProductCard as ProductCardData } from "@/lib/catalog";
import { resolveProPrice, supportsUnitSale } from "@/lib/catalog-pricing";
import {
  COLORS,
  buildQuantityLabel,
  buildUnitLabel,
  productImage,
} from "@/lib/ui";
import { translate } from "@/lib/translations";
import type { Language } from "@/lib/language";
import { ProductAdminActions } from "@/components/admin/product-admin-actions";
import { ProProductCardActions } from "@/components/pro/pro-product-card-actions";

export function ProProductCard({
  product,
  authenticated = true,
  language = "fr",
}: {
  product: ProductCardData;
  authenticated?: boolean;
  language?: Language;
}) {
  const packPrice = resolveProPrice(product, "PACK");
  const hasUnit = supportsUnitSale(product);
  const unitPrice = hasUnit
    ? resolveProPrice(product, "UNIT")
    : null;
  const isOutOfStock = product.isOutOfStock;
  const packagingLabel =
    product.unitsPerPack > 1
      ? translate("Carton de {quantity}", language, {
          quantity: buildQuantityLabel(
            product.unitsPerPack,
            product.baseUnit,
            true,
            language,
          ),
        })
      : buildUnitLabel(product.baseUnit, true, language);

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-sm border bg-white transition hover:shadow-md"
      style={{ borderColor: COLORS.border, opacity: isOutOfStock ? 0.85 : 1 }}
    >
      <ProductAdminActions productId={product.id} />
      {isOutOfStock && (
        <span
          className="absolute start-2 top-2 z-10 inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10px] font-bold tracking-[0.1em] text-white"
          style={{ background: COLORS.red }}
        >
          <AlertCircle className="h-3 w-3" strokeWidth={2.4} />
          <TranslatedText value={"RUPTURE"} />{" "}
        </span>
      )}
      <Link
        href={`/pro/products/${product.id}`}
        prefetch={false}
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
          prefetch={false}
          className="line-clamp-2 min-h-[34px] text-[12.5px] font-semibold leading-tight"
          style={{ color: COLORS.text }}
        >
          {product.name}
        </Link>

        {packagingLabel && (
          <div
            className="flex items-center gap-1.5 text-[11px]"
            style={{ color: COLORS.muted }}
          >
            <Package className="h-3 w-3" strokeWidth={2} />
            {packagingLabel}
          </div>
        )}

        {authenticated && !isOutOfStock && product.availableStock != null && (
          <div
            className="text-[10.5px] font-medium"
            style={{ color: COLORS.muted }}
          >
            {formatAvailableStock(
              product.availableStock,
              product.unitsPerPack,
              product.baseUnit,
              language,
            )}
          </div>
        )}

        {/* Pinned to the bottom so prices and buttons line up across a row. */}
        <div className="mt-auto flex flex-col gap-2 pt-1">
          {authenticated ? (
            <>
              <ProProductCardActions
                productId={product.id}
                name={product.name}
                imageUrl={product.imageUrl}
                unitsPerPack={product.unitsPerPack}
                baseUnit={product.baseUnit}
                packPrice={packPrice}
                unitPrice={unitPrice}
                isOutOfStock={isOutOfStock}
                availableStock={product.availableStock}
              />
              {isOutOfStock && (
                <button
                  type="button"
                  disabled
                  className="grid h-9 cursor-not-allowed place-items-center rounded-sm text-[11.5px] font-bold uppercase tracking-[0.1em] text-white"
                  style={{ background: "#999" }}
                >
                  <TranslatedText value={"Indisponible"} />{" "}
                </button>
              )}
            </>
          ) : (
            <>
              <div
                className="rounded-sm border px-3 py-2.5 text-center text-[11.5px] font-semibold"
                style={{
                  borderColor: COLORS.border,
                  background: COLORS.beige,
                  color: COLORS.muted,
                }}
              >
                <TranslatedText value={"Connectez-vous pour voir le prix"} />{" "}
              </div>
              <Link
                href="/pro/login"
                className="grid h-9 place-items-center rounded-sm text-[11.5px] font-bold uppercase tracking-[0.1em]"
                style={{
                  background: "#FFFFFF",
                  color: COLORS.primary,
                  border: `1px solid ${COLORS.primary}`,
                }}
              >
                <TranslatedText value={"Se connecter"} />{" "}
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function formatAvailableStock(
  availableStock: number,
  unitsPerPack: number,
  baseUnit: string,
  language: Language = "fr",
): string {
  if (unitsPerPack > 1) {
    const cartons = Math.floor(availableStock / unitsPerPack);
    return translate(
      cartons > 1 ? "{count} cartons disponibles" : "{count} carton disponible",
      language,
      { count: cartons },
    );
  }
  return translate(
    availableStock > 1 ? "{quantity} disponibles" : "{quantity} disponible",
    language,
    { quantity: buildQuantityLabel(availableStock, baseUnit, true, language) },
  );
}
