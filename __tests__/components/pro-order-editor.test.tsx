// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const { updateProOrder, refresh } = vi.hoisted(() => ({ updateProOrder: vi.fn(), refresh: vi.fn() }));
vi.mock("@/actions/pro-me", () => ({ updateProOrder }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import { ProOrderEditor } from "@/app/(pro)/pro/orders/[id]/pro-order-editor";

const line = {
  id: "l1",
  name: "Dattes Sukari 200g",
  sku: "DAT",
  imageUrl: null,
  quantity: 2,
  saleUnit: "PACK" as const,
  packSize: 30,
  unitPrice: 49.5,
  discount: 0,
  // Stored with VAT (5.5%) by Alim Express.
  totalPrice: 104.45,
};

function renderEditor() {
  render(
    <ProOrderEditor orderId="o1" updatedAt="2026-11-18T07:00:00.000Z" items={[line]} canEdit>
      <aside />
    </ProOrderEditor>,
  );
}

function editQuantity(value: string) {
  fireEvent.click(screen.getByRole("button", { name: /modifier ma commande/i }));
  fireEvent.change(screen.getByLabelText(/QTÉ/), { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: /enregistrer/i }));
}

beforeEach(() => {
  updateProOrder.mockReset();
  refresh.mockReset();
});

describe("ProOrderEditor", () => {
  it("shows the line total excluding VAT in the TOTAL HT column", () => {
    renderEditor();
    expect(screen.getByText(/99,00/)).toBeInTheDocument();
    expect(screen.queryByText(/104,45/)).not.toBeInTheDocument();
  });

  it.each(["-1", "1.5", "1000", ""])("refuses %j with a French message and saves nothing", async (value) => {
    renderEditor();
    editQuantity(value);
    expect(await screen.findByRole("alert")).toHaveTextContent("nombre entier entre 0 et 999");
    expect(updateProOrder).not.toHaveBeenCalled();
    // Still in edit mode, so the other changes are not lost.
    expect(screen.getByRole("button", { name: /enregistrer/i })).toBeInTheDocument();
  });

  it("saves a valid quantity", async () => {
    updateProOrder.mockResolvedValue({ ok: true, updated: true });
    renderEditor();
    editQuantity("3");
    await waitFor(() => expect(updateProOrder).toHaveBeenCalledWith(
      "o1", "2026-11-18T07:00:00.000Z", [{ id: "l1", quantity: 3, saleUnit: "PACK" }],
    ));
  });

  it("shows the server's message when the save is refused", async () => {
    updateProOrder.mockResolvedValue({ ok: false, error: "La commande a changé. Actualisez la page et réessayez." });
    renderEditor();
    editQuantity("3");
    expect(await screen.findByRole("alert")).toHaveTextContent("La commande a changé");
  });
});
