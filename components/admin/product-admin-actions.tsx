'use client';
import { lazy, Suspense, useState } from 'react';
import { ImagePlus, Search, Sparkles, Pencil, Ellipsis } from 'lucide-react';
import { useCatalogAdmin } from './catalog-admin-provider';
import { useLanguage } from '@/components/language-provider';
import { adminText } from '@/lib/catalog-admin-text';
import type { AdminOperation } from '@/lib/catalog-admin-types';
const ProductAdminDialog = lazy(() => import('./product-admin-dialog').then((module) => ({ default: module.ProductAdminDialog })));

export function ProductAdminActions({ productId, alwaysVisible = false }: { productId: string; alwaysVisible?: boolean }) {
  const { available, enabled, editBaseUrl } = useCatalogAdmin();
  const { language } = useLanguage();
  const [operation, setOperation] = useState<AdminOperation | null>(null);
  if (!available || (!enabled && !alwaysVisible)) return null;
  const t = (text: string) => adminText(text, language);
  const buttonClass = 'pointer-events-auto grid h-9 w-9 place-items-center rounded-md bg-white text-[#3F561F] shadow-sm hover:bg-[#F0EBDD] focus-visible:ring-2 focus-visible:ring-[#3F561F]';
  return <>
    <div className={`absolute end-2 top-2 z-20 flex gap-1 ${alwaysVisible ? '' : 'md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100'} transition-opacity`}>
      <button type="button" aria-label={t('Gérer le produit')} title={t('Gérer le produit')} className={buttonClass} onClick={() => setOperation('manage')}><Ellipsis size={20} /></button>
    </div>
    <div className={`pointer-events-none absolute inset-x-2 top-[94px] z-20 hidden flex-wrap justify-center gap-1 md:flex ${alwaysVisible ? '' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'} transition-opacity`}>
      <a href={`${editBaseUrl}/products/${encodeURIComponent(productId)}/edit`} target="_blank" rel="noopener noreferrer" aria-label={t('Modifier dans le backend')} title={t('Modifier dans le backend')} className={buttonClass}><Pencil size={16} /></a>
      <button type="button" className={buttonClass} aria-label={t('Remplacer l’image')} title={t('Remplacer l’image')} onClick={() => setOperation('replace')}><ImagePlus size={16} /></button>
      <button type="button" className={buttonClass} aria-label={t('Chercher une meilleure image')} title={t('Chercher une meilleure image')} onClick={() => setOperation('search')}><Search size={16} /></button>
      <button type="button" className={buttonClass} aria-label={t('Améliorer l’image')} title={t('Améliorer l’image')} onClick={() => setOperation('enhance')}><Sparkles size={16} /></button>
    </div>
    {operation && <Suspense fallback={null}><ProductAdminDialog productId={productId} operation={operation} onClose={() => setOperation(null)} /></Suspense>}
  </>;
}
