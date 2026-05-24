"use server";

import { z } from "zod";
import { ApiClientError, backendFetch } from "@/lib/api-client";

export type ProMe = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isActive: boolean;
    mustChangePassword: boolean;
    emailVerified: string | null;
  };
  customer: {
    id: string;
    companyName: string;
    companyType: string | null;
    siret: string | null;
    vatNumber: string | null;
    contactName: string;
    managerFirstName: string | null;
    managerLastName: string | null;
    email: string | null;
    phone: string;
    mobilePhone: string | null;
    address: string;
    addressLine2: string | null;
    city: string;
    postalCode: string;
    country: string;
    pricingLevel: "C" | "D" | "E" | "F" | null;
    shareCapital: number | null;
    incorporationDate: string | null;
    apeCode: string | null;
    rcsCity: string | null;
    outstandingBalance: number;
  };
};

export type ProOrderSummary = {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  lockedAt: string | null;
  createdAt: string;
  _count: { items: number };
  quote: { id: string; acceptedAt: string | null; validUntil: string } | null;
};

export type ProOrderDetail = ProOrderSummary & {
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    totalPrice: number;
    product: { name: string; sku: string; imageUrl: string | null };
  }>;
  deliveryCity: {
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

export async function getProMe(): Promise<Ok<ProMe> | Err> {
  try {
    const data = await backendFetch<ProMe>("/api/v1/b2b/me", { auth: "required" });
    return { ok: true, ...data };
  } catch (error) {
    return fail(error);
  }
}

const updateProProfileSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(8, "Téléphone trop court.")
    .regex(/^[0-9 +().-]+$/, "Téléphone invalide.")
    .optional(),
  mobilePhone: z
    .string()
    .trim()
    .min(0)
    .optional(),
});

export type UpdateProProfileInput = z.infer<typeof updateProProfileSchema>;
export type UpdateProProfileResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string> };

export async function updateProProfile(
  input: UpdateProProfileInput,
): Promise<UpdateProProfileResult> {
  const parsed = updateProProfileSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }
  try {
    await backendFetch("/api/v1/b2b/me", {
      method: "PATCH",
      auth: "required",
      body: parsed.data,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, errors: { form: error.message } };
    }
    return { ok: false, errors: { form: "Mise à jour impossible pour le moment." } };
  }
}

const changeProPasswordSchema = z
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

export type ChangeProPasswordInput = z.infer<typeof changeProPasswordSchema>;
export type ChangeProPasswordResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string> };

export async function changeProPassword(
  input: ChangeProPasswordInput,
): Promise<ChangeProPasswordResult> {
  const parsed = changeProPasswordSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }
  try {
    await backendFetch("/api/v1/b2b/auth/change-password", {
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
      if (error.status === 403) errors.currentPassword = error.message;
      else errors.form = error.message;
      return { ok: false, errors };
    }
    return {
      ok: false,
      errors: { form: "Changement de mot de passe impossible pour le moment." },
    };
  }
}

export async function getProOrders(): Promise<Ok<{ orders: ProOrderSummary[] }> | Err> {
  try {
    const data = await backendFetch<{ orders: ProOrderSummary[] }>(
      "/api/v1/b2b/orders",
      { auth: "required" },
    );
    return { ok: true, orders: data.orders };
  } catch (error) {
    return fail(error);
  }
}

export async function getProOrderById(
  orderId: string,
): Promise<Ok<{ order: ProOrderDetail }> | Err> {
  try {
    const data = await backendFetch<{ order: ProOrderDetail }>(
      `/api/v1/b2b/orders/${orderId}`,
      { auth: "required" },
    );
    return { ok: true, order: data.order };
  } catch (error) {
    return fail(error);
  }
}
