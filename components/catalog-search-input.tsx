"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { COLORS } from "@/lib/ui";

const DEBOUNCE_MS = 250;

export function CatalogSearchInput({
  placeholder = "Rechercher un produit, un SKU...",
  className = "",
  variant = "light",
}: {
  placeholder?: string;
  className?: string;
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const current = searchParams.get("q") ?? "";
      if (value === current) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [value, pathname, router, searchParams]);

  const isDark = variant === "dark";

  return (
    <div className={`relative ${className}`}>
      <Search
        className="absolute left-3 top-2.5 h-4 w-4"
        style={{ color: isDark ? "rgba(255,255,255,0.55)" : COLORS.muted }}
        strokeWidth={2}
      />
      <input
        type="search"
        role="searchbox"
        aria-label="Rechercher dans le catalogue"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-full rounded-md border pl-9 pr-9 text-[13px] outline-none transition focus:border-[#3F561F]"
        style={{
          background: isDark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
          borderColor: isDark ? "rgba(255,255,255,0.2)" : COLORS.border,
          color: isDark ? "#FFFFFF" : COLORS.text,
        }}
      />
      {value && (
        <button
          type="button"
          aria-label="Effacer la recherche"
          onClick={() => setValue("")}
          className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full"
          style={{ color: isDark ? "rgba(255,255,255,0.6)" : COLORS.muted }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
