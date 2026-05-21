"use server";

import { ApiClientError, backendFetch } from "@/lib/api-client";

export type CartItemDTO = {
  id: string;
  productId: string;
  quantity: number;
  saleUnit: "UNIT" | "PACK";
  product: {
    name: string;
    sku: string;
    category: string;
    imageUrl: string | null;
    unitsPerPack: number;
    baseUnit: string;
    sellingPrice: number;
    unitSellingPrice: number | null;
    effectivePrice: number;
  };
};

export type CartDTO = {
  id: string;
  items: CartItemDTO[];
  total: number;
};

type Ok<T> = { ok: true } & T;
type Err = { ok: false; error: string };

function fail(error: unknown): Err {
  if (error instanceof ApiClientError) return { ok: false, error: error.message };
  return { ok: false, error: "Opération impossible pour le moment." };
}

export async function getRetailCart(): Promise<Ok<{ cart: CartDTO }> | Err> {
  try {
    const data = await backendFetch<{ cart: CartDTO }>("/api/v1/retail/cart", {
      auth: "required",
    });
    return { ok: true, cart: data.cart };
  } catch (error) {
    return fail(error);
  }
}

export async function addRetailCartItem(input: {
  productId: string;
  quantity: number;
  saleUnit: "UNIT" | "PACK";
}): Promise<Ok<{ item: CartItemDTO }> | Err> {
  try {
    const data = await backendFetch<{ item: CartItemDTO }>(
      "/api/v1/retail/cart/items",
      { method: "POST", auth: "required", body: input },
    );
    return { ok: true, item: data.item };
  } catch (error) {
    return fail(error);
  }
}

export async function updateRetailCartItem(
  itemId: string,
  quantity: number,
): Promise<Ok<{ itemId: string }> | Err> {
  try {
    await backendFetch(`/api/v1/retail/cart/items/${itemId}`, {
      method: "PATCH",
      auth: "required",
      body: { quantity },
    });
    return { ok: true, itemId };
  } catch (error) {
    return fail(error);
  }
}

export async function removeRetailCartItem(
  itemId: string,
): Promise<Ok<{ itemId: string }> | Err> {
  try {
    await backendFetch(`/api/v1/retail/cart/items/${itemId}`, {
      method: "DELETE",
      auth: "required",
    });
    return { ok: true, itemId };
  } catch (error) {
    return fail(error);
  }
}

export async function clearRetailCart(): Promise<Ok<{ cleared: boolean }> | Err> {
  try {
    await backendFetch("/api/v1/retail/cart", {
      method: "DELETE",
      auth: "required",
    });
    return { ok: true, cleared: true };
  } catch (error) {
    return fail(error);
  }
}
