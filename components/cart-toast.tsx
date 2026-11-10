"use client";

import { useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { COLORS } from "@/lib/ui";

const VISIBLE_MS = 5000;

/**
 * Cart changes show up instantly and are saved in the background, so when the
 * server refuses one this is the only place the person learns why the line
 * changed back.
 */
export function CartToast({
  notice,
  onDismiss,
}: {
  notice: { id: number; message: string } | null;
  onDismiss: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(onDismiss, VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [notice, onDismiss]);

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex justify-center px-4"
    >
      {notice && (
        <div
          key={notice.id}
          role="alert"
          className="pointer-events-auto flex w-full max-w-[420px] items-start gap-2.5 rounded-sm border-s-4 px-3.5 py-3 text-[13px] font-medium shadow-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2"
          style={{ background: "#FCE9E5", borderColor: COLORS.red, color: "#7A1709" }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.2} />
          <p className="flex-1 leading-snug">{t(notice.message)}</p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t("Fermer")}
            className="-me-1 -mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm transition hover:bg-black/5"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        </div>
      )}
    </div>
  );
}
