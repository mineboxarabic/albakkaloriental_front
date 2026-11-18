// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AddToProCartButton } from "@/app/(pro)/pro/products/[id]/add-to-pro-cart-button";

const cartMock = vi.hoisted(() => ({
  items: [] as Array<{ productId: string; saleUnit: "PACK" | "UNIT"; quantity: number }>,
  addItem: vi.fn(),
}));
vi.mock("@/components/cart-context", () => ({ useCart: () => cartMock }));

const props = {
  productId: "p1",
  name: "Amba en poudre",
  imageUrl: null,
  unitsPerPack: 12,
  pricing: { effectivePrice: 0.5, unitsPerPack: 12, unitSellingPrice: null },
  availableStock: null,
};

beforeEach(() => {
  cartMock.items = [];
  cartMock.addItem.mockReset();
});

describe("AddToProCartButton", () => {
  it("adds one carton once when the button is double-clicked", async () => {
    let finish: (value: { ok: true }) => void = () => {};
    cartMock.addItem.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    render(<AddToProCartButton {...props} />);

    const button = screen.getByRole("button", { name: /ajouter au devis/i });
    fireEvent.click(button);
    fireEvent.click(button);
    finish({ ok: true });

    await waitFor(() => expect(cartMock.addItem).toHaveBeenCalledTimes(1));
    expect(cartMock.addItem).toHaveBeenCalledWith(expect.objectContaining({ saleUnit: "PACK" }), 1);
  });

  it("does not offer to order a product that has no price yet", () => {
    render(<AddToProCartButton {...props} pricing={{ ...props.pricing, effectivePrice: 0 }} />);

    expect(screen.queryByRole("button", { name: /ajouter au devis/i })).not.toBeInTheDocument();
    expect(screen.getByText(/prix sur demande/i)).toBeInTheDocument();
    expect(screen.queryByText(/0,00/)).not.toBeInTheDocument();
  });

  it("describes what is already in the quote without sounding like a duplicate warning", () => {
    cartMock.items = [{ productId: "p1", saleUnit: "PACK", quantity: 2 }];
    render(<AddToProCartButton {...props} />);

    expect(screen.getByText(/dans votre devis/i)).toBeInTheDocument();
    expect(screen.queryByText(/déjà dans votre devis/i)).not.toBeInTheDocument();
  });
});
