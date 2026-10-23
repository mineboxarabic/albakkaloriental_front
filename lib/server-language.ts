import "server-only";
import { cookies } from "next/headers";
import { LANGUAGE_COOKIE, parseLanguage } from "@/lib/language";
export async function getLanguage() {
  return parseLanguage((await cookies()).get(LANGUAGE_COOKIE)?.value);
}
