import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Package2, ListFilter } from "lucide-react";
import { getRetailOrders } from "@/actions/retail-me";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "En attente", color: "#7A5409", bg: "#FFF1D6" },
  CONFIRMED: { label: "Confirmée", color: "#3F561F", bg: "#E5F0D9" },
  PREPARED: { label: "Préparée", color: "#2E3F17", bg: "#DDE7CB" },
  DELIVERED: { label: "Livrée", color: "#2E3F17", bg: "#DDE7CB" },
  CANCELLED: { label: "Annulée", color: "#D52B14", bg: "#FCE9E5" },
};

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const STATUS_FILTERS = ["all", "PENDING", "CONFIRMED", "PREPARED", "DELIVERED", "CANCELLED"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const PERIOD_FILTERS = ["all", "30d", "90d", "year"] as const;
type PeriodFilter = (typeof PERIOD_FILTERS)[number];

const PERIOD_LABEL: Record<PeriodFilter, string> = {
  all: "Toutes",
  "30d": "30 derniers jours",
  "90d": "90 derniers jours",
  year: "12 derniers mois",
};

function periodCutoff(filter: PeriodFilter): Date | null {
  const now = Date.now();
  if (filter === "30d") return new Date(now - 30 * 86400000);
  if (filter === "90d") return new Date(now - 90 * 86400000);
  if (filter === "year") return new Date(now - 365 * 86400000);
  return null;
}

export default async function RetailOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; period?: string }>;
}) {
  const sp = await searchParams;
  const status: StatusFilter = STATUS_FILTERS.includes(sp.status as StatusFilter)
    ? (sp.status as StatusFilter)
    : "all";
  const period: PeriodFilter = PERIOD_FILTERS.includes(sp.period as PeriodFilter)
    ? (sp.period as PeriodFilter)
    : "all";

  const result = await getRetailOrders();
  if (!result.ok) redirect("/login?next=/orders");

  const cutoff = periodCutoff(period);
  const filtered = result.orders
    .filter((o) => status === "all" || o.status === status)
    .filter((o) => !cutoff || new Date(o.createdAt) >= cutoff)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
        <Link href="/" className="hover:underline">Accueil</Link>{" "}
        <span className="mx-1">›</span>
        <Link href="/account" className="hover:underline">Mon compte</Link>{" "}
        <span className="mx-1">›</span>
        <span style={{ color: COLORS.text }}>Mes commandes</span>
      </nav>

      <h1
        className="mt-3 text-[28px] font-extrabold tracking-tight"
        style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
      >
        Mes commandes
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
        Historique complet de vos commandes ({result.orders.length}).
      </p>

      <section
        className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border bg-white px-5 py-4"
        style={{ borderColor: COLORS.border }}
      >
        <div className="flex items-center gap-2 text-[11.5px] font-bold tracking-[0.1em]" style={{ color: COLORS.muted }}>
          <ListFilter className="h-3.5 w-3.5" />
          FILTRES
        </div>
        <FilterGroup label="Statut" current={status} param="status">
          {STATUS_FILTERS.map((s) => (
            <FilterChip
              key={s}
              active={status === s}
              href={`/orders?${new URLSearchParams({ status: s, period }).toString()}`}
            >
              {s === "all" ? "Tous" : STATUS_LABELS[s]?.label ?? s}
            </FilterChip>
          ))}
        </FilterGroup>
        <FilterGroup label="Période" current={period} param="period">
          {PERIOD_FILTERS.map((p) => (
            <FilterChip
              key={p}
              active={period === p}
              href={`/orders?${new URLSearchParams({ status, period: p }).toString()}`}
            >
              {PERIOD_LABEL[p]}
            </FilterChip>
          ))}
        </FilterGroup>
      </section>

      {filtered.length === 0 ? (
        <div
          className="mt-6 rounded-xl border bg-white px-6 py-12 text-center"
          style={{ borderColor: COLORS.border }}
        >
          <Package2
            className="mx-auto h-10 w-10"
            style={{ color: COLORS.muted }}
            strokeWidth={1.5}
          />
          <h2
            className="mt-3 text-[16px] font-bold"
            style={{ color: COLORS.text }}
          >
            Aucune commande
          </h2>
          <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
            {result.orders.length === 0
              ? "Vous n'avez encore passé aucune commande."
              : "Aucune commande ne correspond à ces filtres."}
          </p>
          {result.orders.length === 0 && (
            <Link
              href="/products"
              className="mt-4 inline-flex rounded-md px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm"
              style={{ background: COLORS.primary }}
            >
              Voir les produits
            </Link>
          )}
        </div>
      ) : (
        <ul
          className="mt-6 overflow-hidden rounded-xl border bg-white divide-y"
          style={{ borderColor: COLORS.border }}
        >
          {filtered.map((o) => {
            const meta = STATUS_LABELS[o.status] ?? {
              label: o.status,
              color: COLORS.text,
              bg: COLORS.beige,
            };
            return (
              <li key={o.id} style={{ borderColor: COLORS.border }}>
                <Link
                  href={`/orders/${o.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#FAF8F2]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[14px] font-extrabold" style={{ color: COLORS.text }}>
                        {o.orderNumber}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10.5px] font-bold tracking-[0.05em]"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-1 text-[12px]" style={{ color: COLORS.muted }}>
                      {DATE_FMT.format(new Date(o.createdAt))} ·{" "}
                      {o._count.items} {o._count.items > 1 ? "articles" : "article"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-extrabold" style={{ color: COLORS.primary }}>
                      {formatPriceEUR(o.totalAmount)}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0" style={{ color: COLORS.muted }} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

function FilterGroup({
  label,
  current,
  param,
  children,
}: {
  label: string;
  current: string;
  param: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[11.5px] font-semibold"
        style={{ color: COLORS.muted }}
      >
        {label}:
      </span>
      <div className="flex flex-wrap gap-1.5" data-active={current} data-param={param}>
        {children}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full border px-3 py-1 text-[11.5px] font-semibold"
      style={{
        background: active ? COLORS.primary : "#FFFFFF",
        color: active ? "#FFFFFF" : COLORS.text,
        borderColor: active ? COLORS.primary : COLORS.border,
      }}
    >
      {children}
    </Link>
  );
}
