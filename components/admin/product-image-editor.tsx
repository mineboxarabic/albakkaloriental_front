'use client';
/* eslint-disable @next/next/no-img-element -- Authenticated previews are already rehosted and must not pass through a public image optimizer. */
import { useState } from 'react';
import { useLanguage } from '@/components/language-provider';
import { adminText } from '@/lib/catalog-admin-text';
import type { AdminProduct, ImageCandidate, PreviewRequest } from '@/lib/catalog-admin-types';

interface Props {
  product: AdminProduct; candidates: ImageCandidate[]; busy: boolean; searched: boolean;
  onPrepare: (request: PreviewRequest) => void; onApply: (candidate: ImageCandidate) => void; onError: (error: string) => void;
}
export function ProductImageEditor({ product, candidates, busy, searched, onPrepare, onApply, onError }: Props) {
  const [url, setUrl] = useState('');
  const [selected, setSelected] = useState(0);
  const { language } = useLanguage();
  const t = (text: string) => adminText(text, language);
  const candidate = candidates[selected] ?? candidates[0];
  const button = 'min-h-11 rounded-md border border-[#DDD8CC] bg-white px-3 text-sm font-semibold text-[#3F561F] disabled:opacity-40';
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { onError(t('JPEG, PNG ou WebP · 5 Mo maximum')); return; }
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setSelected(0);
      onPrepare({ kind: 'upload', data });
    } catch { onError(t('Opération impossible pour le moment.')); }
  }
  return <section className="space-y-4 border-t border-[#DDD8CC] pt-4">
    <div className="flex flex-wrap gap-2">
      <button type="button" className={button} disabled={busy || !product.imageUrl} onClick={() => { setSelected(0); onPrepare({ kind: 'enhance' }); }}>{t('Améliorer l’image')}</button>
      <button type="button" className={button} disabled={busy} onClick={() => { setSelected(0); onPrepare({ kind: 'search' }); }}>{t('Chercher une meilleure image')}</button>
    </div>
    <label className="block text-sm font-medium">{t('Choisir un fichier')}
      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="mt-2 block max-w-full text-sm" onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ''; }} />
      <span className="mt-1 block text-xs text-[#6B665D]">{t('JPEG, PNG ou WebP · 5 Mo maximum')}</span>
    </label>
    <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); setSelected(0); onPrepare({ kind: 'url', url }); }}>
      <label className="min-w-0 flex-1 text-sm font-medium">{t('Lien de l’image')}
        <input type="url" required aria-label={t('Lien de l’image')} value={url} onChange={(e) => setUrl(e.target.value)} disabled={busy} placeholder="https://…" className="mt-1 min-h-11 w-full rounded-md border border-[#DDD8CC] px-3" />
      </label>
      <button type="submit" disabled={busy || !url} className={button}>{t('Prévisualiser le lien')}</button>
    </form>
    {busy && <p role="status" className="text-sm">{t('Préparation de l’aperçu…')}</p>}
    {searched && !busy && !candidates.length && <p className="text-sm">{t('Aucune image trouvée. Essayez un lien ou un fichier.')}</p>}
    <div className="grid grid-cols-2 gap-3">
      <figure><figcaption className="mb-2 text-sm font-semibold">{t('Image actuelle')}</figcaption>
        {product.imageUrl ? <img src={product.imageUrl} alt={t('Image actuelle')} referrerPolicy="no-referrer" className="aspect-square w-full rounded-md border border-[#DDD8CC] bg-white object-contain" /> : <div className="grid aspect-square place-items-center rounded-md border border-dashed border-[#DDD8CC] text-sm text-[#6B665D]">{t('Aucune image')}</div>}
      </figure>
      {candidate && <figure><figcaption className="mb-2 text-sm font-semibold">{t('Nouvelle image')}</figcaption>
        <img src={candidate.imageUrl} alt={t('Nouvelle image')} referrerPolicy="no-referrer" className="aspect-square w-full rounded-md border border-[#DDD8CC] bg-white object-contain" />
        {candidate.sourceUrl && <a href={candidate.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs text-[#3F561F] underline">{t('Source')}: {candidate.title}</a>}
      </figure>}
    </div>
    {candidates.length > 1 && <div className="flex gap-2" role="group" aria-label={t('Nouvelle image')}>
      {candidates.map((item, index) => <button key={item.previewToken} type="button" disabled={busy} aria-pressed={selected === index} onClick={() => setSelected(index)} className={`w-20 rounded-md border-2 p-1 ${selected === index ? 'border-[#3F561F]' : 'border-transparent'}`}><img src={item.imageUrl} alt={item.title} className="aspect-square object-contain" referrerPolicy="no-referrer" /></button>)}
    </div>}
    {candidate && <>
      <p className="text-xs text-[#6B665D]">{t('Vérifiez la marque, le format et les textes avant d’appliquer.')}</p>
      <button type="button" disabled={busy} onClick={() => onApply(candidate)} className="min-h-11 rounded-md bg-[#3F561F] px-4 text-sm font-semibold text-white disabled:opacity-40">{t('Appliquer l’image')}</button>
    </>}
  </section>;
}
