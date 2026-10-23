import Link from "next/link";
import { getCatalogNavigation } from "@/lib/catalog-navigation-server";
import { getLanguage } from "@/lib/server-language";
import { translate } from "@/lib/translations";
import type { CatalogAudience } from "@/lib/catalog";
import { CategoryCard } from "@/components/browse-cards";
export async function CategoryBrowser({
  audience,
}: {
  audience: CatalogAudience;
}) {
  const language = await getLanguage();
  const categories = await getCatalogNavigation(audience, language);
  const base = audience === "pro" ? "/pro/products" : "/products";
  const t = (text: string) => translate(text, language);
  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-8 pb-16">
      <h1 className="text-3xl font-bold text-[#171717]">
        {t("Nos catégories")}
      </h1>
      <p className="mb-7 mt-2 text-sm text-[#6B665D]">
        {t("Tous vos essentiels, simplement.")}
      </p>
      {categories.length === 0 && (
        <p>{t("Aucune catégorie disponible pour le moment.")}</p>
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <section key={category.id} className="min-w-0">
            <CategoryCard
              name={category.label}
              image={category.image}
              href={`${base}?category=${encodeURIComponent(category.value)}`}
            />
            <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs text-[#6B665D]">
              {category.children.map((child) => (
                <li key={child.id}>
                  <Link
                    className="hover:text-[#3F561F] hover:underline"
                    href={`${base}?category=${encodeURIComponent(child.value)}`}
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
