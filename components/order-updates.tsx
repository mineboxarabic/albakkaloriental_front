'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/language-provider';
interface OrderUpdatesProps { status: string }
export function OrderUpdates({ status }: OrderUpdatesProps) {
  const router = useRouter();
  const { t } = useLanguage();
  useEffect(() => {
    if (status === 'DELIVERED' || status === 'CANCELLED') return;
    const update = () => { if (!document.hidden) router.refresh(); };
    const timer = setInterval(update, 30000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, [status, router]);
  return <p role="status" className="mt-3 text-xs text-[#6B665D]">{t('Suivi actualisé automatiquement.')}</p>;
}
