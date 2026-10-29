'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { backendFetch, ApiClientError } from '@/lib/api-client';
import { requireCatalogAdmin } from '@/lib/catalog-admin';
import type { AdminProduct, AdminResult, ImageCandidate } from '@/lib/catalog-admin-types';

const idSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/);
const placementSchema = z.object({
  expectedUpdatedAt: z.string().datetime(), visibility: z.enum(['RETAIL', 'WHOLESALE', 'BOTH']).optional(),
  retailStatus: z.enum(['VISIBLE', 'OUT_OF_STOCK', 'HIDDEN']).optional(), wholesaleStatus: z.enum(['VISIBLE', 'HIDDEN']).optional(),
}).strict().refine((value) => value.visibility || value.retailStatus || value.wholesaleStatus);
const previewSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('upload'), data: z.string().min(1).max(7_000_000) }).strict(),
  z.object({ kind: z.literal('url'), url: z.string().url().max(2048) }).strict(),
  z.object({ kind: z.literal('enhance') }).strict(), z.object({ kind: z.literal('search') }).strict(),
]);
function refreshProduct(id: string) {
  for (const path of ['/', '/products', `/products/${id}`, '/pro', '/pro/products', `/pro/products/${id}`]) revalidatePath(path);
}
async function run<T>(id: unknown, callback: (id: string, token: string) => Promise<T>): Promise<AdminResult<T>> {
  try {
    const { token } = await requireCatalogAdmin();
    const productId = idSchema.parse(id);
    return { ok: true, data: await callback(productId, token) };
  } catch (error) {
    const message = error instanceof z.ZodError ? 'Modification invalide.'
      : error instanceof ApiClientError && [400, 401, 403, 404, 409, 413, 429, 502, 503].includes(error.status) ? error.message
      : 'Opération impossible pour le moment.';
    return { ok: false, error: message };
  }
}
export async function loadAdminProduct(id: unknown) {
  return run<AdminProduct>(id, (productId, token) => backendFetch(`/api/v1/catalog-admin/products/${productId}`, { bearer: token }));
}
export async function updateProductPlacement(id: unknown, input: unknown) {
  return run<AdminProduct>(id, async (productId, token) => {
    const body = placementSchema.parse(input);
    const product = await backendFetch<AdminProduct>(`/api/v1/catalog-admin/products/${productId}`, { method: 'PATCH', body, bearer: token });
    refreshProduct(productId);
    return product;
  });
}
export async function prepareProductImage(id: unknown, input: unknown) {
  return run<{ candidates: ImageCandidate[] }>(id, (productId, token) => backendFetch(`/api/v1/catalog-admin/products/${productId}/image-preview`, { method: 'POST', body: previewSchema.parse(input), bearer: token }));
}
export async function applyProductImage(id: unknown, previewToken: unknown) {
  return run<AdminProduct>(id, async (productId, token) => {
    const body = { previewToken: z.string().min(1).max(8192).parse(previewToken) };
    const product = await backendFetch<AdminProduct>(`/api/v1/catalog-admin/products/${productId}/image`, { method: 'POST', body, bearer: token });
    refreshProduct(productId);
    return product;
  });
}
