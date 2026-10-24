import { test, expect } from "@playwright/test";
import { createServer, type Server } from "node:http";
test.setTimeout(90_000);
let backend: Server;
const categories = [
  {
    id: "food",
    name: "Épicerie salée",
    nameAr: "البقالة المالحة",
    code: "epicerie-salee",
    parentId: null,
    imageUrl: null,
    isFeatured: true,
  },
  {
    id: "rice",
    name: "Riz, pâtes et légumes secs",
    nameAr: "الأرز والمعكرونة والبقوليات",
    code: "riz-pates",
    parentId: "food",
    imageUrl: null,
    isFeatured: false,
  },
  {
    id: "old",
    name: "Old unused category",
    imageUrl: null,
    parentId: null,
    isFeatured: false,
  },
];
const extraCategories = [
  {
    id: "sweet",
    name: "Épicerie sucrée",
    nameAr: "البقالة الحلوة",
    code: "epicerie-sucree",
  },
  { id: "drinks", name: "Boissons", nameAr: "المشروبات", code: "boissons" },
  {
    id: "dairy",
    name: "Produits laitiers",
    nameAr: "الألبان والأجبان",
    code: "laitiers",
  },
  {
    id: "meat",
    name: "Charcuterie",
    nameAr: "اللحوم المصنعة",
    code: "charcuterie",
  },
  {
    id: "home",
    name: "Maison et hygiène",
    nameAr: "المنزل والعناية الشخصية",
    code: "maison-hygiene",
  },
].map((category) => ({
  ...category,
  parentId: null,
  imageUrl: null,
  isFeatured: true,
}));
const product = {
  id: "rice",
  name: "Riz basmati",
  nameAr: "أرز بسمتي",
  sku: "RICE-1",
  description: "Riz à grains longs.",
  descriptionAr: "أرز طويل الحبة.",
  category: "Épicerie salée",
  categoryAr: "البقالة المالحة",
  categoryCode: "epicerie-salee",
  subcategory: "Riz, pâtes et légumes secs",
  subcategoryAr: "الأرز والمعكرونة والبقوليات",
  subcategoryCode: "riz-pates",
  tags: ["basmati"],
  marques: ["Duru"],
  imageUrl: null,
  unitsPerPack: 1,
  baseUnit: "PIECE",
  visibility: "BOTH",
  sellingPrice: 3,
  unitSellingPrice: null,
  price: 3,
  priceLevelC: null,
  priceLevelD: null,
  priceLevelE: null,
  priceLevelF: null,
  retailStatus: "VISIBLE",
  wholesaleStatus: "VISIBLE",
  isOutOfStock: false,
  availableStock: 24,
};
test.beforeAll(async () => {
  backend = createServer((req, res) => {
    const path = new URL(req.url!, "http://localhost:3091").pathname;
    res.setHeader("content-type", "application/json");
    if (path.endsWith("/catalog"))
      res.end(
        JSON.stringify({
          products: [
            product,
            {
              ...product,
              id: "fallback",
              name: "Riz blanc",
              nameAr: null,
              description: null,
              descriptionAr: null,
              tags: [],
            },
            ...extraCategories.map((category) => ({
              ...product,
              id: category.id,
              name: category.name,
              nameAr: category.nameAr,
              category: category.name,
              categoryAr: category.nameAr,
              categoryCode: category.code,
              subcategory: null,
              subcategoryAr: null,
              subcategoryCode: null,
              tags: [],
            })),
          ],
        }),
      );
    else if (path.endsWith("/categories"))
      res.end(
        JSON.stringify({ categories: [...categories, ...extraCategories] }),
      );
    else if (path.endsWith("/marques"))
      res.end(JSON.stringify({ marques: [] }));
    else if (path.includes("/deliveries/"))
      res.end(JSON.stringify({ deliveries: [] }));
    else {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: "Authentication required" }));
    }
  });
  await new Promise<void>((resolve) => backend.listen(3091, resolve));
});
test.afterAll(async () => {
  await new Promise<void>((resolve) => backend.close(() => resolve()));
});
for (const base of ["", "/pro"]) {
  test(`${base || "retail"}: category tree, translated details, Arabic search and persistent switching`, async ({
    page,
  }) => {
    await page.goto(`${base}/categories`);
    await expect(
      page.getByRole("link", { name: "Old unused category" }),
    ).toHaveCount(0);
    const categoryCard = page
      .getByRole("main")
      .getByRole("link", { name: "ÉPICERIE SALÉE" });
    const img = categoryCard.locator("img");
    await expect(img).toHaveAttribute("src", /epicerie-salee/);
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
    await page
      .getByRole("main")
      .getByRole("link", { name: "Riz, pâtes et légumes secs" })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Riz, pâtes et légumes secs",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByText("Riz basmati", { exact: true }),
    ).toBeVisible();
    const path = new URL(page.url()).pathname + new URL(page.url()).search;
    await page.getByRole("button", { name: "Passer en arabe" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    expect(new URL(page.url()).pathname + new URL(page.url()).search).toBe(
      path,
    );
    await expect(
      page.getByRole("main").getByText("أرز بسمتي", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByText("Riz blanc", { exact: true }),
    ).toBeVisible();
    await page.getByRole("searchbox").fill("بسمتي");
    await expect(page).toHaveURL(/q=/);
    await expect(
      page.getByRole("main").getByText("Riz blanc", { exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("main")
      .getByText("أرز بسمتي", { exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "أرز بسمتي", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("أرز طويل الحبة.", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("basmati", { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await page.getByRole("button", { name: "التبديل إلى الفرنسية" }).click();
    await expect(
      page.getByRole("heading", { name: "Riz basmati", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Riz à grains longs.", { exact: true }),
    ).toBeVisible();
  });
}
test("Arabic category navigation fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .context()
    .addCookies([
      { name: "catalog_language", value: "ar", domain: "localhost", path: "/" },
    ]);
  await page.goto("/categories");
  await expect(page.getByRole("heading", { name: "أقسامنا" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  // Six parent category photos plus one thumbnail per subcategory shortcut.
  await expect(page.getByRole("main").locator("img")).toHaveCount(7);
  const dismissCookies = page.getByRole("button", { name: "فهمت" });
  await dismissCookies.click();
  for (const image of await page.getByRole("main").locator("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/categories-ar-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("button", { name: "التبديل إلى الفرنسية" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.screenshot({
    path: "test-results/categories-fr-desktop.png",
    fullPage: true,
  });
});
