import { redirect } from "next/navigation";
import Link from "next/link";
import { Tag } from "lucide-react";
import { getProducts, getCategories } from "@/lib/catalog";
import { getProMe } from "@/actions/pro-me";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { ProProductCard } from "@/components/pro/pro-product-card";
import { CatalogSearchInput } from "@/components/catalog-search-input";

export const dynamic = "force-dynamic";

type Params = Promise<{ category?: string; q?: string }>;

export default async function ProProductsPage({
  searchParams,
}: {
  searchParams: Params;
}) {
  const meRes = await getProMe(); if (!meRes.ok) { return null; } const session = { companyName: meRes.customer.companyName, pricingLevel: meRes.customer.pricingLevel };
  if (!session) {
    redirect("/pro/login?next=/pro/products");
  }

  const { category, q } = await searchParams;
  const [{ products }, categories] = await Promise.all([
    getProducts({ audience: "pro", category }),
    getCategories("pro"),
  ]);

  const filtered = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.sku.toLowerCase().includes(q.toLowerCase()),
      )
    : products;

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
            <Link href="/pro/products" className="hover:underline">
              Catalogue pro
            </Link>{" "}
            {category && (
              <>
                <span className="mx-1">›</span>
                <span style={{ color: COLORS.text }}>{category}</span>
              </>
            )}
          </nav>
          <h1
            className="mt-2 text-[28px] font-extrabold tracking-tight"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            {category ?? "Catalogue professionnel"}
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
            {filtered.length} {filtered.length > 1 ? "produits" : "produit"} ·{" "}
            {session.companyName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CatalogSearchInput className="w-72" />
          <span
            className="inline-flex items-center gap-2 rounded-sm border px-3 py-2 text-[12px] font-bold uppercase tracking-[0.1em]"
            style={{ borderColor: COLORS.border, color: COLORS.primary, background: "#FFFFFF" }}
          >
            <Tag className="h-3.5 w-3.5" strokeWidth={2.2} />
            Niveau{" "}
            <span className="text-[14px]" style={{ color: COLORS.text }}>
              {session.pricingLevel ?? "—"}
            </span>
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <aside className="md:col-span-3">
          <div
            className="rounded-sm border bg-white p-4"
            style={{ borderColor: COLORS.border }}
          >
            <div
              className="mb-3 text-[11px] font-bold tracking-[0.14em]"
              style={{ color: COLORS.muted }}
            >
              CATÉGORIES
            </div>
            <ul className="space-y-1 text-[13px]">
              <li>
                <Link
                  href={{ pathname: "/pro/products", query: q ? { q } : {} }}
                  className="block rounded-sm px-2 py-1.5 transition hover:bg-[#FAF8F2]"
                  style={{
                    color: !category ? COLORS.primary : COLORS.text,
                    fontWeight: !category ? 700 : 400,
                  }}
                >
                  Tous les produits
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <Link
                    href={{
                      pathname: "/pro/products",
                      query: { category: c, ...(q ? { q } : {}) },
                    }}
                    className="block rounded-sm px-2 py-1.5 transition hover:bg-[#FAF8F2]"
                    style={{
                      color: category === c ? COLORS.primary : COLORS.text,
                      fontWeight: category === c ? 700 : 400,
                    }}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="md:col-span-9">
          {filtered.length === 0 ? (
            <div
              className="rounded-sm border bg-white px-6 py-10 text-center text-[14px]"
              style={{ borderColor: COLORS.border, color: COLORS.muted }}
            >
              Aucun produit dans cette catégorie.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {filtered.map((p) => (
                <ProProductCard
                  key={p.id}
                  product={p}
                  pricingLevel={session.pricingLevel}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
