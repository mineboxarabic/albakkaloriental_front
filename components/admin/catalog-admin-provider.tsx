'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { adminText } from '@/lib/catalog-admin-text';

const AdminContext = createContext({ available: false, enabled: false, editBaseUrl: '' });
export const useCatalogAdmin = () => useContext(AdminContext);

export function CatalogAdminProvider({ available, editBaseUrl = '', children }: { available: boolean; editBaseUrl?: string; children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const { language } = useLanguage();
  const t = (text: string) => adminText(text, language);
  return <AdminContext.Provider value={{ available, enabled: available && enabled, editBaseUrl }}>
    {children}
    {available && <div className="fixed bottom-3 start-3 z-40 flex max-w-[calc(100%-24px)] flex-wrap items-center gap-2 rounded-lg border border-[#DDD8CC] bg-white p-2 text-xs shadow-lg">
      <button type="button" aria-pressed={enabled} onClick={() => setEnabled(!enabled)} className={`min-h-10 rounded-md px-3 font-semibold ${enabled ? 'bg-[#3F561F] text-white' : 'bg-[#F0EBDD] text-[#3F561F]'}`}>{t('Mode admin')}</button>
      {enabled && <Link href="/products?adminView=all" prefetch={false} className="px-2 font-semibold text-[#3F561F] underline">{t('Tous les produits (admin)')}</Link>}
    </div>}
  </AdminContext.Provider>;
}
