// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SignJWT } from 'jose';
const { jar } = vi.hoisted(() => ({ jar: { get: vi.fn(), set: vi.fn() } }));
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ cookies: vi.fn(async () => jar) }));
import { requireCatalogAdmin } from '@/lib/catalog-admin';
const secret = 'isolated-admin-session-scope-secret';
const ok = () => new Response(JSON.stringify({ success: true, data: { isAdmin: true } }));
let retail: string;
let pro: string;
beforeEach(async () => {
  vi.clearAllMocks();
  vi.stubEnv('BACKEND_URL', 'https://backend.test');
  vi.stubEnv('BACKEND_ADMIN_URL', '');
  vi.stubEnv('AUTH_SECRET', secret);
  const sign = (payload: Record<string, unknown>) => new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h').sign(new TextEncoder().encode(secret));
  retail = await sign({ sub: 'rc-admin', userId: 'admin', name: 'Admin', phone: '0612345678' });
  pro = await sign({ sub: 'admin', name: 'Admin', email: 'admin@test.fr', customerId: null });
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('portal-scoped admin authorization', () => {
  it('denies guests without contacting the backend', async () => {
    jar.get.mockReturnValue(undefined);
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(requireCatalogAdmin('retail')).rejects.toMatchObject({ status: 403 });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('never grants retail admin access using a different pro cookie', async () => {
    jar.get.mockImplementation((key) => key === 'b2b_session' ? { value: pro } : undefined);
    const fetch = vi.fn().mockImplementation(async () => ok()); vi.stubGlobal('fetch', fetch);
    await expect(requireCatalogAdmin('retail')).rejects.toMatchObject({ status: 403 });
    expect(fetch).not.toHaveBeenCalled();
    expect((await requireCatalogAdmin('pro')).token).toBe(pro);
  });
  it('never falls back from a retail customer to a pro administrator', async () => {
    jar.get.mockImplementation((key) => ({ value: key === 'b2c_session' ? retail : pro }));
    const fetch = vi.fn().mockResolvedValue(new Response('{"error":"Forbidden"}', { status: 403 })); vi.stubGlobal('fetch', fetch);
    await expect(requireCatalogAdmin('retail')).rejects.toMatchObject({ status: 403 });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${retail}`);
  });
  it.each(['garbage', '', 'fake.admin.token'])('rejects invalid local cookies even when the backend fixture grants admin: %s', async (token) => {
    jar.get.mockReturnValue({ value: token });
    const fetch = vi.fn().mockImplementation(async () => ok()); vi.stubGlobal('fetch', fetch);
    await expect(requireCatalogAdmin('retail')).rejects.toMatchObject({ status: 403 });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('rejects a valid pro token in the retail cookie and vice versa', async () => {
    jar.get.mockImplementation((key) => ({ value: key === 'b2c_session' ? pro : retail }));
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(requireCatalogAdmin('retail')).rejects.toMatchObject({ status: 403 });
    await expect(requireCatalogAdmin('pro')).rejects.toMatchObject({ status: 403 });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('requires an explicit portal and checks the current role on each call', async () => {
    jar.get.mockReturnValue({ value: retail });
    const fetch = vi.fn().mockResolvedValueOnce(ok()).mockResolvedValueOnce(new Response('{"error":"Forbidden"}', { status: 403 })); vi.stubGlobal('fetch', fetch);
    expect((await requireCatalogAdmin('retail')).token).toBe(retail);
    await expect(requireCatalogAdmin('retail')).rejects.toMatchObject({ status: 403 });
    await expect(requireCatalogAdmin(undefined as never)).rejects.toMatchObject({ status: 403 });
    expect(jar.set).not.toHaveBeenCalled();
  });
});
