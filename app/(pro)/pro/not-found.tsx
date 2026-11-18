import Link from "next/link";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { getTranslator } from "@/lib/server-language";

/** Shown for an unknown order, product or page inside the pro area. */
export default async function ProNotFound() {
  const { t } = await getTranslator();
  return (
    <main className="mx-auto max-w-[640px] px-6 py-16 text-center">
      <p className="text-[12px] font-bold tracking-[0.14em]" style={{ color: COLORS.muted }}>
        404
      </p>
      <h1
        className="mt-2 text-[26px] font-extrabold tracking-tight"
        style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
      >
        {t("Page introuvable")}
      </h1>
      <p className="mt-2 text-[13.5px]" style={{ color: COLORS.muted }}>
        {t("Cette page n'existe pas ou n'est plus disponible.")}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/pro/products"
          className="rounded-sm px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-white"
          style={{ background: COLORS.primary }}
        >
          {t("Voir le catalogue")}
        </Link>
        <Link
          href="/pro/orders"
          className="rounded-sm border px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em]"
          style={{ borderColor: COLORS.primary, color: COLORS.primary }}
        >
          {t("Mes commandes")}
        </Link>
      </div>
    </main>
  );
}
