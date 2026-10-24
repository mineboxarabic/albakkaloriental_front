import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { hasArabicTranslation, translate } from "@/lib/translations";
import { AR_AUTH } from "@/lib/i18n/ar-auth";
import { AR_PRO } from "@/lib/i18n/ar-pro";
import { AR_RETAIL } from "@/lib/i18n/ar-retail";
import { AR_SHARED } from "@/lib/i18n/ar-shared";

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) sourceFiles(path, out);
    else if (/\.tsx?$/.test(entry)) out.push(path);
  }
  return out;
}

/** Every literal French string handed to t(), translate() or <TranslatedText>. */
function translationKeys(): Map<string, string> {
  const files = ["app", "components", "lib"]
    .flatMap((dir) => sourceFiles(dir))
    .filter((file) => !file.includes("i18n") && !file.endsWith("translations.ts"));
  const keys = new Map<string, string>();
  const literal = String.raw`"((?:[^"\\]|\\.)*)"`;
  const patterns = [
    new RegExp(String.raw`\bt\(\s*` + literal, "g"),
    new RegExp(String.raw`translate\(\s*` + literal, "g"),
    new RegExp(String.raw`TranslatedText\s+value=\{\s*` + literal, "g"),
    // t(condition ? "a" : "b") and value={condition ? "a" : "b"}
    new RegExp(
      String.raw`(?:\bt\(|translate\(|value=\{)\s*[\w.!<>=() \n]+\?\s*` +
        literal +
        String.raw`\s*:\s*` +
        literal,
      "g",
    ),
  ];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        for (const key of match.slice(1)) {
          if (key !== undefined) keys.set(key.replace(/\\(["'])/g, "$1"), file);
        }
      }
    }
  }
  return keys;
}

describe("Arabic translation coverage", () => {
  it("has an Arabic entry for every UI string used in the app", () => {
    const missing = [...translationKeys()]
      .filter(([key]) => !hasArabicTranslation(key))
      .map(([key, file]) => `${file}: ${key}`);
    expect(missing).toEqual([]);
  });

  it("keeps each French key in a single dictionary", () => {
    const seen = new Map<string, string>();
    const duplicates: string[] = [];
    const dictionaries = { AR_AUTH, AR_PRO, AR_RETAIL, AR_SHARED };
    for (const [name, dictionary] of Object.entries(dictionaries)) {
      for (const key of Object.keys(dictionary)) {
        if (seen.has(key)) duplicates.push(`${key} (${seen.get(key)} & ${name})`);
        seen.set(key, name);
      }
    }
    expect(duplicates).toEqual([]);
  });

  it("never invents placeholders the French string does not provide", () => {
    // Singular Arabic forms may spell the number out ("منتج واحد") and drop
    // {count}; any other placeholder must exist in the French source.
    const names = (text: string) => new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]));
    const broken = Object.entries({ ...AR_AUTH, ...AR_PRO, ...AR_RETAIL, ...AR_SHARED })
      .filter(([french, arabic]) => {
        const available = names(french);
        return [...names(arabic)].some((name) => !available.has(name));
      })
      .map(([french]) => french);
    expect(broken).toEqual([]);
  });
});

describe("translate()", () => {
  it("fills placeholders in both languages", () => {
    expect(translate("Commande {number}", "fr", { number: "CMD-1" })).toBe("Commande CMD-1");
    expect(translate("Commande {number}", "ar", { number: "CMD-1" })).toBe("الطلب CMD-1");
  });

  it("matches keys regardless of JSX line wrapping", () => {
    expect(translate("Votre panier   est vide.", "ar")).toBe("سلتك فارغة.");
  });

  it("leaves unknown placeholders and source data untouched", () => {
    expect(translate("Riz {unknown}", "ar", { other: 1 })).toBe("Riz {unknown}");
  });
});
