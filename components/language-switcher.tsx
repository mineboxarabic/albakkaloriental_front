"use client";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { setLanguage } from "@/actions/language";
export function LanguageSwitcher() {
  const { language } = useLanguage();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  return (
    <div className="shrink-0" dir="ltr">
      <button
        type="button"
        disabled={pending}
        aria-label={
          language === "fr" ? "Passer en arabe" : "التبديل إلى الفرنسية"
        }
        className="rounded-md border border-current/25 px-2.5 py-2 text-xs font-semibold disabled:opacity-50"
        onClick={() =>
          startTransition(async () => {
            setError(false);
            try {
              await setLanguage(language === "fr" ? "ar" : "fr");
              router.refresh();
            } catch {
              setError(true);
            }
          })
        }
      >
        {pending ? "…" : language === "fr" ? "العربية" : "Français"}
      </button>
      {error && (
        <span role="alert" className="block text-xs">
          {language === "fr" ? "Réessayez" : "حاول مجدداً"}
        </span>
      )}
    </div>
  );
}
