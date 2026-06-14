import Link from "next/link";
import { getCategories } from "@/lib/catalog";
import { getDisplayCategories } from "@/lib/category-display";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { CategoryCard } from "@/components/browse-cards";

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await getCategories("retail");
  const displays = getDisplayCategories(categories);

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <header className="mb-6">
        <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
          <Link href="/" className="hover:underline">
            Accueil
          </Link>{" "}
          <span className="mx-1">›</span>
          <span style={{ color: COLORS.text }}>Catégories</span>
        </nav>
        <h1
          className="mt-2 text-[28px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          Nos catégories
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
          {displays.length} {displays.length > 1 ? "catégories" : "catégorie"}
        </p>
      </header>

      {displays.length === 0 ? (
        <div
          className="rounded-lg border bg-white px-6 py-10 text-center text-[14px]"
          style={{ borderColor: COLORS.border, color: COLORS.muted }}
        >
          Aucune catégorie disponible pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {displays.map((c) => (
            <CategoryCard
              key={c.name}
              name={c.name}
              image={c.image}
              href={`/products?category=${encodeURIComponent(c.name)}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
