import { describe, expect, it } from "vitest";

import { getLabelSearchScore, getTokenMatchScore, normalizeSearchText, tokenizeSearchQuery } from "@/lib/text-search";

describe("normalizeSearchText", () => {
  it("strips accents, casing and punctuation", () => {
    expect(normalizeSearchText("Café L'Orient")).toBe("cafe l orient");
    expect(normalizeSearchText("Coca-Cola")).toBe("coca cola");
    expect(normalizeSearchText("  Huile   d'Olive  ")).toBe("huile d olive");
  });

  it("keeps digits and separates them from units so 33cl and 33 cl compare equal", () => {
    expect(normalizeSearchText("Pack 33cl")).toBe("pack 33 cl");
    expect(normalizeSearchText("Pack 33 cl")).toBe("pack 33 cl");
  });

  it("expands French ligatures", () => {
    expect(normalizeSearchText("Œufs frais")).toBe("oeufs frais");
    expect(normalizeSearchText("Cœur de palmier")).toBe("coeur de palmier");
  });

  it("keeps Arabic letters instead of wiping them out", () => {
    expect(normalizeSearchText("زيت الزيتون")).toBe("زيت الزيتون");
  });

  it("removes Arabic diacritics (tashkeel) and tatweel", () => {
    expect(normalizeSearchText("زَيْتُ")).toBe("زيت");
    expect(normalizeSearchText("عـــسل")).toBe("عسل");
  });

  it("folds Arabic letter variants people type interchangeably", () => {
    expect(normalizeSearchText("أرز")).toBe("ارز");
    expect(normalizeSearchText("إناء")).toBe("اناء");
    expect(normalizeSearchText("آية")).toBe("ايه");
    expect(normalizeSearchText("حلوى")).toBe("حلوي");
    expect(normalizeSearchText("مؤسسة")).toBe("موسسه");
    expect(normalizeSearchText("شاطئ")).toBe("شاطي");
  });

  it("converts Arabic-Indic and Persian digits to Latin digits", () => {
    expect(normalizeSearchText("٤٠٠غ")).toBe("400 غ");
    expect(normalizeSearchText("۱۲")).toBe("12");
  });
});

describe("tokenizeSearchQuery", () => {
  it("drops French stop words and elided articles when real words remain", () => {
    expect(tokenizeSearchQuery("l'huile de olive")).toEqual(["huile", "olive"]);
    expect(tokenizeSearchQuery("pot de confiture")).toEqual(["pot", "confiture"]);
  });

  it("drops standalone Arabic conjunctions and prepositions", () => {
    expect(tokenizeSearchQuery("زيت و زيتون")).toEqual(["زيت", "زيتون"]);
  });

  it("keeps a stop word when it is the whole query", () => {
    expect(tokenizeSearchQuery("le")).toEqual(["le"]);
  });

  it("returns no tokens for a blank query", () => {
    expect(tokenizeSearchQuery("   ")).toEqual([]);
  });
});

describe("getTokenMatchScore", () => {
  it("ranks exact above prefix above word-prefix above substring", () => {
    const exact = getTokenMatchScore("nutella", "nutella")!;
    const prefix = getTokenMatchScore("nutella pate", "nutella")!;
    const wordPrefix = getTokenMatchScore("pate nutella", "nutel")!;
    const substring = getTokenMatchScore("pate nutella", "utell")!;

    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(wordPrefix);
    expect(wordPrefix).toBeGreaterThan(substring);
  });

  it("falls back to an ordered fuzzy match", () => {
    expect(getTokenMatchScore("nutella", "ntla")).not.toBeNull();
  });

  it("returns null when the letters are not present in order", () => {
    expect(getTokenMatchScore("nutella", "allentu")).toBeNull();
  });

  it("does not match letters scattered across different words", () => {
    expect(getTokenMatchScore("sucre en poudre", "sep")).toBeNull();
    expect(getTokenMatchScore("the vert", "tvt")).toBeNull();
  });

  it("tolerates one typo in a word, including swapped letters", () => {
    expect(getTokenMatchScore("nutella", "nutela")).not.toBeNull();
    expect(getTokenMatchScore("huile olive", "oliev")).not.toBeNull();
    expect(getTokenMatchScore("harissa", "harisa")).not.toBeNull();
  });

  it("tolerates a typo while the word is still being typed", () => {
    expect(getTokenMatchScore("confiture abricot", "confit")).not.toBeNull();
    expect(getTokenMatchScore("confiture abricot", "comfit")).not.toBeNull();
  });

  it("tolerates a typo in an Arabic word", () => {
    expect(getTokenMatchScore("زيتون", "زيتوت")).not.toBeNull();
  });

  it("ranks a typo below a clean word match", () => {
    const clean = getTokenMatchScore("nutella", "nutel")!;
    const typo = getTokenMatchScore("nutella", "nutela")!;

    expect(clean).toBeGreaterThan(typo);
  });

  it("does not apply typo tolerance to very short words", () => {
    expect(getTokenMatchScore("riz basmati", "ris")).toBeNull();
  });

  it("never treats a different number as a typo", () => {
    expect(getTokenMatchScore("coca 33 cl", "34")).toBeNull();
    expect(getTokenMatchScore("nutella 400 g", "500")).toBeNull();
  });

  it("matches an Arabic word with or without the article ال", () => {
    expect(getTokenMatchScore("الزيتون", "زيتون")).not.toBeNull();
    expect(getTokenMatchScore("زيتون", "الزيتون")).not.toBeNull();
    expect(getTokenMatchScore("بالعسل", "عسل")).not.toBeNull();
  });

  it("ranks an Arabic article-stripped match as a whole-word match, above a substring", () => {
    const article = getTokenMatchScore("زيت الزيتون", "زيتون")!;
    const substring = getTokenMatchScore("حلاوة بالفستق", "فست")!;

    expect(article).toBeGreaterThan(substring);
  });

  it("matches words typed without their separators", () => {
    expect(getTokenMatchScore("coca cola", "cocacola")).not.toBeNull();
  });
});

describe("getLabelSearchScore", () => {
  it("matches without the accents of the real label", () => {
    expect(getLabelSearchScore("Café Noir", "cafe")).not.toBeNull();
    expect(getLabelSearchScore("Crème Fraîche", "creme fraiche")).not.toBeNull();
  });

  it("matches a partial word instead of requiring the full name", () => {
    expect(getLabelSearchScore("Huile d'Olive Premium", "prem")).not.toBeNull();
    expect(getLabelSearchScore("Nutella", "nut")).not.toBeNull();
  });

  it("matches tokens typed in any order", () => {
    expect(getLabelSearchScore("Huile d'Olive Premium", "prem olive")).not.toBeNull();
  });

  it("ignores punctuation differences", () => {
    expect(getLabelSearchScore("Coca-Cola", "coca cola")).not.toBeNull();
    expect(getLabelSearchScore("L'Oréal", "loreal")).not.toBeNull();
  });

  it("ignores French articles the user adds or leaves out", () => {
    expect(getLabelSearchScore("Huile d'Olive", "huile de olive")).not.toBeNull();
    expect(getLabelSearchScore("Huile d'Olive", "l'huile d'olive")).not.toBeNull();
  });

  it("requires every token to match", () => {
    expect(getLabelSearchScore("Huile d'Olive Premium", "olive zzz")).toBeNull();
  });

  it("returns null for an unrelated label", () => {
    expect(getLabelSearchScore("Nutella", "riz basmati")).toBeNull();
  });

  it("treats a blank query as a neutral match", () => {
    expect(getLabelSearchScore("Nutella", "   ")).toBe(0);
  });

  it("scores a closer label higher so it sorts first", () => {
    const exact = getLabelSearchScore("Coca", "coca")!;
    const looser = getLabelSearchScore("Coca Cola Zero Pack", "coca")!;

    expect(exact).toBeGreaterThan(looser);
  });

  it("finds Arabic labels with the article, diacritics and hamza written differently", () => {
    expect(getLabelSearchScore("زيت الزيتون البكر", "زيت زيتون")).not.toBeNull();
    expect(getLabelSearchScore("أَرُز بسمتي", "ارز")).not.toBeNull();
    expect(getLabelSearchScore("حلاوة طحينية", "حلاوه")).not.toBeNull();
  });

  it("does not match an Arabic query against a French-only label", () => {
    expect(getLabelSearchScore("Nutella 400g", "زيت")).toBeNull();
  });

  it("accepts Arabic-Indic digits in the query", () => {
    expect(getLabelSearchScore("Coca 33cl", "٣٣")).not.toBeNull();
  });

  it("finds a label by a single stop word when that is all the user typed", () => {
    expect(getLabelSearchScore("Le Gaulois", "le")).not.toBeNull();
  });

  it("ranks a label containing the exact phrase above one with the words apart", () => {
    const phrase = getLabelSearchScore("Huile d'olive vierge", "huile olive")!;
    const apart = getLabelSearchScore("Olive verte à l'huile", "huile olive")!;

    expect(phrase).toBeGreaterThan(apart);
  });
});
