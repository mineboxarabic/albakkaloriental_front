"use client";

import { Download } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { formatDate } from "@/lib/language";
import {
  documentFamily,
  formatFileSize,
  splitOrderAttachments,
  type DocumentFamily,
  type ProOrderAttachment,
} from "@/lib/order-attachments";
import { COLORS } from "@/lib/ui";
import { ProPhotoViewer } from "./pro-photo-viewer";
import { usePhotoViewer } from "./use-photo-viewer";

type ProOrderAttachmentsProps = {
  attachments: ProOrderAttachment[] | undefined;
  /** WhatsApp or mailto link prefilled with the order number; null hides the line. */
  contactUrl: string | null;
};

const FAMILY_TILE: Record<DocumentFamily, { label: string; bg: string; color: string }> = {
  pdf: { label: "PDF", bg: "#FCE9E5", color: COLORS.red },
  excel: { label: "XLS", bg: "#E5F0D9", color: COLORS.primary },
  word: { label: "DOC", bg: COLORS.beige, color: COLORS.text },
  other: { label: "FICH", bg: COLORS.beige, color: COLORS.muted },
};

export function ProOrderAttachments({ attachments, contactUrl }: ProOrderAttachmentsProps) {
  const { t, language, isRtl } = useLanguage();
  const { photos, documents } = splitOrderAttachments(attachments);
  const viewer = usePhotoViewer(photos.length, isRtl);
  const total = photos.length + documents.length;

  if (total === 0) return null;

  return (
    <section
      aria-labelledby="order-attachments-title"
      className="mt-6 overflow-hidden rounded-sm border bg-white"
      style={{ borderColor: COLORS.border }}
    >
      <div className="border-b px-5 py-4" style={{ borderColor: COLORS.border, background: COLORS.bg }}>
        <h2
          id="order-attachments-title"
          className="text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: COLORS.text }}
        >
          {t("Photos et documents")} <span style={{ color: COLORS.muted }}>({total})</span>
        </h2>
        <p className="mt-1 text-[12.5px]" style={{ color: COLORS.muted }}>
          {t("Partagés par notre équipe pour cette commande.")}
        </p>
      </div>

      <div className="space-y-5 p-5">
        {photos.length > 0 && (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6" aria-label={t("Photos")}>
            {photos.map((photo, index) => (
              <li key={photo.id}>
                <button
                  type="button"
                  onClick={() => viewer.open(index)}
                  aria-label={t("Agrandir la photo {name}", { name: photo.fileName })}
                  className="block aspect-square w-full overflow-hidden rounded-sm transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ background: COLORS.beige, ["--tw-ring-color" as string]: COLORS.primary }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- S3 photos of unknown size */}
                  <img src={photo.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {documents.length > 0 && (
          <ul className="divide-y rounded-sm border" style={{ borderColor: COLORS.border }} aria-label={t("Documents")}>
            {documents.map((doc) => {
              const tile = FAMILY_TILE[documentFamily(doc.contentType)];
              return (
                <li key={doc.id} style={{ borderColor: COLORS.border }}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={doc.fileName}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#FAF8F2] focus-visible:bg-[#FAF8F2] focus-visible:outline-none"
                  >
                    <span
                      aria-hidden
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-sm text-[10px] font-bold tracking-wide"
                      style={{ background: tile.bg, color: tile.color }}
                    >
                      {tile.label}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[13px] font-semibold" style={{ color: COLORS.text }}>
                        <span className="ltr-isolate">{doc.fileName}</span>
                      </span>
                      {/* Separate <bdi> parts: size and date each keep their own direction in RTL. */}
                      <span className="flex flex-wrap gap-x-2 text-[11.5px]" style={{ color: COLORS.muted }}>
                        <bdi>{formatFileSize(doc.size, language)}</bdi>
                        <bdi>
                          {formatDate(doc.createdAt, language, { day: "numeric", month: "short", year: "numeric" })}
                        </bdi>
                      </span>
                    </span>
                    <span
                      className="hidden items-center gap-1 text-[11.5px] font-bold uppercase tracking-[0.1em] sm:inline-flex"
                      style={{ color: COLORS.primary }}
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden />
                      {t("Télécharger")}
                    </span>
                    <Download className="h-4 w-4 shrink-0 sm:hidden" style={{ color: COLORS.primary }} aria-hidden />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {contactUrl && (
        <p className="border-t px-5 py-3 text-[12px]" style={{ borderColor: COLORS.border, color: COLORS.muted }}>
          {t("Une question sur ces fichiers ?")}{" "}
          <a
            href={contactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2"
            style={{ color: COLORS.primary }}
          >
            {t("Écrivez-nous")}
          </a>
        </p>
      )}

      <ProPhotoViewer photos={photos} viewer={viewer} />
    </section>
  );
}
