"use client";
import { useLanguage } from "@/components/language-provider";
export function TranslatedText({ value }: { value: string }) {
  return useLanguage().t(value);
}
