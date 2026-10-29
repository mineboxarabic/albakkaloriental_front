import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { backendFetch, ApiClientError } from '@/lib/api-client';
import { RETAIL_COOKIE, PRO_COOKIE } from '@/lib/session';

async function resolveCatalogAdmin() {
  const jar = await cookies();
  const tokens = new Set([jar.get(RETAIL_COOKIE)?.value, jar.get(PRO_COOKIE)?.value].filter((token): token is string => Boolean(token)));
  for (const token of tokens) {
    try {
      const me = await backendFetch<{ isAdmin: boolean }>('/api/v1/catalog-admin/me', { bearer: token });
      if (me.isAdmin !== true) continue;
      const url = new URL(process.env.BACKEND_ADMIN_URL || process.env.BACKEND_URL || '');
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
      // This object is server-only. Only the explicit boolean and link base go to the client.
      return { token, editBaseUrl: url.origin };
    } catch { /* A separate portal cookie may still belong to an administrator. */ }
  }
  return null;
}
// Request-scoped deduplication during rendering, never a process/global role cache.
export const getCatalogAdmin = cache(resolveCatalogAdmin);
export async function requireCatalogAdmin() {
  const admin = await resolveCatalogAdmin();
  if (!admin) throw new ApiClientError(403, 'Accès administrateur requis.');
  return admin;
}
