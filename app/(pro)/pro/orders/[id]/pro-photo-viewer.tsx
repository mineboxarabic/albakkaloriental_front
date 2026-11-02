"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import type { ProOrderAttachment } from "@/lib/order-attachments";
import type { usePhotoViewer } from "./use-photo-viewer";

type ProPhotoViewerProps = {
  photos: ProOrderAttachment[];
  viewer: ReturnType<typeof usePhotoViewer>;
};

const STAGE_BG = "#12140E";
const iconButton =
  "grid h-10 w-10 place-items-center rounded-full text-[#FAF8F2]/80 transition-colors hover:bg-white/10 hover:text-[#FAF8F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF8F2]";

export function ProPhotoViewer({ photos, viewer }: ProPhotoViewerProps) {
  const { t, isRtl } = useLanguage();
  const closeButton = useRef<HTMLButtonElement>(null);
  const isOpen = viewer.index !== null;

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  // Keep Tab inside the viewer while it covers the page.
  const trapFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return viewer.onKeyDown(event);
    const focusable = event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  if (viewer.index === null) return null;
  const index = viewer.index;
  const photo = photos[index];
  const BackIcon = isRtl ? ChevronRight : ChevronLeft;
  const ForwardIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.fileName}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: STAGE_BG, color: "#FAF8F2" }}
      onKeyDown={trapFocus}
    >
      <header className="flex items-center gap-2 px-3 py-2 sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">{photo.fileName}</p>
          <p className="text-[11.5px] text-[#FAF8F2]/60">
            {t("Photo {current} sur {total}", { current: index + 1, total: photos.length })}
          </p>
        </div>
        <a href={photo.url} target="_blank" rel="noopener noreferrer" download={photo.fileName} className={iconButton} aria-label={t("Télécharger la photo")}>
          <Download className="h-5 w-5" />
        </a>
        <button ref={closeButton} type="button" onClick={viewer.close} className={iconButton} aria-label={t("Fermer")}>
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16" {...viewer.swipeHandlers}>
        {/* eslint-disable-next-line @next/next/no-img-element -- S3 photos of any size; next/image would need fixed dimensions */}
        <img key={photo.id} src={photo.url} alt={photo.fileName} className="max-h-full max-w-full select-none object-contain" />
        {photos.length > 1 && (
          <>
            <button type="button" onClick={viewer.previous} className={`${iconButton} absolute start-2 hidden h-12 w-12 bg-white/5 sm:grid`} aria-label={t("Photo précédente")}>
              <BackIcon className="h-6 w-6" />
            </button>
            <button type="button" onClick={viewer.next} className={`${iconButton} absolute end-2 hidden h-12 w-12 bg-white/5 sm:grid`} aria-label={t("Photo suivante")}>
              <ForwardIcon className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <ol className="flex justify-center gap-2 overflow-x-auto px-4 pb-4 pt-2" aria-label={t("Toutes les photos")}>
          {photos.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => viewer.open(i)}
                aria-current={i === index ? "true" : undefined}
                aria-label={t("Photo {current} sur {total}", { current: i + 1, total: photos.length })}
                className={`block h-14 w-14 overflow-hidden rounded-sm transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF8F2] ${
                  i === index ? "ring-2 ring-[#FAF8F2]" : "opacity-50 hover:opacity-90"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
