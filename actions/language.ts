"use server";
import { cookies } from "next/headers";
import { LANGUAGE_COOKIE, type Language } from "@/lib/language";
export async function setLanguage(language: Language) {
  if (language !== "fr" && language !== "ar")
    throw new Error("Unsupported language");
  (await cookies()).set(LANGUAGE_COOKIE, language, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
