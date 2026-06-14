import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, ChevronRight, CheckCircle2, Clock, XCircle, Lock, ListFilter, Download } from "lucide-react";
import { listQuotes } from "@/actions/pro-quote";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";

export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

type QuoteState = "pending" | "signed" | "expired" | "locked";

function quoteState(q: {
  acceptedAt: string | null;
  validUntil: string;
  order: { lockedAt: string | null };
}): QuoteState {
  if (q.acceptedAt) return "signed";
  if (q.order.lockedAt) return "locked";
  if (new Date(q.validUntil).getTime() <= Date.now()) return "expired";
  return "pending";
}

const STATE_META: Record<QuoteState, { label: string; bg: string; color: string; icon: typeof FileText }> = {
  pending: { label: "À signer", bg: "#FFF1D6", color: "#7A5409", icon: Clock },
  signed: { label: "Signé", bg: "#E5F0D9", color: "#2E3F17", icon: CheckCircle2 },
  expired: { label: "Expiré", bg: "#FCE9E5", color: "#7A1709", icon: XCircle },
  locked: { label: "Verrouillé", bg: "#F0E2D6", color: "#7A3F09", icon: Lock },
};

const FILTERS = ["all", "pending", "signed", "expired", "locked"] as const;
type Filter = (typeof FILTERS)[number];
const FILTER_LABEL: Record<Filter, string> = {
  all: "Tous",
  pending: "À signer",
  signed: "Signés",
  expired: "Expirés",
  locked: "Verrouillés",
};

export default async function ProQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const sp = await searchParams;
  const state: Filter = FILTERS.includes(sp.state as Filter)
    ? (sp.state as Filter)
    : "all";

  const result = await listQuotes();
  if (!result.ok) redirect("/pro/login?next=/pro/quotes");

  const filtered = result.quotes.filter((q) => state === "all" || quoteState(q) === state);

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <h1
        className="text-[24px] font-extrabold tracking-tight sm:text-[28px]"
        style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
      >
        Mes devis
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
        Historique de vos devis professionnels ({result.quotes.length}).
      </p>

      <section
        className="mt-6 flex flex-wrap items-center gap-2 rounded-sm border bg-white px-5 py-4"
        style={{ borderColor: COLORS.border }}
      >
        <div
          className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em]"
          style={{ color: COLORS.muted }}
        >
          <ListFilter className="h-3.5 w-3.5" />
          FILTRES
        </div>
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/pro/quotes" : `/pro/quotes?state=${f}`}
            className="rounded-sm border px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.06em]"
            style={{
              background: state === f ? COLORS.primary : "#FFFFFF",
              color: state === f ? "#FFFFFF" : COLORS.text,
              borderColor: state === f ? COLORS.primary : COLORS.border,
            }}
          >
            {FILTER_LABEL[f]}
          </Link>
        ))}
      </section>

      {filtered.length === 0 ? (
        <div
          className="mt-6 rounded-sm border bg-white px-6 py-12 text-center"
          style={{ borderColor: COLORS.border }}
        >
          <FileText className="mx-auto h-10 w-10" style={{ color: COLORS.muted }} strokeWidth={1.5} />
          <h2 className="mt-3 text-[16px] font-bold" style={{ color: COLORS.text }}>
            Aucun devis
          </h2>
          <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
            {result.quotes.length === 0
              ? "Vous n'avez pas encore reçu de devis. Générez-en un depuis votre panier."
              : "Aucun devis ne correspond à ce filtre."}
          </p>
        </div>
      ) : (
        <ul
          className="mt-6 overflow-hidden rounded-sm border bg-white divide-y"
          style={{ borderColor: COLORS.border }}
        >
          {filtered.map((q) => {
            const s = quoteState(q);
            const meta = STATE_META[s];
            const Icon = meta.icon;
            return (
              <li
                key={q.id}
                className="px-5 py-4 hover:bg-[#FAF8F2]"
                style={{ borderColor: COLORS.border }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                  <Link
                    href={`/pro/quotes/${q.id}`}
                    className="flex min-w-0 flex-1 items-start justify-between gap-4 sm:items-center"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[14px] font-extrabold" style={{ color: COLORS.text }}>
                          {q.quoteNumber}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10.5px] font-bold tracking-[0.06em]"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          <Icon className="h-3 w-3" />
                          {meta.label.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-1 text-[12px]" style={{ color: COLORS.muted }}>
                        Commande {q.order.orderNumber} ·{" "}
                        {DATE_FMT.format(new Date(q.createdAt))}
                        {s === "pending" && (
                          <>
                            {" · "}Valable jusqu&apos;au {DATE_FMT.format(new Date(q.validUntil))}
                          </>
                        )}
                        {s === "signed" && q.acceptedAt && (
                          <>
                            {" · "}Signé le {DATE_FMT.format(new Date(q.acceptedAt))}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[15px] font-extrabold" style={{ color: COLORS.primary }}>
                        {formatPrice(q.total)}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <a
                      href={`/pro/quotes/${q.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm border px-3 py-2 text-[11.5px] font-bold uppercase tracking-[0.06em] sm:flex-none sm:py-1.5"
                      style={{ borderColor: COLORS.border, color: COLORS.text, background: "#FFFFFF" }}
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </a>
                    <ChevronRight className="hidden h-4 w-4 shrink-0 sm:block" style={{ color: COLORS.muted }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
