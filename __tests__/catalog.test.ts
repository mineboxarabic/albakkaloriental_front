// @vitest-environment node
import { describe, expect, it } from "vitest";
import { getTierPrice, formatPriceEUR } from "@/lib/catalog-pricing";

const base = {
  sellingPrice: 10,
  priceLevelC: 9,
  priceLevelD: 8,
  priceLevelE: 7,
  priceLevelF: null,
};

describe("getTierPrice", () => {
  it("returns sellingPrice when no pricing level is supplied", () => {
    expect(getTierPrice(base, null)).toBe(10);
    expect(getTierPrice(base, undefined)).toBe(10);
  });

  it("returns the matching tier price for C/D/E", () => {
    expect(getTierPrice(base, "C")).toBe(9);
    expect(getTierPrice(base, "D")).toBe(8);
    expect(getTierPrice(base, "E")).toBe(7);
  });

  it("falls back to sellingPrice when the requested tier is null", () => {
    expect(getTierPrice(base, "F")).toBe(10);
  });

  it("falls back to sellingPrice when every tier is missing", () => {
    expect(
      getTierPrice(
        {
          sellingPrice: 4.2,
          priceLevelC: null,
          priceLevelD: null,
          priceLevelE: null,
          priceLevelF: null,
        },
        "D",
      ),
    ).toBe(4.2);
  });
});

describe("formatPriceEUR", () => {
  it("formats with comma decimal and euro suffix", () => {
    expect(formatPriceEUR(2.35)).toBe("2,35 €");
    expect(formatPriceEUR(10)).toBe("10,00 €");
    expect(formatPriceEUR(0.9)).toBe("0,90 €");
  });
});
