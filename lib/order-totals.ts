/**
 * HT / VAT / TTC of quote or order lines, with the same rule as Alim Express
 * (src/lib/pricing/line-total.ts): round each line, then add the lines up.
 * Every product has its own VAT rate (5.5% for most food, 20% for some), so
 * there is no single rate for a whole cart.
 */
export type TotalsLine = {
  quantity: number;
  /** Price of one sale unit excluding VAT. */
  unitPrice: number;
  discount?: number | null;
  /** VAT rate in percent; unknown when the back-end did not send it. */
  taxRate?: number | null;
};

export type OrderTotals = { subtotalHt: number; tax: number; totalTtc: number };

export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/** Null when a line's VAT rate is unknown: better to say so than show a wrong VAT. */
export function summarizeLines(lines: TotalsLine[]): OrderTotals | null {
  if (lines.some((line) => typeof line.taxRate !== "number")) return null;
  let subtotalHt = 0;
  let tax = 0;
  for (const line of lines) {
    const subtotal = line.quantity * line.unitPrice;
    const discountAmount = roundMoney((subtotal * (line.discount ?? 0)) / 100);
    const afterDiscount = roundMoney(subtotal - discountAmount);
    subtotalHt += afterDiscount;
    tax += roundMoney((afterDiscount * (line.taxRate as number)) / 100);
  }
  subtotalHt = roundMoney(subtotalHt);
  tax = roundMoney(tax);
  return { subtotalHt, tax, totalTtc: roundMoney(subtotalHt + tax) };
}
