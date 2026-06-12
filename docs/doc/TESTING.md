# Testing Guide — AlimExpressCatalog

How tests are organized in this project, and how to run them.

---

## Cheatsheet

> ⚠️ In this environment the default Vitest **`forks`** pool times out spawning workers.
> Always pass **`--pool=threads`** for unit/component tests.

| Goal | Command |
| --- | --- |
| Run the whole unit/component suite | `npx vitest run --pool=threads` |
| Watch mode (re-run on change) | `npx vitest --pool=threads` |
| Run one file | `npx vitest run __tests__/lib/catalog-sort.test.ts --pool=threads` |
| Run several files | `npx vitest run __tests__/components/browse-cards.test.tsx __tests__/lib/category-display.test.ts --pool=threads --no-file-parallelism` |
| Filter by test name | `npx vitest run --pool=threads -t "out of stock"` |
| Coverage report | `npx vitest run --pool=threads --coverage` |
| Lint (run before committing) | `npm run lint` |
| End-to-end (Playwright) | `npx playwright test` |
| One E2E file | `npx playwright test e2e/cart.spec.ts` |
| E2E with UI runner | `npx playwright test --ui` |

There is no `npm test` script defined — call `vitest` / `playwright` directly as above.

---

## Test stack

| Layer | Tool | Config |
| --- | --- | --- |
| Unit & component | [Vitest](https://vitest.dev) v4 | [vitest.config.ts](../../vitest.config.ts) |
| DOM environment | jsdom | set in config (`environment: "jsdom"`) |
| Component rendering | `@testing-library/react` + `@testing-library/jest-dom` | [vitest.setup.ts](../../vitest.setup.ts) |
| End-to-end (browser) | [Playwright](https://playwright.dev) | [playwright.config.ts](../../playwright.config.ts) |

- Globals are enabled, so `describe` / `it` / `expect` / `vi` are available without importing
  (most files import them explicitly anyway for clarity).
- The `@` import alias maps to the project root (e.g. `@/lib/catalog`).
- Test files are discovered at `__tests__/**/*.{test,spec}.{ts,tsx}`.

---

## Layout

```
__tests__/
  actions/        # server actions (auth, cart, checkout, quotes, password…) — node env, mocked backend
  components/     # React components — jsdom env, React Testing Library
  lib/            # pure helpers & server lib (catalog, pricing, sorting, category-display…)
  catalog.test.ts # integration-style catalog filtering
e2e/
  cart.spec.ts    # Playwright browser flows (guest cart → login → quantity limits…)
  mock-backend.ts # in-memory backend the E2E spec runs against
```

---

## The three test patterns

Pick the pattern that matches what you're testing. Each maps to a real example file you can copy.

### 1. Pure function / lib — no env header, no mocks
Direct import, direct assertions. Fastest and most valuable.

Examples: [\_\_tests\_\_/lib/catalog-sort.test.ts](../../__tests__/lib/catalog-sort.test.ts),
[\_\_tests\_\_/lib/category-display.test.ts](../../__tests__/lib/category-display.test.ts).

```ts
import { describe, expect, it } from "vitest";
import { sortProducts } from "@/lib/catalog-sort";

it("sorts by price ascending", () => {
  expect(sortProducts([a, b], "price-asc").map((p) => p.id)).toEqual(["b", "a"]);
});
```

### 2. Component — jsdom + React Testing Library
Header `// @vitest-environment jsdom`, render with `render`, query with `screen`. `next/image`
and `next/link` render natively in jsdom (no mocking needed). Assert on visible text, roles,
and link `href`s — not on classes or styles.

Examples: [\_\_tests\_\_/components/product-card.test.tsx](../../__tests__/components/product-card.test.tsx),
[\_\_tests\_\_/components/pro-product-card.test.tsx](../../__tests__/components/pro-product-card.test.tsx),
[\_\_tests\_\_/components/browse-cards.test.tsx](../../__tests__/components/browse-cards.test.tsx).

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { ProProductCard } from "@/components/pro/pro-product-card";

it("shows the devis CTA when in stock", () => {
  render(<ProProductCard product={makeProduct()} pricingLevel="C" />);
  expect(screen.getByRole("link", { name: /ajouter au devis/i }))
    .toHaveAttribute("href", "/pro/products/p1");
});
```

**Client components that use `next/navigation`** (router / search params) need it mocked.
Copy the mock from
[\_\_tests\_\_/components/catalog-search-input.test.tsx](../../__tests__/components/catalog-search-input.test.tsx)
or [\_\_tests\_\_/components/catalog-sort-select.test.tsx](../../__tests__/components/catalog-sort-select.test.tsx):

```tsx
const routerPush = vi.fn();
const searchParamsStore = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
  useSearchParams: () => searchParamsStore,
  usePathname: () => "/products",
}));
```

### 3. Server action / server lib — node env + mocked `backendFetch`
Header `// @vitest-environment node`. The REST client is mocked with a **hoisted** `vi.fn()` so the
mock exists before the module under test imports it. Assert which endpoint was called and with
which auth mode.

Examples: every file in [\_\_tests\_\_/actions/](../../__tests__/actions/),
[\_\_tests\_\_/lib/catalog.test.ts](../../__tests__/lib/catalog.test.ts).

```ts
// @vitest-environment node
const { backendFetchMock } = vi.hoisted(() => ({ backendFetchMock: vi.fn() }));
vi.mock("@/lib/api-client", () => ({ backendFetch: backendFetchMock /* …ApiClientError… */ }));

it("calls the retail cart endpoint with required auth", async () => {
  await addToCart(/* … */);
  expect(backendFetchMock).toHaveBeenCalledWith(
    "/api/v1/retail/cart",
    expect.objectContaining({ auth: "required" }),
  );
});
```

---

## Writing a new test — quick recipe

1. Put the file under the matching `__tests__/` subfolder, named `*.test.ts(x)`.
2. Choose a pattern above and copy the closest existing example.
3. For product data, reuse a `makeProduct()` builder (see the product-card / catalog-sort tests).
   Remember the `ProductCard` type includes `marques: []`.
4. Prefer accessible queries: `getByRole`, `getByText`, `getByAltText`. Use `getAllByText` when a
   value legitimately appears more than once (e.g. a price shown in both mobile and desktop blocks).
5. Run it: `npx vitest run path/to/file --pool=threads`.
6. Run the full suite and lint before committing: `npx vitest run --pool=threads && npm run lint`.

---

## End-to-end (Playwright)

E2E specs in [e2e/](../../e2e/) drive a real browser against an in-memory backend
([e2e/mock-backend.ts](../../e2e/mock-backend.ts)) rather than the live API, so they're deterministic.
Playwright starts its own dev server (see [playwright.config.ts](../../playwright.config.ts)); you do
**not** need to run `npm run dev` first.

```
npx playwright test            # headless, all specs
npx playwright test --ui       # interactive runner
npx playwright show-report     # open the last HTML report
```

---

## Conventions

- **Test behavior, not styling.** Assert on text, roles, and hrefs — never on Tailwind classes or
  inline colors (they change often and aren't user-facing contracts).
- **Keep tests deterministic.** No real network, no real time. Mock `backendFetch`; use
  `vi.useFakeTimers()` for debounced UI (see the search-input test).
- **One concern per `it`.** A focused failure message beats a giant assertion block.
- **Match the existing file's style** in the folder you're adding to.
