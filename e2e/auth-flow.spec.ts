import { test, expect } from '@playwright/test';
import { MockBackend } from './mock-backend';

const backend = new MockBackend(3091);
test.beforeAll(() => backend.start());
test.afterAll(() => backend.stop());

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
  expect((await context.cookies()).some(cookie => cookie.name === 'b2c_session')).toBe(false);
});

test('professional protected route resumes after login', async ({ page, context }) => {
  await page.goto('/pro/account');
  await expect(page).toHaveURL(/\/pro\/login\?next=/);
  await page.locator('input[name="email"]').fill('pro@example.com');
  await page.locator('input[name="password"]').fill('password123');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page).toHaveURL('/pro/account');
  await page.reload();
  await expect(page).toHaveURL('/pro/account');
  expect((await context.cookies()).some(cookie => cookie.name === 'b2b_session' && cookie.httpOnly)).toBe(true);
});
