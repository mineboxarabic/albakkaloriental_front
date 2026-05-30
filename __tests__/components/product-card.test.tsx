// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/retail/product-card";
import type { ProductCard as ProductCardData } from "@/lib/catalog";

vi.mock("@/components/retail/quick-add-button", () => ({
  QuickAddButton: () => <button type="button">add</button>,
}));

vi.mock("@/components/retail/price-tag", () => ({
  PriceTag: ({ value }: { value: number }) => <span>{value}€</span>,
}));

const baseProduct: ProductCardData = {
  id: "p1",
  name: "Test Product",
  sku: "TP-1",
  category: "epicerie",
  imageUrl: null,
  unitsPerPack: 1,
  baseUnit: "PIECE",
  sellingPrice: 4.99,
  unitSellingPrice: null,
  priceLevelC: null,
  priceLevelD: null,
  priceLevelE: null,
  priceLevelF: null,
  effectivePrice: 4.99,
  isOutOfStock: false,
};

describe("ProductCard (retail)", () => {
  it("renders product name + price + add button when in stock", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("4.99€")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    expect(screen.queryByText(/rupture/i)).not.toBeInTheDocument();
  });

  it("shows RUPTURE badge + disabled button when out of stock", () => {
    render(<ProductCard product={{ ...baseProduct, isOutOfStock: true }} />);
    expect(screen.getByText("RUPTURE")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /indisponible/i });
    expect(button).toBeDisabled();
    expect(screen.queryByRole("button", { name: /add/i })).not.toBeInTheDocument();
  });
});
