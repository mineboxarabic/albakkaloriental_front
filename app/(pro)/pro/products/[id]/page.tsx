import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Package, Tag } from "lucide-react";
import { getProduct, getProducts } from "@/lib/catalog";
import { getProMe } from "@/actions/pro-me";
import { COLORS, DISPLAY_FONT, buildWeightLabel, productImage } from "@/lib/ui";
import { ProProductCard } from "@/components/pro/pro-product-card";
import { AddToProCartButton } from "./add-to-pro-cart-button";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function ProProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const meRes = await getProMe(); if (!meRes.ok) { return null; } const session = { companyName: meRes.customer.companyName, pricingLevel: meRes.customer.pricingLevel };
  if (!session) {
    redirect("/pro/login");
  }
  const { id } = await params;
  const product = await getProduct(id, "pro");
  if (!product) notFound();

  const related = (
    await getProducts({ audience: "pro", category: product.category, take: 8 })
  )
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <nav className="mb-6 text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/pro/products" className="hover:underline">Catalogue pro</Link>{" "}
        <span className="mx-1">›</span>
        <Link
          href={`/pro/products?category=${encodeURIComponent(product.category)}`}
          className="hover:underline"
        >
          {product.category}
        </Link>{" "}
        <span className="mx-1">›</span>
        <span style={{ color: COLORS.text }}>{product.name}</span>
      </nav>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-5">
          <div
            className="grid aspect-square w-full place-items-center overflow-hidden rounded-sm border"
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
          <div className="flex items-center gap-2 text-[11.5px] uppercase tracking-[0.12em]" style={{ color: COLORS.muted }}>
            <span>{product.category}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Niveau {session.pricingLevel ?? "—"}
            </span>
          </div>
          <h1
            className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            {product.name}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-[12.5px]" style={{ color: COLORS.muted }}>
            <span>Réf : {product.sku}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Package className="h-3.5 w-3.5" strokeWidth={2} />
              {product.unitsPerPack > 1
                ? `Carton de ${product.unitsPerPack} ${packUnitLabel(product.baseUnit)}`
                : buildWeightLabel(product)}
            </span>
          </div>

          <div className="mt-6">
            <AddToProCartButton
              productId={product.id}
              name={product.name}
              imageUrl={product.imageUrl}
              unitsPerPack={product.unitsPerPack}
              pricingLevel={session.pricingLevel}
              isOutOfStock={product.isOutOfStock}
              pricing={{
                sellingPrice: product.sellingPrice,
                unitSellingPrice: product.unitSellingPrice,
                unitsPerPack: product.unitsPerPack,
                priceLevelC: product.priceLevelC,
                priceLevelD: product.priceLevelD,
                priceLevelE: product.priceLevelE,
                priceLevelF: product.priceLevelF,
              }}
            />
          </div>

          <div
            className="mt-8 rounded-sm border bg-white px-5 py-4 text-[13px]"
            style={{ borderColor: COLORS.border, color: COLORS.muted }}
          >
            <div className="mb-2 text-[11px] font-bold tracking-[0.14em]" style={{ color: COLORS.text }}>
              CONDITIONS PROFESSIONNELLES
            </div>
            Prix HT, TVA 20% appliquée sur le devis. Vos prix sont calculés selon
            votre niveau de tarification (
            <strong style={{ color: COLORS.primary }}>{session.pricingLevel ?? "—"}</strong>
            ). Devis valable jusqu&apos;à la veille de la livraison (J-1, 21h Paris).
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2
            className="text-[20px] font-extrabold tracking-tight"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            Produits associés
          </h2>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {related.map((p) => (
              <ProProductCard
                key={p.id}
                product={p}
                pricingLevel={session.pricingLevel}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function packUnitLabel(baseUnit: string): string {
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
