import { describe, expect, it } from "vitest";
import { DEFAULT_RETAIL_ORDER_RULES, deliveryFee, roundRetailMoney } from "../../lib/order-rules";

describe("deliveryFee()", () => {
  const rules = { ...DEFAULT_RETAIL_ORDER_RULES, deliveryFeeEur: 5.5, freeDeliveryThresholdEur: 70 };

  it("charges the configured fee below the threshold", () => {
    expect(deliveryFee(69.99, rules)).toBe(5.5);
  });

  it("is free at or above the configured threshold", () => {
    expect(deliveryFee(70, rules)).toBe(0);
    expect(deliveryFee(70.01, rules)).toBe(0);
  });

  it("uses cent precision for totals", () => {
    expect(roundRetailMoney(0.1 + 0.2)).toBe(0.3);
  });
});
