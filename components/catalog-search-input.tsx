"use client";
import { useLanguage } from "@/components/language-provider";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { COLORS } from "@/lib/ui";
import { useCatalogNavigation } from "@/components/catalog-transition";

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
  const { t } = useLanguage();
  const { isPending, navigate } = useCatalogNavigation();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = searchParams.get("q") ?? "";
  const [value, setValue] = useState(current);
  // The query this input last sent. When its results land, the URL catches up
  // with what was typed then; keep any letters typed since instead of
  // snapping the field back to the older query.
  const sentRef = useRef<string | null>(null);

  useEffect(() => {
    if (sentRef.current !== null && current === sentRef.current) {
      sentRef.current = null;
      return;
    }
    setValue(current);
  }, [current]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = value.trim();
      if (next === current) return;
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (next) params.set("q", next);
      else params.delete("q");
      sentRef.current = next;
      navigate(`${pathname}?${params.toString()}`);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [value, current, pathname, navigate, searchParams]);

  const isDark = variant === "dark";
  // Typing and loading read as one step: the spinner starts on the first key.
  const searching = isPending || value.trim() !== current;
  const iconColor = isDark ? "rgba(255,255,255,0.55)" : COLORS.muted;

  return (
    <div className={`relative ${className}`}>
      {searching ? (
        <Loader2
          aria-hidden
          data-testid="catalog-search-spinner"
          className="absolute start-3 top-2.5 h-4 w-4 animate-spin motion-reduce:animate-none"
          style={{ color: isDark ? "#FFFFFF" : COLORS.primary }}
          strokeWidth={2.4}
        />
      ) : (
        <Search
          aria-hidden
          className="absolute start-3 top-2.5 h-4 w-4"
          style={{ color: iconColor }}
          strokeWidth={2}
        />
      )}
      <input
        type="search"
        role="searchbox"
        aria-label={t("Rechercher dans le catalogue")}
        aria-busy={searching || undefined}
        placeholder={t(placeholder)}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-full rounded-md border ps-9 pe-9 text-[13px] outline-none transition focus:border-[#3F561F] focus-visible:ring-2 focus-visible:ring-[#3F561F]/20 [&::-webkit-search-cancel-button]:appearance-none"
        style={{
          background: isDark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
          borderColor: isDark ? "rgba(255,255,255,0.2)" : COLORS.border,
          color: isDark ? "#FFFFFF" : COLORS.text,
        }}
      />
      {value && (
        <button
          type="button"
          aria-label={t("Effacer la recherche")}
          onClick={() => setValue("")}
          className="absolute end-2 top-2 grid h-5 w-5 place-items-center rounded-full"
          style={{ color: isDark ? "rgba(255,255,255,0.6)" : COLORS.muted }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
