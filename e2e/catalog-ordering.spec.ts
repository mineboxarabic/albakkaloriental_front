import { expect, test } from "@playwright/test";
import { MockBackend } from "./mock-backend";

const backend = new MockBackend(3091);

test.beforeAll(async () => {
  backend.catalogOrdering = true;
  await backend.start();
});
test.afterAll(() => backend.stop());

test("wholesale catalog order can be edited until staff confirmation", async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "accepted"));
  await page.goto("/pro/login");
  await page.locator('input[name="email"]').fill("pro@example.com");
  await page.locator('input[name="password"]').fill("password123");
  await page.getByRole("button", { name: "Accéder au portail" }).click();
  await expect(page).toHaveURL(/\/pro\/(account|products)/);

  await page.goto("/pro/products/prod-2");
  await expect(page.getByText(/\d+ cartons? disponibles?/i)).toHaveCount(0);
  await page.getByRole("button", { name: "Augmenter la quantité" }).click();
  await page.getByRole("button", { name: "Ajouter au devis" }).click();
  await expect.poll(() => backend.proCartItems[0]?.quantity).toBe(2);

  await page.goto("/pro/cart");
  await expect(page.getByRole("note")).toContainText("Commande sous réserve de disponibilité.");
  await page.getByRole("button", { name: "Commander" }).click();
  await expect(page).toHaveURL(/\/pro\/orders\/catalog-order$/);
  await page.getByRole("button", { name: "Modifier ma commande" }).click();
  await expect(page.getByRole("table").getByRole("spinbutton", { name: /Produit Pro 2/ })).toHaveValue("2");
  await page.getByRole("table").getByRole("spinbutton", { name: /Produit Pro 2/ }).fill("25");
  await page.getByRole("table").getByRole("combobox", { name: /Produit Pro 2/ }).selectOption("UNIT");
  await page.screenshot({ path: testInfo.outputPath("b2b-order-edit-table.png") });
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect.poll(() => backend.catalogOrder).toMatchObject({ quantity: 25, saleUnit: "UNIT" });
  await expect(page.getByRole("table").getByText("Unité", { exact: true })).toBeVisible();

  backend.catalogOrder.status = "CONFIRMED";
  await page.reload();
  await expect(page.getByRole("button", { name: "Modifier ma commande" })).toHaveCount(0);
  await expect(page.getByRole("table").getByRole("combobox")).toHaveCount(0);
  await expect(page.getByText("Commande validée. Contactez-nous pour demander une modification.")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("confirmed-order.png") });
});
