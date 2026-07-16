// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProOrderBillingCard } from "@/app/(pro)/pro/orders/[id]/pro-order-billing-card";
import type { ProInvoice } from "@/actions/pro-me";

const sharedInvoice: ProInvoice = {
  id: "inv1",
  invoiceNumber: "FAC-2026-0042",
  invoiceDate: "2026-07-01",
  dueDate: "2026-08-01",
  status: "UNPAID",
  totalAmount: 1000,
  paidAmount: 600,
  remainingAmount: 400,
  isSent: true,
  orders: [
    { id: "o1", orderNumber: "CMD-1042", orderDate: "2026-06-01", totalAmount: 300 },
    { id: "o2", orderNumber: "CMD-1051", orderDate: "2026-06-15", totalAmount: 300 },
    { id: "o3", orderNumber: "CMD-1060", orderDate: "2026-06-20", totalAmount: 400 },
  ],
};

const sharedBilling = { state: "INVOICED" as const, invoices: [sharedInvoice] };

describe("ProOrderBillingCard", () => {
  it("shows delivered orders waiting for invoicing", () => {
    render(<ProOrderBillingCard billing={{ state: "UNINVOICED", invoices: [] }} orderStatus="DELIVERED" />);
    expect(screen.getByText(/facturation en préparation/i)).toBeVisible();
  });

  it("shows shared invoice money without subtracting it from the order", () => {
    render(<ProOrderBillingCard billing={sharedBilling} orderStatus="DELIVERED" />);
    expect(screen.getByText(/incluse dans la facture FAC-2026-0042/i)).toBeVisible();
    expect(screen.getByText(/Paiements suivis au niveau de la facture/i)).toBeVisible();
    expect(screen.getByText(/400,00/)).toBeVisible();
    expect(screen.queryByText(/Reste à payer.*-300/i)).not.toBeInTheDocument();
  });

  it("omits the waiting-for-invoice notice when the order isn't delivered yet and has no invoice", () => {
    render(<ProOrderBillingCard billing={{ state: "UNINVOICED", invoices: [] }} orderStatus="CONFIRMED" />);
    expect(screen.queryByText(/facturation en préparation/i)).not.toBeInTheDocument();
  });

  it("mentions the other orders sharing the same invoice", () => {
    render(<ProOrderBillingCard billing={sharedBilling} orderStatus="DELIVERED" />);
    expect(screen.getByText(/avec 2 autres commandes/i)).toBeVisible();
  });

  it("does not mention other orders when this invoice covers only this one", () => {
    render(
      <ProOrderBillingCard
        billing={{ state: "INVOICED", invoices: [{ ...sharedInvoice, orders: [sharedInvoice.orders[0]] }] }}
        orderStatus="DELIVERED"
      />,
    );
    expect(screen.queryByText(/autres commandes/i)).not.toBeInTheDocument();
  });

  it("shows 'Facture réglée' instead of an outstanding amount once fully paid", () => {
    render(
      <ProOrderBillingCard
        billing={{ state: "INVOICED", invoices: [{ ...sharedInvoice, paidAmount: 1000, remainingAmount: 0 }] }}
        orderStatus="DELIVERED"
      />,
    );
    expect(screen.getByText(/Facture réglée/i)).toBeVisible();
    expect(screen.queryByText(/Reste à payer/i)).not.toBeInTheDocument();
  });

  it("links to the invoice-specific PDF with an accessible name", () => {
    render(<ProOrderBillingCard billing={sharedBilling} orderStatus="DELIVERED" />);
    const link = screen.getByRole("link", { name: /PDF de la facture FAC-2026-0042/i });
    expect(link).toHaveAttribute("href", "/pro/invoices/inv1/pdf");
  });
});
