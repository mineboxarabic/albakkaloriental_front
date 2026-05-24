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
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { getProOrderById } from "@/actions/pro-me";
import { COLORS, DISPLAY_FONT, productImage } from "@/lib/ui";
import { formatPriceEUR } from "@/lib/catalog-pricing";

export const dynamic = "force-dynamic";

const STATUS_META: Record<
  string,
  { label: string; bg: string; color: string; icon: typeof FileText; description: string }
> = {
  PENDING: {
    label: "Devis en cours d'émission",
    bg: "#FFF1D6",
    color: "#7A5409",
    icon: FileText,
    description:
      "Notre équipe valide votre demande. Vous recevrez sous peu un devis par email à signer en ligne.",
  },
  CONFIRMED: {
    label: "Commande confirmée",
    bg: "#E5F0D9",
    color: COLORS.primary,
    icon: ShieldCheck,
    description: "Devis signé. Préparation en cours.",
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

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

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
  const itemsTotal = order.items.reduce((sum, i) => sum + i.totalPrice, 0);
  const tva = Number((itemsTotal * (TAX_RATE / 100)).toFixed(2));
  const ttc = Number((itemsTotal + tva).toFixed(2));

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/pro/products" className="hover:underline">
          Catalogue pro
        </Link>{" "}
        <span className="mx-1">›</span>
        <Link href="/pro/orders" className="hover:underline">
          Mes commandes
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
          Retour
        </Link>
      </div>

      <header className="mt-3 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-[28px] font-extrabold tracking-tight"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            Commande {order.orderNumber}
          </h1>
          <p className="mt-1 text-[12.5px] flex items-center gap-1" style={{ color: COLORS.muted }}>
            <Calendar className="h-3.5 w-3.5" />
            {DATE_FMT.format(new Date(order.orderDate))}
          </p>
        </div>

        <span
          className="inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-[11.5px] font-bold tracking-[0.1em]"
          style={{ background: meta.bg, color: meta.color }}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
          {meta.label.toUpperCase()}
        </span>
      </header>

      <section
        className="mt-5 rounded-sm border bg-white px-5 py-4"
        style={{ borderColor: COLORS.border }}
      >
        <p className="text-[13px]" style={{ color: COLORS.muted }}>
          {meta.description}
        </p>
        {order.quote && (
          <div className="mt-3 flex items-center gap-3 rounded-sm border bg-[#FAF8F2] px-4 py-3 text-[13px]">
            <FileText className="h-4 w-4" style={{ color: COLORS.primary }} />
            <div className="flex-1">
              <div className="font-semibold" style={{ color: COLORS.text }}>
                Devis associé
              </div>
              <div className="text-[11.5px]" style={{ color: COLORS.muted }}>
                {order.quote.acceptedAt
                  ? `Signé le ${DATE_FMT.format(new Date(order.quote.acceptedAt))}`
                  : `Valable jusqu'au ${DATE_FMT.format(new Date(order.quote.validUntil))}`}
              </div>
            </div>
            <Link
              href={`/pro/quotes/${order.quote.id}`}
              className="inline-flex items-center gap-1 rounded-sm border px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.1em]"
              style={{ borderColor: COLORS.border, color: COLORS.text }}
            >
              <CheckCircle2 className="h-3 w-3" />
              Consulter le devis
            </Link>
          </div>
        )}
      </section>

      <section className="mt-6 grid grid-cols-12 gap-6">
        <div
          className="col-span-12 lg:col-span-8 overflow-hidden rounded-sm border bg-white"
          style={{ borderColor: COLORS.border }}
        >
          <div
            className="grid grid-cols-12 items-center px-4 py-3 text-[10.5px] font-bold tracking-[0.14em]"
            style={{ color: COLORS.muted, background: "#FAF8F2" }}
          >
            <div className="col-span-6">PRODUIT</div>
            <div className="col-span-2 text-center">QTÉ</div>
            <div className="col-span-2 text-right">PU HT</div>
            <div className="col-span-2 text-right">TOTAL HT</div>
          </div>

          <ul>
            {order.items.map((it) => (
              <li
                key={it.id}
                className="grid grid-cols-12 items-center gap-3 border-t px-4 py-3 text-[13px]"
                style={{ borderColor: COLORS.border }}
              >
                <div className="col-span-6 flex items-center gap-3">
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-sm"
                    style={{ background: COLORS.beige }}
                  >
                    <Image
                      src={productImage(it.product.imageUrl)}
                      alt={it.product.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="font-semibold" style={{ color: COLORS.text }}>
                      {it.product.name}
                    </div>
                    <div className="text-[11px]" style={{ color: COLORS.muted }}>
                      Réf {it.product.sku}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-center font-semibold" style={{ color: COLORS.text }}>
                  {it.quantity}
                </div>
                <div className="col-span-2 text-right" style={{ color: COLORS.muted }}>
                  {formatPriceEUR(it.unitPrice)}
                </div>
                <div className="col-span-2 text-right font-bold" style={{ color: COLORS.text }}>
                  {formatPriceEUR(it.totalPrice)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside
          className="col-span-12 lg:col-span-4 rounded-sm border bg-white p-5"
          style={{ borderColor: COLORS.border }}
        >
          <div className="text-[11px] font-bold tracking-[0.14em]" style={{ color: COLORS.text }}>
            RÉCAPITULATIF
          </div>
          <dl className="mt-4 space-y-2 text-[13px]" style={{ color: COLORS.text }}>
            <Row label="Sous-total HT" value={formatPriceEUR(itemsTotal)} />
            <Row label={`TVA ${TAX_RATE}%`} value={formatPriceEUR(tva)} />
          </dl>
          <div
            className="mt-4 flex items-center justify-between border-t pt-4"
            style={{ borderColor: COLORS.border }}
          >
            <span className="text-[14px] font-bold" style={{ color: COLORS.text }}>
              Total TTC
            </span>
            <span className="text-[22px] font-extrabold" style={{ color: COLORS.primary }}>
              {formatPriceEUR(ttc)}
            </span>
          </div>
          {order.deliveryCity && (
            <div
              className="mt-5 rounded-sm border-l-2 px-3 py-2 text-[11.5px]"
              style={{ borderColor: COLORS.primary, background: "#FAF8F2", color: COLORS.muted }}
            >
              <div className="flex items-center gap-1.5 font-bold" style={{ color: COLORS.text }}>
                <Package className="h-3 w-3" />
                Livraison
              </div>
              {order.deliveryCity.name} ·{" "}
              {DATE_FMT.format(new Date(order.deliveryCity.delivery.scheduledDate))}
            </div>
          )}
        </aside>
      </section>
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
