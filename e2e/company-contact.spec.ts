import http from 'node:http';
import { test, expect } from '@playwright/test';

let server: http.Server;
let contact: { whatsappNumber: string | null; companyEmail: string | null };
let unavailable = false;
const number = '33722222222';

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    const path = new URL(req.url ?? '/', 'http://127.0.0.1:3191').pathname;
    if (path === '/api/v1/public/contact' && unavailable) {
      res.writeHead(503); res.end(); return;
    }
    let data: unknown;
    if (path === '/api/v1/public/contact') data = contact;
    else if (path.endsWith('/categories')) data = { categories: [] };
    else if (path.endsWith('/marques')) data = { marques: [] };
    else if (path.endsWith('/deliveries/upcoming')) data = { deliveries: [] };
    else if (path.endsWith('/catalog')) data = { products: [] };
    else { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ success: true, data }));
  });
  await new Promise<void>((resolve) => server.listen(3191, '127.0.0.1', resolve));
});
test.afterAll(async () => { await new Promise<void>((resolve) => server.close(() => resolve())); });
test.beforeEach(async ({ context }) => {
  contact = { whatsappNumber: number, companyEmail: 'company@example.com' };
  unavailable = false;
  await context.addInitScript(() => localStorage.setItem('cookie-consent', 'accepted'));
});

test('contact, legal and support pages all use the saved company email', async ({ page }) => {
  for (const path of ['/contact', '/cgv', '/confidentialite', '/livraison', '/click-collect', '/nos-engagements', '/a-propos', '/mentions-legales']) {
    await page.goto(path);
    const links = page.locator('main a[href^="mailto:"]');
    expect(await links.count()).toBeGreaterThan(0);
    for (const link of await links.all()) await expect(link).toHaveAttribute('href', 'mailto:company@example.com');
    await expect(page.locator('footer')).toContainText('company@example.com');
    await expect(page.locator('body')).not.toContainText('support@lebakkaloriental.fr');
  }
});

test('the business application and contact page share the configured WhatsApp destination', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.locator('a[href^="https://wa.me/"]')).toHaveAttribute('href', `https://wa.me/${number}`);
  await page.goto('/register/entreprise');
  for (const [name, value] of Object.entries({ firstName: 'Test', lastName: 'Client', companyName: 'Test Company', email: 'test@example.com', phone: '0612345678', address: '1 Rue Test' })) {
    await page.locator(`input[name="${name}"]`).fill(value);
  }
  const link = page.locator('a[href^="https://wa.me/"]');
  await expect(link).toHaveAttribute('aria-disabled', 'false');
  const url = new URL((await link.getAttribute('href'))!);
  expect(url.pathname).toBe('/' + number);
  expect(url.searchParams.get('text')).toContain('Test Company');
  await expect(page.locator('main')).toContainText('+' + number);
});

test('city requests use the configured WhatsApp number', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Où souhaitez-vous être livré ?').fill('Lyon & Nice');
  const link = page.getByRole('link', { name: 'Demander un arrêt' });
  const url = new URL((await link.getAttribute('href'))!);
  expect(url.pathname).toBe('/' + number);
  expect(url.searchParams.get('text')).toContain('Lyon & Nice');
});

test('changes to the backend contact appear on the next page load', async ({ page }) => {
  await page.goto('/contact');
  contact = { whatsappNumber: '33733333333', companyEmail: 'updated@example.com' };
  await page.reload();
  await expect(page.locator('main a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:updated@example.com');
  await expect(page.locator('a[href^="https://wa.me/"]')).toHaveAttribute('href', 'https://wa.me/33733333333');
});

test('frontend environment defaults work when the backend is unavailable', async ({ page }) => {
  unavailable = true;
  await page.goto('/contact');
  await expect(page.locator('main a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:env@example.com');
  await expect(page.locator('a[href^="https://wa.me/"]')).toHaveAttribute('href', 'https://wa.me/33711111111');
});

test('Arabic support pages use the same company email', async ({ page, context }) => {
  await context.addCookies([{ name: 'catalog_language', value: 'ar', url: 'http://127.0.0.1:3190' }]);
  await page.goto('/confidentialite');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('main a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:company@example.com');
});
