"use client";

import { useState } from "react";
import { Truck, CheckCircle, Search, MessageSquare, XCircle, MapPin, ChevronDown } from "lucide-react";
import type { UpcomingDelivery } from "@/lib/catalog";
import { useLanguage } from "@/components/language-provider";
import { formatDate } from "@/lib/language";
import { INTER_FONT, MONO_FONT } from "@/lib/ui";
import { buildWhatsappUrl } from "@/lib/whatsapp";

/**
 * "Quantum Systems" (Neuform Featured) design system applied to the weekly
 * delivery planner — same composition (accent rail, MODULE Q7 kicker, mono
 * technical labels, 8px geometry) recolored to the Le Bakkal brand palette:
 * light surfaces, olive-green accent (#3F561F), Inter + JetBrains Mono.
 */
const QS = {
  surface: "#FFFFFF",
  surfaceElevated: "#FAF8F2",
  surfacePanel: "#F0EBDD",
  surfaceInput: "#FFFFFF",
  accent: "#3F561F",
  accentText: "#FAF8F2",
  danger: "#D52B14",
  textPrimary: "#171717",
  textSecondary: "#6B665D",
  textMuted: "#9A968C",
  border: "#DDD8CC",
  borderStrong: "#CFC8B8",
} as const;

const DISPLAY = INTER_FONT;
const MONO = MONO_FONT;

interface DeliveryCheckerProps {
  deliveries: UpcomingDelivery[];
  serverDate: string;
  whatsappNumber: string | null;
}

export function DeliveryChecker({ deliveries, serverDate, whatsappNumber }: DeliveryCheckerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { t, language } = useLanguage();
  const whatsappUrl = buildWhatsappUrl(whatsappNumber, `Bonjour, j'aimerais proposer une tournée de livraison à ${searchQuery}`);

  const today = new Date(serverDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();

  const normalizedQuery = normalize(searchQuery);

  const matchedDelivery = searchQuery
    ? deliveries.find((d) => d.cities.some((c) => normalize(c.name).includes(normalizedQuery)))
    : null;

  const matchedCity = matchedDelivery?.cities.find((c) =>
    normalize(c.name).includes(normalizedQuery),
  );

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <div
      className="mt-5 overflow-hidden rounded-lg border shadow-[0_18px_44px_-26px_rgba(23,23,23,0.28)]"
      style={{ background: QS.surface, borderColor: QS.border, fontFamily: DISPLAY, color: QS.textPrimary }}
    >
      <div className="p-6">
        {/* Header — accordion toggle on mobile, static on desktop */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 border-b pb-5 text-start md:items-end lg:cursor-default"
          style={{ borderColor: QS.border }}
        >
          <div>
            <div
              className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase"
              style={{ fontFamily: MONO, color: QS.accent, letterSpacing: "0.18em" }}
            >
              <span style={{ color: QS.textMuted }}>{t("LOGISTIQUE")}</span>
            </div>
            <h2 className="text-[20px] font-medium leading-[1.04] tracking-tight sm:text-[24px]" style={{ color: QS.textPrimary }}>
              {t("Planning de livraison hebdomadaire")}
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: QS.textSecondary }}>
              {t("Indiquez votre ville pour connaître votre jour de livraison et commander à temps.")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="hidden items-center gap-2 self-start rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase md:flex md:self-auto"
              style={{ fontFamily: MONO, letterSpacing: "0.12em", borderColor: QS.borderStrong, color: QS.textPrimary, background: QS.surfaceElevated }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: QS.accent }} />
              {t("Livraisons ouvertes")}
            </span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform duration-200 lg:hidden ${open ? "rotate-180" : ""}`}
              style={{ color: QS.accent }}
            />
          </div>
        </button>

        <div className={`mt-6 grid-cols-1 gap-6 lg:grid-cols-12 lg:grid ${open ? "grid" : "hidden"}`}>
          {/* Week grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
              {weekDays.map((day, idx) => {
                const isToday = idx === 0;
                const delivery = deliveries.find((d) => isSameDay(new Date(d.scheduledDate), day));
                const isMatchedDay = matchedDelivery && isSameDay(new Date(matchedDelivery.scheduledDate), day);
                const highlighted = isMatchedDay || isToday;

                return (
                  <div
                    key={day.toISOString()}
                    className="relative flex min-h-[118px] flex-col justify-between rounded-lg border p-3 transition-all"
                    style={{
                      borderColor: isMatchedDay ? QS.accent : isToday ? "rgba(63,86,31,0.45)" : QS.border,
                      background: highlighted ? "rgba(63,86,31,0.06)" : QS.surfaceElevated,
                      borderWidth: highlighted ? "1.5px" : "1px",
                    }}
                  >
                    {isToday && !isMatchedDay && (
                      <span
                        className="absolute -top-2 start-2.5 rounded px-1.5 py-0.5 text-[8.5px] font-bold uppercase"
                        style={{ fontFamily: MONO, letterSpacing: "0.1em", background: QS.accent, color: QS.accentText }}
                      >
                        {t("Aujourd'hui")}
                      </span>
                    )}
                    {isMatchedDay && (
                      <span
                        className="absolute -top-2 start-2.5 rounded px-1.5 py-0.5 text-[8.5px] font-bold uppercase"
                        style={{ fontFamily: MONO, letterSpacing: "0.1em", background: QS.accent, color: QS.accentText }}
                      >
                        {t("Chez vous")}
                      </span>
                    )}

                    <div className="leading-tight">
                      <div className="text-[10px] font-semibold uppercase" style={{ fontFamily: MONO, letterSpacing: "0.12em", color: QS.textMuted }}>
                        {formatDate(day, language, { weekday: "short" })}
                      </div>
                      <div className="text-[15px] font-semibold" style={{ color: QS.textPrimary }}>
                        {formatDate(day, language, { day: "numeric", month: "short" })}
                      </div>
                    </div>

                    {delivery ? (
                      <div className="mt-2 text-start">
                        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase" style={{ fontFamily: MONO, letterSpacing: "0.08em", color: QS.accent }}>
                          <Truck className="h-3 w-3 shrink-0" />
                          <span>{t("Tournée")}</span>
                        </div>
                        <div dir="ltr" className="mt-1 truncate text-start text-[10px] font-medium rtl:text-end" style={{ color: QS.textSecondary }}>
                          {delivery.cities.map((c) => c.name).join(", ")}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-[9.5px] font-medium uppercase" style={{ fontFamily: MONO, letterSpacing: "0.08em", color: QS.textMuted }}>
                        {t("Aucune tournée")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search panel */}
          <div
            className="flex flex-col justify-between rounded-lg border p-4 lg:col-span-4"
            style={{ borderColor: QS.border, background: QS.surfacePanel }}
          >
            <div>
              <label
                htmlFor="city-search"
                className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase"
                style={{ fontFamily: MONO, letterSpacing: "0.12em", color: QS.textSecondary }}
              >
                <MapPin className="h-3.5 w-3.5" style={{ color: QS.accent }} />
                {t("Où souhaitez-vous être livré ?")}
              </label>
              <div className="relative">
                <Search className="absolute start-3 top-2.5 h-4 w-4" style={{ color: QS.textMuted }} />
                <input
                  id="city-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("Saisissez votre ville...")}
                  className="w-full rounded-lg border py-2.5 ps-9 pe-4 text-[12.5px] outline-none transition-colors placeholder:text-[#9A968C] focus:border-[#3F561F]"
                  style={{ background: QS.surfaceInput, borderColor: QS.borderStrong, color: QS.textPrimary }}
                />
              </div>

              {searchQuery && (
                <div className="mt-3.5">
                  {matchedDelivery && matchedCity ? (
                    <div
                      className="rounded-lg border p-3.5 text-[12px]"
                      style={{ borderColor: "rgba(63,86,31,0.45)", background: "rgba(63,86,31,0.07)", color: QS.textPrimary }}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase" style={{ fontFamily: MONO, letterSpacing: "0.1em", color: QS.accent }}>
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <span>{t("Livraison disponible")}</span>
                      </div>
                      <p className="mt-1.5 text-[11.5px] leading-relaxed" style={{ color: QS.textSecondary }}>
                        {t("Notre camion passe à")}{" "}
                        <strong style={{ color: QS.textPrimary }}>{matchedCity.name}</strong>{" "}
                        {t("le")}{" "}
                        <strong style={{ color: QS.textPrimary }}>
                          {formatDate(matchedDelivery.scheduledDate, language, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </strong>
                        .
                      </p>
                      <div
                        className="mt-2.5 border-t pt-2 text-[10px] font-semibold uppercase"
                        style={{ fontFamily: MONO, letterSpacing: "0.08em", borderColor: "rgba(63,86,31,0.22)", color: QS.textMuted }}
                      >
                        {t("Limite de commande : veille à 21h00")}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="rounded-lg border p-3.5 text-[12px]"
                      style={{ borderColor: "rgba(213,43,20,0.4)", background: "rgba(213,43,20,0.07)", color: QS.textPrimary }}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase" style={{ fontFamily: MONO, letterSpacing: "0.1em", color: QS.danger }}>
                        <XCircle className="h-4 w-4 shrink-0" />
                        <span>{t("Ville non planifiée")}</span>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: QS.textSecondary }}>
                        {t("Nous ne passons pas encore à")}{" "}
                        <strong style={{ color: QS.textPrimary }}>{searchQuery}</strong>{" "}
                        {t("cette semaine.")}
                      </p>
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase transition-opacity hover:opacity-90"
                          style={{ fontFamily: MONO, letterSpacing: "0.08em", background: QS.accent, color: QS.accentText }}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {t("Demander un arrêt")}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!searchQuery && (
              <div className="mt-4 text-[11px] leading-relaxed" style={{ color: QS.textMuted }}>
                {t("Entrez le nom de votre ville pour voir si notre camion passe près de chez vous cette semaine.")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
