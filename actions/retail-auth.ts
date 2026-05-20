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
  const existing = await prisma.retailCustomer.findUnique({
    where: { phone: data.phone },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      errors: { phone: "Un compte existe déjà avec ce numéro." },
      values: raw,
    };
  }

  const hash = await bcrypt.hash(data.password, 10);
  const customer = await prisma.retailCustomer.create({
    data: {
      name: `${data.firstName} ${data.lastName}`.trim(),
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
  phone: phoneSchema,
  password: z.string().min(1, "Mot de passe requis."),
});

export type LoginState =
  | { ok: false; error: string; values?: { phone?: string } }
  | null;

export async function loginRetail(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = {
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Identifiants invalides.",
      values: { phone: raw.phone },
    };
  }

  const customer = await prisma.retailCustomer.findUnique({
    where: { phone: parsed.data.phone },
    select: { id: true, name: true, phone: true, password: true, isActive: true },
  });

  if (!customer || !customer.isActive) {
    return {
      ok: false,
      error: "Identifiants invalides.",
      values: { phone: raw.phone },
    };
  }

  const ok = await bcrypt.compare(parsed.data.password, customer.password);
  if (!ok) {
    return {
      ok: false,
      error: "Identifiants invalides.",
      values: { phone: raw.phone },
    };
  }

  await setSessionCookie({
    type: "retail",
    customerId: customer.id,
    name: customer.name,
    phone: customer.phone,
  });
  redirect("/");
}

export async function logoutRetail() {
  await clearSessionCookie();
  redirect("/");
}
