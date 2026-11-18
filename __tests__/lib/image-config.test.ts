import { describe, expect, it } from "vitest";
import { hasRemoteMatch } from "next/dist/shared/lib/match-remote-pattern";
import config from "@/next.config";
describe("catalog image sources", () => {
  it.each([
    "https://anahit.fr/data/img_products/rice.jpg",
    "https://amilapps.com/azimages/Items/primary/2442/2442.jpg",
    "https://alimexpress-buckeyt.s3.eu-north-1.amazonaws.com/products/rice.webp",
    // Brand logos generated or fetched by Alim Express (were broken tiles on /pro/marques).
    "https://ui-avatars.com/api/?name=Alnasser&size=512&bold=true&format=png&background=c937a4&color=ffffff",
    "https://www.google.com/s2/favicons?domain=barbicanworld.com&sz=256",
  ])("allows the actual catalog source %s", (url) => {
    expect(
      hasRemoteMatch([], config.images?.remotePatterns ?? [], new URL(url)),
    ).toBe(true);
  });

  it("does not open the image optimizer to the whole of google.com", () => {
    expect(
      hasRemoteMatch([], config.images?.remotePatterns ?? [], new URL("https://www.google.com/images/anything.png")),
    ).toBe(false);
  });
});
