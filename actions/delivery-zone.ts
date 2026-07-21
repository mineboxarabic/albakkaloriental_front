"use server";

import { backendFetch } from "@/lib/api-client";

/**
 * Ask the backend whether a postal code is inside the delivery zone.
 * Used by the address fields to give instant yes/no feedback before submit.
 * The backend enforces the same rule on signup/checkout, so this is UX only.
 */
export async function checkDeliveryZone(
  postalCode: string,
): Promise<{ allowed: boolean; label: string | null }> {
  const cp = postalCode.replace(/\D/g, "").slice(0, 5);
  if (cp.length !== 5) return { allowed: false, label: null };

  return backendFetch<{ allowed: boolean; label: string | null }>(
    `/api/v1/retail/delivery-zone/check?postalCode=${cp}`,
    { auth: "none" },
  );
}
