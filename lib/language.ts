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

/**
 * BCP-47 locale used for Intl date/number formatting. Arabic keeps Latin
 * digits (nu-latn) so prices, quantities, phone numbers and dates read the
 * same way as on invoices and delivery slips.
 */
export function intlLocale(language: Language): string {
  return language === "ar" ? "ar-u-nu-latn" : "fr-FR";
}

export function textDirection(language: Language): "rtl" | "ltr" {
  return language === "ar" ? "rtl" : "ltr";
}

export function formatDate(
  value: Date | string | number,
  language: Language,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(intlLocale(language), options).format(
    value instanceof Date ? value : new Date(value),
  );
}
