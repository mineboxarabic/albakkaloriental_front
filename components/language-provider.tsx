"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Language } from "@/lib/language";
import { translate, type TranslationParams } from "@/lib/translations";
const LanguageContext = createContext<Language>("fr");
export function LanguageProvider({
  language,
  children,
}: {
  language: Language;
  children: ReactNode;
}) {
  return (
    <LanguageContext.Provider value={language}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  const language = useContext(LanguageContext);
  const t = useCallback(
    (text: string, params?: TranslationParams) =>
      translate(text, language, params),
    [language],
  );
  return useMemo(
    () => ({ language, isRtl: language === "ar", t }),
    [language, t],
  );
}
