# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cart.spec.ts >> B2B Pro Cart Flow >> B2B user can add high quantity (> 3) of products and update without clamping to 3
- Location: e2e\cart.spec.ts:100:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('div').filter({ hasText: /^5$/ }).first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('div').filter({ hasText: /^5$/ }).first()
    14 × locator resolved to <div class="mt-3 md:hidden">…</div>
       - unexpected value "hidden"

```

```yaml
- banner:
  - 'link "Le Bakkal Oriental: espace pro"':
    - /url: /pro/products
    - img "Le Bakkal Oriental"
    - text: PRO
  - navigation:
    - link "CATALOGUE":
      - /url: /pro/products
    - link "COMMANDES":
      - /url: /pro/orders
    - link "DEVIS":
      - /url: /pro/quotes
    - link "FACTURES":
      - /url: /pro/invoices
  - link "PANIER 5":
    - /url: /pro/cart
  - link "Mon compte":
    - /url: /pro/account
  - button "Se déconnecter"
- main:
  - navigation:
    - link "Catalogue pro":
      - /url: /pro/products
    - text: ›Mon panier
  - heading "Mon panier professionnel" [level=1]
  - paragraph: 5 articles dans votre panier.
  - text: PRODUIT UNITÉ QUANTITÉ TOTAL HT
  - list:
    - listitem:
      - link "Produit Pro 2":
        - /url: /pro/products/prod-2
        - img "Produit Pro 2"
      - link "Produit Pro 2":
        - /url: /pro/products/prod-2
      - text: 12,00 € HT / carton Carton
      - button "Diminuer"
      - text: "5"
      - button "Augmenter"
      - text: 60,00 €
      - button "Supprimer Produit Pro 2"
  - link "Continuer mes achats":
    - /url: /pro/products
  - button "Vider le panier"
  - text: NOTES POUR LE DEVIS (OPTIONNEL)
  - textbox "Demandes particulières, délai souhaité, instructions de livraison…"
  - complementary:
    - text: RÉCAPITULATIF
    - term: Sous-total HT
    - definition: 60,00 €
    - term: TVA 20%
    - definition: 12,00 €
    - text: Total TTC 72,00 €
    - button "Commander"
    - paragraph: Votre commande sera transmise pour validation. Un devis vous sera ensuite envoyé à signer avant la livraison.
- alert
```

# Test source

```ts
  31  | 
  32  |     // 2. Click to add to cart -> should open login modal
  33  |     await addToCartBtn.click();
  34  |     await expect(page.getByText("CONNEXION REQUISE")).toBeVisible();
  35  | 
  36  |     // 3. Fill and submit login form
  37  |     await page.locator('input[name="email"]').fill("john@example.com");
  38  |     await page.locator('input[name="password"]').fill("password123");
  39  |     await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  40  | 
  41  |     // 4. After login, it redirect back and consumes the pending cart intent
  42  |     // Wait for the button to show "Ajouté au panier" or "Ajouter au panier"
  43  |     await expect(page.getByRole("button", { name: "Ajouter au panier" })).toBeVisible({ timeout: 10000 });
  44  | 
  45  |     // 5. Navigate to the cart page
  46  |     await page.goto("/cart");
  47  | 
  48  |     // The cart should show "Produit Retail 1" with quantity 1
  49  |     await expect(page.getByText("Produit Retail 1")).toBeVisible();
  50  |     await expect(page.locator("div").filter({ hasText: /^1$/ }).first()).toBeVisible();
  51  | 
  52  |     // 6. Enforce retail limit of 3 units
  53  |     // Click plus button twice to reach 3
  54  |     const plusBtn = page.getByRole("button", { name: "Augmenter la quantité" });
  55  |     await plusBtn.click();
  56  |     // Wait for update
  57  |     await page.waitForTimeout(300);
  58  |     await plusBtn.click();
  59  |     await page.waitForTimeout(300);
  60  | 
  61  |     // The plus button should now be disabled since we hit MAX_QTY_PER_PRODUCT (3)
  62  |     await expect(plusBtn).toBeDisabled();
  63  |   });
  64  | 
  65  |   test("stale session cookie triggers auth alert and redirects to /login on cart update", async ({ page }) => {
  66  |     // 1. Visit product page as guest
  67  |     await page.goto("/products/prod-1");
  68  |     const addToCartBtn = page.getByRole("button", { name: "Se connecter pour ajouter" });
  69  |     await expect(addToCartBtn).toBeVisible();
  70  | 
  71  |     // 2. Log in
  72  |     await addToCartBtn.click();
  73  |     await page.locator('input[name="email"]').fill("john@example.com");
  74  |     await page.locator('input[name="password"]').fill("password123");
  75  |     await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  76  |     await expect(page.getByRole("button", { name: "Ajouter au panier" })).toBeVisible();
  77  | 
  78  |     // 3. Invalidate session on the backend
  79  |     backend.loggedIn = false;
  80  | 
  81  |     // 4. Setup dialog handler to accept the expiration alert
  82  |     let alertText = "";
  83  |     page.once("dialog", async (dialog) => {
  84  |       alertText = dialog.message();
  85  |       await dialog.accept();
  86  |     });
  87  | 
  88  |     // 5. Try to add to cart -> should trigger 401 -> alert -> redirect to /login
  89  |     await page.getByRole("button", { name: "Ajouter au panier" }).click();
  90  | 
  91  |     // 6. Verify alert dialog was shown with expected text
  92  |     await expect.poll(() => alertText).toContain("Votre session a expiré");
  93  | 
  94  |     // 7. Verify we got redirected to the login page
  95  |     await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  96  |   });
  97  | });
  98  | 
  99  | test.describe("B2B Pro Cart Flow", () => {
  100 |   test("B2B user can add high quantity (> 3) of products and update without clamping to 3", async ({ page }) => {
  101 |     // 1. Login as a pro user first
  102 |     await page.goto("/pro/login");
  103 |     await page.locator('input[name="email"]').fill("pro@example.com");
  104 |     await page.locator('input[name="password"]').fill("password123");
  105 |     await page.getByRole("button", { name: "Accéder au portail" }).click();
  106 | 
  107 |     // Should redirect to /pro/account or /pro/products
  108 |     await expect(page).toHaveURL(/\/pro\/(account|products)/, { timeout: 10000 });
  109 | 
  110 |     // 2. Go to B2B product detail page
  111 |     await page.goto("/pro/products/prod-2");
  112 |     await expect(page.getByRole("heading", { name: "Produit Pro 2" })).toBeVisible();
  113 | 
  114 |     // 3. Increase quantity to 5 (greater than retail limit 3)
  115 |     const plusBtn = page.getByRole("button", { name: "Augmenter la quantité" });
  116 |     for (let i = 0; i < 4; i++) {
  117 |       await plusBtn.click();
  118 |     }
  119 |     // Verify quantity input shows 5
  120 |     await expect(page.getByText("5", { exact: true })).toBeVisible();
  121 | 
  122 |     // 4. Click "Ajouter au devis"
  123 |     await page.getByRole("button", { name: "Ajouter au devis" }).click();
  124 |     await expect(page.getByText("Ajouté au panier")).toBeVisible();
  125 | 
  126 |     // 5. Navigate to pro cart page
  127 |     await page.goto("/pro/cart");
  128 |     await expect(page.getByText("Produit Pro 2").first()).toBeVisible();
  129 |     
  130 |     // Check quantity is indeed 5 (not clamped to 3)
> 131 |     await expect(page.locator("div").filter({ hasText: /^5$/ }).first()).toBeVisible();
      |                                                                          ^ Error: expect(locator).toBeVisible() failed
  132 | 
  133 |     // 6. Increase quantity even further in cart (e.g., to 6)
  134 |     const cartPlusBtn = page.getByRole("button", { name: "Augmenter" });
  135 |     await cartPlusBtn.click();
  136 |     await page.waitForTimeout(300);
  137 | 
  138 |     // Check quantity is now 6
  139 |     await expect(page.locator("div").filter({ hasText: /^6$/ }).first()).toBeVisible();
  140 |   });
  141 | });
  142 | 
```