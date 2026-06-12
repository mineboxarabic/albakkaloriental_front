import Link from "next/link";
import { getProducts, getCategories, getMarques } from "@/lib/catalog";
import { getOrderedCategoryNames } from "@/lib/category-display";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { ProductCard } from "@/components/retail/product-card";
import { CatalogSearchInput } from "@/components/catalog-search-input";
import { CatalogSortSelect } from "@/components/catalog-sort-select";
import { parseSortKey, sortProducts } from "@/lib/catalog-sort";

export const revalidate = 60;

type Params = Promise<{
  category?: string;
  marque?: string;
  q?: string;
  sort?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Params;
}) {
  const { category, marque, q, sort } = await searchParams;
  const [{ products }, categories, marques] = await Promise.all([
    getProducts({ audience: "retail", category, marque }),
    getCategories("retail"),
    getMarques(),
  ]);
  const orderedCategories = getOrderedCategoryNames(categories);
  const activeLabel = category ?? marque ?? null;

  const searched = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.sku.toLowerCase().includes(q.toLowerCase()),
      )
    : products;
  const filteredProducts = sortProducts(searched, parseSortKey(sort));

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <header className="mb-6">
        <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
          <Link href="/" className="hover:underline">
            Accueil
          </Link>{" "}
          {marque && (
            <>
              <span className="mx-1">›</span>
              <Link href="/marques" className="hover:underline">
                Marques
              </Link>{" "}
            </>
          )}
          <span className="mx-1">›</span>
          <span style={{ color: COLORS.text }}>
            {activeLabel ?? (q ? `Résultats pour « ${q} »` : "Nos produits")}
          </span>
        </nav>
        <h1
          className="mt-2 text-[28px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          {activeLabel ?? "Nos produits"}
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
          {filteredProducts.length}{" "}
          {filteredProducts.length > 1 ? "produits" : "produit"}
          {q ? ` pour « ${q} »` : ""}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full max-w-md">
            <CatalogSearchInput />
          </div>
          <CatalogSortSelect className="w-full sm:w-56" />
        </div>
      </header>

      {/* Mobile category chips (horizontal scroll) */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none md:hidden">
        <Link
          href={{ pathname: "/products", query: q ? { q } : {} }}
          className="shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-[12.5px] font-semibold"
          style={
            !category
              ? { background: COLORS.primary, color: "#FFFFFF", borderColor: COLORS.primary }
              : { background: "#FFFFFF", color: COLORS.text, borderColor: COLORS.border }
          }
        >
          Toutes
        </Link>
        {orderedCategories.map((c) => (
          <Link
            key={c}
            href={{ pathname: "/products", query: { category: c, ...(q ? { q } : {}) } }}
            className="shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-[12.5px] font-semibold"
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
            className="rounded-lg border bg-white p-4"
            style={{ borderColor: COLORS.border }}
          >
            <div
              className="mb-3 text-[12px] font-bold tracking-wide"
              style={{ color: COLORS.text }}
            >
              CATÉGORIES
            </div>
            <ul className="space-y-1.5 text-[13px]">
              <li>
                <Link
                  href={{ pathname: "/products", query: q ? { q } : {} }}
                  className="block rounded px-2 py-1.5 transition hover:bg-[#FAF8F2]"
                  style={{
                    color: !category && !marque ? COLORS.primary : COLORS.text,
                    fontWeight: !category && !marque ? 700 : 400,
                  }}
                >
                  Toutes les catégories
                </Link>
              </li>
              {orderedCategories.map((c) => (
                <li key={c}>
                  <Link
                    href={{
                      pathname: "/products",
                      query: { category: c, ...(q ? { q } : {}) },
                    }}
                    className="block rounded px-2 py-1.5 transition hover:bg-[#FAF8F2]"
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

            {marques.length > 0 && (
              <>
                <div className="my-3 border-t" style={{ borderColor: COLORS.border }} />
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="text-[12px] font-bold tracking-wide"
                    style={{ color: COLORS.text }}
                  >
                    MARQUES
                  </span>
                  <Link
                    href="/marques"
                    className="text-[11px] font-semibold hover:underline"
                    style={{ color: COLORS.primary }}
                  >
                    Voir tout
                  </Link>
                </div>
                <ul className="space-y-1.5 text-[13px]">
                  {marques.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={{
                          pathname: "/products",
                          query: { marque: m.name, ...(q ? { q } : {}) },
                        }}
                        className="block rounded px-2 py-1.5 transition hover:bg-[#FAF8F2]"
                        style={{
                          color: marque === m.name ? COLORS.primary : COLORS.text,
                          fontWeight: marque === m.name ? 700 : 400,
                        }}
                      >
                        {m.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>

        <section className="md:col-span-9">
          {filteredProducts.length === 0 ? (
            <div
              className="rounded-lg border bg-white px-6 py-10 text-center text-[14px]"
              style={{ borderColor: COLORS.border, color: COLORS.muted }}
            >
              Aucun produit ne correspond à votre recherche.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
