"use client";

import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { COLORS } from "@/lib/ui";

type Props = {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  decreaseLabel: string;
  increaseLabel: string;
  inputLabel: string;
  /** When set, the minus button becomes a remove button at the minimum. */
  removeLabel?: string;
  size?: "md" | "lg";
};

/**
 * − [qty] + with a typeable quantity: wholesale orders often run to dozens of
 * cartons, which nobody should have to tap in one by one. The typed value is
 * applied on Enter or when the field loses focus; Escape restores it.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  decreaseLabel,
  increaseLabel,
  inputLabel,
  removeLabel,
  size = "md",
}: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const box = size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const field = size === "lg" ? "h-11 w-14 text-[15px]" : "h-9 w-12 text-[13.5px]";
  const atMin = value <= min;
  const showRemove = Boolean(removeLabel) && atMin;

  const commit = () => {
    if (draft === null) return;
    const parsed = Number.parseInt(draft, 10);
    setDraft(null);
    if (!Number.isFinite(parsed)) return;
    const next = Math.min(max, Math.max(removeLabel ? 0 : min, parsed));
    if (next !== value) onChange(next);
  };

  return (
    <div
      className="inline-flex items-center overflow-hidden rounded-sm border bg-white"
      style={{ borderColor: COLORS.border }}
    >
      <button
        type="button"
        aria-label={showRemove ? removeLabel : decreaseLabel}
        onClick={() => onChange(value - 1)}
        disabled={atMin && !removeLabel}
        className={`grid ${box} place-items-center transition hover:bg-[#FAF8F2] active:bg-[#F0EBDD] disabled:cursor-not-allowed disabled:opacity-35`}
        style={{ color: showRemove ? COLORS.muted : COLORS.text }}
      >
        {showRemove ? (
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
        ) : (
          <Minus className="h-3.5 w-3.5" strokeWidth={2.2} />
        )}
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={inputLabel}
        value={draft ?? String(value)}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setDraft(e.currentTarget.value.replace(/\D/g, "").slice(0, 3))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setDraft(null);
            e.currentTarget.blur();
          }
        }}
        className={`${field} border-x bg-transparent text-center font-bold tabular-nums outline-none transition focus:bg-[#FAF8F2]`}
        style={{ borderColor: COLORS.border, color: COLORS.text }}
      />
      <button
        type="button"
        aria-label={increaseLabel}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={`grid ${box} place-items-center transition hover:bg-[#FAF8F2] active:bg-[#F0EBDD] disabled:cursor-not-allowed disabled:opacity-35`}
        style={{ color: COLORS.text }}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
      </button>
    </div>
  );
}
