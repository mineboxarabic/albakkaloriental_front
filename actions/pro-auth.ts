"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ApiClientError, backendFetch } from "@/lib/api-client";
import { clearProSession, storeProToken } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

export type ProLoginState =
  | { ok: false; error: string; values?: { email?: string } }
  | null;

function sanitizeRedirect(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

export async function loginPro(
  _prev: ProLoginState,
  formData: FormData,
): Promise<ProLoginState> {
  const raw = {
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    password: String(formData.get("password") ?? ""),
  };
  const redirectTo = sanitizeRedirect(
    formData.get("redirectTo") as string | null,
    "/pro/account",
  );

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Identifiants invalides.",
      values: { email: raw.email },
    };
  }

  try {
    const result = await backendFetch<{
      token: string;
      user: { id: string; email: string };
    }>("/api/v1/b2b/auth/login", {
      method: "POST",
      auth: "none",
      body: parsed.data,
    });

    await storeProToken(result.token);
  } catch (error) {
    return {
      ok: false,
      error: mapLoginError(error),
      values: { email: raw.email },
    };
  }

  redirect(redirectTo);
}

function mapLoginError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 401) return "Adresse e-mail ou mot de passe incorrect.";
    return error.message;
  }
  return "Connexion impossible pour le moment.";
}

export async function logoutPro() {
  await clearProSession();
  redirect("/pro/login");
}
