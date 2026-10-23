import { describe, expect, it } from "vitest";
import { hasRemoteMatch } from "next/dist/shared/lib/match-remote-pattern";
import config from "@/next.config";
describe("catalog image sources", () => {
  it.each([
    "https://anahit.fr/data/img_products/rice.jpg",
    "https://amilapps.com/azimages/Items/primary/2442/2442.jpg",
    "https://alimexpress-buckeyt.s3.eu-north-1.amazonaws.com/products/rice.webp",
  ])("allows the actual catalog source %s", (url) => {
    expect(
      hasRemoteMatch([], config.images?.remotePatterns ?? [], new URL(url)),
    ).toBe(true);
  });
});
