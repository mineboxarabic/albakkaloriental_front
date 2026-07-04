"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ApiClientError, backendFetch } from "@/lib/api-client";
import { clearRetailSession, storeRetailToken } from "@/lib/session";

const phoneSchema = z
  .string()
  .trim()
  .min(8, "Numéro de téléphone trop court.")
  .max(20, "Numéro de téléphone trop long.")
  .regex(/^[0-9 +().-]+$/, "Numéro de téléphone invalide.");

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis."),
  lastName: z.string().trim().min(1, "Nom requis."),
  email: z.string().trim().email("Adresse e-mail invalide."),
  phone: phoneSchema,
  city: z.string().trim().min(1, "Ville requise."),
  postalCode: z.string().trim().min(1, "Code postal requis."),
  address: z.string().trim().min(5, "Adresse requise (5 caractères min)."),
  password: z
    .string()
    .min(8, "Mot de passe trop court (8 caractères min).")
    .max(72, "Mot de passe trop long."),
  acceptCgv: z.literal("on", {
    message: "Vous devez accepter les CGV pour continuer.",
  }),
  acceptPrivacy: z.literal("on", {
    message: "Vous devez accepter la politique de confidentialité pour continuer.",
  }),
});

export type RegisterState =
  | { ok: false; errors: Record<string, string>; values?: Record<string, string> }
  | null;

export async function registerRetail(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    phone: String(formData.get("phone") ?? ""),
    city: String(formData.get("city") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    address: String(formData.get("address") ?? ""),
    password: String(formData.get("password") ?? ""),
    acceptCgv: String(formData.get("acceptCgv") ?? ""),
    acceptPrivacy: String(formData.get("acceptPrivacy") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors, values: raw };
  }

  const data = parsed.data;
  const name = `${data.firstName} ${data.lastName}`.trim();

  try {
    await backendFetch<{
      needsEmailVerification: boolean;
      customer: { id: string; name: string; phone: string };
    }>("/api/v1/retail/auth/register", {
      method: "POST",
      auth: "none",
      body: {
        name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        postalCode: data.postalCode,
        address: data.address,
        password: data.password,
      },
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      const errors: Record<string, string> = {};
      const message = error.message.toLowerCase();
      if (message.includes("email")) errors.email = error.message;
      else if (message.includes("phone")) errors.phone = error.message;
      else errors.form = error.message;
      return { ok: false, errors, values: raw };
    }
    return {
      ok: false,
      errors: { form: "Inscription impossible pour le moment." },
      values: raw,
    };
  }

  redirect(`/verify-pending?email=${encodeURIComponent(data.email)}`);
}

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Adresse e-mail requise.")
    .email("Adresse e-mail invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

export type LoginState =
  | { ok: false; error: string; values?: { email?: string } }
  | null;

function sanitizeRedirect(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export async function loginRetail(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
  const redirectTo = sanitizeRedirect(formData.get("redirectTo") as string | null);

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
      customer: { id: string; name: string; phone: string };
    }>("/api/v1/retail/auth/login", {
      method: "POST",
      auth: "none",
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
    });

    await storeRetailToken(result.token);
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

export async function logoutRetail() {
  await clearRetailSession();
  redirect("/");
}
