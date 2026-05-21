"use server";

import { z } from "zod";
import { ApiClientError, backendFetch } from "@/lib/api-client";

const schema = z
  .object({
    token: z.string().min(1, "Lien d'activation invalide."),
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

export type SetPasswordState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export async function submitSetPassword(
  _prev: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const raw = {
    token: String(formData.get("token") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  try {
    await backendFetch<{ userId: string }>("/api/v1/auth/set-password", {
      method: "POST",
      auth: "none",
      body: { token: parsed.data.token, password: parsed.data.password },
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Impossible de définir le mot de passe pour le moment." };
  }
}
