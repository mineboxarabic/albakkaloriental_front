import Link from "next/link";
import { Clock, Download } from "lucide-react";
import { COLORS } from "@/lib/ui";
import type { ProInvoice } from "@/actions/pro-me";
import { translate, type TranslationParams } from "@/lib/translations";
import type { Language } from "@/lib/language";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

type OrderBilling = {
  state: "UNINVOICED" | "INVOICED";
  invoices: ProInvoice[];
};

export function ProOrderBillingCard({
  billing,
  orderStatus,
  language = "fr",
}: {
  billing: OrderBilling;
  orderStatus: string;
  language?: Language;
}) {
  const t = (text: string, params?: TranslationParams) =>
    translate(text, language, params);
  if (billing.invoices.length === 0) {
    if (billing.state !== "UNINVOICED" || orderStatus !== "DELIVERED") return null;
    return (
      <div
        className="mt-5 rounded-sm border p-4"
        style={{ borderColor: COLORS.border, background: "#FAF8F2" }}
      >
        <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: COLORS.text }}>
          <Clock className="h-4 w-4" style={{ color: COLORS.muted }} />
          {t("Facturation en préparation")}
        </div>
        <p className="mt-1 text-[11.5px]" style={{ color: COLORS.muted }}>
          {t("Cette commande sera bientôt ajoutée à une facture.")}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      {billing.invoices.map((invoice) => {
        const otherOrders = invoice.orders.length - 1;
        return (
          <div
            key={invoice.id}
            className="rounded-sm border p-4"
            style={{ borderColor: COLORS.border, background: "#FAF8F2" }}
          >
            <p className="text-[13px]" style={{ color: COLORS.text }}>
              {t("Cette commande est incluse dans la facture {number}", {
                number: invoice.invoiceNumber,
              })}
              {otherOrders > 1
                ? t(" avec {count} autres commandes", { count: otherOrders })
                : otherOrders === 1
                  ? t(" avec 1 autre commande")
                  : ""}
            </p>
            <p className="mt-1 text-[11.5px]" style={{ color: COLORS.muted }}>
              {t("Paiements suivis au niveau de la facture.")}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-[13px]" style={{ color: COLORS.muted }}>
                {invoice.remainingAmount > 0 ? (
                  <>
                    {t("Reste à payer sur la facture :")}{" "}
                    <span className="font-semibold" style={{ color: "#7A5409" }}>
                      {formatPrice(invoice.remainingAmount)}
                    </span>
                  </>
                ) : (
                  <span className="font-semibold" style={{ color: COLORS.primary }}>
                    {t("Facture réglée")}
                  </span>
                )}
              </div>
              <Link
                href={`/pro/invoices/${invoice.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("PDF de la facture {number}", {
                  number: invoice.invoiceNumber,
                })}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.06em]"
                style={{ borderColor: COLORS.border, color: COLORS.text, background: "#FFFFFF" }}
              >
                <Download className="h-3.5 w-3.5" />
                {t("Télécharger la facture")}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
