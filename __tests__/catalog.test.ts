// @vitest-environment node
import { describe, expect, it } from "vitest";
import { formatPriceEUR, resolveProPrice } from "@/lib/catalog-pricing";

describe("resolveProPrice", () => {
  const product = { effectivePrice: 1.4, unitsPerPack: 12 };

  it("UNIT returns effectivePrice", () => {
    expect(resolveProPrice(product, "UNIT")).toBe(1.4);
  });

  it("PACK multiplies by unitsPerPack", () => {
    expect(resolveProPrice(product, "PACK")).toBeCloseTo(16.8, 10);
  });

  it("unitsPerPack 0 counts as 1", () => {
    expect(resolveProPrice({ effectivePrice: 5, unitsPerPack: 0 }, "PACK")).toBe(5);
  });

  it("unitsPerPack 1 returns the price unchanged for both units", () => {
    const single = { effectivePrice: 3, unitsPerPack: 1 };
    expect(resolveProPrice(single, "UNIT")).toBe(3);
    expect(resolveProPrice(single, "PACK")).toBe(3);
  });
});

describe("formatPriceEUR", () => {
  it("formats with comma decimal and euro suffix", () => {
    expect(formatPriceEUR(2.35)).toBe("2,35 €");
    expect(formatPriceEUR(10)).toBe("10,00 €");
    expect(formatPriceEUR(0.9)).toBe("0,90 €");
  });
});
