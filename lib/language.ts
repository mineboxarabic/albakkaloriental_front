export type Language = "fr" | "ar";
export const LANGUAGE_COOKIE = "catalog_language";
export function parseLanguage(value: unknown): Language {
  return value === "ar" ? "ar" : "fr";
}
export function localizedText(
  french: string | null | undefined,
  arabic: string | null | undefined,
  language: Language,
): string {
  return (
    (language === "ar" ? arabic?.trim() || french?.trim() : french?.trim()) ||
    ""
  );
}
