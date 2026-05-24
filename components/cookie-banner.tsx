"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { COLORS } from "@/lib/ui";

const STORAGE_KEY = "cookie-consent";

type Choice = "accepted" | "rejected";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (!existing) setVisible(true);
  }, []);

  function persist(choice: Choice) {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // ignore quota errors
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Bandeau de consentement aux cookies"
      className="fixed bottom-3 left-3 right-3 z-50 mx-auto max-w-2xl rounded-xl border bg-white p-4 shadow-2xl sm:bottom-4 sm:left-4 sm:right-4"
      style={{ borderColor: COLORS.border }}
    >
      <div className="flex items-start gap-3">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
          style={{ background: COLORS.beige, color: COLORS.primary }}
        >
          <Cookie className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <div className="flex-1 text-[12.5px] leading-relaxed" style={{ color: COLORS.text }}>
          Nous utilisons uniquement des cookies techniques (session, panier).
          Aucun traceur publicitaire ou statistique tiers. Consultez notre{" "}
          <Link
            href="/confidentialite"
            className="font-semibold underline-offset-2 hover:underline"
            style={{ color: COLORS.primary }}
          >
            politique de confidentialité
          </Link>
          .
        </div>
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => persist("rejected")}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
          style={{ color: COLORS.muted }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => persist("accepted")}
          className="rounded-md px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm"
          style={{ background: COLORS.primary }}
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  );
}
