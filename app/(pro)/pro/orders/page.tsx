import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ShieldCheck, Truck, XCircle, ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getEnrichedProSession } from "@/lib/session";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";

export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type StatusKey = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

const STATUS_META: Record<
  StatusKey,
  { label: string; bg: string; color: string; icon: typeof FileText }
> = {
  PENDING: {
    label: "Devis",
    bg: "#FFF1D6",
    color: "#7A5409",
    icon: FileText,
  },
  CONFIRMED: {
    label: "Commande confirmée",
    bg: "#E5F0D9",
    color: COLORS.primary,
    icon: ShieldCheck,
  },
  DELIVERED: {
    label: "Livrée",
    bg: "#DDE7CB",
    color: "#2E3F17",
    icon: Truck,
  },
  CANCELLED: {
    label: "Annulée",
    bg: "#FCE9E5",
    color: COLORS.red,
    icon: XCircle,
  },
};

export default async function ProOrdersPage() {
  const session = await getEnrichedProSession();
  if (!session || !session.customerId) {
    redirect("/pro/login?next=/pro/orders");
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.customerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  });

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const confirmedCount = orders.filter(
    (o) => o.status === "CONFIRMED" || o.status === "DELIVERED",
  ).length;

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
            <Link href="/pro/products" className="hover:underline">
              Catalogue pro
            </Link>{" "}
            <span className="mx-1">›</span>
            <span style={{ color: COLORS.text }}>Mes commandes</span>
          </nav>
          <h1
            className="mt-2 text-[28px] font-extrabold tracking-tight"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            Mes commandes
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
            {orders.length === 0
              ? "Aucune commande pour le moment."
              : `${orders.length} ${orders.length > 1 ? "commandes" : "commande"} · ${session.companyName}`}
          </p>
        </div>

        {orders.length > 0 && (
          <div className="flex items-center gap-3">
            <StatPill label="Devis ouverts" value={pendingCount} accent="#7A5409" bg="#FFF1D6" />
            <StatPill label="Validées" value={confirmedCount} accent={COLORS.primary} bg="#E5F0D9" />
          </div>
        )}
      </header>

      {orders.length === 0 ? (
        <div
          className="grid place-items-center rounded-sm border bg-white px-6 py-16 text-center"
          style={{ borderColor: COLORS.border }}
        >
          <div
            className="grid h-16 w-16 place-items-center rounded-full"
            style={{ background: COLORS.beige, color: COLORS.primary }}
          >
            <FileText className="h-7 w-7" strokeWidth={1.6} />
          </div>
          <div
            className="mt-4 text-[17px] font-bold"
            style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
          >
            Aucune commande
          </div>
          <p className="mt-1 max-w-[380px] text-[13px]" style={{ color: COLORS.muted }}>
            Générez votre premier devis depuis le catalogue professionnel.
          </p>
          <Link
            href="/pro/products"
            className="mt-5 inline-flex items-center rounded-sm px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white shadow-sm"
            style={{ background: COLORS.primary }}
          >
            Voir le catalogue
          </Link>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-sm border bg-white"
          style={{ borderColor: COLORS.border }}
        >
          <div
            className="grid grid-cols-12 items-center px-4 py-3 text-[10.5px] font-bold tracking-[0.14em]"
            style={{ color: COLORS.muted, background: "#FAF8F2" }}
          >
            <div className="col-span-3">N° COMMANDE</div>
            <div className="col-span-2">DATE</div>
            <div className="col-span-2 text-center">ARTICLES</div>
            <div className="col-span-3">STATUT</div>
            <div className="col-span-2 text-right">TOTAL HT</div>
          </div>

          <ul>
            {orders.map((o) => {
              const meta = STATUS_META[o.status as StatusKey];
              const Icon = meta.icon;
              return (
                <li
                  key={o.id}
                  className="border-t"
                  style={{ borderColor: COLORS.border }}
                >
                  <Link
                    href={`/pro/proforma/${o.id}`}
                    className="grid grid-cols-12 items-center gap-3 px-4 py-4 text-[13.5px] transition hover:bg-[#FAF8F2]"
                  >
                    <div className="col-span-3 flex items-center gap-2">
                      <div
                        className="grid h-8 w-8 place-items-center rounded-sm"
                        style={{ background: COLORS.beige, color: COLORS.primary }}
                      >
                        <FileText className="h-4 w-4" strokeWidth={1.8} />
                      </div>
                      <span className="font-extrabold" style={{ color: COLORS.text }}>
                        {o.orderNumber}
                      </span>
                    </div>
                    <div className="col-span-2" style={{ color: COLORS.muted }}>
                      {DATE_FMT.format(new Date(o.createdAt))}
                    </div>
                    <div className="col-span-2 text-center" style={{ color: COLORS.text }}>
                      {o._count.items}
                    </div>
                    <div className="col-span-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <Icon className="h-3 w-3" strokeWidth={2.2} />
                        {meta.label}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span
                        className="text-[15px] font-extrabold"
                        style={{ color: COLORS.text }}
                      >
                        {formatPriceEUR(o.totalAmount)}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5" style={{ color: COLORS.muted }} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </main>
  );
}

function StatPill({
  label,
  value,
  accent,
  bg,
}: {
  label: string;
  value: number;
  accent: string;
  bg: string;
}) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-sm border px-3 py-2"
      style={{ borderColor: COLORS.border, background: "#FFFFFF" }}
    >
      <span
        className="grid h-7 w-7 place-items-center rounded-sm text-[12px] font-extrabold"
        style={{ background: bg, color: accent }}
      >
        {value}
      </span>
      <span
        className="text-[10.5px] font-bold tracking-[0.12em]"
        style={{ color: COLORS.muted }}
      >
        {label.toUpperCase()}
      </span>
    </div>
  );
}
