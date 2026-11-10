import { CatalogLink } from "@/components/catalog-transition";
import { catalogPageHref, type CatalogSearchParams } from "@/lib/catalog-pagination";
import { translate } from "@/lib/translations";
import type { Language } from "@/lib/language";

export function CatalogPagination({ base, params, page, totalPages, language }: {
  base: string;
  params: CatalogSearchParams;
  page: number;
  totalPages: number;
  language: Language;
}) {
  if (totalPages <= 1) return null;
  const t = (text: string) => translate(text, language);
  const linkClass = "rounded-md border border-[#DDD8CC] bg-white px-3 py-2 text-sm font-semibold text-[#3F561F] hover:bg-[#F0EBDD]";
  return (
    <nav aria-label={t("Pagination du catalogue")} className="my-5 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <CatalogLink href={catalogPageHref(base, params, page - 1)} prefetch={false} rel="prev" className={linkClass}>
          {t("Précédent")}
        </CatalogLink>
      )}
      <span aria-current="page" className="px-2 text-sm text-[#6B665D]">
        {translate("Page {page} sur {total}", language, { page, total: totalPages })}
      </span>
      {page < totalPages && (
        <CatalogLink href={catalogPageHref(base, params, page + 1)} prefetch={false} rel="next" className={linkClass}>
          {t("Suivant")}
        </CatalogLink>
      )}
    </nav>
  );
}
