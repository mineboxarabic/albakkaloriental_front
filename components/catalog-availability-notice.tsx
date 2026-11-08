import { getProducts, type CatalogAudience } from "@/lib/catalog";
import { getTranslator } from "@/lib/server-language";

export async function CatalogAvailabilityNotice({ audience }: { audience: CatalogAudience }) {
  const [{ availabilityMessage }, { language }] = await Promise.all([
    getProducts({ audience, take: 0 }),
    getTranslator(),
  ]);
  if (!availabilityMessage) return null;

  return (
    <p role="note" className="mx-auto mt-4 max-w-[1132px] rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      {availabilityMessage[language]}
    </p>
  );
}
