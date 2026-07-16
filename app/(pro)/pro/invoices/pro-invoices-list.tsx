import Link from "next/link";
import { Download, ChevronRight } from "lucide-react";
import { COLORS } from "@/lib/ui";
import type { ProInvoice } from "@/actions/pro-me";

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  UNPAID: { label: "Non réglée", bg: "#FFF1D6", color: "#7A5409" },
  PARTIAL: { label: "Partielle", bg: "#FFE3C4", color: "#7A3F09" },
  PAID: { label: "Réglée", bg: "#E5F0D9", color: "#2E3F17" },
  OVERDUE: { label: "En retard", bg: "#FCE9E5", color: "#7A1709" },
};

function isOverdue(invoice: ProInvoice): boolean {
  return invoice.status !== "PAID" && new Date(invoice.dueDate).getTime() < Date.now();
}

function displayStatus(invoice: ProInvoice): "UNPAID" | "PAID" | "OVERDUE" | "PARTIAL" {
  if (isOverdue(invoice)) return "OVERDUE";
  if (invoice.paidAmount > 0 && invoice.remainingAmount > 0) return "PARTIAL";
  return invoice.status;
}

export function ProInvoicesList({ invoices }: { invoices: ProInvoice[] }) {
  return (
    <ul
      className="mt-6 overflow-hidden rounded-sm border bg-white divide-y"
      style={{ borderColor: COLORS.border }}
    >
      {invoices.map((inv) => {
        const status = displayStatus(inv);
        const meta = STATUS_META[status] ?? { label: status, bg: COLORS.beige, color: COLORS.text };
        const visibleOrders = inv.orders.slice(0, 2);
        const extraCount = inv.orders.length - visibleOrders.length;

        return (
          <li key={inv.id} className="px-5 py-4" style={{ borderColor: COLORS.border }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[14px] font-extrabold" style={{ color: COLORS.text }}>
                    {inv.invoiceNumber}
                  </span>
                  <span
                    className="rounded-sm px-2 py-0.5 text-[10.5px] font-bold tracking-[0.05em]"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.label.toUpperCase()}
                  </span>
                </div>
                <div className="mt-1 text-[12px]" style={{ color: COLORS.muted }}>
                  Émise le {DATE_FMT.format(new Date(inv.invoiceDate))} · Échéance{" "}
                  {DATE_FMT.format(new Date(inv.dueDate))}
                </div>
                {inv.orders.length > 0 && (
                  <div className="mt-1 text-[12px]" style={{ color: COLORS.muted }}>
                    {inv.orders.length > 1 ? `${inv.orders.length} commandes : ` : null}
                    {visibleOrders.map((order, idx) => (
                      <span key={order.id}>
                        {idx > 0 && ", "}
                        <Link href={`/pro/orders/${order.id}`} className="underline">
                          {order.orderNumber}
                        </Link>
                      </span>
                    ))}
                    {extraCount > 0 && ` +${extraCount}`}
                  </div>
                )}
                <div className="mt-1 text-[11.5px]" style={{ color: COLORS.muted }}>
                  Payé : {formatPrice(inv.paidAmount)}
                </div>
                {inv.remainingAmount > 0 && (
                  <div className="text-[11.5px] font-semibold" style={{ color: "#7A5409" }}>
                    Reste à payer : {formatPrice(inv.remainingAmount)}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="text-right">
                  <div className="text-[15px] font-extrabold" style={{ color: COLORS.primary }}>
                    {formatPrice(inv.totalAmount)}
                  </div>
                </div>
                <Link
                  href={`/pro/invoices/${inv.id}/pdf`}
                  prefetch={false}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`PDF de la facture ${inv.invoiceNumber}`}
                  className="inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.06em]"
                  style={{ borderColor: COLORS.border, color: COLORS.text, background: "#FFFFFF" }}
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Link>
                <ChevronRight className="hidden h-4 w-4 shrink-0 sm:block" style={{ color: COLORS.muted }} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
