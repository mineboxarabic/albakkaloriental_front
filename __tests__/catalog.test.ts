// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  getTierPrice,
  formatPriceEUR,
  resolveProPrice,
} from "@/lib/catalog-pricing";

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

describe("resolveProPrice", () => {
  const product = {
    sellingPrice: 12,
    priceLevelC: 10,
    priceLevelD: 9,
    priceLevelE: 8,
    priceLevelF: null,
    unitSellingPrice: 1.5,
    unitsPerPack: 6,
  };

  it("PACK returns the tier price for the level", () => {
    expect(resolveProPrice(product, "PACK", "C")).toBe(10);
    expect(resolveProPrice(product, "PACK", "D")).toBe(9);
    expect(resolveProPrice(product, "PACK", "E")).toBe(8);
  });

  it("PACK falls back to sellingPrice when level missing or null", () => {
    expect(resolveProPrice(product, "PACK", null)).toBe(12);
    expect(resolveProPrice(product, "PACK", "F")).toBe(12);
  });

  it("UNIT divides the tier price by unitsPerPack (tier-aware)", () => {
    expect(resolveProPrice(product, "UNIT", "C")).toBeCloseTo(10 / 6, 5);
    expect(resolveProPrice(product, "UNIT", "D")).toBeCloseTo(9 / 6, 5);
    expect(resolveProPrice(product, "UNIT", "E")).toBeCloseTo(8 / 6, 5);
  });

  it("UNIT without level falls back to sellingPrice / unitsPerPack", () => {
    expect(resolveProPrice(product, "UNIT", null)).toBeCloseTo(12 / 6, 5);
  });

  it("UNIT with tier null falls back to sellingPrice / unitsPerPack", () => {
    expect(resolveProPrice(product, "UNIT", "F")).toBeCloseTo(12 / 6, 5);
  });

  it("UNIT ignores the B2C unitSellingPrice (per spec: pro UNIT = tier / units)", () => {
    expect(resolveProPrice(product, "UNIT", "C")).not.toBe(1.5);
  });

  it("UNIT with unitsPerPack=1 returns the tier price unchanged", () => {
    expect(
      resolveProPrice({ ...product, unitsPerPack: 1 }, "UNIT", "C"),
    ).toBe(10);
  });
});

describe("formatPriceEUR", () => {
  it("formats with comma decimal and euro suffix", () => {
    expect(formatPriceEUR(2.35)).toBe("2,35 €");
    expect(formatPriceEUR(10)).toBe("10,00 €");
    expect(formatPriceEUR(0.9)).toBe("0,90 €");
  });
});
