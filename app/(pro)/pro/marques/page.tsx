import Link from "next/link";
import { getMarques } from "@/lib/catalog";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { MarqueCard } from "@/components/browse-cards";

export const dynamic = "force-dynamic";

export default async function ProMarquesPage() {
  const marques = await getMarques();

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <header className="mb-6">
        <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
          <Link href="/pro/products" className="hover:underline">
            Catalogue pro
          </Link>{" "}
          <span className="mx-1">›</span>
          <span style={{ color: COLORS.text }}>Marques</span>
        </nav>
        <h1
          className="mt-2 text-[24px] font-extrabold tracking-tight sm:text-[28px]"
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
          className="rounded-sm border bg-white px-6 py-10 text-center text-[14px]"
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
              href={`/pro/products?marque=${encodeURIComponent(m.name)}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
