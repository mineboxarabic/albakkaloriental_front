"use client";
import { useLanguage } from "@/components/language-provider";
import type { TranslationParams } from "@/lib/translations";
export function TranslatedText({
  value,
  params,
}: {
  value: string;
  params?: TranslationParams;
}) {
  return useLanguage().t(value, params);
}
