import { beforeEach, describe, expect, it, vi } from 'vitest';
const { admin, fetchBackend, revalidate } = vi.hoisted(() => ({ admin: vi.fn(), fetchBackend: vi.fn(), revalidate: vi.fn() }));
vi.mock('@/lib/catalog-admin', () => ({ requireCatalogAdmin: admin }));
vi.mock('@/lib/api-client', async (importOriginal) => ({ ...await importOriginal<typeof import('@/lib/api-client')>(), backendFetch: fetchBackend }));
vi.mock('next/cache', () => ({ revalidatePath: revalidate }));
import { loadAdminProduct, updateProductPlacement, prepareProductImage, applyProductImage } from '@/actions/catalog-admin';

beforeEach(() => { vi.resetAllMocks(); admin.mockResolvedValue({ token: 'server-only-token' }); fetchBackend.mockResolvedValue({ id: 'p1' }); });
describe('catalog management server actions', () => {
  it('authorizes every action and never returns credentials', async () => {
    const result = await loadAdminProduct('p1');
    expect(admin).toHaveBeenCalled();
    expect(fetchBackend).toHaveBeenCalledWith('/api/v1/catalog-admin/products/p1', { bearer: 'server-only-token' });
    expect(result).toEqual({ ok: true, data: { id: 'p1' } });
  });
  it('does not contact a write endpoint when authorization fails', async () => {
    admin.mockRejectedValue(new Error('Forbidden'));
    expect((await updateProductPlacement('p1', { visibility: 'RETAIL', expectedUpdatedAt: '2026-10-29T10:00:00Z' })).ok).toBe(false);
    expect(fetchBackend).not.toHaveBeenCalled();
  });
  it.each(['../secret', 'p1?role=ADMIN', 'p1/images', ''])('rejects path injection %s', async (id) => {
    expect((await loadAdminProduct(id)).ok).toBe(false);
    expect(fetchBackend).not.toHaveBeenCalled();
  });
  it('rejects price changes, extra fields and oversized images', async () => {
    expect((await updateProductPlacement('p1', { sellingPrice: 1, expectedUpdatedAt: '2026-10-29T10:00:00Z' })).ok).toBe(false);
    expect((await prepareProductImage('p1', { kind: 'upload', data: 'a'.repeat(7_000_001) })).ok).toBe(false);
    expect((await applyProductImage('p1', '')) .ok).toBe(false);
    expect(fetchBackend).not.toHaveBeenCalled();
  });
  it('previews do not invalidate or mutate the displayed catalogue', async () => {
    await prepareProductImage('p1', { kind: 'enhance' });
    expect(fetchBackend).toHaveBeenCalledWith('/api/v1/catalog-admin/products/p1/image-preview', expect.objectContaining({ method: 'POST', body: { kind: 'enhance' } }));
    expect(revalidate).not.toHaveBeenCalled();
  });
  it('refreshes both catalogues and details after applying an image', async () => {
    await applyProductImage('p1', 'signed-preview');
    expect(revalidate.mock.calls.map(([path]) => path)).toEqual(['/', '/products', '/products/p1', '/pro', '/pro/products', '/pro/products/p1']);
  });
});
