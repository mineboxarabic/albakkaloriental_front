"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  clearSessionCookie,
  setSessionCookie,
  type ProSession,
} from "@/lib/session";

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

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      isActive: true,
      customerId: true,
      customer: {
        select: {
          id: true,
          companyName: true,
          pricingLevel: true,
        },
      },
    },
  });

  const invalid = (): ProLoginState => ({
    ok: false,
    error: "Identifiants invalides ou compte non autorisé.",
    values: { email: raw.email },
  });

  if (!user || !user.isActive || user.role !== "B2B_CLIENT" || !user.customer) {
    return invalid();
  }

  const ok = await bcrypt.compare(parsed.data.password, user.password);
  if (!ok) return invalid();

  const session: ProSession = {
    type: "pro",
    userId: user.id,
    customerId: user.customer.id,
    email: user.email,
    companyName: user.customer.companyName,
    pricingLevel: user.customer.pricingLevel,
  };
  await setSessionCookie(session);
  redirect(redirectTo);
}

export async function logoutPro() {
  await clearSessionCookie();
  redirect("/pro/login");
}
