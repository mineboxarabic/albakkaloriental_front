import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Truck } from "lucide-react";
import { getRetailOrderById } from "@/actions/retail-me";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { getTranslator } from "@/lib/server-language";
import { formatDate } from "@/lib/language";
import { getLocalizedProductNames } from "@/lib/catalog-navigation-server";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "#B6841C" },
  CONFIRMED: { label: "Confirmée", color: "#3F561F" },
  PREPARED: { label: "En préparation", color: "#3F561F" },
  DELIVERED: { label: "Livrée", color: "#3F561F" },
  CANCELLED: { label: "Annulée", color: "#D52B14" },
};


type Params = Promise<{ id: string }>;

export default async function OrderPage({ params }: { params: Params }) {
  const { id } = await params;
  const result = await getRetailOrderById(id);
  if (!result.ok) {
    if (result.error.toLowerCase().includes("not found")) notFound();
    redirect("/login");
  }
  const order = result.order;
  const { t, language } = await getTranslator();
  const productNames = await getLocalizedProductNames("retail", language);

  const statusInfo = STATUS_LABELS[order.status] ?? {
    label: order.status,
    color: COLORS.text,
  };

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/" className="hover:underline">{t("Accueil")}</Link>{" "}
        <span className="mx-1">›</span>
        <span style={{ color: COLORS.text }}>
          {t("Commande {number}", { number: order.orderNumber })}
        </span>
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
            {t("Merci pour votre commande !")}
          </h1>
          <p className="mt-1 text-[13.5px]" style={{ color: COLORS.muted }}>
            {t("Nous vous contacterons pour confirmer votre commande.")}
          </p>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
        <section className="md:col-span-8 flex flex-col gap-4">
          <div
            className="flex items-center justify-between rounded-xl border bg-white px-6 py-4"
            style={{ borderColor: COLORS.border }}
          >
            <div>
              <div className="text-[12px]" style={{ color: COLORS.muted }}>
                {t("Numéro de commande")}
              </div>
              <div className="text-[16px] font-extrabold" style={{ color: COLORS.text }}>
                {order.orderNumber}
              </div>
              <div className="mt-1 text-[12px]" style={{ color: COLORS.muted }}>
                {t("Passée le {date}", {
                  date: formatDate(order.createdAt, language, {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                })}
              </div>
            </div>
            <span
              className="rounded-full px-3 py-1.5 text-[12px] font-bold"
              style={{ background: `${statusInfo.color}1A`, color: statusInfo.color }}
            >
              {t(statusInfo.label)}
            </span>
          </div>

          <div
            className="rounded-xl border bg-white p-6"
            style={{ borderColor: COLORS.border }}
          >
            <h2 className="text-[14px] font-bold tracking-wide" style={{ color: COLORS.text }}>
              {t("ARTICLES")}
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
                      {productNames[it.productId] ?? it.productName}
                    </div>
                    <div className="text-[12px]" style={{ color: COLORS.muted }}>
                      <span className="ltr-isolate">
                        {it.quantity} × {formatPriceEUR(it.unitPrice)}
                      </span>
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
              {t("LIVRAISON")}
            </h2>

            {order.deliveryCityRef?.delivery?.scheduledDate && (
              <div
                className="mt-3 flex items-start gap-3 rounded-md border-s-4 px-3 py-2.5"
                style={{
                  background: "#E5F0D9",
                  borderColor: COLORS.primary,
                  color: "#2E3F17",
                }}
              >
                <Truck className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="text-[13px]">
                  <div className="font-bold">{t("Livraison prévue")}</div>
                  <div className="capitalize">
                    {formatDate(
                      order.deliveryCityRef.delivery.scheduledDate,
                      language,
                      {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </div>
                  {order.deliveryCityRef.name && (
                    <div className="text-[12px]" style={{ color: "#3F561F" }}>
                      {t("Tournée — {city}", { city: order.deliveryCityRef.name })}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-3 text-[13.5px] leading-relaxed" style={{ color: COLORS.text }}>
              <div className="font-semibold">
                <bdi>{order.deliveryName}</bdi>
              </div>
              <div style={{ color: COLORS.muted }}>
                <span className="ltr-isolate">{order.deliveryPhone}</span>
              </div>
              <div>
                <bdi>{order.deliveryAddress}</bdi>
              </div>
              <div>
                <bdi>{order.deliveryCity}</bdi>
              </div>
            </div>
            {order.notes && (
              <div className="mt-3 text-[12.5px]" style={{ color: COLORS.muted }}>
                <strong style={{ color: COLORS.text }}>{t("Note :")}</strong>{" "}
                {order.notes}
              </div>
            )}
          </div>
        </section>

        <aside className="md:col-span-4">
          <div
            className="rounded-xl border bg-white p-5"
            style={{ borderColor: COLORS.border }}
          >
            <div className="text-[12px] font-bold tracking-wide" style={{ color: COLORS.text }}>
              {t("RÉCAPITULATIF")}
            </div>

            <dl className="mt-4 space-y-2 text-[13px]" style={{ color: COLORS.text }}>
              <div className="flex items-center justify-between">
                <dt style={{ color: COLORS.muted }}>{t("Articles")}</dt>
                <dd>{order.items.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt style={{ color: COLORS.muted }}>{t("Paiement")}</dt>
                <dd>
                  {order.paymentMethod === "cash_on_delivery"
                    ? t("À la livraison")
                    : order.paymentMethod}
                </dd>
              </div>
            </dl>

            <div
              className="mt-4 flex items-center justify-between border-t pt-4"
              style={{ borderColor: COLORS.border }}
            >
              <span className="text-[14px] font-bold" style={{ color: COLORS.text }}>
                {t("Total")}
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
              {t("Continuer mes achats")}
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
