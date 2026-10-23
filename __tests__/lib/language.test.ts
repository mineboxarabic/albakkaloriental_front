import { describe, expect, it } from "vitest";
import { parseLanguage, localizedText } from "@/lib/language";
import { translate } from "@/lib/translations";
describe("language boundaries", () => {
  it("accepts Arabic and defaults invalid values to French", () => {
    expect(parseLanguage("ar")).toBe("ar");
    expect(parseLanguage("unsupported")).toBe("fr");
    expect(parseLanguage(undefined)).toBe("fr");
  });
  it("falls back to French for blank Arabic and keeps missing content empty", () => {
    expect(localizedText("Riz", "  ", "ar")).toBe("Riz");
    expect(localizedText(null, null, "ar")).toBe("");
    expect(localizedText("Riz", "أرز", "fr")).toBe("Riz");
  });
  it("translates browsing controls while retaining unknown source content", () => {
    expect(translate("Tous les produits", "ar")).toBe("جميع المنتجات");
    expect(translate("My Brand", "ar")).toBe("My Brand");
  });
});
