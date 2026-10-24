import "server-only";
import { cookies } from "next/headers";
import { LANGUAGE_COOKIE, parseLanguage, type Language } from "@/lib/language";
import { translate, type TranslationParams } from "@/lib/translations";

export async function getLanguage() {
  return parseLanguage((await cookies()).get(LANGUAGE_COOKIE)?.value);
}

export type Translator = (text: string, params?: TranslationParams) => string;

export function translator(language: Language): Translator {
  return (text, params) => translate(text, language, params);
}

/** Current language plus a bound `t()` for server components. */
export async function getTranslator(): Promise<{
  language: Language;
  t: Translator;
}> {
  const language = await getLanguage();
  return { language, t: translator(language) };
}
