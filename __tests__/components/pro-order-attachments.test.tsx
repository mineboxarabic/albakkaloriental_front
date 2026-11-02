// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ProOrderAttachments } from "@/app/(pro)/pro/orders/[id]/pro-order-attachments";
import { LanguageProvider } from "@/components/language-provider";
import type { ProOrderAttachment } from "@/lib/order-attachments";

const photo = (id: string, name: string): ProOrderAttachment => ({
  id,
  fileName: name,
  contentType: "image/jpeg",
  size: 300_000,
  url: `https://cdn.test/${name}`,
  createdAt: "2026-11-02T08:00:00.000Z",
});
const bon: ProOrderAttachment = {
  id: "d1",
  fileName: "bon-livraison.pdf",
  contentType: "application/pdf",
  size: 1_240_000,
  url: "https://cdn.test/bon-livraison.pdf",
  createdAt: "2026-11-02T09:00:00.000Z",
};
const files = [photo("p1", "palette.jpg"), photo("p2", "quai.jpg"), bon];

function renderSection(props: Partial<Parameters<typeof ProOrderAttachments>[0]> = {}, language: "fr" | "ar" = "fr") {
  return render(
    <LanguageProvider language={language}>
      <ProOrderAttachments attachments={files} contactUrl="https://wa.me/33600000000" {...props} />
    </LanguageProvider>,
  );
}

describe("ProOrderAttachments", () => {
  it("renders nothing when the order has no shared files", () => {
    const { container } = renderSection({ attachments: [] });
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the photos and a downloadable list of documents", () => {
    renderSection();

    expect(screen.getByRole("heading", { name: /Photos et documents/ })).toBeVisible();
    expect(screen.getAllByRole("button", { name: /Agrandir la photo/ })).toHaveLength(2);
    const download = screen.getByRole("link", { name: /bon-livraison\.pdf/ });
    expect(download).toHaveAttribute("href", "https://cdn.test/bon-livraison.pdf");
  });

  it("opens a full-screen viewer and moves between photos", () => {
    renderSection();

    fireEvent.click(screen.getByRole("button", { name: "Agrandir la photo palette.jpg" }));
    const viewer = screen.getByRole("dialog");
    expect(within(viewer).getByText("Photo 1 sur 2")).toBeVisible();

    fireEvent.keyDown(viewer, { key: "ArrowRight" });
    expect(within(viewer).getByText("Photo 2 sur 2")).toBeVisible();

    fireEvent.keyDown(viewer, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("offers a way to contact the team about the files", () => {
    renderSection();
    expect(screen.getByRole("link", { name: /Écrivez-nous/ })).toHaveAttribute("href", "https://wa.me/33600000000");
  });

  it("hides the contact line when no contact channel is configured", () => {
    renderSection({ contactUrl: null });
    expect(screen.queryByRole("link", { name: /Écrivez-nous/ })).not.toBeInTheDocument();
  });

  it("is translated in Arabic", () => {
    renderSection({}, "ar");
    expect(screen.getByRole("heading", { name: /الصور والمستندات/ })).toBeVisible();
  });
});
