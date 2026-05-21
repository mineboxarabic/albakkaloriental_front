"use server";

import { z } from "zod";
import { ApiClientError, backendFetch } from "@/lib/api-client";

const checkoutSchema = z.object({
  notes: z.string().trim().max(500).optional(),
  dueDate: z.coerce.date().optional(),
});

export type ProCheckoutInput = z.infer<typeof checkoutSchema>;

export type ProCheckoutResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; error: string };

/** @deprecated Replaced by /pro/quotes/[id]/accept flow (Phase F.H). */
export async function confirmProforma(_orderId: string): Promise<{ ok: false; error: string }> {
  return {
    ok: false,
    error: "Le workflow proforma est remplacé par la signature de devis. Voir vos devis dans votre espace.",
  };
}

export async function checkoutPro(input: ProCheckoutInput): Promise<ProCheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    const data = await backendFetch<{
      order: { id: string; orderNumber: string; status: string; totalAmount: number };
    }>("/api/v1/b2b/orders/checkout", {
      method: "POST",
      auth: "required",
      body: parsed.data,
    });
    return { ok: true, orderId: data.order.id, orderNumber: data.order.orderNumber };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Commande impossible pour le moment." };
  }
}
