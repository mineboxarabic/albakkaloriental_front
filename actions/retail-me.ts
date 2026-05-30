"use server";

import { z } from "zod";
import { ApiClientError, backendFetch } from "@/lib/api-client";

export type RetailMe = {
  user: {
    id: string;
    email: string;
    name: string | null;
    isActive: boolean;
    emailVerified: string | null;
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    city: string;
    postalCode: string | null;
    address: string;
    latitude: number | null;
    longitude: number | null;
    isActive: boolean;
    createdAt: string;
  };
};

export type RetailOrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryName: string;
  deliveryPhone?: string;
  deliveryCity: string;
  deliveryAddress: string;
  paymentMethod?: string;
  notes?: string | null;
  createdAt: string;
  lockedAt: string | null;
  _count: { items: number };
};

export type RetailOrderDetail = RetailOrderSummary & {
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }>;
  deliveryCityRef: {
    name: string;
    delivery: { scheduledDate: string; status: string };
  } | null;
};

type Ok<T> = { ok: true } & T;
type Err = { ok: false; error: string };

function fail(error: unknown): Err {
  if (error instanceof ApiClientError) return { ok: false, error: error.message };
  return { ok: false, error: "Requête impossible pour le moment." };
}

export async function getRetailMe(): Promise<Ok<RetailMe> | Err> {
  try {
    const data = await backendFetch<RetailMe>("/api/v1/retail/me", {
      auth: "required",
    });
    return { ok: true, ...data };
  } catch (error) {
    return fail(error);
  }
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis."),
    newPassword: z
      .string()
      .min(8, "Mot de passe trop court (8 caractères min).")
      .max(72, "Mot de passe trop long."),
    confirmPassword: z.string().min(1, "Confirmation requise."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type ChangeRetailPasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string> };

export async function changeRetailPassword(
  input: ChangeRetailPasswordInput,
): Promise<ChangePasswordResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }
  try {
    await backendFetch("/api/v1/retail/auth/change-password", {
      method: "POST",
      auth: "required",
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      },
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiClientError) {
      const errors: Record<string, string> = {};
      const msg = error.message.toLowerCase();
      if (msg.includes("actuel") || error.status === 403) {
        errors.currentPassword = error.message;
      } else {
        errors.form = error.message;
      }
      return { ok: false, errors };
    }
    return {
      ok: false,
      errors: { form: "Changement de mot de passe impossible pour le moment." },
    };
  }
}

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis.").optional(),
  lastName: z.string().trim().min(1, "Nom requis.").optional(),
  phone: z
    .string()
    .trim()
    .min(8, "Téléphone trop court.")
    .regex(/^[0-9 +().-]+$/, "Téléphone invalide.")
    .optional(),
  city: z.string().trim().min(1, "Ville requise.").optional(),
  postalCode: z.string().trim().min(1, "Code postal requis.").optional(),
  address: z.string().trim().min(5, "Adresse requise.").optional(),
});

export type UpdateRetailProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateRetailProfileResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string> };

export async function updateRetailProfile(
  input: UpdateRetailProfileInput,
): Promise<UpdateRetailProfileResult> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }
  try {
    await backendFetch("/api/v1/retail/me", {
      method: "PATCH",
      auth: "required",
      body: parsed.data,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiClientError) {
      const errors: Record<string, string> = {};
      const msg = error.message.toLowerCase();
      if (msg.includes("téléphone") || msg.includes("phone")) errors.phone = error.message;
      else errors.form = error.message;
      return { ok: false, errors };
    }
    return {
      ok: false,
      errors: { form: "Mise à jour impossible pour le moment." },
    };
  }
}

export async function getRetailOrders(): Promise<
  Ok<{ orders: RetailOrderSummary[] }> | Err
> {
  try {
    const data = await backendFetch<{ orders: RetailOrderSummary[] }>(
      "/api/v1/retail/orders/me",
      { auth: "required" },
    );
    return { ok: true, orders: data.orders };
  } catch (error) {
    return fail(error);
  }
}

export async function getRetailOrderById(
  orderId: string,
): Promise<Ok<{ order: RetailOrderDetail }> | Err> {
  try {
    const data = await backendFetch<{ order: RetailOrderDetail }>(
      `/api/v1/retail/orders/me/${orderId}`,
      { auth: "required" },
    );
    return { ok: true, order: data.order };
  } catch (error) {
    return fail(error);
  }
}
