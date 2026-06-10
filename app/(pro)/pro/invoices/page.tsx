import Link from "next/link";
import { redirect } from "next/navigation";
import { Receipt, Download, ChevronRight, AlertTriangle } from "lucide-react";
import { listProInvoices } from "@/actions/pro-me";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";

export const dynamic = "force-dynamic";

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

function isOverdue(invoice: { dueDate: string; status: string }): boolean {
  return (
    invoice.status !== "PAID" &&
    new Date(invoice.dueDate).getTime() < Date.now()
  );
}

export default async function ProInvoicesPage() {
  const result = await listProInvoices();
  if (!result.ok) redirect("/pro/login?next=/pro/invoices");

  const invoices = result.invoices;
  const totalOutstanding = invoices.reduce(
    (sum, i) => sum + (i.totalAmount - i.paidAmount),
    0,
  );

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <h1
        className="text-[28px] font-extrabold tracking-tight"
        style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
      >
        Mes factures
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
        Historique de vos factures professionnelles ({invoices.length}).
      </p>

      {totalOutstanding > 0 && (
        <div
          className="mt-5 flex items-center justify-between rounded-sm border-l-4 bg-white px-5 py-4"
          style={{ borderColor: "#7A5409", background: "#FFF8EA" }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" style={{ color: "#7A5409" }} />
            <div>
              <div className="text-[13px] font-bold" style={{ color: "#5C3F06" }}>
                Solde en attente
              </div>
              <div className="text-[11.5px]" style={{ color: "#7A5409" }}>
                Total des factures non réglées.
              </div>
            </div>
          </div>
          <div className="text-[20px] font-extrabold" style={{ color: "#7A5409" }}>
            {formatPrice(totalOutstanding)}
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <div
          className="mt-6 rounded-sm border bg-white px-6 py-12 text-center"
          style={{ borderColor: COLORS.border }}
        >
          <Receipt className="mx-auto h-10 w-10" style={{ color: COLORS.muted }} strokeWidth={1.5} />
          <h2 className="mt-3 text-[16px] font-bold" style={{ color: COLORS.text }}>
            Aucune facture
          </h2>
          <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
            Vos factures apparaîtront ici dès qu&apos;une commande est livrée et facturée.
          </p>
        </div>
      ) : (
        <ul
          className="mt-6 overflow-hidden rounded-sm border bg-white divide-y"
          style={{ borderColor: COLORS.border }}
        >
          {invoices.map((inv) => {
            const overdue = isOverdue(inv);
            const meta =
              overdue && inv.status !== "PAID"
                ? STATUS_META.OVERDUE
                : STATUS_META[inv.status] ?? {
                    label: inv.status,
                    bg: COLORS.beige,
                    color: COLORS.text,
                  };
            const outstanding = inv.totalAmount - inv.paidAmount;
            return (
              <li
                key={inv.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
                style={{ borderColor: COLORS.border }}
              >
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
                    {inv.order && (
                      <>
                        {" · "}
                        <Link href={`/pro/orders/${inv.order.id}`} className="underline">
                          {inv.order.orderNumber}
                        </Link>
                      </>
                    )}
                  </div>
                  {outstanding > 0 && (
                    <div className="mt-1 text-[11.5px] font-semibold" style={{ color: "#7A5409" }}>
                      Reste à payer : {formatPrice(outstanding)}
                    </div>
                  )}
                </div>
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
                  className="inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.06em]"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Link>
                <ChevronRight className="h-4 w-4 shrink-0" style={{ color: COLORS.muted }} />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
