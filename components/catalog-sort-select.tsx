"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { COLORS } from "@/lib/ui";
import { SORT_OPTIONS, parseSortKey } from "@/lib/catalog-sort";

export function CatalogSortSelect({
  className = "",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const current = parseSortKey(searchParams.get("sort") ?? undefined);
  const isDark = variant === "dark";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "default") params.set("sort", value);
    else params.delete("sort");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className={`relative ${className}`}>
      <ArrowUpDown
        className="pointer-events-none absolute left-3 top-2.5 h-4 w-4"
        style={{ color: isDark ? "rgba(255,255,255,0.55)" : COLORS.muted }}
        strokeWidth={2}
      />
      <select
        aria-label="Trier les produits"
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full appearance-none rounded-md border pl-9 pr-8 text-[13px] outline-none transition focus:border-[#3F561F]"
        style={{
          background: isDark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
          borderColor: isDark ? "rgba(255,255,255,0.2)" : COLORS.border,
          color: isDark ? "#FFFFFF" : COLORS.text,
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} style={{ color: COLORS.text }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
