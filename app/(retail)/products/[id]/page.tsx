import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/catalog";
import { COLORS, DISPLAY_FONT, buildWeightLabel, productImage } from "@/lib/ui";
import { ProductCard } from "@/components/retail/product-card";
import { PriceTag } from "@/components/retail/price-tag";
import { AddToCartButton } from "./add-to-cart-button";

export const revalidate = 60;

type Params = Promise<{ id: string }>;

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getProduct(id, "retail");
  if (!product) notFound();

  // Suggestions: same category, exclude self.
  const firstCategory = product.category.split(",")[0]?.trim();
  const { products: relatedRaw } = await getProducts({
    audience: "retail",
    category: firstCategory,
    take: 8,
  });
  const related = relatedRaw.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <nav className="mb-6 text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/" className="hover:underline">Accueil</Link>{" "}
        <span className="mx-1">›</span>
        {product.category.split(",").map((cat, idx, arr) => {
          const trimmed = cat.trim();
          return (
            <span key={trimmed}>
              <Link
                href={`/products?category=${encodeURIComponent(trimmed)}`}
                className="hover:underline"
              >
                {trimmed}
              </Link>
              {idx < arr.length - 1 && <span className="mx-1.5">,</span>}
            </span>
          );
        })}
        {" "}<span className="mx-1">›</span>
        <span style={{ color: COLORS.text }}>{product.name}</span>
      </nav>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-5">
          <div
            className="grid aspect-square w-full place-items-center overflow-hidden rounded-xl border"
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

        <div className="col-span-7 flex flex-col">
          <div className="text-[11.5px] uppercase tracking-wide" style={{ color: COLORS.muted }}>
            {product.category}
          </div>
          <h1
            className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            {product.name}
          </h1>
          <div className="mt-1 text-[12.5px]" style={{ color: COLORS.muted }}>
            Réf : {product.sku} · {buildWeightLabel(product)}
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <PriceTag value={product.sellingPrice} size="hero" />
          </div>
          <p className="mt-1 text-[12px]" style={{ color: COLORS.muted }}>
            Prix TTC, livraison non incluse.
          </p>

          <div className="mt-6 max-w-[420px]">
            {product.isOutOfStock ? (
              <div
                role="alert"
                className="rounded-md border-l-4 px-4 py-3 text-[13.5px]"
                style={{
                  background: "#FCE9E5",
                  borderColor: "#D52B14",
                  color: "#7A1709",
                }}
              >
                <strong className="font-bold">Produit en rupture de stock.</strong>{" "}
                Indisponible à la commande pour le moment.
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

          <div
            className="mt-8 rounded-lg border bg-white px-5 py-4 text-[13px]"
            style={{ borderColor: COLORS.border, color: COLORS.muted }}
          >
            <div className="mb-2 text-[12px] font-bold" style={{ color: COLORS.text }}>
              À PROPOS DU PRODUIT
            </div>
            Produit sélectionné par notre équipe parmi des fournisseurs de
            confiance. Conservation, allergènes et informations nutritionnelles
            disponibles sur l&apos;emballage. Pour toute question, contactez
            notre service client.
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2
            className="text-[22px] font-extrabold tracking-tight"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            Vous aimerez aussi
          </h2>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
