"use client";

import { Lock } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { useAuthModal } from "@/components/auth-modal";
import { formatPriceEUR } from "@/lib/catalog-pricing";
import { COLORS } from "@/lib/ui";

export function PriceTag({
  value,
  size = "card",
}: {
  value: number;
  size?: "card" | "hero";
}) {
  const { isConnected } = useSession();
  const { open } = useAuthModal();

  const cls =
    size === "hero" ? "text-[30px] font-extrabold" : "text-[14px] font-extrabold";
  const color = size === "hero" ? COLORS.primary : COLORS.text;

  if (isConnected) {
    return (
      <span className={cls} style={{ color }}>
        {formatPriceEUR(value)}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        open();
      }}
      className="group inline-flex items-center gap-1.5"
      aria-label="Connectez-vous pour voir le prix"
    >
      <span
        className={cls}
        style={{
          color,
          filter: "blur(6px)",
          userSelect: "none",
          letterSpacing: "0.04em",
        }}
        aria-hidden
      >
        {formatPriceEUR(value)}
      </span>
      <Lock
        className={size === "hero" ? "h-4 w-4" : "h-3.5 w-3.5"}
        strokeWidth={2}
        style={{ color: COLORS.muted }}
      />
    </button>
  );
}
