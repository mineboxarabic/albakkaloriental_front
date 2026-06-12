// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProProductCard } from "@/components/pro/pro-product-card";
import type { ProductCard as ProductCardData } from "@/lib/catalog";

function makeProduct(overrides: Partial<ProductCardData> = {}): ProductCardData {
  return {
    id: "p1",
    name: "Couscous fin 5kg",
    sku: "CSC-5",
    category: "Riz et pâtes",
    marques: [],
    imageUrl: null,
    unitsPerPack: 6,
    baseUnit: "PIECE",
    sellingPrice: 10,
    unitSellingPrice: null,
    priceLevelC: null,
    priceLevelD: null,
    priceLevelE: null,
    priceLevelF: null,
    effectivePrice: 10,
    isOutOfStock: false,
    ...overrides,
  };
}

describe("ProProductCard", () => {
  it("shows SKU, name and the devis CTA when authenticated and in stock", () => {
    render(<ProProductCard product={makeProduct()} pricingLevel="C" />);
    expect(screen.getByText("CSC-5")).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /ajouter au devis/i });
    expect(cta).toHaveAttribute("href", "/pro/products/p1");
    expect(screen.queryByText(/connectez-vous/i)).not.toBeInTheDocument();
  });

  it("renders the unit price block when the product is sold by pack (unitsPerPack > 1)", () => {
    render(<ProProductCard product={makeProduct({ unitsPerPack: 6 })} pricingLevel="C" />);
    // "À L'UNITÉ" (sm+) / "UNITÉ" (mobile) only appear when unit sale is supported.
    expect(screen.getAllByText(/unit[ée]/i).length).toBeGreaterThan(0);
  });

  it("omits the unit price block for single-unit products", () => {
    render(<ProProductCard product={makeProduct({ unitsPerPack: 1 })} pricingLevel="C" />);
    expect(screen.queryByText(/unit[ée]/i)).not.toBeInTheDocument();
  });

  it("hides prices and shows the login prompt when unauthenticated", () => {
    render(
      <ProProductCard product={makeProduct()} pricingLevel={null} authenticated={false} />,
    );
    expect(screen.getByText(/connectez-vous pour voir le prix/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /se connecter/i })).toHaveAttribute(
      "href",
      "/pro/login",
    );
    expect(screen.queryByRole("link", { name: /ajouter au devis/i })).not.toBeInTheDocument();
  });

  it("shows the RUPTURE badge and a disabled CTA when out of stock", () => {
    render(<ProProductCard product={makeProduct({ isOutOfStock: true })} pricingLevel="C" />);
    expect(screen.getByText("RUPTURE")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /indisponible/i });
    expect(button).toBeDisabled();
    expect(screen.queryByRole("link", { name: /ajouter au devis/i })).not.toBeInTheDocument();
  });
});
