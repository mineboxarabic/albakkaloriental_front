// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProInvoicesList } from "@/app/(pro)/pro/invoices/pro-invoices-list";
import type { ProInvoice } from "@/actions/pro-me";

const sharedInvoice: ProInvoice = {
  id: "i1",
  invoiceNumber: "FAC-2026-0042",
  invoiceDate: "2026-05-01",
  dueDate: "2026-06-01",
  status: "UNPAID",
  totalAmount: 1000,
  paidAmount: 600,
  remainingAmount: 400,
  isSent: true,
  orders: [
    { id: "o1", orderNumber: "CMD-1042", orderDate: "2026-04-01", totalAmount: 300 },
    { id: "o2", orderNumber: "CMD-1051", orderDate: "2026-04-15", totalAmount: 300 },
    { id: "o3", orderNumber: "CMD-1060", orderDate: "2026-04-20", totalAmount: 400 },
  ],
};

describe("ProInvoicesList", () => {
  it("renders all order references and invoice-level installment amounts", () => {
    render(<ProInvoicesList invoices={[sharedInvoice]} />);
    expect(screen.getByText(/3 commandes/i)).toBeVisible();
    expect(screen.getByRole("link", { name: "CMD-1042" })).toHaveAttribute("href", "/pro/orders/o1");
    expect(screen.getByRole("link", { name: "CMD-1051" })).toHaveAttribute("href", "/pro/orders/o2");
    expect(screen.getByText(/Payé.*600,00/i)).toBeVisible();
    expect(screen.getByText(/Reste.*400,00/i)).toBeVisible();
    expect(screen.getByRole("link", { name: /PDF de la facture FAC-2026-0042/i })).toBeVisible();
  });

  it("does not show a 'reste à payer' line for a fully paid invoice", () => {
    render(
      <ProInvoicesList
        invoices={[{ ...sharedInvoice, status: "PAID", paidAmount: 1000, remainingAmount: 0 }]}
      />,
    );
    expect(screen.queryByText(/Reste à payer/i)).not.toBeInTheDocument();
  });

  it("renders a single order reference without the 'N commandes' prefix", () => {
    render(
      <ProInvoicesList
        invoices={[{ ...sharedInvoice, orders: [sharedInvoice.orders[0]] }]}
      />,
    );
    expect(screen.queryByText(/commandes/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "CMD-1042" })).toHaveAttribute("href", "/pro/orders/o1");
  });

  it("omits the order-reference line entirely for a manual invoice with no linked orders", () => {
    render(<ProInvoicesList invoices={[{ ...sharedInvoice, orders: [] }]} />);
    expect(screen.queryByRole("link", { name: "CMD-1042" })).not.toBeInTheDocument();
  });
});
