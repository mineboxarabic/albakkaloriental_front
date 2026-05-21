import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getRetailOrderById } from "@/actions/retail-me";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "#B6841C" },
  CONFIRMED: { label: "Confirmée", color: "#3F561F" },
  PREPARED: { label: "En préparation", color: "#3F561F" },
  DELIVERED: { label: "Livrée", color: "#3F561F" },
  CANCELLED: { label: "Annulée", color: "#D52B14" },
};

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

type Params = Promise<{ id: string }>;

export default async function OrderPage({ params }: { params: Params }) {
  const { id } = await params;
  const result = await getRetailOrderById(id);
  if (!result.ok) {
    if (result.error.toLowerCase().includes("not found")) notFound();
    redirect("/login");
  }
  const order = result.order;

  const statusInfo = STATUS_LABELS[order.status] ?? {
    label: order.status,
    color: COLORS.text,
  };

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/" className="hover:underline">Accueil</Link>{" "}
        <span className="mx-1">›</span>
        <span style={{ color: COLORS.text }}>Commande {order.orderNumber}</span>
      </nav>

      <section
        className="mt-4 flex items-center gap-4 rounded-xl border bg-white p-6"
        style={{ borderColor: COLORS.border }}
      >
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
          style={{ background: COLORS.beige, color: COLORS.primary }}
        >
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <div>
          <h1
            className="text-[22px] font-extrabold tracking-tight"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            Merci pour votre commande !
          </h1>
          <p className="mt-1 text-[13.5px]" style={{ color: COLORS.muted }}>
            Nous vous contacterons pour confirmer votre commande.
          </p>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-12 gap-6">
        <section className="col-span-8 flex flex-col gap-4">
          <div
            className="flex items-center justify-between rounded-xl border bg-white px-6 py-4"
            style={{ borderColor: COLORS.border }}
          >
            <div>
              <div className="text-[12px]" style={{ color: COLORS.muted }}>
                Numéro de commande
              </div>
              <div className="text-[16px] font-extrabold" style={{ color: COLORS.text }}>
                {order.orderNumber}
              </div>
              <div className="mt-1 text-[12px]" style={{ color: COLORS.muted }}>
                Passée le {DATE_FMT.format(new Date(order.createdAt))}
              </div>
            </div>
            <span
              className="rounded-full px-3 py-1.5 text-[12px] font-bold"
              style={{ background: `${statusInfo.color}1A`, color: statusInfo.color }}
            >
              {statusInfo.label}
            </span>
          </div>

          <div
            className="rounded-xl border bg-white p-6"
            style={{ borderColor: COLORS.border }}
          >
            <h2 className="text-[14px] font-bold tracking-wide" style={{ color: COLORS.text }}>
              ARTICLES
            </h2>
            <ul className="mt-4 divide-y" style={{ borderColor: COLORS.border }}>
              {order.items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center justify-between py-3 text-[13.5px]"
                  style={{ borderColor: COLORS.border }}
                >
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: COLORS.text }}>
                      {it.productName}
                    </div>
                    <div className="text-[12px]" style={{ color: COLORS.muted }}>
                      {it.quantity} × {formatPriceEUR(it.unitPrice)}
                    </div>
                  </div>
                  <div className="font-extrabold" style={{ color: COLORS.text }}>
                    {formatPriceEUR(it.totalPrice)}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-xl border bg-white p-6"
            style={{ borderColor: COLORS.border }}
          >
            <h2 className="text-[14px] font-bold tracking-wide" style={{ color: COLORS.text }}>
              LIVRAISON
            </h2>
            <div className="mt-3 text-[13.5px] leading-relaxed" style={{ color: COLORS.text }}>
              <div className="font-semibold">{order.deliveryName}</div>
              <div style={{ color: COLORS.muted }}>{order.deliveryPhone}</div>
              <div>{order.deliveryAddress}</div>
              <div>{order.deliveryCity}</div>
            </div>
            {order.notes && (
              <div className="mt-3 text-[12.5px]" style={{ color: COLORS.muted }}>
                <strong style={{ color: COLORS.text }}>Note :</strong> {order.notes}
              </div>
            )}
          </div>
        </section>

        <aside className="col-span-4">
          <div
            className="rounded-xl border bg-white p-5"
            style={{ borderColor: COLORS.border }}
          >
            <div className="text-[12px] font-bold tracking-wide" style={{ color: COLORS.text }}>
              RÉCAPITULATIF
            </div>

            <dl className="mt-4 space-y-2 text-[13px]" style={{ color: COLORS.text }}>
              <div className="flex items-center justify-between">
                <dt style={{ color: COLORS.muted }}>Articles</dt>
                <dd>{order.items.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt style={{ color: COLORS.muted }}>Paiement</dt>
                <dd>
                  {order.paymentMethod === "cash_on_delivery"
                    ? "À la livraison"
                    : order.paymentMethod}
                </dd>
              </div>
            </dl>

            <div
              className="mt-4 flex items-center justify-between border-t pt-4"
              style={{ borderColor: COLORS.border }}
            >
              <span className="text-[14px] font-bold" style={{ color: COLORS.text }}>
                Total
              </span>
              <span className="text-[20px] font-extrabold" style={{ color: COLORS.primary }}>
                {formatPriceEUR(order.totalAmount)}
              </span>
            </div>

            <Link
              href="/products"
              className="mt-5 grid h-11 place-items-center rounded-md text-[13.5px] font-semibold text-white shadow-sm"
              style={{ background: COLORS.primary }}
            >
              Continuer mes achats
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
