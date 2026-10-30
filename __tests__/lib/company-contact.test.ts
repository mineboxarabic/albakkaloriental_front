import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const { backendFetch } = vi.hoisted(() => ({ backendFetch: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/api-client', () => ({ backendFetch }));
import { getCompany } from '@/lib/company';
import { buildWhatsappUrl } from '@/lib/whatsapp';

describe('company contact configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('WHATSAPP_NUMBER', '+33 7 11 11 11 11');
    vi.stubEnv('COMPANY_EMAIL', 'env@example.com');
    vi.stubEnv('SUPPORT_EMAIL', 'old-support@example.com');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('uses the AlimExpress contact settings and never requests credentials', async () => {
    backendFetch.mockResolvedValue({ whatsappNumber: '33722222222', companyEmail: 'company@example.com' });
    const company = await getCompany();
    expect(company.whatsappNumber).toBe('33722222222');
    expect(company.whatsappUrl).toBe('https://wa.me/33722222222');
    expect(company.email).toBe('company@example.com');
    expect(company).not.toHaveProperty('supportEmail');
    expect(backendFetch).toHaveBeenCalledWith('/api/v1/public/contact', { auth: 'none' });
  });
  it.each([null, {}])('uses frontend environment defaults when the backend has no values: %s', async (contact) => {
    backendFetch.mockResolvedValue(contact);
    const company = await getCompany();
    expect(company.whatsappNumber).toBe('33711111111');
    expect(company.email).toBe('env@example.com');
  });
  it('keeps environment fallback available during backend failures or an older deployment', async () => {
    backendFetch.mockRejectedValue(new Error('503'));
    expect((await getCompany()).whatsappUrl).toBe('https://wa.me/33711111111');
    expect((await getCompany()).email).toBe('env@example.com');
  });
  it('never returns a malicious remote contact URL or mailto query', async () => {
    backendFetch.mockResolvedValue({ whatsappNumber: '123?text=attack', companyEmail: 'mail@example.com?bcc=attacker@example.com' });
    const company = await getCompany();
    expect(company.whatsappNumber).toBe('33711111111');
    expect(company.email).toBe('env@example.com');
  });
  it('hides WhatsApp and leaves email empty when nothing valid is configured', async () => {
    backendFetch.mockResolvedValue({ whatsappNumber: null, companyEmail: null });
    vi.stubEnv('WHATSAPP_NUMBER', '');
    vi.stubEnv('COMPANY_EMAIL', '');
    const company = await getCompany();
    expect(company.whatsappUrl).toBeNull();
    expect(company.email).toBe('');
  });
  it('encodes user messages without changing the WhatsApp destination', () => {
    const result = buildWhatsappUrl('+33 7 22 22 22 22', 'Lyon & Nice? مرحبا');
    const url = new URL(result!);
    expect(url.origin + url.pathname).toBe('https://wa.me/33722222222');
    expect(url.searchParams.get('text')).toBe('Lyon & Nice? مرحبا');
    expect(buildWhatsappUrl('javascript:alert(1)')).toBeNull();
  });
});
