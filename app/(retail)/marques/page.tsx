import Link from "next/link";
import { getMarques } from "@/lib/catalog";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { MarqueCard } from "@/components/browse-cards";

export const revalidate = 60;

export default async function MarquesPage() {
  const marques = await getMarques();

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <header className="mb-6">
        <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
          <Link href="/" className="hover:underline">
            Accueil
          </Link>{" "}
          <span className="mx-1">›</span>
          <span style={{ color: COLORS.text }}>Marques</span>
        </nav>
        <h1
          className="mt-2 text-[28px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          Nos marques
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
          {marques.length} {marques.length > 1 ? "marques" : "marque"}
        </p>
      </header>

      {marques.length === 0 ? (
        <div
          className="rounded-lg border bg-white px-6 py-10 text-center text-[14px]"
          style={{ borderColor: COLORS.border, color: COLORS.muted }}
        >
          Aucune marque disponible pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {marques.map((m) => (
            <MarqueCard
              key={m.id}
              name={m.name}
              imageUrl={m.imageUrl}
              productCount={m.productCount}
              href={`/products?marque=${encodeURIComponent(m.name)}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
