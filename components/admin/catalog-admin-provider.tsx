'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { adminText } from '@/lib/catalog-admin-text';
import type { CatalogAudience } from '@/lib/catalog';

const AdminContext = createContext({ available: false, enabled: false, editBaseUrl: '', audience: 'retail' as CatalogAudience });
export const useCatalogAdmin = () => useContext(AdminContext);

export function CatalogAdminProvider({ audience, available, editBaseUrl = '', children }: { audience: CatalogAudience; available: boolean; editBaseUrl?: string; children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [verified, setVerified] = useState(false);
  useEffect(() => {
    let active = true;
    let generation = 0;
    const check = async () => {
      const current = ++generation;
      let allowed = false;
      try {
        if (available) {
          const { verifyCatalogAdminAccess } = await import('@/actions/catalog-admin');
          allowed = await verifyCatalogAdminAccess(audience);
        }
      } catch { /* Hide controls on any failure. */ }
      if (!active || current !== generation) return;
      setVerified(allowed);
      if (!allowed) setEnabled(false);
    };
    void check();
    if (!available) return () => { active = false; };
    const focus = () => { void check(); };
    const visibility = () => { if (document.visibilityState === 'visible') void check(); };
    const timer = window.setInterval(focus, 30_000);
    window.addEventListener('focus', focus);
    document.addEventListener('visibilitychange', visibility);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', focus); document.removeEventListener('visibilitychange', visibility); };
  }, [audience, available]);
  const allowed = available && verified;
  const { language } = useLanguage();
  const t = (text: string) => adminText(text, language);
  return <AdminContext.Provider value={{ available: allowed, enabled: allowed && enabled, editBaseUrl, audience }}>
    {children}
    {allowed && <div className="fixed bottom-3 start-3 z-40 flex max-w-[calc(100%-24px)] flex-wrap items-center gap-2 rounded-lg border border-[#DDD8CC] bg-white p-2 text-xs shadow-lg">
      <button type="button" aria-pressed={enabled} onClick={() => setEnabled(!enabled)} className={`min-h-10 rounded-md px-3 font-semibold ${enabled ? 'bg-[#3F561F] text-white' : 'bg-[#F0EBDD] text-[#3F561F]'}`}>{t('Mode admin')}</button>
      {enabled && <Link href={`${audience === 'pro' ? '/pro/products' : '/products'}?adminView=all`} prefetch={false} className="px-2 font-semibold text-[#3F561F] underline">{t('Tous les produits (admin)')}</Link>}
    </div>}
  </AdminContext.Provider>;
}
