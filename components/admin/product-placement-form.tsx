'use client';
import { useState, type FormEvent } from 'react';
import type { AdminProduct, PlacementPatch, Visibility, RetailStatus, WholesaleStatus } from '@/lib/catalog-admin-types';
import { useLanguage } from '@/components/language-provider';
import { adminText } from '@/lib/catalog-admin-text';

export function ProductPlacementForm({ product, busy, onSave }: { product: AdminProduct; busy: boolean; onSave: (patch: PlacementPatch) => void }) {
  const [visibility, setVisibility] = useState(product.visibility);
  const [retailStatus, setRetailStatus] = useState(product.retailStatus);
  const [wholesaleStatus, setWholesaleStatus] = useState(product.wholesaleStatus);
  const { language } = useLanguage();
  const t = (text: string) => adminText(text, language);
  const changed = visibility !== product.visibility || retailStatus !== product.retailStatus || wholesaleStatus !== product.wholesaleStatus;
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!changed || busy) return;
    onSave({ expectedUpdatedAt: product.updatedAt,
      ...(visibility !== product.visibility ? { visibility } : {}),
      ...(retailStatus !== product.retailStatus ? { retailStatus } : {}),
      ...(wholesaleStatus !== product.wholesaleStatus ? { wholesaleStatus } : {}),
    });
  }
  const selectClass = 'mt-1 min-h-11 w-full rounded-md border border-[#DDD8CC] bg-white px-2';
  return <form onSubmit={submit} className="space-y-3">
    <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-3">
      <label className="text-sm font-medium">{t('Où vendre')}
        <select aria-label={t('Où vendre')} value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)} className={selectClass}>
          <option value="RETAIL">{t('Détail uniquement')}</option><option value="WHOLESALE">{t('Gros uniquement')}</option><option value="BOTH">{t('Détail et gros')}</option>
        </select>
      </label>
      <label className="text-sm font-medium">{t('Statut détail')}
        <select aria-label={t('Statut détail')} value={retailStatus} onChange={(e) => setRetailStatus(e.target.value as RetailStatus)} className={selectClass}>
          <option value="VISIBLE">{t('Visible')}</option><option value="OUT_OF_STOCK">{t('Rupture')}</option><option value="HIDDEN">{t('Masqué')}</option>
        </select>
      </label>
      <label className="text-sm font-medium">{t('Statut gros')}
        <select aria-label={t('Statut gros')} value={wholesaleStatus} onChange={(e) => setWholesaleStatus(e.target.value as WholesaleStatus)} className={selectClass}>
          <option value="VISIBLE">{t('Visible')}</option><option value="HIDDEN">{t('Masqué')}</option>
        </select>
      </label>
    </fieldset>
    <button type="submit" disabled={busy || !changed} className="min-h-11 rounded-md bg-[#3F561F] px-4 text-sm font-semibold text-white disabled:opacity-40">{t('Enregistrer')}</button>
  </form>;
}
