import Link from "next/link";
import { getProducts, getCategories } from "@/lib/catalog";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { ProductCard } from "@/components/retail/product-card";

export const revalidate = 60;

type Params = Promise<{
  category?: string;
  q?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Params;
}) {
  const { category, q } = await searchParams;
  const [{ products }, categories] = await Promise.all([
    getProducts({ audience: "retail", category }),
    getCategories("retail"),
  ]);

  const filteredProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.sku.toLowerCase().includes(q.toLowerCase()),
      )
    : products;

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <header className="mb-6">
        <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
          <Link href="/" className="hover:underline">
            Accueil
          </Link>{" "}
          <span className="mx-1">›</span>
          <span style={{ color: COLORS.text }}>
            {category ?? q ? `Résultats pour « ${category ?? q} »` : "Nos produits"}
          </span>
        </nav>
        <h1
          className="mt-2 text-[28px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          {category ? category : "Nos produits"}
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
          {filteredProducts.length}{" "}
          {filteredProducts.length > 1 ? "produits" : "produit"}
          {q ? ` pour « ${q} »` : ""}
        </p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3">
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
                    color: !category ? COLORS.primary : COLORS.text,
                    fontWeight: !category ? 700 : 400,
                  }}
                >
                  Toutes les catégories
                </Link>
              </li>
              {categories.map((c) => (
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
          </div>
        </aside>

        <section className="col-span-9">
          {filteredProducts.length === 0 ? (
            <div
              className="rounded-lg border bg-white px-6 py-10 text-center text-[14px]"
              style={{ borderColor: COLORS.border, color: COLORS.muted }}
            >
              Aucun produit ne correspond à votre recherche.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
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
