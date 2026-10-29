/* eslint-disable @next/next/no-img-element -- Admin image thumbnails use already-hosted product URLs. */
import Link from 'next/link';
import { backendFetch } from '@/lib/api-client';
import { getCatalogAdmin } from '@/lib/catalog-admin';
import type { AdminProduct } from '@/lib/catalog-admin-types';
import { adminText } from '@/lib/catalog-admin-text';
import { getLanguage } from '@/lib/server-language';
import { CatalogSearchInput } from '@/components/catalog-search-input';
import { CatalogPagination } from '@/components/catalog-pagination';
import type { CatalogSearchParams } from '@/lib/catalog-pagination';
import { ProductAdminActions } from './product-admin-actions';

export async function AdminCatalogBrowser({ params, base }: { params: CatalogSearchParams; base: string }) {
  const admin = await getCatalogAdmin();
  if (!admin) return null;
  const language = await getLanguage();
  const t = (text: string) => adminText(text, language);
  const query = new URLSearchParams({ q: params.q ?? '', page: params.page ?? '1' });
  let data: { products: AdminProduct[]; total: number; page: number; totalPages: number };
  try { data = await backendFetch(`/api/v1/catalog-admin/products?${query}`, { bearer: admin.token }); }
  catch { return <main className="mx-auto max-w-[1180px] p-6"><p role="alert">{t('Opération impossible pour le moment.')}</p><Link href={base}>{t('Retour au catalogue')}</Link></main>; }
  const placement = { RETAIL: 'Détail uniquement', WHOLESALE: 'Gros uniquement', BOTH: 'Détail et gros' };
  const statuses = { VISIBLE: 'Visible', OUT_OF_STOCK: 'Rupture', HIDDEN: 'Masqué' };
  return <main className="mx-auto w-full max-w-[1180px] px-5 py-8 pb-24">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold">{t('Tous les produits (admin)')}</h1><p className="mt-1 text-sm text-[#6B665D]">{data.total} · {t('Produits masqués inclus')}</p><Link href={base} className="mt-2 inline-block text-sm text-[#3F561F] underline">{t('Retour au catalogue')}</Link></div>
      <CatalogSearchInput className="w-full sm:w-72" />
    </header>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {data.products.map((product) => <article key={product.id} className="group relative overflow-hidden rounded-lg border border-[#DDD8CC] bg-white">
        <div className="h-[140px] bg-[#F0EBDD]">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" referrerPolicy="no-referrer" /> : <div className="grid h-full place-items-center text-xs text-[#6B665D]">{t('Aucune image')}</div>}</div>
        <ProductAdminActions productId={product.id} alwaysVisible />
        <div className="space-y-2 p-3"><h2 className="text-sm font-semibold">{product.name}</h2><p className="text-xs text-[#6B665D]">{product.sku} · {product.barcode}</p>
          <span className="inline-block rounded bg-[#F0EBDD] px-2 py-1 text-xs">{t(placement[product.visibility])}</span>
          <div className="space-y-1 text-xs"><p>{t('Statut détail')}: {t(statuses[product.retailStatus])}</p><p>{t('Statut gros')}: {t(statuses[product.wholesaleStatus])}</p></div>
        </div>
      </article>)}
    </div>
    <CatalogPagination base={base} params={params} page={data.page} totalPages={data.totalPages} language={language} />
  </main>;
}
