import "server-only";

import { ApiClientError, backendFetch } from "@/lib/api-client";
import { DEFAULT_RETAIL_ORDER_RULES, type RetailOrderRules } from "@/lib/order-rules";

export async function getRetailOrderRules(): Promise<RetailOrderRules> {
  try {
    return await backendFetch<RetailOrderRules>("/api/v1/public/retail-order-rules", { auth: "none" });
  } catch (error) {
    // Allow the storefront to roll out while the backend still uses its original defaults.
    if (error instanceof ApiClientError && error.status === 404) return DEFAULT_RETAIL_ORDER_RULES;
    throw error;
  }
}
