import { test, expect } from "@playwright/test";
import { createServer, type Server } from "node:http";

let backend: Server;
const products = Array.from({ length: 1000 }, (_, index) => ({
  id: `perf-${index + 1}`,
  name: `Produit ${String(index + 1).padStart(4, "0")}`,
  nameAr: `منتج ${index + 1}`,
  sku: `PERF-${index + 1}`,
  category: "Épicerie salée",
  categoryCode: "epicerie-salee",
  categoryAr: "البقالة المالحة",
  marques: ["Duru"],
  tags: ["basmati"],
  imageUrl: null,
  unitsPerPack: 1,
  baseUnit: "PIECE",
  visibility: "BOTH",
  sellingPrice: index + 1,
  price: index + 1,
  retailStatus: "VISIBLE",
  wholesaleStatus: "VISIBLE",
  availableStock: 100,
}));

test.beforeAll(async () => {
  backend = createServer((req, res) => {
    const path = new URL(req.url!, "http://localhost:3091").pathname;
    res.setHeader("content-type", "application/json");
    if (path.endsWith("/catalog")) res.end(JSON.stringify({ products }));
    else if (path.endsWith("/categories")) res.end(JSON.stringify({ categories: [{
      id: "food", name: "Épicerie salée", nameAr: "البقالة المالحة",
      code: "epicerie-salee", parentId: null, imageUrl: null, isFeatured: true,
    }] }));
    else if (path.endsWith("/marques")) res.end(JSON.stringify({ marques: [] }));
    else { res.statusCode = 401; res.end(JSON.stringify({ error: "Authentication required" })); }
  });
  await new Promise<void>((resolve) => backend.listen(3091, resolve));
});
test.afterAll(async () => {
  await new Promise<void>((resolve) => backend.close(() => resolve()));
});

for (const base of ["", "/pro"]) {
  test(`${base || "retail"}: 1000-product page stays bounded and all products remain accessible`, async ({ page, request }, testInfo) => {
    const measurements = [];
    for (let run = 0; run < 5; run++) {
      const start = performance.now();
      const response = await request.get(`${base}/products`);
      const html = await response.text();
      measurements.push({ ms: Math.round(performance.now() - start), bytes: Buffer.byteLength(html), cards: (html.match(/<article/g) ?? []).length });
    }
    console.log(JSON.stringify({ audience: base || "retail", measurements }));
    await testInfo.attach("catalog-performance.json", { body: JSON.stringify(measurements, null, 2), contentType: "application/json" });
    await page.goto(`${base}/products`);
    await expect(page.locator("main article")).toHaveCount(24);
    await expect(page.locator("main")).toContainText("1000 produits");
    await page.getByRole("navigation", { name: "Pagination du catalogue" }).first().getByRole("link", { name: "Suivant" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.locator("main article")).toHaveCount(24);
    await expect(page.locator("main article").first()).toContainText("Produit 0025");
    await page.goto(`${base}/products?page=42`);
    await expect(page.locator("main article")).toHaveCount(16);
    await expect(page.locator("main article").last()).toContainText("Produit 1000");
    await page.getByRole("searchbox", { name: "Rechercher dans le catalogue" }).fill("PERF-1000");
    await expect(page).toHaveURL(/q=PERF-1000/);
    expect(new URL(page.url()).searchParams.has("page")).toBe(false);
    await expect(page.locator("main article")).toHaveCount(1);
    await expect(page.locator("main article")).toContainText("Produit 1000");
    await page.goto(`${base}/products?page=2&sort=price-desc&category=epicerie-salee&marque=Duru&tag=basmati`);
    const previous = page.getByRole("navigation", { name: "Pagination du catalogue" }).first().getByRole("link", { name: "Précédent" });
    const href = new URL((await previous.getAttribute("href"))!, "http://localhost");
    for (const [key, value] of Object.entries({ sort: "price-desc", category: "epicerie-salee", marque: "Duru", tag: "basmati" })) expect(href.searchParams.get(key)).toBe(value);
    await expect(page.locator("main article").first()).toContainText("Produit 0976");
    await page.getByRole("combobox", { name: "Trier les produits" }).selectOption("price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);
    expect(new URL(page.url()).searchParams.has("page")).toBe(false);
    await expect(page.locator("main article").first()).toContainText("Produit 0001");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: testInfo.outputPath("catalog-mobile.png"), fullPage: true, animations: "disabled" });
    await page.getByRole("button", { name: "Passer en arabe" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.getByRole("navigation", { name: "صفحات الكتالوج" }).first()).toContainText("الصفحة 1 من 42");
    await expect(page.locator("main article")).toHaveCount(24);
    await page.screenshot({ path: testInfo.outputPath("catalog-mobile-ar.png"), fullPage: true, animations: "disabled" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
