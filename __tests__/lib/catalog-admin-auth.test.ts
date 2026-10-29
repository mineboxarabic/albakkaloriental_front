// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const { jar } = vi.hoisted(() => ({ jar: { get: vi.fn(), set: vi.fn() } }));
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ cookies: vi.fn(async () => jar) }));
import { requireCatalogAdmin } from '@/lib/catalog-admin';
const ok = () => new Response(JSON.stringify({ success: true, data: { isAdmin: true } }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('BACKEND_URL', 'https://backend.test');
  vi.stubEnv('BACKEND_ADMIN_URL', '');
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('admin session selection', () => {
  it('denies guests without contacting the backend', async () => {
    jar.get.mockReturnValue(undefined);
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(requireCatalogAdmin()).rejects.toMatchObject({ status: 403 });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('checks both portals against the backend and preserves unrelated cookies', async () => {
    jar.get.mockImplementation((key) => ({ value: key === 'b2c_session' ? 'expired-retail-token' : 'pro-admin-token' }));
    const fetch = vi.fn().mockResolvedValueOnce(new Response('{"error":"Expired"}', { status: 401 })).mockResolvedValueOnce(ok());
    vi.stubGlobal('fetch', fetch);
    expect(await requireCatalogAdmin()).toEqual({ token: 'pro-admin-token', editBaseUrl: 'https://backend.test' });
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe('Bearer pro-admin-token');
    expect(jar.set).not.toHaveBeenCalled();
  });
  it('does not trust a successful response unless it explicitly grants admin access', async () => {
    jar.get.mockReturnValue({ value: 'customer-token' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { role: 'ADMIN' } }))));
    await expect(requireCatalogAdmin()).rejects.toMatchObject({ status: 403 });
  });
  it('does not reuse an admin role across separate action calls', async () => {
    jar.get.mockReturnValue({ value: 'admin-token' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(ok()).mockResolvedValueOnce(new Response('{"error":"Forbidden"}', { status: 403 })));
    expect((await requireCatalogAdmin()).token).toBe('admin-token');
    await expect(requireCatalogAdmin()).rejects.toMatchObject({ status: 403 });
  });
});
