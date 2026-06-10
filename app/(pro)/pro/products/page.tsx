import { redirect } from "next/navigation";
import Link from "next/link";
import { getProducts, getCategories } from "@/lib/catalog";
import { getProMe } from "@/actions/pro-me";
import { getOrderedCategoryNames } from "@/lib/category-display";
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
  const orderedCategories = getOrderedCategoryNames(categories);

  const filtered = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.sku.toLowerCase().includes(q.toLowerCase()),
      )
    : products;

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <header className="mb-6 lg:flex lg:items-end lg:justify-between">
        <div className="min-w-0">
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
            className="mt-2 text-[24px] font-extrabold tracking-tight sm:text-[28px]"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            {category ?? "Catalogue professionnel"}
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
            {filtered.length} {filtered.length > 1 ? "produits" : "produit"} ·{" "}
            {session.companyName}
          </p>
        </div>

        <div className="mt-4 lg:mt-0">
          <CatalogSearchInput className="w-full lg:w-72" />
        </div>
      </header>

      {/* Mobile category chips (horizontal scroll) */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none md:hidden">
        <Link
          href={{ pathname: "/pro/products", query: q ? { q } : {} }}
          className="shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold"
          style={
            !category
              ? { background: COLORS.primary, color: "#FFFFFF", borderColor: COLORS.primary }
              : { background: "#FFFFFF", color: COLORS.text, borderColor: COLORS.border }
          }
        >
          Tous les produits
        </Link>
        {orderedCategories.map((c) => (
          <Link
            key={c}
            href={{ pathname: "/pro/products", query: { category: c, ...(q ? { q } : {}) } }}
            className="shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold"
            style={
              category === c
                ? { background: COLORS.primary, color: "#FFFFFF", borderColor: COLORS.primary }
                : { background: "#FFFFFF", color: COLORS.text, borderColor: COLORS.border }
            }
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <aside className="hidden md:col-span-3 md:block">
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
              {orderedCategories.map((c) => (
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
