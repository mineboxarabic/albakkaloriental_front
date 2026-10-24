import { getCatalogNavigation } from "@/lib/catalog-navigation-server";
import { getLanguage } from "@/lib/server-language";
import { translate } from "@/lib/translations";
import type { CatalogAudience } from "@/lib/catalog";
import { CategoryCard, SubcategoryChip } from "@/components/browse-cards";
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
      <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
        {categories.map((category) => (
          <section key={category.id} className="min-w-0">
            <CategoryCard
              name={category.label}
              image={category.image}
              imageFit={category.imageFit}
              href={`${base}?category=${encodeURIComponent(category.value)}`}
            />
            {category.children.length > 0 && (
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {category.children.map((child) => (
                  <li key={child.id} className="min-w-0">
                    <SubcategoryChip
                      name={child.label}
                      image={child.image}
                      imageFit={child.imageFit}
                      href={`${base}?category=${encodeURIComponent(child.value)}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
