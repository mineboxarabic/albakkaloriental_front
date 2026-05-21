"use server";

import { ApiClientError, backendFetch } from "@/lib/api-client";

export type VerifyEmailResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitVerifyEmail(token: string): Promise<VerifyEmailResult> {
  if (!token || token.trim() === "") {
    return { ok: false, error: "Lien de vérification invalide." };
  }

  try {
    await backendFetch<{ userId: string; verified: boolean }>(
      "/api/v1/auth/verify-email",
      {
        method: "POST",
        auth: "none",
        body: { token },
      },
    );
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Vérification impossible pour le moment." };
  }
}
