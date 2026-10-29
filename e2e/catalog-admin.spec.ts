import { test, expect, type BrowserContext, type Page, type Request } from '@playwright/test';
import { CatalogAdminBackend, catalogToken } from './catalog-admin-backend';

const backend = new CatalogAdminBackend();
test.beforeAll(async () => backend.start());
test.afterAll(async () => backend.stop());
test.beforeEach(() => backend.reset());
async function session(context: BrowserContext, admin = true, portal: 'retail' | 'pro' = 'retail') {
  await context.addInitScript(() => localStorage.setItem('cookie-consent', 'accepted'));
  await context.route('**/catalog-admin-fixture.png', (route) => route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJ1sAAAAASUVORK5CYII=', 'base64') }));
  await context.addCookies([{ name: portal === 'pro' ? 'b2b_session' : 'b2c_session', value: await catalogToken(admin, portal), url: 'http://localhost:3090', httpOnly: true, sameSite: 'Lax' }, { name: 'cookie_consent', value: 'accepted', url: 'http://localhost:3090' }]);
}
async function adminMode(page: Page) { await page.goto('/products'); await page.getByRole('button', { name: 'Mode admin', exact: true }).click(); }
async function manage(page: Page) { await page.getByText('Rice 1kg', { exact: true }).first().hover(); await page.getByRole('button', { name: 'Gérer le produit', exact: true }).click(); await expect(page.getByLabel('Où vendre')).toBeVisible(); }

test('customers cannot see admin controls or hidden products even with an admin query flag or claimed role', async ({ page, context }) => {
  await session(context, false);
  await page.goto('/products?adminView=all');
  await expect(page.getByText('Rice 1kg', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mode admin', exact: true })).toHaveCount(0);
  await expect(page.getByText('Hidden tea', { exact: true })).toHaveCount(0);
  expect(backend.writes).toBe(0);
});
test('desktop hover exposes thumbnail actions and placement preserves independent statuses', async ({ page, context }) => {
  await session(context); await adminMode(page);
  await page.getByText('Rice 1kg', { exact: true }).first().hover();
  await expect(page.getByRole('button', { name: 'Remplacer l’image', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Modifier dans le backend', exact: true })).toHaveAttribute('href', 'http://localhost:3091/products/p1/edit');
  await manage(page);
  await page.getByLabel('Où vendre').selectOption('WHOLESALE');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect.poll(() => backend.writes).toBe(1);
  expect(backend.products[0]).toMatchObject({ visibility: 'WHOLESALE', retailStatus: 'OUT_OF_STOCK', wholesaleStatus: 'VISIBLE' });
  await expect(page.getByText('Rice 1kg', { exact: true })).toHaveCount(0);
});
test('hidden products can be restored from admin catalogue on a phone', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await session(context); await adminMode(page);
  await page.getByRole('link', { name: 'Tous les produits (admin)', exact: true }).click();
  const card = page.locator('article').filter({ hasText: 'Hidden tea' });
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Gérer le produit', exact: true }).click();
  await page.getByLabel('Où vendre').selectOption('RETAIL');
  await page.getByLabel('Statut détail').selectOption('VISIBLE');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect.poll(() => backend.writes).toBe(1);
  expect(backend.products[1]).toMatchObject({ visibility: 'RETAIL', retailStatus: 'VISIBLE', wholesaleStatus: 'HIDDEN' });
  await page.locator('dialog').getByRole('button', { name: 'Fermer', exact: true }).click();
  await page.getByRole('link', { name: 'Retour au catalogue', exact: true }).click();
  await expect(page.getByText('Hidden tea', { exact: true })).toBeVisible();
});
test('URL replacement previews a blank original, Cancel writes nothing, Apply writes once', async ({ page, context }) => {
  await session(context); await adminMode(page); await manage(page);
  await page.getByLabel('Lien de l’image').fill('https://images.test/rice.png');
  await page.getByRole('button', { name: 'Prévisualiser le lien', exact: true }).click();
  await expect(page.getByAltText('Nouvelle image', { exact: true })).toBeVisible();
  await expect(page.getByText('Aucune image', { exact: true })).toBeVisible();
  expect(backend.writes).toBe(0);
  await page.locator('dialog').getByRole('button', { name: 'Fermer', exact: true }).click();
  expect(backend.products[0].imageUrl).toBeNull();
  await manage(page);
  await page.getByLabel('Lien de l’image').fill('https://images.test/rice.png');
  await page.getByRole('button', { name: 'Prévisualiser le lien', exact: true }).click();
  await page.getByRole('button', { name: 'Appliquer l’image', exact: true }).click();
  await expect.poll(() => backend.writes).toBe(1);
});
test('image upload, AI search and enhancement all use the preview flow', async ({ page, context }) => {
  await session(context); await adminMode(page); await manage(page);
  await page.getByLabel('Choisir un fichier', { exact: false }).setInputFiles({ name: 'rice.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJ1sAAAAASUVORK5CYII=', 'base64') });
  await expect(page.getByAltText('Nouvelle image', { exact: true })).toBeVisible();
  expect(backend.writes).toBe(0);
  await page.locator('dialog').getByRole('button', { name: 'Chercher une meilleure image', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Source: Rice 1kg', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Appliquer l’image', exact: true }).click();
  await expect.poll(() => backend.writes).toBe(1);
  await page.locator('dialog').getByRole('button', { name: 'Améliorer l’image', exact: true }).click();
  await expect(page.getByAltText('Nouvelle image', { exact: true })).toBeVisible();
  expect(backend.writes).toBe(1);
});
test('wholesale sessions get the same controls and revoked roles cannot save an open dialog', async ({ page, context }) => {
  await session(context, true, 'pro'); await page.goto('/pro/products');
  await page.getByRole('button', { name: 'Mode admin', exact: true }).click();
  await manage(page);
  backend.revoked = true;
  await page.getByLabel('Statut gros').selectOption('HIDDEN');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.locator('dialog').getByRole('alert')).toContainText('Accès administrateur requis.');
  expect(backend.writes).toBe(0);
});
test('forged customer and cross-origin direct Server Action requests cannot mutate products', async ({ page, context, browser }) => {
  await session(context); await adminMode(page); await manage(page);
  let captured: Request | undefined;
  page.on('request', (req) => { if (req.method() === 'POST' && req.headers()['next-action']) captured = req; });
  await page.getByLabel('Statut gros').selectOption('HIDDEN');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect.poll(() => backend.writes).toBe(1);
  expect(captured).toBeDefined();
  const action = captured!;
  const headers = { 'next-action': action.headers()['next-action'], 'content-type': action.headers()['content-type'], origin: 'http://localhost:3090' };
  const customer = await browser.newContext(); await session(customer, false);
  const response = await customer.request.post('/products', { headers, data: action.postDataBuffer()!, failOnStatusCode: false });
  await expect.poll(() => backend.writes).toBe(1);
  expect(await response.text()).toContain('Accès administrateur requis.');
  await customer.close();
  const csrf = await context.request.post('/products', { headers: { ...headers, origin: 'https://evil.test' }, data: action.postDataBuffer()!, failOnStatusCode: false });
  expect(csrf.status()).toBeGreaterThanOrEqual(400);
  expect(backend.writes).toBe(1);
});
test('a failed preview leaves the current image untouched and shows a useful error', async ({ page, context }) => {
  await session(context); backend.failPreview = true; await adminMode(page); await manage(page);
  await page.getByLabel('Lien de l’image').fill('https://images.test/broken.png');
  await page.getByRole('button', { name: 'Prévisualiser le lien', exact: true }).click();
  await expect(page.locator('dialog').getByRole('alert')).toContainText('Image indisponible.');
  await expect(page.getByRole('button', { name: 'Appliquer l’image', exact: true })).toHaveCount(0);
  expect(backend.writes).toBe(0);
});
