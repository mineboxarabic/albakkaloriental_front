import { describe, expect, it } from "vitest";
import {
  documentFamily,
  formatFileSize,
  splitOrderAttachments,
  type ProOrderAttachment,
} from "@/lib/order-attachments";

function file(id: string, contentType: string): ProOrderAttachment {
  return {
    id,
    fileName: `${id}.x`,
    contentType,
    size: 10,
    url: `https://cdn/${id}`,
    createdAt: "2026-11-02T10:00:00.000Z",
  };
}

describe("splitOrderAttachments", () => {
  it("separates photos from documents and keeps their order", () => {
    const result = splitOrderAttachments([
      file("a", "image/jpeg"),
      file("b", "application/pdf"),
      file("c", "image/webp"),
    ]);

    expect(result.photos.map((f) => f.id)).toEqual(["a", "c"]);
    expect(result.documents.map((f) => f.id)).toEqual(["b"]);
  });

  it("treats a missing list as empty (older backend without attachments)", () => {
    expect(splitOrderAttachments(undefined)).toEqual({ photos: [], documents: [] });
  });
});

describe("documentFamily", () => {
  it("recognises PDF, Word and Excel files", () => {
    expect(documentFamily("application/pdf")).toBe("pdf");
    expect(documentFamily("application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe("word");
    expect(documentFamily("application/vnd.ms-excel")).toBe("excel");
    expect(documentFamily("text/plain")).toBe("other");
  });
});

describe("formatFileSize", () => {
  it("formats sizes in French", () => {
    expect(formatFileSize(900, "fr")).toBe("900 o");
    expect(formatFileSize(1536, "fr")).toBe("1,5 Ko");
    expect(formatFileSize(1.25 * 1024 * 1024, "fr")).toBe("1,3 Mo");
  });

  it("formats sizes in Arabic with Latin digits", () => {
    expect(formatFileSize(2 * 1024 * 1024, "ar")).toBe("2 م.ب");
  });
});
