import { TranslatedText } from "@/components/translated-text";
import { getLanguage } from "@/lib/server-language";
import { ProductDescription } from "@/components/product-description";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { XCircle } from "lucide-react";
import { getProduct, getProducts } from "@/lib/catalog";
import {
  COLORS,
  INTER_FONT,
  MONO_FONT,
  buildUnitLabel,
  productImage,
} from "@/lib/ui";
import { ProductCard } from "@/components/retail/product-card";
import { PriceTag } from "@/components/retail/price-tag";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductAdminActions } from "@/components/admin/product-admin-actions";

// Match the "Planning de livraison hebdomadaire" typography.
const INTER = INTER_FONT;
const MONO = MONO_FONT;

export const revalidate = 60;

type Params = Promise<{ id: string }>;

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const language = await getLanguage();
  const { id } = await params;
  const product = await getProduct(id, "retail", language);
  if (!product) notFound();
  const unitLabel = buildUnitLabel(product.baseUnit, false, language);

  // Suggestions: same category first, exclude self, then top up from the rest
  // of the catalogue so the "Vous aimerez aussi" row is always well filled.
  const firstCategory = product.categoryCode || product.category;
  const { products: relatedRaw } = await getProducts({
    audience: "retail",
    language,
    category: firstCategory,
    take: 13,
  });
  let related = relatedRaw.filter((p) => p.id !== product.id).slice(0, 8);
  if (related.length < 8) {
    const { products: moreRaw } = await getProducts({
      audience: "retail",
      language,
      take: 16,
    });
    const seen = new Set([product.id, ...related.map((p) => p.id)]);
    const fill = moreRaw
      .filter((p) => !seen.has(p.id))
      .slice(0, 8 - related.length);
    related = [...related, ...fill];
  }

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <nav className="mb-6 text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/" className="hover:underline">
          <TranslatedText value={"Accueil"} />
        </Link>{" "}
        <span className="mx-1">›</span>
        {[product.category].map((cat, idx, arr) => {
          const trimmed = cat.trim();
          return (
            <span key={trimmed}>
              <Link
                href={`/products?category=${encodeURIComponent(trimmed)}`}
                className="hover:underline"
              >
                {product.categoryLabel || trimmed}
              </Link>
              {idx < arr.length - 1 && <span className="mx-1.5">,</span>}
            </span>
          );
        })}{" "}
        <span className="mx-1">›</span>
        <span style={{ color: COLORS.text }}>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="group relative lg:col-span-5">
          <ProductAdminActions productId={product.id} />
          <div
            className="mx-auto grid aspect-square w-full max-w-[400px] place-items-center overflow-hidden rounded-lg border shadow-[0_18px_44px_-26px_rgba(23,23,23,0.28)] lg:max-w-none"
            style={{ borderColor: COLORS.border, background: COLORS.beige }}
          >
            <Image
              src={productImage(product.imageUrl)}
              alt={product.name}
              width={520}
              height={520}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col lg:col-span-7">
          <div
            className="flex items-center gap-2 text-[11px] font-semibold uppercase"
            style={{
              fontFamily: MONO,
              letterSpacing: "0.18em",
              color: COLORS.muted,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: COLORS.primary }}
            />
            {product.categoryLabel || product.category}
          </div>
          <h1
            className="mt-2.5 text-[28px] font-medium leading-[1.04] tracking-tight"
            style={{ color: COLORS.text, fontFamily: INTER }}
          >
            {product.name}
          </h1>
          <div className="mt-1 text-[12.5px]" style={{ color: COLORS.muted }}>
            <TranslatedText value={"Réf :"} />{" "}
            <span className="ltr-isolate">{product.sku}</span>
            {unitLabel && <> · {unitLabel}</>}
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <PriceTag value={product.sellingPrice} size="hero" />
          </div>
          <p className="mt-1 text-[12px]" style={{ color: COLORS.muted }}>
            <TranslatedText value={"Prix TTC, livraison non incluse."} />{" "}
          </p>

          <div className="mt-6 max-w-[420px]">
            {product.isOutOfStock ? (
              <div
                role="alert"
                className="rounded-lg border p-4"
                style={{
                  borderColor: "rgba(213,43,20,0.4)",
                  background: "rgba(213,43,20,0.07)",
                  fontFamily: INTER,
                }}
              >
                <div
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase"
                  style={{
                    fontFamily: MONO,
                    letterSpacing: "0.1em",
                    color: COLORS.red,
                  }}
                >
                  <XCircle className="h-4 w-4 shrink-0" />
                  <TranslatedText value={"Rupture de stock"} />{" "}
                </div>
                <p
                  className="mt-1.5 text-[12.5px] leading-relaxed"
                  style={{ color: COLORS.muted }}
                >
                  <TranslatedText
                    value={
                      "Ce produit est indisponible à la commande pour le moment."
                    }
                  />{" "}
                </p>
              </div>
            ) : (
              <AddToCartButton
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
      </div>
      <ProductDescription product={product} language={language} />

      {related.length > 0 && (
        <section className="mt-12">
          <div
            className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase"
            style={{
              fontFamily: MONO,
              letterSpacing: "0.18em",
              color: COLORS.muted,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: COLORS.primary }}
            />
            <TranslatedText value={"Suggestions"} />{" "}
          </div>
          <h2
            className="text-[22px] font-medium leading-[1.04] tracking-tight"
            style={{ color: COLORS.text, fontFamily: INTER }}
          >
            <TranslatedText value={"Vous aimerez aussi"} />{" "}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} language={language} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
