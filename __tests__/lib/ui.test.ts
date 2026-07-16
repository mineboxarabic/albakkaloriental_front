import { describe, expect, it } from "vitest";
import { buildQuantityLabel, buildUnitLabel } from "@/lib/ui";

describe("product unit labels", () => {
  it("omits the piece suffix for retail labels", () => {
    expect(buildUnitLabel("PIECE")).toBe("");
    expect(buildQuantityLabel(12, "PIECE")).toBe("12");
  });

  it("includes the piece suffix for professional labels", () => {
    expect(buildUnitLabel("PIECE", true)).toBe("u.");
    expect(buildQuantityLabel(12, "PIECE", true)).toBe("12 u.");
  });

  it("keeps measurement units for weighted and liquid products", () => {
    expect(buildQuantityLabel(5, "KILOGRAM")).toBe("5 kg");
    expect(buildQuantityLabel(2, "LITER")).toBe("2 L");
  });
});
