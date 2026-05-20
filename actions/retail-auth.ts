"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  clearSessionCookie,
  setSessionCookie,
  type RetailSession,
} from "@/lib/session";

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
  address: z.string().trim().min(5, "Adresse requise (5 caractères min)."),
  password: z
    .string()
    .min(8, "Mot de passe trop court (8 caractères min).")
    .max(72, "Mot de passe trop long."),
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
    address: String(formData.get("address") ?? ""),
    password: String(formData.get("password") ?? ""),
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

  const conflict = await prisma.retailCustomer.findFirst({
    where: { OR: [{ phone: data.phone }, { email: data.email }] },
    select: { phone: true, email: true },
  });
  if (conflict) {
    const errors: Record<string, string> = {};
    if (conflict.phone === data.phone) {
      errors.phone = "Un compte existe déjà avec ce numéro.";
    }
    if (conflict.email === data.email) {
      errors.email = "Un compte existe déjà avec cette adresse e-mail.";
    }
    return { ok: false, errors, values: raw };
  }

  const hash = await bcrypt.hash(data.password, 10);
  const customer = await prisma.retailCustomer.create({
    data: {
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      phone: data.phone,
      password: hash,
      city: data.city,
      address: data.address,
    },
    select: { id: true, name: true, phone: true },
  });

  const session: RetailSession = {
    type: "retail",
    customerId: customer.id,
    name: customer.name,
    phone: customer.phone,
  };
  await setSessionCookie(session);
  redirect("/");
}

const loginSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide."),
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
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
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

  const customer = await prisma.retailCustomer.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, name: true, phone: true, password: true, isActive: true },
  });

  if (!customer || !customer.isActive) {
    return {
      ok: false,
      error: "Identifiants invalides.",
      values: { email: raw.email },
    };
  }

  const ok = await bcrypt.compare(parsed.data.password, customer.password);
  if (!ok) {
    return {
      ok: false,
      error: "Identifiants invalides.",
      values: { email: raw.email },
    };
  }

  await setSessionCookie({
    type: "retail",
    customerId: customer.id,
    name: customer.name,
    phone: customer.phone,
  });
  redirect(redirectTo);
}

export async function logoutRetail() {
  await clearSessionCookie();
  redirect("/");
}
