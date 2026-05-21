import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Pencil,
  Package,
  Box,
  Building2,
  MapPin,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { ConfirmProformaButton, ConfirmedBadge } from "./confirm-button";

export const dynamic = "force-dynamic";

const TAX_RATE = 20;

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Devis",
  CONFIRMED: "Commande confirmée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

type Params = Promise<{ id: string }>;

export default async function ProformaPage({ params }: { params: Params }) {
  const session = await getSession();
  if (!session || session.type !== "pro") {
    redirect("/pro/login");
  }
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      orderDate: true,
      createdAt: true,
      totalAmount: true,
      notes: true,
      customerId: true,
      customer: {
        select: {
          companyName: true,
          contactName: true,
          phone: true,
          email: true,
          address: true,
          postalCode: true,
          city: true,
          country: true,
          pricingLevel: true,
        },
      },
      items: {
        select: {
          id: true,
          saleUnit: true,
          quantity: true,
          unitPrice: true,
          taxRate: true,
          totalPrice: true,
          product: { select: { name: true, sku: true, unitsPerPack: true } },
        },
      },
    },
  });

  if (!order || order.customerId !== session.customerId) {
    notFound();
  }

  const totalHT = order.totalAmount;
  const totalTVA = Number((totalHT * (TAX_RATE / 100)).toFixed(2));
  const totalTTC = Number((totalHT + totalTVA).toFixed(2));

  const isPending = order.status === "PENDING";

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/pro/products" className="hover:underline">Catalogue pro</Link>{" "}
        <span className="mx-1">›</span>
        <span style={{ color: COLORS.text }}>{order.orderNumber}</span>
      </nav>

      <header className="mt-4 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="grid h-14 w-14 place-items-center rounded-sm"
            style={{ background: COLORS.beige, color: COLORS.primary }}
          >
            <FileText className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <div>
            <h1
              className="text-[26px] font-extrabold leading-tight tracking-tight"
              style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
            >
              {isPending ? "Votre devis" : "Votre commande"} {order.orderNumber}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-[12.5px]" style={{ color: COLORS.muted }}>
              <span>Émis le {DATE_FMT.format(new Date(order.createdAt))}</span>
              <span>·</span>
              <span>
                Devis – non valeur fiscale
              </span>
            </div>
          </div>
        </div>

        {isPending ? (
          <span
            className="inline-flex items-center rounded-sm px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.12em]"
            style={{ background: "#FFF1D6", color: "#7A5409" }}
          >
            {STATUS_LABEL[order.status]}
          </span>
        ) : (
          <ConfirmedBadge />
        )}
      </header>

      <div className="mt-6 grid grid-cols-12 gap-6">
        <section className="col-span-8 flex flex-col gap-4">
          <div
            className="rounded-sm border bg-white p-6"
            style={{ borderColor: COLORS.border }}
          >
            <h2 className="text-[11px] font-bold tracking-[0.14em]" style={{ color: COLORS.text }}>
              CLIENT
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-4 text-[13px]" style={{ color: COLORS.text }}>
              <div className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: COLORS.muted }} />
                <div>
                  <div className="font-semibold">{order.customer.companyName}</div>
                  <div style={{ color: COLORS.muted }}>{order.customer.contactName}</div>
                  <div style={{ color: COLORS.muted }}>{order.customer.phone}</div>
                  {order.customer.email && (
                    <div style={{ color: COLORS.muted }}>{order.customer.email}</div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: COLORS.muted }} />
                <div>
                  <div>{order.customer.address}</div>
                  <div>
                    {order.customer.postalCode} {order.customer.city}
                  </div>
                  <div>{order.customer.country}</div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="overflow-hidden rounded-sm border bg-white"
            style={{ borderColor: COLORS.border }}
          >
            <div
              className="grid grid-cols-12 px-4 py-3 text-[10.5px] font-bold tracking-[0.14em]"
              style={{ color: COLORS.muted, background: "#FAF8F2" }}
            >
              <div className="col-span-5">PRODUIT</div>
              <div className="col-span-2 text-center">UNITÉ</div>
              <div className="col-span-1 text-center">QTÉ</div>
              <div className="col-span-2 text-right">P.U. HT</div>
              <div className="col-span-2 text-right">TOTAL HT</div>
            </div>
            <ul>
              {order.items.map((it) => (
                <li
                  key={it.id}
                  className="grid grid-cols-12 items-center border-t px-4 py-3 text-[13px]"
                  style={{ borderColor: COLORS.border }}
                >
                  <div className="col-span-5">
                    <div className="font-semibold" style={{ color: COLORS.text }}>
                      {it.product.name}
                    </div>
                    <div className="text-[11px]" style={{ color: COLORS.muted }}>
                      Réf : {it.product.sku}
                      {it.saleUnit === "PACK" && it.product.unitsPerPack > 1
                        ? ` · ${it.product.unitsPerPack} u./carton`
                        : ""}
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span
                      className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]"
                      style={{
                        background:
                          it.saleUnit === "PACK" ? COLORS.beige : "#FFFFFF",
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                    >
                      {it.saleUnit === "PACK" ? (
                        <Package className="h-3 w-3" strokeWidth={2} />
                      ) : (
                        <Box className="h-3 w-3" strokeWidth={2} />
                      )}
                      {it.saleUnit === "PACK" ? "Carton" : "Unité"}
                    </span>
                  </div>
                  <div className="col-span-1 text-center font-bold" style={{ color: COLORS.text }}>
                    {it.quantity}
                  </div>
                  <div className="col-span-2 text-right" style={{ color: COLORS.text }}>
                    {formatPriceEUR(it.unitPrice)}
                  </div>
                  <div className="col-span-2 text-right font-extrabold" style={{ color: COLORS.text }}>
                    {formatPriceEUR(it.totalPrice)}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {order.notes && (
            <div
              className="rounded-sm border bg-white p-5"
              style={{ borderColor: COLORS.border }}
            >
              <div className="text-[11px] font-bold tracking-[0.14em]" style={{ color: COLORS.text }}>
                NOTES
              </div>
              <p className="mt-2 text-[13px]" style={{ color: COLORS.muted }}>
                {order.notes}
              </p>
            </div>
          )}
        </section>

        <aside className="col-span-4">
          <div
            className="rounded-sm border bg-white p-5"
            style={{ borderColor: COLORS.border }}
          >
            <div className="text-[11px] font-bold tracking-[0.14em]" style={{ color: COLORS.text }}>
              RÉCAPITULATIF
            </div>

            <dl className="mt-4 space-y-2 text-[13px]" style={{ color: COLORS.text }}>
              <Row label="Sous-total HT" value={formatPriceEUR(totalHT)} />
              <Row label={`TVA ${TAX_RATE}%`} value={formatPriceEUR(totalTVA)} />
              <Row
                label="Niveau de tarification"
                value={order.customer.pricingLevel ?? "—"}
                muted
              />
            </dl>

            <div
              className="mt-4 flex items-center justify-between border-t pt-4"
              style={{ borderColor: COLORS.border }}
            >
              <span className="text-[14px] font-bold" style={{ color: COLORS.text }}>
                Total TTC
              </span>
              <span
                className="text-[22px] font-extrabold"
                style={{ color: COLORS.primary }}
              >
                {formatPriceEUR(totalTTC)}
              </span>
            </div>

            {isPending ? (
              <>
                <div className="mt-5">
                  <ConfirmProformaButton orderId={order.id} />
                </div>
                <Link
                  href="/pro/cart"
                  className="mt-3 flex items-center justify-center gap-1.5 text-[12px] font-semibold underline-offset-2 hover:underline"
                  style={{ color: COLORS.muted }}
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                  Modifier le devis
                </Link>
              </>
            ) : (
              <div className="mt-5">
                <Link
                  href="/pro/orders"
                  className="grid h-11 place-items-center rounded-sm text-[12.5px] font-bold uppercase tracking-[0.12em] text-white shadow-md"
                  style={{ background: COLORS.primary }}
                >
                  Voir mes commandes
                </Link>
                <p className="mt-3 text-center text-[11.5px]" style={{ color: COLORS.muted }}>
                  Votre commande est en cours de traitement. Une facture vous sera envoyée à la livraison.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt style={{ color: COLORS.muted }}>{label}</dt>
      <dd
        className="font-semibold"
        style={{ color: muted ? COLORS.muted : COLORS.text }}
      >
        {value}
      </dd>
    </div>
  );
}
