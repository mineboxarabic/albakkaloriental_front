import Link from "next/link";
import {
  getProducts,
  getCategoryItems,
  getMarques,
  type CatalogAudience,
} from "@/lib/catalog";
import { getLanguage } from "@/lib/server-language";
import {
  buildCategoryNavigation,
  matchesCategory,
  matchesProductSearch,
} from "@/lib/catalog-navigation";
import { sortProducts, parseSortKey } from "@/lib/catalog-sort";
import { translate } from "@/lib/translations";
import { getProMe } from "@/actions/pro-me";
import { ProductCard } from "@/components/retail/product-card";
import { ProProductCard } from "@/components/pro/pro-product-card";
import { CatalogSearchInput } from "@/components/catalog-search-input";
import { CatalogSortSelect } from "@/components/catalog-sort-select";
export type CatalogSearchParams = {
  category?: string;
  marque?: string;
  q?: string;
  sort?: string;
  tag?: string;
};
export async function CatalogBrowser({
  audience,
  searchParams,
}: {
  audience: CatalogAudience;
  searchParams: Promise<CatalogSearchParams>;
}) {
  const language = await getLanguage();
  const params = await searchParams;
  const [{ products, backendDown }, categoryItems, marques, me] =
    await Promise.all([
      getProducts({ audience, language }),
      getCategoryItems(),
      getMarques(),
      audience === "pro" ? getProMe() : Promise.resolve(null),
    ]);
  const navigation = buildCategoryNavigation(categoryItems, products, language);
  const category = [
    ...navigation,
    ...navigation.flatMap((c) => c.children),
  ].find((c) => c.value === params.category || c.name === params.category);
  const filtered = products.filter(
    (p) =>
      (!params.category || matchesCategory(p, params.category)) &&
      (!params.marque || p.marques.includes(params.marque)) &&
      (!params.q || matchesProductSearch(p, params.q)) &&
      (!params.tag || p.tags?.includes(params.tag)),
  );
  const sorted = sortProducts(filtered, parseSortKey(params.sort), language);
  const base = audience === "pro" ? "/pro/products" : "/products";
  const t = (text: string) => translate(text, language);
  const link = (value?: string) => ({
    pathname: base,
    query: {
      ...(value ? { category: value } : {}),
      ...(params.q ? { q: params.q } : {}),
      ...(params.sort ? { sort: params.sort } : {}),
    },
  });
  const activeLabel =
    category?.label ||
    params.category ||
    params.marque ||
    t(audience === "pro" ? "Catalogue professionnel" : "Tous les produits");
  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-8 pb-16">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#171717]">{activeLabel}</h1>
          <p className="mt-2 text-sm text-[#6B665D]">
            {sorted.length} {t(sorted.length === 1 ? "produit" : "produits")}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <CatalogSearchInput className="min-w-0 flex-1 sm:w-64" />
          <CatalogSortSelect />
        </div>
      </header>
      {backendDown && (
        <p role="status" className="mb-5 rounded-lg bg-amber-50 p-4">
          {t("Le catalogue est temporairement indisponible.")}
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[210px_1fr]">
        <aside aria-label={t("Catégories")} className="min-w-0">
          <Link
            href={link()}
            className="mb-3 inline-block text-sm font-semibold text-[#3F561F]"
          >
            {t("Tous les produits")}
          </Link>
          <div className="flex gap-3 overflow-x-auto pb-3 lg:block">
            {navigation.map((parent) => (
              <details
                key={parent.id}
                open
                className="min-w-[170px] rounded-lg border border-[#DDD8CC] bg-white p-3 lg:mb-3"
              >
                <summary className="cursor-pointer text-sm font-semibold text-[#3F561F]">
                  <Link
                    href={link(parent.value)}
                    aria-current={
                      params.category === parent.value ? "page" : undefined
                    }
                  >
                    {parent.label}
                  </Link>
                </summary>
                <ul className="mt-2 space-y-2 text-xs text-[#6B665D]">
                  {parent.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={link(child.value)}
                        aria-current={
                          params.category === child.value ? "page" : undefined
                        }
                        className="hover:underline"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
          {marques.length > 0 && (
            <details className="mt-4">
              <summary className="text-sm font-semibold">
                {t("Marques")}
              </summary>
              <ul className="mt-3 space-y-2 text-xs">
                {marques.map((m) => (
                  <li key={m.id}>
                    <Link href={{ pathname: base, query: { marque: m.name } }}>
                      {m.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </aside>
        <section aria-label={t("Produits")}>
          {sorted.length === 0 ? (
            <p className="rounded-lg border border-[#DDD8CC] bg-white p-8 text-center text-sm">
              {t("Aucun produit trouvé.")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {sorted.map((product) =>
                audience === "pro" ? (
                  <ProProductCard
                    key={product.id}
                    product={product}
                    authenticated={Boolean(me?.ok)}
                    pricingLevel={me?.ok ? me.customer.pricingLevel : null}
                  />
                ) : (
                  <ProductCard key={product.id} product={product} />
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
