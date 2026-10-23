"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { Language } from "@/lib/language";
import { translate } from "@/lib/translations";
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
  return { language, t: (text: string) => translate(text, language) };
}
