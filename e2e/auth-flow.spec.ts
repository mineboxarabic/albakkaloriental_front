import { test, expect } from '@playwright/test';
import { MockBackend } from './mock-backend';

const backend = new MockBackend(3091);
test.beforeAll(() => backend.start());
test.afterAll(() => backend.stop());

test('Paris registration has no delivery restriction, then verification and login work', async ({ page, context }) => {
  await page.route('https://api-adresse.data.gouv.fr/**', route => route.fulfill({ json: { features: [] } }));
  const checksBefore = backend.deliveryZoneChecks;
  await page.goto('/register/particulier');
  for (const [name, value] of Object.entries({
    firstName: 'Paris', lastName: 'Customer', email: 'paris@example.test', phone: '0600000000',
    address: '1 rue de Rivoli', postalCode: '75001', city: 'Paris', password: 'Password123!',
  })) {
    await page.locator(`input[name="${name}"]`).fill(value);
  }
  await page.locator('input[name="acceptCgv"]').check();
  await page.locator('input[name="acceptPrivacy"]').check();
  await expect(page.getByText(/Nous ne livrons pas encore/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Créer mon compte', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Créer mon compte', exact: true }).click();
  await expect(page).toHaveURL(/\/verify-pending\?email=/);
  expect(backend.registeredPostalCode).toBe('75001');
  expect(backend.deliveryZoneChecks).toBe(checksBefore);
  expect((await context.cookies()).some(cookie => cookie.name === 'b2c_session')).toBe(false);

  await page.goto('/verify-email?token=e2e-verification-token');
  await expect(page.getByRole('heading', { name: 'Email confirmé' })).toBeVisible();
  await page.getByRole('link', { name: 'Se connecter', exact: true }).click();
  await page.locator('input[name="email"]').fill('paris@example.test');
  await page.locator('input[name="password"]').fill('Password123!');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page).toHaveURL('/');
  expect((await context.cookies()).some(cookie => cookie.name === 'b2c_session' && cookie.httpOnly)).toBe(true);
});

test('retail login persists across reload and logout clears the session', async ({ page, context }) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('john@example.com');
  await page.locator('input[name="password"]').fill('password123');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page).toHaveURL('/');
  expect((await context.cookies()).some(cookie => cookie.name === 'b2c_session' && cookie.httpOnly)).toBe(true);
  await page.goto('/account');
  await page.reload();
  await expect(page).toHaveURL('/account');
  await page.getByRole('button', { name: /déconnexion|déconnecter/i }).click();
  await expect(page).toHaveURL('/');
  expect((await context.cookies()).some(cookie => cookie.name === 'b2c_session')).toBe(false);
});

test('professional protected route resumes after login', async ({ page, context }) => {
  await page.goto('/pro/account');
  await expect(page).toHaveURL(/\/pro\/login\?next=/);
  await page.locator('input[name="email"]').fill('pro@example.com');
  await page.locator('input[name="password"]').fill('password123');
  await page.getByRole('button', { name: 'Accéder au portail', exact: true }).click();
  await expect(page).toHaveURL('/pro/account');
  await page.reload();
  await expect(page).toHaveURL('/pro/account');
  expect((await context.cookies()).some(cookie => cookie.name === 'b2b_session' && cookie.httpOnly)).toBe(true);
});
