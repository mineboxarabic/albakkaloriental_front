import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, FileText } from "lucide-react";
import { getQuote } from "@/actions/pro-quote";
import AcceptButton from "./accept-button";

export const dynamic = "force-dynamic";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getQuote(id);
  if (!result.ok) notFound();

  const { quote } = result;
  const isAccepted = quote.acceptedAt !== null;
  const isExpired = new Date(quote.validUntil).getTime() <= Date.now();
  const canAccept = !isAccepted && !isExpired;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/pro/account"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <FileText className="h-6 w-6 text-muted-foreground" />
            Devis {quote.quoteNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            Commande de référence : <strong>{quote.order.orderNumber}</strong>
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Sous-total
          </div>
          <div className="mt-1 text-lg font-semibold">
            {formatPrice(quote.subtotal)}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            TVA
          </div>
          <div className="mt-1 text-lg font-semibold">
            {formatPrice(quote.taxTotal)}
          </div>
        </div>
        <div className="rounded-lg border-2 border-emerald-700 bg-emerald-50 p-4">
          <div className="text-xs uppercase tracking-wide text-emerald-800">
            Total TTC
          </div>
          <div className="mt-1 text-lg font-extrabold text-emerald-900">
            {formatPrice(quote.total)}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center gap-2 text-sm">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <span>
            Valable jusqu&apos;au{" "}
            <strong>{formatDate(quote.validUntil)}</strong>
          </span>
        </div>
        {isAccepted && (
          <div className="mt-2 text-sm text-emerald-700">
            ✓ Devis signé le {formatDate(quote.acceptedAt!)}.
          </div>
        )}
        {isExpired && !isAccepted && (
          <div className="mt-2 text-sm text-red-700">
            Ce devis a expiré. Contactez-nous pour le renouveler.
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Produit</th>
              <th className="px-4 py-2 text-right">Qté</th>
              <th className="px-4 py-2 text-right">PU</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((line, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2 font-medium">{line.productId}</td>
                <td className="px-4 py-2 text-right">{line.quantity}</td>
                <td className="px-4 py-2 text-right">{formatPrice(line.unitPrice)}</td>
                <td className="px-4 py-2 text-right font-semibold">
                  {formatPrice(line.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canAccept && (
        <div className="rounded-lg border bg-white p-5">
          <AcceptButton quoteId={quote.id} />
        </div>
      )}
    </div>
  );
}
