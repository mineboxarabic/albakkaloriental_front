import { test, expect } from "@playwright/test";
import { MockBackend } from "./mock-backend";

let backend: MockBackend;

test.beforeAll(async () => {
  backend = new MockBackend(3091);
  await backend.start();
});

test.afterAll(async () => {
  await backend.stop();
});

test.beforeEach(() => {
  backend.retailCartItems = [];
  backend.proCartItems = [];
  backend.loggedIn = false;
  backend.loggedInPro = false;
});

test("B2B customer sees one consolidated invoice from each linked order", async ({ page }) => {
  await page.goto("/pro/login");
  await page.locator('input[name="email"]').fill("pro@example.com");
  await page.locator('input[name="password"]').fill("password123");
  await page.getByRole("button", { name: "Accéder au portail" }).click();
  await expect(page).toHaveURL(/\/pro\/(account|products)/);

  await page.goto("/pro/invoices");
  await expect(page.getByText("FAC-2026-0042")).toBeVisible();
  await expect(page.getByText(/3 commandes/i)).toBeVisible();
  await expect(page.getByText(/Reste.*400,00/i)).toBeVisible();

  await page.goto("/pro/orders/o1");
  await expect(page.getByText(/incluse dans la facture FAC-2026-0042/i)).toBeVisible();
  await expect(page.getByText(/Paiements suivis au niveau de la facture/i)).toBeVisible();
});
