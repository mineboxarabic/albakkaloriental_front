import type { ReactNode } from "react";
import Link from "next/link";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";
import { getTranslator } from "@/lib/server-language";

export async function InfoPage({
  title,
  eyebrow = "Épicerie orientale",
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  const { t } = await getTranslator();
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
      <header className="mb-6">
        <nav className="text-[11.5px]" style={{ color: COLORS.muted }}>
          <Link href="/" className="hover:underline">
            {t("Accueil")}
          </Link>{" "}
          <span className="mx-1">›</span>
          <span style={{ color: COLORS.text }}>{t(title)}</span>
        </nav>
        {eyebrow && (
          <div
            className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: COLORS.muted }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.primary }} />
            {t(eyebrow)}
          </div>
        )}
        <h1
          className="mt-2 text-[28px] font-extrabold tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          {t(title)}
        </h1>
      </header>
      <div
        className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-[0_18px_44px_-30px_rgba(23,23,23,0.28)] sm:p-8"
        style={{ borderColor: COLORS.border }}
      >
        {children}
      </div>
    </main>
  );
}

/** Mail link that keeps its left-to-right reading order inside Arabic text. */
export function MailLink({ email }: { email: string }) {
  if (!email) return null;
  return (
    <a href={`mailto:${email}`} className="ltr-isolate font-semibold underline">
      {email}
    </a>
  );
}

/** Shown under legal pages in Arabic: the French text is the binding one. */
export async function LegalTranslationNote() {
  const { language } = await getTranslator();
  if (language !== "ar") return null;
  return (
    <p
      className="mt-5 border-t pt-4 text-[12px] leading-relaxed"
      style={{ color: COLORS.muted, borderColor: COLORS.border }}
    >
      هذه ترجمة عربية لتسهيل القراءة، والنسخة الفرنسية هي المرجع القانوني المعتمد.
    </p>
  );
}
