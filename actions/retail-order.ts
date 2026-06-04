"use server";

import { z } from "zod";
import { ApiClientError, backendFetch } from "@/lib/api-client";

const checkoutSchema = z.object({
  deliveryName: z.string().trim().min(1, "Nom requis."),
  deliveryPhone: z
    .string()
    .trim()
    .min(8, "Téléphone requis.")
    .regex(/^[0-9 +().-]+$/, "Téléphone invalide."),
  deliveryCity: z.string().trim().min(1, "Ville requise."),
  deliveryPostalCode: z.string().trim().min(1).optional(),
  deliveryAddress: z.string().trim().min(5, "Adresse requise."),
  notes: z.string().trim().max(500).optional(),
});

export type RetailCheckoutInput = z.infer<typeof checkoutSchema>;

export type RetailCheckoutResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; error: string; isUnauthorized?: boolean };

export async function checkoutRetail(
  input: RetailCheckoutInput,
): Promise<RetailCheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  try {
    const data = await backendFetch<{
      order: { id: string; orderNumber: string; status: string; totalAmount: number };
    }>("/api/v1/retail/orders/checkout", {
      method: "POST",
      auth: "required",
      body: parsed.data,
    });
    return { ok: true, orderId: data.order.id, orderNumber: data.order.orderNumber };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.message, isUnauthorized: error.status === 401 };
    }
    return { ok: false, error: "Commande impossible pour le moment." };
  }
}
