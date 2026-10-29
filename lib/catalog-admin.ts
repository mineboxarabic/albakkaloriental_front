import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { backendFetch, ApiClientError } from '@/lib/api-client';
import { RETAIL_COOKIE, PRO_COOKIE, getRetailSession, getProSession } from '@/lib/session';
import type { CatalogAudience } from '@/lib/catalog';

async function resolveCatalogAdmin(audience: CatalogAudience) {
  if (audience !== 'retail' && audience !== 'pro') return null;
  const jar = await cookies();
  const token = jar.get(audience === 'retail' ? RETAIL_COOKIE : PRO_COOKIE)?.value;
  if (!token) return null;
  const session = audience === 'retail' ? await getRetailSession() : await getProSession();
  if (!session) return null;
  try {
    const me = await backendFetch<{ isAdmin: boolean }>('/api/v1/catalog-admin/me', { bearer: token });
    if (me.isAdmin !== true) return null;
    const url = new URL(process.env.BACKEND_ADMIN_URL || process.env.BACKEND_URL || '');
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    // This object is server-only. Only the explicit boolean and link base go to the client.
    const userId = session.type === 'retail' ? session.userId ?? session.customerId : session.userId;
    return { token, userId, editBaseUrl: url.origin };
  } catch { /* Fail closed; never fall back to a different account or portal. */ }
  return null;
}
// Request-scoped deduplication during rendering, never a process/global role cache.
export const getCatalogAdmin = cache(resolveCatalogAdmin);
export async function requireCatalogAdmin(audience: CatalogAudience) {
  const admin = await resolveCatalogAdmin(audience);
  if (!admin) throw new ApiClientError(403, 'Accès administrateur requis.');
  return admin;
}
