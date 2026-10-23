import {
  CatalogBrowser,
  type CatalogSearchParams,
} from "@/components/catalog-browser";
export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  return <CatalogBrowser audience="pro" searchParams={searchParams} />;
}
