"use server";

import { z } from "zod";
import { ApiClientError, backendFetch } from "@/lib/api-client";

const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Adresse e-mail requise.")
    .email("Adresse e-mail invalide."),
});

export type ForgotPasswordState =
  | { ok: true; sent: boolean }
  | { ok: false; error: string }
  | null;

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = forgotSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  try {
    await backendFetch<{ sent: boolean }>("/api/v1/auth/forgot-password", {
      method: "POST",
      auth: "none",
      body: parsed.data,
    });
    return { ok: true, sent: true };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 400) {
      return { ok: false, error: error.message };
    }
    // Anti-énumération : on retourne toujours "sent" même si erreur back
    return { ok: true, sent: true };
  }
}

const resetSchema = z
  .object({
    token: z.string().min(1, "Lien invalide."),
    password: z
      .string()
      .min(8, "Mot de passe trop court (8 caractères min).")
      .max(72, "Mot de passe trop long."),
    confirmPassword: z.string().min(1, "Confirmation requise."),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type ResetPasswordState =
  | { ok: true }
  | { ok: false; errors: Record<string, string> }
  | null;

export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetSchema.safeParse({
    token: String(formData.get("token") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  try {
    await backendFetch("/api/v1/auth/reset-password", {
      method: "POST",
      auth: "none",
      body: {
        token: parsed.data.token,
        password: parsed.data.password,
      },
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, errors: { form: error.message } };
    }
    return {
      ok: false,
      errors: { form: "Réinitialisation impossible pour le moment." },
    };
  }
}
