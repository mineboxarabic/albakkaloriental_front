import type { ReactNode } from "react";
import Link from "next/link";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";

export function InfoPage({
  title,
  eyebrow = "Épicerie orientale",
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <header className="mb-6">
        <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
          <Link href="/" className="hover:underline">
            Accueil
          </Link>{" "}
          <span className="mx-1">›</span>
          <span style={{ color: COLORS.text }}>{title}</span>
        </nav>
        {eyebrow && (
          <div
            className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: COLORS.muted }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.primary }} />
            {eyebrow}
          </div>
        )}
        <h1
          className="mt-2 text-[28px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          {title}
        </h1>
      </header>
      <div
        className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 shadow-[0_18px_44px_-30px_rgba(23,23,23,0.28)]"
        style={{ borderColor: COLORS.border }}
      >
        {children}
      </div>
    </main>
  );
}
