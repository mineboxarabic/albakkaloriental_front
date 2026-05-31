# Order Rules — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire three retail business rules into the frontend: minimum 30 € order, 3 € delivery fee (free at 50 €+), and max 3 units per product — mirroring backend enforcement already in place.

**Architecture:** A single constants file (`lib/order-rules.ts`) is the source of truth; all components import from it. Cart context enforces the max-qty rule client-side before hitting the backend. Cart and checkout UI surfaces delivery fee and minimum order state. No new components — all changes are in-place edits to existing files.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Tailwind, Vitest (jsdom), `@testing-library/jest-dom`

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| **Create** | `lib/order-rules.ts` | Constants + `deliveryFee()` helper |
| **Create** | `__tests__/lib/order-rules.test.ts` | Unit tests for the helper |
| **Modify** | `components/cart-context.tsx` | Max-qty guard in `addItem`; clamp in `updateQty` |
| **Modify** | `app/(retail)/cart/page.tsx` | Delivery fee row, nudge, grand total, disabled CTA, disabled `+` |
| **Modify** | `app/(retail)/checkout/checkout-form.tsx` | Delivery fee row, grand total, min-order guard |
| **Modify** | `app/(retail)/products/[id]/add-to-cart-button.tsx` | Clamp picker; disable when at max |
| **Modify** | `components/retail/quick-add-button.tsx` | Disable when product already at max in cart |
| **Modify** | `CLAUDE.md` | Point to `lib/order-rules.ts` |

---

## Task 1: Create `lib/order-rules.ts` with tests (TDD)

**Files:**
- Create: `__tests__/lib/order-rules.test.ts`
- Create: `lib/order-rules.ts`

- [ ] **Step 1.1 — Write the failing tests**

Create `__tests__/lib/order-rules.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  MIN_ORDER_EUR,
  FREE_DELIVERY_THRESHOLD_EUR,
  DELIVERY_FEE_EUR,
  MAX_QTY_PER_PRODUCT,
  deliveryFee,
} from "@/lib/order-rules";

describe("order-rules constants", () => {
  it("MIN_ORDER_EUR is 30", () => expect(MIN_ORDER_EUR).toBe(30));
  it("FREE_DELIVERY_THRESHOLD_EUR is 50", () => expect(FREE_DELIVERY_THRESHOLD_EUR).toBe(50));
  it("DELIVERY_FEE_EUR is 3", () => expect(DELIVERY_FEE_EUR).toBe(3));
  it("MAX_QTY_PER_PRODUCT is 3", () => expect(MAX_QTY_PER_PRODUCT).toBe(3));
});

describe("deliveryFee()", () => {
  it("charges 3 € when subtotal is below the free threshold", () => {
    expect(deliveryFee(0)).toBe(3);
    expect(deliveryFee(29.99)).toBe(3);
    expect(deliveryFee(30)).toBe(3);
    expect(deliveryFee(49.99)).toBe(3);
  });

  it("is free exactly at the threshold", () => {
    expect(deliveryFee(50)).toBe(0);
  });

  it("is free above the threshold", () => {
    expect(deliveryFee(50.01)).toBe(0);
    expect(deliveryFee(200)).toBe(0);
  });
});
```

- [ ] **Step 1.2 — Run tests to confirm they fail**

```
npx vitest run __tests__/lib/order-rules.test.ts
```

Expected: `Cannot find module '@/lib/order-rules'`

- [ ] **Step 1.3 — Create `lib/order-rules.ts`**

```ts
export const MIN_ORDER_EUR = 30;
export const FREE_DELIVERY_THRESHOLD_EUR = 50;
export const DELIVERY_FEE_EUR = 3;
export const MAX_QTY_PER_PRODUCT = 3;

export function deliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD_EUR ? 0 : DELIVERY_FEE_EUR;
}
```

- [ ] **Step 1.4 — Run tests to confirm they pass**

```
npx vitest run __tests__/lib/order-rules.test.ts
```

Expected: 7 tests passing.

- [ ] **Step 1.5 — Commit**

```
git add lib/order-rules.ts __tests__/lib/order-rules.test.ts
git commit -m "feat(order-rules): add constants and deliveryFee helper"
```

---

## Task 2: Enforce max qty in cart context

**Files:**
- Modify: `components/cart-context.tsx`

- [ ] **Step 2.1 — Add import**

At the top of `components/cart-context.tsx`, add after the existing imports:

```ts
import { MAX_QTY_PER_PRODUCT } from "@/lib/order-rules";
```

- [ ] **Step 2.2 — Guard `addItem`**

Replace the current `addItem` callback (lines 143–158) with:

```ts
const addItem = useCallback(
  async (item: AddCartItem, quantity = 1) => {
    if (quantity <= 0) return;
    const existingQty =
      items.find((i) => i.productId === item.productId)?.quantity ?? 0;
    if (existingQty + quantity > MAX_QTY_PER_PRODUCT) {
      setError(
        `Vous ne pouvez pas commander plus de ${MAX_QTY_PER_PRODUCT} unités du même produit.`,
      );
      return;
    }
    const result = await actions.add({
      productId: item.productId,
      quantity,
      saleUnit: item.saleUnit ?? "UNIT",
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    await refresh();
  },
  [actions, refresh, items],
);
```

Note: `items` is added to the dependency array because the guard reads from it.

- [ ] **Step 2.3 — Clamp `updateQty`**

Replace the current `updateQty` callback (lines 160–169) with:

```ts
const updateQty = useCallback(
  async (lineId: string, quantity: number) => {
    const clamped = Math.min(MAX_QTY_PER_PRODUCT, Math.max(0, quantity));
    const result = await actions.update(lineId, clamped);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    await refresh();
  },
  [actions, refresh],
);
```

- [ ] **Step 2.4 — Verify build**

```
npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 2.5 — Commit**

```
git add components/cart-context.tsx
git commit -m "feat(cart): enforce max 3 units per product in cart context"
```

---

## Task 3: Update cart page — delivery fee, nudge, grand total, disabled CTA, disabled `+`

**Files:**
- Modify: `app/(retail)/cart/page.tsx`

- [ ] **Step 3.1 — Add imports**

Add to the existing import block at the top of the file:

```ts
import {
  MIN_ORDER_EUR,
  FREE_DELIVERY_THRESHOLD_EUR,
  MAX_QTY_PER_PRODUCT,
  deliveryFee,
} from "@/lib/order-rules";
```

- [ ] **Step 3.2 — Compute derived values inside `CartPage`**

Inside `CartPage`, immediately after destructuring from `useCart()`, add:

```ts
const fee = deliveryFee(total);
const grandTotal = total + fee;
const belowMinimum = total > 0 && total < MIN_ORDER_EUR;
const nudgeFreeDelivery = total >= MIN_ORDER_EUR && total < FREE_DELIVERY_THRESHOLD_EUR;
```

- [ ] **Step 3.3 — Replace the summary panel inside `<aside>`**

Find and replace the entire `<aside className="col-span-4">` block with:

```tsx
<aside className="col-span-4">
  <div
    className="rounded-lg border bg-white p-5"
    style={{ borderColor: COLORS.border }}
  >
    <div
      className="text-[12px] font-bold tracking-wide"
      style={{ color: COLORS.text }}
    >
      RÉCAPITULATIF
    </div>

    <dl className="mt-4 space-y-2 text-[13px]" style={{ color: COLORS.text }}>
      <div className="flex items-center justify-between">
        <dt style={{ color: COLORS.muted }}>Sous-total</dt>
        <dd className="font-semibold">{formatPriceEUR(total)}</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt style={{ color: COLORS.muted }}>Livraison</dt>
        <dd
          className="font-semibold"
          style={{ color: fee === 0 ? COLORS.primary : COLORS.text }}
        >
          {fee === 0 ? "Gratuite" : formatPriceEUR(fee)}
        </dd>
      </div>
    </dl>

    {nudgeFreeDelivery && (
      <div
        className="mt-3 rounded-md px-3 py-2 text-[11.5px]"
        style={{ background: "#FEF9C3", color: "#854D0E" }}
      >
        Plus {formatPriceEUR(FREE_DELIVERY_THRESHOLD_EUR - total)} pour la livraison gratuite
      </div>
    )}

    {belowMinimum && (
      <div
        className="mt-3 rounded-md px-3 py-2 text-[11.5px]"
        style={{ background: "#FCE9E5", color: "#7A1709" }}
      >
        Minimum de commande&nbsp;: {formatPriceEUR(MIN_ORDER_EUR)}
      </div>
    )}

    <div
      className="mt-4 flex items-center justify-between border-t pt-4"
      style={{ borderColor: COLORS.border }}
    >
      <span className="text-[14px] font-bold" style={{ color: COLORS.text }}>
        Total
      </span>
      <span className="text-[20px] font-extrabold" style={{ color: COLORS.primary }}>
        {formatPriceEUR(grandTotal)}
      </span>
    </div>

    {belowMinimum ? (
      <button
        type="button"
        disabled
        className="mt-5 grid h-11 w-full cursor-not-allowed place-items-center rounded-md text-[14px] font-semibold text-white opacity-40 shadow-sm"
        style={{ background: COLORS.primary }}
      >
        Valider mon panier
      </button>
    ) : (
      <Link
        href="/checkout"
        className="mt-5 grid h-11 place-items-center rounded-md text-[14px] font-semibold text-white shadow-sm"
        style={{ background: COLORS.primary }}
      >
        Valider mon panier
      </Link>
    )}

    <p className="mt-3 text-center text-[11.5px]" style={{ color: COLORS.muted }}>
      Paiement à la livraison disponible.
    </p>
  </div>
</aside>
```

- [ ] **Step 3.4 — Disable the `+` stepper when quantity is at max**

In the item row loop, find the "Augmenter la quantité" button and add `disabled` handling:

```tsx
<button
  type="button"
  aria-label="Augmenter la quantité"
  onClick={() => updateQty(it.lineId, it.quantity + 1)}
  disabled={it.quantity >= MAX_QTY_PER_PRODUCT}
  className="grid h-9 w-9 place-items-center transition hover:bg-[#FAF8F2] disabled:cursor-not-allowed disabled:opacity-40"
  style={{ color: COLORS.text }}
>
  <Plus className="h-4 w-4" strokeWidth={2.2} />
</button>
```

- [ ] **Step 3.5 — Verify build**

```
npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 3.6 — Commit**

```
git add app/\(retail\)/cart/page.tsx
git commit -m "feat(cart): show delivery fee, minimum order warning, and disable CTA below minimum"
```

---

## Task 4: Update checkout form — delivery fee, grand total, min-order guard

**Files:**
- Modify: `app/(retail)/checkout/checkout-form.tsx`

- [ ] **Step 4.1 — Add imports**

Add to the existing import block:

```ts
import { MIN_ORDER_EUR, deliveryFee } from "@/lib/order-rules";
```

- [ ] **Step 4.2 — Compute derived values in `CheckoutForm`**

Inside `CheckoutForm`, after `const { items, total, clearCart } = useCart();`, add:

```ts
const fee = deliveryFee(total);
const grandTotal = total + fee;
const belowMinimum = total > 0 && total < MIN_ORDER_EUR;
```

- [ ] **Step 4.3 — Add minimum-order guard to `onSubmit`**

In the `onSubmit` handler, after the `items.length === 0` check, add:

```ts
if (belowMinimum) {
  setError(`Commande minimum de ${MIN_ORDER_EUR} €.`);
  return;
}
```

- [ ] **Step 4.4 — Update the summary panel inside `<aside>`**

Find the summary `<ul>` block inside `<aside>` and replace the entire `<aside>` content with:

```tsx
<aside className="md:col-span-5">
  <div
    className="rounded-xl border bg-white p-5"
    style={{ borderColor: COLORS.border }}
  >
    <div className="text-[12px] font-bold tracking-wide" style={{ color: COLORS.text }}>
      RÉCAPITULATIF
    </div>

    <ul className="mt-4 space-y-2.5 text-[13px]" style={{ color: COLORS.text }}>
      {items.map((it) => (
        <li key={it.productId} className="flex items-start justify-between gap-3">
          <span className="line-clamp-2 flex-1">
            {it.quantity} × {it.name}
          </span>
          <span className="font-semibold whitespace-nowrap">
            {formatPriceEUR(it.unitPrice * it.quantity)}
          </span>
        </li>
      ))}
    </ul>

    <dl className="mt-4 space-y-2 border-t pt-4 text-[13px]" style={{ borderColor: COLORS.border }}>
      <div className="flex items-center justify-between">
        <dt style={{ color: COLORS.muted }}>Sous-total</dt>
        <dd className="font-semibold">{formatPriceEUR(total)}</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt style={{ color: COLORS.muted }}>Livraison</dt>
        <dd
          className="font-semibold"
          style={{ color: fee === 0 ? COLORS.primary : COLORS.text }}
        >
          {fee === 0 ? "Gratuite" : formatPriceEUR(fee)}
        </dd>
      </div>
    </dl>

    <div
      className="mt-4 flex items-center justify-between border-t pt-4"
      style={{ borderColor: COLORS.border }}
    >
      <span className="text-[14px] font-bold" style={{ color: COLORS.text }}>
        Total
      </span>
      <span className="text-[20px] font-extrabold" style={{ color: COLORS.primary }}>
        {formatPriceEUR(grandTotal)}
      </span>
    </div>

    {error && (
      <div
        className="mt-4 rounded-md border-l-4 px-3 py-2 text-[12.5px]"
        style={{ background: "#FCE9E5", borderColor: COLORS.red, color: "#7A1709" }}
      >
        {error}
      </div>
    )}

    <button
      type="submit"
      disabled={pending || belowMinimum}
      className="mt-5 grid h-11 w-full place-items-center rounded-md text-[14px] font-semibold text-white shadow-sm disabled:opacity-70"
      style={{ background: COLORS.primary }}
    >
      {pending ? "Envoi de la commande..." : "Confirmer ma commande"}
    </button>

    <p className="mt-3 text-center text-[11.5px]" style={{ color: COLORS.muted }}>
      Vous serez recontacté pour confirmer la commande et la livraison.
    </p>
  </div>
</aside>
```

- [ ] **Step 4.5 — Verify build**

```
npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 4.6 — Commit**

```
git add app/\(retail\)/checkout/checkout-form.tsx
git commit -m "feat(checkout): add delivery fee line, correct grand total, block below minimum"
```

---

## Task 5: Update `AddToCartButton` — clamp picker, check existing qty, disable at max

**Files:**
- Modify: `app/(retail)/products/[id]/add-to-cart-button.tsx`

- [ ] **Step 5.1 — Add imports**

Add to the existing import block:

```ts
import { MAX_QTY_PER_PRODUCT } from "@/lib/order-rules";
```

- [ ] **Step 5.2 — Read existing cart qty for this product**

Inside `AddToCartButton`, after `const { addItem } = useCart();`, get the existing quantity:

```ts
const { addItem, items } = useCart();
const existingQty = items.find((i) => i.productId === item.productId)?.quantity ?? 0;
const remainingQty = Math.max(0, MAX_QTY_PER_PRODUCT - existingQty);
```

- [ ] **Step 5.3 — Clamp the local picker and disable at max**

Replace the `qty` initialisation and `+` / `-` button logic:

```tsx
const [qty, setQty] = useState(1);

// Ensure local qty stays within remaining slots whenever the cart changes
const effectiveQty = Math.min(qty, remainingQty);
```

Update the `−` button's `onClick`:

```tsx
onClick={() => setQty((q) => Math.max(1, q - 1))}
```

Update the `+` button's `onClick`:

```tsx
onClick={() => setQty((q) => Math.min(remainingQty, q + 1))}
disabled={effectiveQty >= remainingQty}
className="grid h-11 w-11 place-items-center transition hover:bg-[#FAF8F2] disabled:cursor-not-allowed disabled:opacity-40"
```

Update the qty display:

```tsx
{effectiveQty}
```

Update the add-to-cart `onClick` to use `effectiveQty`:

```tsx
onClick={() => {
  if (!isConnected) {
    open({ ...item, quantity: effectiveQty });
    return;
  }
  addItem(item, effectiveQty);
  setConfirmed(true);
  window.setTimeout(() => setConfirmed(false), 1400);
}}
disabled={remainingQty === 0}
```

When `remainingQty === 0`, replace the button content with:

```tsx
{remainingQty === 0 ? (
  "Quantité maximale atteinte"
) : !isConnected ? (
  <>
    <Lock className="h-4 w-4" strokeWidth={2} />
    Se connecter pour ajouter
  </>
) : confirmed ? (
  <>
    <Check className="h-4 w-4" strokeWidth={2.4} />
    Ajouté au panier
  </>
) : (
  <>
    <ShoppingCart className="h-4 w-4" strokeWidth={2} />
    Ajouter au panier
  </>
)}
```

- [ ] **Step 5.4 — Verify build**

```
npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 5.5 — Commit**

```
git add app/\(retail\)/products/\[id\]/add-to-cart-button.tsx
git commit -m "feat(product): clamp add-to-cart picker at max qty and disable when full"
```

---

## Task 6: Update `QuickAddButton` — disable when product is at max

**Files:**
- Modify: `components/retail/quick-add-button.tsx`

- [ ] **Step 6.1 — Add imports**

Add to the existing import block:

```ts
import { MAX_QTY_PER_PRODUCT } from "@/lib/order-rules";
```

- [ ] **Step 6.2 — Read existing qty and gate the button**

Inside `QuickAddButton`, after `const { addItem } = useCart();`:

```ts
const { addItem, items } = useCart();
const existingQty = items.find((i) => i.productId === item.productId)?.quantity ?? 0;
const atMax = existingQty >= MAX_QTY_PER_PRODUCT;
```

- [ ] **Step 6.3 — Update the button**

Replace the full `<button>` element with:

```tsx
<button
  type="button"
  aria-label={
    atMax
      ? "Quantité maximale atteinte"
      : isConnected
        ? `Ajouter ${item.name} au panier`
        : "Connectez-vous pour ajouter au panier"
  }
  disabled={atMax}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isConnected) {
      open({ ...item, quantity: 1 });
      return;
    }
    addItem(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  }}
  className="grid h-7 w-7 place-items-center rounded-full text-white shadow-sm transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
  style={{ background: added ? "#2E3F17" : COLORS.primary }}
>
  {!isConnected ? (
    <Lock className="h-3.5 w-3.5" strokeWidth={2.4} />
  ) : added ? (
    <Check className="h-4 w-4" strokeWidth={2.6} />
  ) : (
    <Plus className="h-4 w-4" strokeWidth={2.6} />
  )}
</button>
```

- [ ] **Step 6.4 — Verify build and lint**

```
npm run build 2>&1 | tail -20
npm run lint
```

Expected: no errors.

- [ ] **Step 6.5 — Commit**

```
git add components/retail/quick-add-button.tsx
git commit -m "feat(quick-add): disable button when product already at max qty"
```

---

## Task 7: Update `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 7.1 — Add a note under Business Rules**

In `CLAUDE.md`, find the `## Business Rules` section and add this line after the existing bullet list:

```markdown
- Order rule thresholds (minimum order, delivery fee, free-delivery threshold, max qty per product) are defined in `lib/order-rules.ts`. Change values there only — never use magic numbers in components.
```

- [ ] **Step 7.2 — Run full test suite and lint**

```
npx vitest run
npm run lint
```

Expected: all tests pass, no lint errors.

- [ ] **Step 7.3 — Commit**

```
git add CLAUDE.md
git commit -m "docs: note order-rules.ts as the source of truth for thresholds"
```

---

## Self-Review

**Spec coverage:**
- ✅ `lib/order-rules.ts` constants + helper — Task 1
- ✅ Cart context `addItem` max-qty guard — Task 2
- ✅ Cart context `updateQty` clamp — Task 2
- ✅ Cart page delivery fee row — Task 3
- ✅ Cart page nudge banner (30–50 €) — Task 3
- ✅ Cart page grand total — Task 3
- ✅ Cart page disabled CTA (Link → disabled button) below minimum — Task 3
- ✅ Cart page disabled `+` button at max qty — Task 3
- ✅ Checkout form delivery fee line — Task 4
- ✅ Checkout form grand total — Task 4
- ✅ Checkout form block submission below minimum — Task 4
- ✅ `AddToCartButton` qty picker capped at remaining — Task 5
- ✅ `AddToCartButton` disabled when at max — Task 5
- ✅ `QuickAddButton` disabled when at max — Task 6
- ✅ CLAUDE.md note — Task 7

**Type consistency:**
- `deliveryFee(subtotal: number): number` — defined Task 1, used Tasks 3 & 4 ✅
- `MAX_QTY_PER_PRODUCT` — defined Task 1, used Tasks 2, 3, 5, 6 ✅
- `MIN_ORDER_EUR`, `FREE_DELIVERY_THRESHOLD_EUR` — defined Task 1, used Tasks 3 & 4 ✅
- `items` added to `addItem` dep array in Task 2, `useCart()` destructures `items` in Tasks 5 & 6 ✅
