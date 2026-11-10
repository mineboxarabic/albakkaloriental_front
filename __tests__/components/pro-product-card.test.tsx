// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProProductCard } from "@/components/pro/pro-product-card";
import type { ProductCard as ProductCardData } from "@/lib/catalog";

const cartMock = vi.hoisted(() => ({
  items: [] as Array<{ lineId: string; key: string; productId: string; saleUnit: "PACK" | "UNIT"; quantity: number }>,
  addItem: vi.fn().mockResolvedValue({ ok: true }),
  updateQty: vi.fn().mockResolvedValue({ ok: true }),
}));
const addItemMock = cartMock.addItem;
vi.mock("@/components/cart-context", () => ({ useCart: () => cartMock }));

beforeEach(() => {
  cartMock.items = [];
  cartMock.addItem.mockClear();
  cartMock.updateQty.mockClear();
});

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
  it("shows separate quick-add buttons for one unit and one carton", async () => {
    render(<ProProductCard product={makeProduct()} />);
    expect(screen.getByText("CSC-5")).toBeInTheDocument();
    expect(screen.queryByText(/connectez-vous/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /ajouter une unité au devis/i }));
    await waitFor(() => expect(addItemMock).toHaveBeenCalledWith(
      expect.objectContaining({ productId: "p1", saleUnit: "UNIT", unitPrice: 10 }),
      1,
    ));
    fireEvent.click(screen.getByRole("button", { name: /ajouter un carton au devis/i }));
    await waitFor(() => expect(addItemMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ productId: "p1", saleUnit: "PACK", unitPrice: 60 }),
      1,
    ));
  });

  it("renders the unit price block when the product is sold by pack (unitsPerPack > 1)", () => {
    render(<ProProductCard product={makeProduct({ unitsPerPack: 6 })} />);
    // "À L'UNITÉ" (sm+) / "UNITÉ" (mobile) only appear when unit sale is supported.
    expect(screen.getAllByText(/unit[ée]/i).length).toBeGreaterThan(0);
  });

  it("omits the unit price block for single-unit products", () => {
    render(<ProProductCard product={makeProduct({ unitsPerPack: 1 })} />);
    expect(screen.queryByText(/unit[ée]/i)).not.toBeInTheDocument();
  });

  it("hides prices and shows the login prompt when unauthenticated", () => {
    render(
      <ProProductCard product={makeProduct()} authenticated={false} />,
    );
    expect(screen.getByText(/connectez-vous pour voir le prix/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /se connecter/i })).toHaveAttribute(
      "href",
      "/pro/login",
    );
    expect(screen.queryByRole("button", { name: /ajouter .* au devis/i })).not.toBeInTheDocument();
  });

  it("shows the RUPTURE badge and a disabled CTA when out of stock", () => {
    render(<ProProductCard product={makeProduct({ isOutOfStock: true })} />);
    expect(screen.getByText("RUPTURE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /indisponible/i })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /ajouter .* au devis/i })).not.toBeInTheDocument();
  });
});

describe("ProProductCard quote stepper", () => {
  it("turns a sale unit already in the quote into a stepper showing its quantity", () => {
    cartMock.items = [{ lineId: "l1", key: "l1", productId: "p1", saleUnit: "PACK", quantity: 3 }];
    render(<ProProductCard product={makeProduct()} />);
    const group = screen.getByRole("group", { name: /par carton/i });
    expect(group).toHaveTextContent("3");
    expect(group).toHaveTextContent("cartons");
    // The unit row is still a plain add button.
    expect(screen.getByRole("button", { name: /ajouter une unité au devis/i })).toBeEnabled();
  });

  it("adds and removes cartons from the stepper without a new line", () => {
    cartMock.items = [{ lineId: "l1", key: "l1", productId: "p1", saleUnit: "PACK", quantity: 3 }];
    render(<ProProductCard product={makeProduct()} />);
    fireEvent.click(screen.getByRole("button", { name: /ajouter un carton au devis/i }));
    expect(cartMock.updateQty).toHaveBeenLastCalledWith("l1", 4);
    fireEvent.click(screen.getByRole("button", { name: /retirer un carton/i }));
    expect(cartMock.updateQty).toHaveBeenLastCalledWith("l1", 2);
    expect(addItemMock).not.toHaveBeenCalled();
  });

  it("offers removal instead of minus at quantity one", () => {
    cartMock.items = [{ lineId: "l1", key: "l1", productId: "p1", saleUnit: "UNIT", quantity: 1 }];
    render(<ProProductCard product={makeProduct()} />);
    fireEvent.click(screen.getByRole("button", { name: /retirer du devis/i }));
    expect(cartMock.updateQty).toHaveBeenCalledWith("l1", 0);
  });

  it("stops adding cartons at the available stock", () => {
    cartMock.items = [{ lineId: "l1", key: "l1", productId: "p1", saleUnit: "PACK", quantity: 2 }];
    render(<ProProductCard product={makeProduct({ availableStock: 12, unitsPerPack: 6 })} />);
    expect(screen.getByRole("button", { name: /ajouter un carton au devis/i })).toBeDisabled();
  });
});

describe("ProProductCard price source", () => {
  it("shows the carton price from effectivePrice even when tier fields disagree", () => {
    render(
      <ProProductCard
        product={makeProduct({ effectivePrice: 1.4, unitsPerPack: 12, priceLevelE: 1.75 })}
      />,
    );
    expect(screen.getAllByText(/16,80 €/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/21,00 €/)).not.toBeInTheDocument();
  });

  it("shows the unit price from effectivePrice", () => {
    render(<ProProductCard product={makeProduct({ effectivePrice: 1.4, unitsPerPack: 12 })} />);
    expect(screen.getAllByText(/1,40 €/).length).toBeGreaterThan(0);
  });

  it("shows En rupture and disables both quick-add options when the price is zero", () => {
    render(<ProProductCard product={makeProduct({ effectivePrice: 0 })} />);
    expect(screen.queryByText(/0,00 €/)).not.toBeInTheDocument();
    expect(screen.getAllByText("En rupture").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole("button", { name: "En rupture" }).every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
    expect(addItemMock).not.toHaveBeenCalled();
  });
});
