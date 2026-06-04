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
  // Reset the mock backend state before each test
  backend.retailCartItems = [];
  backend.proCartItems = [];
  backend.loggedIn = false;
  backend.loggedInPro = false;
});

test.describe("B2C Retail Cart Flow", () => {
  test("guest adding item to cart opens login modal, consumes intent post-login, and enforces retail limits", async ({ page }) => {
    // 1. Visit the product page as a guest
    await page.goto("/products/prod-1");

    // We should see "Se connecter pour ajouter" button because we are guest
    const addToCartBtn = page.getByRole("button", { name: "Se connecter pour ajouter" });
    await expect(addToCartBtn).toBeVisible();

    // 2. Click to add to cart -> should open login modal
    await addToCartBtn.click();
    await expect(page.getByText("CONNEXION REQUISE")).toBeVisible();

    // 3. Fill and submit login form
    await page.locator('input[name="email"]').fill("john@example.com");
    await page.locator('input[name="password"]').fill("password123");
    await page.getByRole("button", { name: "Se connecter", exact: true }).click();

    // 4. After login, it redirect back and consumes the pending cart intent
    // Wait for the button to show "Ajouté au panier" or "Ajouter au panier"
    await expect(page.getByRole("button", { name: "Ajouter au panier" })).toBeVisible({ timeout: 10000 });

    // 5. Navigate to the cart page
    await page.goto("/cart");

    // The cart should show "Produit Retail 1" with quantity 1
    await expect(page.getByText("Produit Retail 1")).toBeVisible();
    await expect(page.locator("div").filter({ hasText: /^1$/ }).first()).toBeVisible();

    // 6. Enforce retail limit of 3 units
    // Click plus button twice to reach 3
    const plusBtn = page.getByRole("button", { name: "Augmenter la quantité" });
    await plusBtn.click();
    // Wait for update
    await page.waitForTimeout(300);
    await plusBtn.click();
    await page.waitForTimeout(300);

    // The plus button should now be disabled since we hit MAX_QTY_PER_PRODUCT (3)
    await expect(plusBtn).toBeDisabled();
  });

  test("stale session cookie triggers auth alert and redirects to /login on cart update", async ({ page }) => {
    // 1. Visit product page as guest
    await page.goto("/products/prod-1");
    const addToCartBtn = page.getByRole("button", { name: "Se connecter pour ajouter" });
    await expect(addToCartBtn).toBeVisible();

    // 2. Log in
    await addToCartBtn.click();
    await page.locator('input[name="email"]').fill("john@example.com");
    await page.locator('input[name="password"]').fill("password123");
    await page.getByRole("button", { name: "Se connecter", exact: true }).click();
    await expect(page.getByRole("button", { name: "Ajouter au panier" })).toBeVisible();

    // 3. Invalidate session on the backend
    backend.loggedIn = false;

    // 4. Setup dialog handler to accept the expiration alert
    let alertText = "";
    page.once("dialog", async (dialog) => {
      alertText = dialog.message();
      await dialog.accept();
    });

    // 5. Try to add to cart -> should trigger 401 -> alert -> redirect to /login
    await page.getByRole("button", { name: "Ajouter au panier" }).click();

    // 6. Verify alert dialog was shown with expected text
    await expect.poll(() => alertText).toContain("Votre session a expiré");

    // 7. Verify we got redirected to the login page
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

test.describe("B2B Pro Cart Flow", () => {
  test("B2B user can add high quantity (> 3) of products and update without clamping to 3", async ({ page }) => {
    // 1. Login as a pro user first
    await page.goto("/pro/login");
    await page.locator('input[name="email"]').fill("pro@example.com");
    await page.locator('input[name="password"]').fill("password123");
    await page.getByRole("button", { name: "Accéder au portail" }).click();

    // Should redirect to /pro/account or /pro/products
    await expect(page).toHaveURL(/\/pro\/(account|products)/, { timeout: 10000 });

    // 2. Go to B2B product detail page
    await page.goto("/pro/products/prod-2");
    await expect(page.getByRole("heading", { name: "Produit Pro 2" })).toBeVisible();

    // 3. Increase quantity to 5 (greater than retail limit 3)
    const plusBtn = page.getByRole("button", { name: "Augmenter la quantité" });
    for (let i = 0; i < 4; i++) {
      await plusBtn.click();
    }
    // Verify quantity input shows 5
    await expect(page.getByText("5", { exact: true })).toBeVisible();

    // 4. Click "Ajouter au devis"
    await page.getByRole("button", { name: "Ajouter au devis" }).click();
    await expect(page.getByText("Ajouté au panier")).toBeVisible();

    // 5. Navigate to pro cart page
    await page.goto("/pro/cart");
    await expect(page.getByText("Produit Pro 2").first()).toBeVisible();
    
    // Check quantity is indeed 5 (not clamped to 3)
    await expect(page.locator("div").filter({ hasText: /^5$/ }).first()).toBeVisible();

    // 6. Increase quantity even further in cart (e.g., to 6)
    const cartPlusBtn = page.getByRole("button", { name: "Augmenter" });
    await cartPlusBtn.click();
    await page.waitForTimeout(300);

    // Check quantity is now 6
    await expect(page.locator("div").filter({ hasText: /^6$/ }).first()).toBeVisible();
  });
});
