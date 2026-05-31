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
