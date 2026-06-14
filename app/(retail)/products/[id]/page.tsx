import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { XCircle } from "lucide-react";
import { getProduct, getProducts } from "@/lib/catalog";
import { COLORS, buildWeightLabel, productImage } from "@/lib/ui";
import { ProductCard } from "@/components/retail/product-card";
import { PriceTag } from "@/components/retail/price-tag";
import { AddToCartButton } from "./add-to-cart-button";

// Match the "Planning de livraison hebdomadaire" typography (Inter + JetBrains Mono).
const INTER = "var(--font-inter), 'Inter', system-ui, sans-serif";
const MONO = "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace";

export const revalidate = 60;

type Params = Promise<{ id: string }>;

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getProduct(id, "retail");
  if (!product) notFound();

  // Suggestions: same category first, exclude self, then top up from the rest
  // of the catalogue so the "Vous aimerez aussi" row is always well filled.
  const firstCategory = product.category.split(",")[0]?.trim();
  const { products: relatedRaw } = await getProducts({
    audience: "retail",
    category: firstCategory,
    take: 13,
  });
  let related = relatedRaw.filter((p) => p.id !== product.id).slice(0, 8);
  if (related.length < 8) {
    const { products: moreRaw } = await getProducts({ audience: "retail", take: 16 });
    const seen = new Set([product.id, ...related.map((p) => p.id)]);
    const fill = moreRaw
      .filter((p) => !seen.has(p.id))
      .slice(0, 8 - related.length);
    related = [...related, ...fill];
  }

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
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
            style={{ fontFamily: MONO, letterSpacing: "0.18em", color: COLORS.muted }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.primary }} />
            {product.category}
          </div>
          <h1
            className="mt-2.5 text-[28px] font-medium leading-[1.04] tracking-tight"
            style={{ color: COLORS.text, fontFamily: INTER }}
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
                className="rounded-lg border p-4"
                style={{
                  borderColor: "rgba(213,43,20,0.4)",
                  background: "rgba(213,43,20,0.07)",
                  fontFamily: INTER,
                }}
              >
                <div
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase"
                  style={{ fontFamily: MONO, letterSpacing: "0.1em", color: COLORS.red }}
                >
                  <XCircle className="h-4 w-4 shrink-0" />
                  Rupture de stock
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: COLORS.muted }}>
                  Ce produit est indisponible à la commande pour le moment.
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

          <div
            className="mt-8 rounded-lg border bg-white px-5 py-4 text-[13px] leading-relaxed shadow-[0_18px_44px_-26px_rgba(23,23,23,0.28)]"
            style={{ borderColor: COLORS.border, color: COLORS.muted, fontFamily: INTER }}
          >
            <div
              className="mb-2 text-[11px] font-semibold uppercase"
              style={{ fontFamily: MONO, letterSpacing: "0.14em", color: COLORS.muted }}
            >
              À propos du produit
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
          <div
            className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase"
            style={{ fontFamily: MONO, letterSpacing: "0.18em", color: COLORS.muted }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.primary }} />
            Suggestions
          </div>
          <h2
            className="text-[22px] font-medium leading-[1.04] tracking-tight"
            style={{ color: COLORS.text, fontFamily: INTER }}
          >
            Vous aimerez aussi
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* SEO content */}
      <section
        className="mt-16 grid grid-cols-1 gap-8 border-t pt-10 md:grid-cols-2"
        style={{ borderColor: COLORS.border }}
      >
        <article>
          <h2
            className="text-[19px] font-medium leading-[1.04] tracking-tight"
            style={{ color: COLORS.text, fontFamily: INTER }}
          >
            {product.name} : authenticité et qualité
          </h2>
          <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: COLORS.muted }}>
            Découvrez <strong style={{ color: COLORS.text }}>{product.name}</strong>, un
            produit de la catégorie{" "}
            <Link
              href={`/products?category=${encodeURIComponent(firstCategory ?? "")}`}
              className="underline"
              style={{ color: COLORS.primary }}
            >
              {firstCategory}
            </Link>{" "}
            soigneusement sélectionné par Le Bakkal Oriental. Nous travaillons
            directement avec des fournisseurs de confiance pour vous proposer des
            saveurs authentiques de la cuisine orientale et méditerranéenne, au
            meilleur rapport qualité-prix.
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: COLORS.muted }}>
            Idéal pour vos recettes du quotidien comme pour vos grandes occasions,
            {" "}{product.name} se conserve facilement et se marie avec de nombreux
            autres produits de notre épicerie. Retrouvez l&apos;ensemble de notre
            sélection dans le rayon{" "}
            <Link
              href={`/products?category=${encodeURIComponent(firstCategory ?? "")}`}
              className="underline"
              style={{ color: COLORS.primary }}
            >
              {firstCategory}
            </Link>.
          </p>
        </article>

        <article>
          <h2
            className="text-[19px] font-medium leading-[1.04] tracking-tight"
            style={{ color: COLORS.text, fontFamily: INTER }}
          >
            Pourquoi commander chez Le Bakkal Oriental ?
          </h2>
          <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed" style={{ color: COLORS.muted }}>
            <li>
              <strong style={{ color: COLORS.text }}>Livraison à domicile</strong> dans
              toute la France, directement chez vous.
            </li>
            <li>
              <strong style={{ color: COLORS.text }}>Produits authentiques</strong> issus
              d&apos;une sélection rigoureuse de fournisseurs spécialisés.
            </li>
            <li>
              <strong style={{ color: COLORS.text }}>Prix justes</strong> sur toute
              l&apos;épicerie orientale : épices, huiles, conserves, riz et pâtes,
              confiseries et boissons.
            </li>
            <li>
              <strong style={{ color: COLORS.text }}>Service client</strong> à votre
              écoute pour toute question sur nos produits ou votre commande.
            </li>
          </ul>
          <Link
            href="/products"
            className="mt-4 inline-block text-[13px] font-semibold underline"
            style={{ color: COLORS.primary }}
          >
            Voir tous nos produits
          </Link>
        </article>
      </section>
    </main>
  );
}
