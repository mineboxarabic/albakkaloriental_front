import { intlLocale, type Language } from "@/lib/language";

/** Shape returned by AlimExpressApp's GET /api/v1/b2b/orders/[orderId] (client-visible files only). */
export type ProOrderAttachment = {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  url: string;
  createdAt: string;
};

export type DocumentFamily = "pdf" | "word" | "excel" | "other";

const FAMILIES: Record<string, DocumentFamily> = {
  "application/pdf": "pdf",
  "application/msword": "word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "word",
  "application/vnd.ms-excel": "excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "excel",
};

export function isPhotoAttachment(contentType: string): boolean {
  return contentType.startsWith("image/");
}

export function documentFamily(contentType: string): DocumentFamily {
  return FAMILIES[contentType] ?? "other";
}

export function splitOrderAttachments(attachments: ProOrderAttachment[] | undefined) {
  const list = attachments ?? [];
  return {
    photos: list.filter((a) => isPhotoAttachment(a.contentType)),
    documents: list.filter((a) => !isPhotoAttachment(a.contentType)),
  };
}

const UNITS: Record<Language, [string, string, string]> = {
  fr: ["o", "Ko", "Mo"],
  ar: ["بايت", "ك.ب", "م.ب"],
};

export function formatFileSize(bytes: number, language: Language): string {
  const [b, kb, mb] = UNITS[language];
  const number = new Intl.NumberFormat(intlLocale(language), { maximumFractionDigits: 1 });
  if (bytes < 1024) return `${bytes} ${b}`;
  if (bytes < 1024 * 1024) return `${number.format(bytes / 1024)} ${kb}`;
  return `${number.format(bytes / (1024 * 1024))} ${mb}`;
}
