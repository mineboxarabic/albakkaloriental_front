"use client";

import { useState } from "react";
import { Truck, CheckCircle, Search, MessageSquare } from "lucide-react";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import type { UpcomingDelivery } from "@/lib/catalog";

const DELIVERY_DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

interface DeliveryCheckerProps {
  deliveries: UpcomingDelivery[];
  serverDate: string;
}

export function DeliveryChecker({ deliveries, serverDate }: DeliveryCheckerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const today = new Date(serverDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
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
      className="mt-5 rounded-xl border bg-white p-6 shadow-sm"
      style={{ borderColor: COLORS.border }}
    >
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b pb-4 mb-5" style={{ borderColor: COLORS.border }}>
        <div>
          <h2 className="text-[17px] font-extrabold tracking-tight" style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}>
            🚚 Planning de livraison hebdomadaire
          </h2>
          <p className="text-[11.5px]" style={{ color: COLORS.muted }}>
            Indiquez votre ville pour connaître votre jour de livraison et commander à temps.
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 px-2.5 py-1 rounded-full text-emerald-800 self-start md:self-auto mt-2 md:mt-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Livraisons ouvertes
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
            {weekDays.map((day, idx) => {
              const isToday = idx === 0;
              const delivery = deliveries.find((d) => isSameDay(new Date(d.scheduledDate), day));
              const isMatchedDay = matchedDelivery && isSameDay(new Date(matchedDelivery.scheduledDate), day);

              return (
                <div
                  key={day.toISOString()}
                  className="relative flex flex-col justify-between rounded-lg border p-3 min-h-[115px] transition-all"
                  style={{
                    borderColor: isMatchedDay ? COLORS.primary : isToday ? COLORS.yellow : COLORS.border,
                    background: isMatchedDay ? "#F4F7F0" : isToday ? "#FFFBEA" : "#FFFFFF",
                    borderWidth: isMatchedDay || isToday ? "2px" : "1px",
                  }}
                >
                  {isToday && (
                    <span className="absolute -top-2 left-3 rounded bg-amber-500 px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase text-white tracking-wider">
                      Aujourd&apos;hui
                    </span>
                  )}
                  {isMatchedDay && (
                    <span
                      className="absolute -top-2 left-2 rounded px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase text-white tracking-wider"
                      style={{ background: COLORS.primary }}
                    >
                      Chez vous !
                    </span>
                  )}

                  <div className="leading-tight">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">
                      {day.toLocaleDateString("fr-FR", { weekday: "short" })}
                    </div>
                    <div className="text-[14px] font-extrabold text-gray-800">
                      {day.getDate()} {day.toLocaleDateString("fr-FR", { month: "short" })}
                    </div>
                  </div>

                  {delivery ? (
                    <div className="mt-2 text-left">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800">
                        <Truck className="h-3 w-3 shrink-0" />
                        <span>Tournée</span>
                      </div>
                      <div className="mt-0.5 text-[9.5px] font-semibold text-gray-700 truncate max-w-full">
                        {delivery.cities.map((c) => c.name).join(", ")}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-[9.5px] font-medium text-gray-400 italic">
                      Aucune tournée
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-between rounded-xl border p-4 bg-amber-50/20" style={{ borderColor: COLORS.border }}>
          <div>
            <label htmlFor="city-search" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
              📍 Où souhaitez-vous être livré ?
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                id="city-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Saisissez votre ville..."
                className="w-full rounded-md border bg-white py-2 pl-9 pr-4 text-[12.5px] outline-none placeholder:text-gray-400 focus:border-gray-400"
                style={{ borderColor: COLORS.border, color: COLORS.text }}
              />
            </div>

            {searchQuery && (
              <div className="mt-3.5">
                {matchedDelivery && matchedCity ? (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-[12px] text-emerald-950">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Livraison disponible !</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed">
                      Notre camion passe à <strong>{matchedCity.name}</strong> le{" "}
                      <strong>{DELIVERY_DATE_FMT.format(new Date(matchedDelivery.scheduledDate))}</strong>.
                    </p>
                    <div className="mt-2 border-t border-emerald-100 pt-1.5 text-[10px] text-emerald-800">
                      Limite de commande : veille à 21h00.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 text-[12px] text-rose-950">
                    <div className="font-bold flex items-center gap-1">❌ Ville non planifiée</div>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-rose-800">
                      Nous ne passons pas encore à <strong>{searchQuery}</strong> cette semaine.
                    </p>
                    <a
                      href={`https://wa.me/33766301339?text=Bonjour,%20j'aimerais%20proposer%20une%20tournée%20de%20livraison%20à%20${encodeURIComponent(searchQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Demander un arrêt par WhatsApp
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!searchQuery && (
            <div className="mt-4 text-[10.5px] leading-relaxed text-gray-500 italic">
              Entrez le nom de votre ville pour voir si notre camion passe près de chez vous cette semaine !
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
