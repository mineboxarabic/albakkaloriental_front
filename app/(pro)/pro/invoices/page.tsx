import { redirect } from "next/navigation";
import { Receipt, AlertTriangle } from "lucide-react";
import { listProInvoices } from "@/actions/pro-me";
import { ProInvoicesList } from "./pro-invoices-list";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";

export const dynamic = "force-dynamic";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default async function ProInvoicesPage() {
  const result = await listProInvoices();
  if (!result.ok) redirect("/pro/login?next=/pro/invoices");

  const invoices = result.invoices;
  const totalOutstanding = invoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0);

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <h1
        className="text-[24px] font-extrabold tracking-tight sm:text-[28px]"
        style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
      >
        Mes factures
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
        Historique de vos factures professionnelles ({invoices.length}).
      </p>

      {totalOutstanding > 0 && (
        <div
          className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-sm border-l-4 bg-white px-5 py-4"
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
        <ProInvoicesList invoices={invoices} />
      )}
    </main>
  );
}
