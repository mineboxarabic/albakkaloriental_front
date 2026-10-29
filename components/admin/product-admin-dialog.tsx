'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { loadAdminProduct, updateProductPlacement, prepareProductImage, applyProductImage } from '@/actions/catalog-admin';
import type { AdminProduct, AdminOperation, ImageCandidate, PlacementPatch, PreviewRequest } from '@/lib/catalog-admin-types';
import { useCatalogAdmin } from './catalog-admin-provider';
import { useLanguage } from '@/components/language-provider';
import { adminText } from '@/lib/catalog-admin-text';
import { ProductPlacementForm } from './product-placement-form';
import { ProductImageEditor } from './product-image-editor';
import { callAdmin } from '@/lib/catalog-admin-client';

export function ProductAdminDialog({ productId, operation, onClose }: { productId: string; operation: AdminOperation; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const router = useRouter();
  const { editBaseUrl, audience } = useCatalogAdmin();
  const { language } = useLanguage();
  const t = (text: string) => adminText(text, language);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [candidates, setCandidates] = useState<ImageCandidate[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await callAdmin(() => loadAdminProduct(productId, audience));
      if (cancelled) return;
      if (!result.ok) { setError(result.error); return; }
      setProduct(result.data);
      if (operation !== 'search' && operation !== 'enhance') return;
      setBusy(true);
      const prepared = await callAdmin(() => prepareProductImage(productId, { kind: operation }, audience));
      if (cancelled) return;
      if (prepared.ok) setCandidates(prepared.data.candidates);
      else setError(prepared.error);
      setSearched(operation === 'search');
      setBusy(false);
    })();
    return () => { cancelled = true; };
  }, [productId, operation, audience]);
  async function save(patch: PlacementPatch) {
    setBusy(true); setError(''); setMessage('');
    const result = await callAdmin(() => updateProductPlacement(productId, patch, audience));
    if (result.ok) { setProduct(result.data); setMessage(t('Modifications enregistrées.')); router.refresh(); }
    else setError(result.error);
    setBusy(false);
  }
  async function prepare(request: PreviewRequest) {
    setBusy(true); setError(''); setMessage(''); setCandidates([]);
    const result = await callAdmin(() => prepareProductImage(productId, request, audience));
    if (result.ok) setCandidates(result.data.candidates);
    else setError(result.error);
    setSearched(request.kind === 'search'); setBusy(false);
  }
  async function apply(candidate: ImageCandidate) {
    setBusy(true); setError(''); setMessage('');
    const result = await callAdmin(() => applyProductImage(productId, candidate.previewToken, audience));
    if (result.ok) { setProduct(result.data); setCandidates([]); setSearched(false); setMessage(t('Image appliquée.')); router.refresh(); }
    else setError(result.error);
    setBusy(false);
  }
  return createPortal(<dialog ref={ref} aria-labelledby={titleId} onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="m-auto max-h-[88dvh] w-[calc(100%-24px)] max-w-2xl overflow-auto rounded-xl border border-[#DDD8CC] bg-[#FAF8F2] p-5 text-[#171717] shadow-xl backdrop:bg-black/40">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div><h2 id={titleId} className="text-lg font-bold">{product?.name ?? t('Gérer le produit')}</h2>{product && <p className="mt-1 text-xs text-[#6B665D]">{product.sku} · {product.barcode}</p>}</div>
      <button type="button" onClick={onClose} className="min-h-10 rounded-md border border-[#DDD8CC] px-3 text-sm">{t('Fermer')}</button>
    </div>
    {error && <p role="alert" className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {message && <p role="status" className="mb-3 rounded-md bg-green-50 p-3 text-sm text-green-800">{message}</p>}
    {!product && !error && <p role="status">{t('Chargement…')}</p>}
    {product && <div className="space-y-5">
      <ProductPlacementForm key={product.updatedAt} product={product} busy={busy} onSave={(patch) => void save(patch)} />
      <a href={`${editBaseUrl}/products/${encodeURIComponent(productId)}/edit`} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-[#3F561F] underline">{t('Modifier dans le backend')}</a>
      <ProductImageEditor product={product} candidates={candidates} busy={busy} searched={searched} onPrepare={(request) => void prepare(request)} onApply={(candidate) => void apply(candidate)} onError={setError} />
    </div>}
  </dialog>, document.body);
}
