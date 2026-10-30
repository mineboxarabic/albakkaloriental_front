import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
const { backendFetch, language } = vi.hoisted(() => ({ backendFetch: vi.fn(), language: { value: 'fr' } }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/api-client', () => ({ backendFetch }));
vi.mock('@/lib/server-language', () => ({ getTranslator: async () => ({ language: language.value, t: (text: string) => text }) }));
vi.mock('@/components/info-page', () => ({
  InfoPage: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  MailLink: ({ email }: { email: string }) => email ? <a href={`mailto:${email}`}>{email}</a> : null,
  LegalTranslationNote: () => null,
}));
import Cgv from '@/app/(public)/(content)/cgv/page';
import Privacy from '@/app/(public)/(content)/confidentialite/page';
import Delivery from '@/app/(public)/(content)/livraison/page';
import Collection from '@/app/(public)/(content)/click-collect/page';
import Commitments from '@/app/(public)/(content)/nos-engagements/page';
import About from '@/app/(public)/(content)/a-propos/page';
import Legal from '@/app/(public)/(content)/mentions-legales/page';
import Contact from '@/app/(public)/(content)/contact/page';
import { SiteFooter } from '@/components/retail/site-footer';

beforeEach(() => {
  backendFetch.mockResolvedValue({ companyEmail: 'company@example.com', whatsappNumber: '33722222222' });
  vi.stubEnv('COMPANY_EMAIL', 'env@example.com');
  vi.stubEnv('SUPPORT_EMAIL', 'old-support@example.com');
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe.each(['fr', 'ar'])('company email on %s information pages', (lang) => {
  it.each([['CGV', Cgv], ['privacy', Privacy], ['delivery', Delivery], ['collection', Collection], ['commitments', Commitments], ['about', About], ['legal', Legal], ['contact', Contact]] as const)('uses the saved company email on %s', async (_name, Page) => {
    language.value = lang;
    const { container } = render(await Page());
    const links = container.querySelectorAll('a[href^="mailto:"]');
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(link.getAttribute('href')).toBe('mailto:company@example.com');
    expect(container.textContent).not.toContain('support@lebakkaloriental.fr');
    expect(container.textContent).not.toContain('old-support@example.com');
  });
});

it('shows the same company email in the footer', async () => {
  const { container } = render(await SiteFooter({ categories: [] }));
  expect(container.textContent).toContain('company@example.com');
  expect(container.textContent).not.toContain('env@example.com');
});
