export const CATALOG_PAGE_SIZE = 24;

export type CatalogSearchParams = {
  adminView?: string;
  category?: string;
  marque?: string;
  q?: string;
  sort?: string;
  tag?: string;
  page?: string;
};

/** Slice only after filtering and sorting, so search still covers the full catalogue. */
export function paginateCatalog<T>(items: T[], rawPage?: unknown) {
  const parsed = typeof rawPage === "string" && /^\d+$/.test(rawPage)
    ? Number(rawPage)
    : 1;
  const requested = Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
  const totalPages = Math.max(1, Math.ceil(items.length / CATALOG_PAGE_SIZE));
  const page = Math.min(requested, totalPages);
  const offset = (page - 1) * CATALOG_PAGE_SIZE;
  return {
    items: items.slice(offset, offset + CATALOG_PAGE_SIZE),
    page,
    totalPages,
    total: items.length,
    start: items.length ? offset + 1 : 0,
    end: Math.min(offset + CATALOG_PAGE_SIZE, items.length),
  };
}

export function catalogPageHref(base: string, params: CatalogSearchParams, page: number) {
  const query = new URLSearchParams();
  for (const key of ["category", "marque", "q", "sort", "tag", "adminView"] as const) {
    if (params[key]) query.set(key, params[key]);
  }
  if (page > 1) query.set("page", String(page));
  return query.size ? `${base}?${query}` : base;
}
