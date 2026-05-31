# Order Rules — Frontend Design

Date: 2026-05-31

## Context

The backend (AlimExpressApp) now enforces three retail business rules server-side. This spec covers the matching frontend implementation: constants, UX feedback, and blocking logic.

## Rules

| Rule | Value |
|---|---|
| Minimum order | 30 € |
| Free delivery threshold | 50 € |
| Delivery fee (below threshold) | 3 € |
| Max units per product | 3 |

## Files Changed

### New: `lib/order-rules.ts`

Single source of truth for the four constants and a `deliveryFee(subtotal)` helper. All other files import from here — no magic numbers elsewhere.

```ts
export const MIN_ORDER_EUR = 30;
export const FREE_DELIVERY_THRESHOLD_EUR = 50;
export const DELIVERY_FEE_EUR = 3;
export const MAX_QTY_PER_PRODUCT = 3;

export function deliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD_EUR ? 0 : DELIVERY_FEE_EUR;
}
```

### `components/cart-context.tsx`

- `addItem`: before calling the server action, check if `currentQty + requestedQty > MAX_QTY_PER_PRODUCT`. If so, set `error` to a user-facing message and return early. This avoids a round-trip for the most common case; the backend is the authoritative check.
- `updateQty`: clamp `quantity` to `MAX_QTY_PER_PRODUCT` before calling the server action.
- Surface backend error messages as-is through the existing `error` state (already done via `setError(result.error)`).

### `app/(retail)/cart/page.tsx`

Summary panel changes:
- Replace "Calculée à l'étape suivante" with the computed delivery fee: "Gratuite" (styled green) or "3,00 €".
- Add a nudge row when `30 <= total < 50`: "Plus X,XX € pour la livraison gratuite" in amber/yellow.
- Show grand total as `total + deliveryFee(total)` (not just subtotal).
- When `total < MIN_ORDER_EUR`: replace the `<Link href="/checkout">` with a `<button type="button" disabled>` (same visual style, greyed out). Show a message row: "Minimum de commande : 30,00 €". When total >= minimum, render the Link as before.

Item row changes:
- Disable the `+` stepper button when `it.quantity >= MAX_QTY_PER_PRODUCT`.

### `app/(retail)/checkout/checkout-form.tsx`

Summary panel changes:
- Add a "Livraison" line showing the same fee as the cart page.
- Update the grand total display to `total + deliveryFee(total)`.
- Block form submission if `total < MIN_ORDER_EUR` (show same message as cart page).

### `app/(retail)/products/[id]/add-to-cart-button.tsx`

- Change the `+` button's `Math.min(99, q + 1)` to `Math.min(MAX_QTY_PER_PRODUCT, q + 1)`.
- Also check the current quantity already in cart for that product: `existingQty = items.find(i => i.productId === item.productId)?.quantity ?? 0`. Cap the local picker max at `MAX_QTY_PER_PRODUCT - existingQty` (minimum 0).
- If `existingQty >= MAX_QTY_PER_PRODUCT`, disable the entire add button and show "Quantité maximale atteinte".

### `components/retail/quick-add-button.tsx`

- If the product's current cart quantity is already `>= MAX_QTY_PER_PRODUCT`, disable the button and show a tooltip/aria-label indicating the limit is reached.

### `CLAUDE.md`

Add a note under Business Rules:
> Order rule thresholds (minimum order, delivery fee, free-delivery threshold, max qty per product) are defined in `lib/order-rules.ts`. Change values there only.

## Error Handling

- Frontend cap prevents the request in the common case.
- If the backend returns a 400 for max-qty or minimum-order (e.g. via a direct API call), the existing `error` state in CartContext surfaces it.
- No new error UI components needed.

## What This Does Not Cover

- Delivery fee is not stored as a separate DB field — it is baked into `totalAmount` in the backend.
- The order confirmation/detail page will show the full `totalAmount` (which includes the fee) without a separate breakdown line. That is acceptable for now.
- B2B (pro) cart is unchanged.
