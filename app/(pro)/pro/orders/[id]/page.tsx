import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Package,
  ShieldCheck,
  Truck,
  XCircle,
  Download,
} from "lucide-react";
import { getProOrderById } from "@/actions/pro-me";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { ProOrderEditor } from "./pro-order-editor";
import { ProOrderBillingCard } from "./pro-order-billing-card";
import { getTranslator } from "@/lib/server-language";
import { formatDate } from "@/lib/language";
import { getLocalizedProductNames } from "@/lib/catalog-navigation-server";
import { OrderUpdates } from '@/components/order-updates';
import { getCompany } from "@/lib/company";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { ProOrderAttachments } from "./pro-order-attachments";

export const dynamic = "force-dynamic";

const STATUS_META: Record<
  string,
  { label: string; bg: string; color: string; icon: typeof FileText; description: string }
> = {
  PENDING: {
    label: "En attente de validation",
    bg: "#FFF1D6",
    color: "#7A5409",
    icon: FileText,
    description:
      "Notre équipe vérifie la disponibilité des produits.",
  },
  CONFIRMED: {
    label: "Commande confirmée",
    bg: "#E5F0D9",
    color: COLORS.primary,
    icon: ShieldCheck,
    description: "Commande validée. Contactez-nous pour demander une modification.",
  },
  PREPARED: {
    label: "Préparée",
    bg: "#DDE7CB",
    color: "#2E3F17",
    icon: Package,
    description: "Commande préparée, prête à partir en livraison.",
  },
  DELIVERED: {
    label: "Livrée",
    bg: "#DDE7CB",
    color: "#2E3F17",
    icon: Truck,
    description: "Commande livrée.",
  },
  CANCELLED: {
    label: "Annulée",
    bg: "#FCE9E5",
    color: COLORS.red,
    icon: XCircle,
    description: "Commande annulée.",
  },
};

const STATUS_FALLBACK = {
  label: "Statut inconnu",
  bg: "#F0F0F0",
  color: "#555555",
  icon: FileText,
  description: "Statut non reconnu, contactez le support.",
} satisfies (typeof STATUS_META)[string];


const TAX_RATE = 20;

type Params = Promise<{ id: string }>;

export default async function ProOrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const result = await getProOrderById(id);
  if (!result.ok) {
    if (result.error.toLowerCase().includes("not found")) notFound();
    redirect("/pro/login?next=/pro/orders");
  }
  const order = result.order;
  const meta = STATUS_META[order.status] ?? STATUS_FALLBACK;
  const Icon = meta.icon;
  // TVA is informational only; invoicing/payment is tracked per invoice via
  // order.billing, never split back onto the order (see ProOrderBillingCard).
  const total = order.totalAmount;
  const tva = Number((total * (TAX_RATE / 100)).toFixed(2));
  const { t, language } = await getTranslator();
  const productNames = await getLocalizedProductNames("pro", language);
  const longDate = (d: string | Date) =>
    formatDate(d, language, { day: "2-digit", month: "long", year: "numeric" });
  const company = await getCompany();
  const contactMessage = t("Bonjour, j'ai une question sur les fichiers de la commande {number}.", {
    number: order.orderNumber,
  });
  const attachmentsContactUrl =
    buildWhatsappUrl(company.whatsappNumber, contactMessage) ??
    (company.email
      ? `mailto:${company.email}?subject=${encodeURIComponent(order.orderNumber)}&body=${encodeURIComponent(contactMessage)}`
      : null);

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-6 pb-16 sm:px-6 sm:pt-8">
      <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/pro/products" className="hover:underline">
          {t("Catalogue pro")}
        </Link>{" "}
        <span className="mx-1">›</span>
        <Link href="/pro/orders" className="hover:underline">
          {t("Mes commandes")}
        </Link>{" "}
        <span className="mx-1">›</span>
        <span style={{ color: COLORS.text }}>{order.orderNumber}</span>
      </nav>

      <div className="mt-3 flex items-center gap-3">
        <Link
          href="/pro/orders"
          className="flex items-center gap-1 text-[12px] font-semibold"
          style={{ color: COLORS.muted }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("Retour")}
        </Link>
      </div>

      <header className="mt-3 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-[22px] font-extrabold tracking-tight sm:text-[28px]"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            {t("Commande {number}", { number: order.orderNumber })}
          </h1>
          <p className="mt-1 text-[12.5px] flex items-center gap-1" style={{ color: COLORS.muted }}>
            <Calendar className="h-3.5 w-3.5" />
            {longDate(order.orderDate)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-[11.5px] font-bold tracking-[0.1em]"
            style={{ background: meta.bg, color: meta.color }}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
            {t(meta.label).toLocaleUpperCase("fr")}
          </span>
        </div>
      </header>

      <OrderUpdates status={order.status} />
      <section
        className="mt-5 rounded-sm border bg-white px-5 py-4"
        style={{ borderColor: COLORS.border }}
      >
        <p className="text-[13px]" style={{ color: COLORS.muted }}>
          {t(meta.description)}
        </p>
        <div className="mt-3 flex flex-col gap-3 rounded-sm border bg-[#FAF8F2] px-4 py-3 text-[13px] sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 shrink-0" style={{ color: COLORS.primary }} />
            <div className="flex-1">
              <div className="font-semibold" style={{ color: COLORS.text }}>
                {order.status === "PENDING" ? t("Devis") : t("Bon de commande")}
              </div>
              <div className="text-[11.5px]" style={{ color: COLORS.muted }}>
                {t("Récapitulatif de votre commande {number}", {
                  number: order.orderNumber,
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-2 sm:ms-auto">
            <a
              href={`/pro/orders/${order.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-sm border px-3 py-2 text-[11.5px] font-bold uppercase tracking-[0.1em] sm:flex-none sm:py-1.5"
              style={{ borderColor: COLORS.border, color: COLORS.text, background: "#FFFFFF" }}
            >
              <Download className="h-3 w-3" />
              {t("Télécharger le PDF")}
            </a>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-12 gap-6">
        <ProOrderEditor
          key={order.updatedAt}
          orderId={order.id}
          updatedAt={order.updatedAt}
          canEdit={order.canEdit === true}
          items={order.items.map(item => ({
            id: item.id,
            name: productNames[item.productId] ?? item.product.name,
            sku: item.product.sku,
            imageUrl: item.product.imageUrl,
            quantity: item.quantity,
            saleUnit: item.saleUnit,
            packSize: item.editablePackSize ?? 1,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          }))}
        >
          <aside
            className="col-span-12 lg:col-span-4 rounded-sm border bg-white p-5"
            style={{ borderColor: COLORS.border }}
          >
            <div className="text-[11px] font-bold tracking-[0.14em]" style={{ color: COLORS.text }}>
              {t("RÉCAPITULATIF")}
            </div>
            <dl className="mt-4 space-y-2 text-[13px]" style={{ color: COLORS.text }}>
              <Row label={t("Sous-total HT")} value={formatPriceEUR(total)} />
              <Row
                label={t("dont TVA {rate}%", { rate: TAX_RATE })}
                value={formatPriceEUR(tva)}
              />
            </dl>
            <div
              className="mt-4 flex items-center justify-between border-t pt-4"
              style={{ borderColor: COLORS.border }}
            >
              <span className="text-[14px] font-bold" style={{ color: COLORS.text }}>
                {t("Total")}
              </span>
              <span className="text-[22px] font-extrabold" style={{ color: COLORS.primary }}>
                {formatPriceEUR(total)}
              </span>
            </div>
            {order.deliveryCity && (
              <div
                className="mt-5 rounded-sm border-s-2 px-3 py-2 text-[11.5px]"
                style={{ borderColor: COLORS.primary, background: "#FAF8F2", color: COLORS.muted }}
              >
                <div className="flex items-center gap-1.5 font-bold" style={{ color: COLORS.text }}>
                  <Package className="h-3 w-3" />
                  {t("Livraison")}
                </div>
                {order.deliveryCity.name} ·{" "}
                {longDate(order.deliveryCity.delivery.scheduledDate)}
              </div>
            )}

            <ProOrderBillingCard
              billing={order.billing}
              orderStatus={order.status}
              language={language}
            />
          </aside>
        </ProOrderEditor>
      </section>

      <ProOrderAttachments attachments={order.attachments} contactUrl={attachmentsContactUrl} />
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt style={{ color: COLORS.muted }}>{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
