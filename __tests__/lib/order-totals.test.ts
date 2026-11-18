import { describe, expect, it } from "vitest";
import { summarizeLines } from "@/lib/order-totals";

describe("summarizeLines (same rule as Alim Express)", () => {
  it("adds each line's own VAT rate", () => {
    expect(summarizeLines([
      { quantity: 2, unitPrice: 49.5, taxRate: 5.5 },
      { quantity: 3, unitPrice: 30, taxRate: 20 },
    ])).toEqual({ subtotalHt: 189, tax: 23.45, totalTtc: 212.45 });
  });

  it("rounds per line so HT + VAT = TTC", () => {
    const line = { quantity: 1, unitPrice: 0.03, taxRate: 20 };
    expect(summarizeLines([line, line])).toEqual({ subtotalHt: 0.06, tax: 0.02, totalTtc: 0.08 });
  });

  it("applies a line discount before VAT", () => {
    expect(summarizeLines([{ quantity: 2, unitPrice: 10, discount: 10, taxRate: 20 }]))
      .toEqual({ subtotalHt: 18, tax: 3.6, totalTtc: 21.6 });
  });

  it("returns null when a line's VAT rate is unknown, rather than guessing", () => {
    expect(summarizeLines([{ quantity: 1, unitPrice: 10 }])).toBeNull();
  });

  it("returns zeros for no lines", () => {
    expect(summarizeLines([])).toEqual({ subtotalHt: 0, tax: 0, totalTtc: 0 });
  });
});
