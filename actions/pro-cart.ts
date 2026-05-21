"use server";

import { ApiClientError, backendFetch } from "@/lib/api-client";
import type { CartDTO, CartItemDTO } from "./retail-cart";

type Ok<T> = { ok: true } & T;
type Err = { ok: false; error: string };

function fail(error: unknown): Err {
  if (error instanceof ApiClientError) return { ok: false, error: error.message };
  return { ok: false, error: "Opération impossible pour le moment." };
}

export async function getProCart(): Promise<Ok<{ cart: CartDTO }> | Err> {
  try {
    const data = await backendFetch<{ cart: CartDTO }>("/api/v1/b2b/cart", {
      auth: "required",
    });
    return { ok: true, cart: data.cart };
  } catch (error) {
    return fail(error);
  }
}

export async function addProCartItem(input: {
  productId: string;
  quantity: number;
  saleUnit: "UNIT" | "PACK";
}): Promise<Ok<{ item: CartItemDTO }> | Err> {
  try {
    const data = await backendFetch<{ item: CartItemDTO }>(
      "/api/v1/b2b/cart/items",
      { method: "POST", auth: "required", body: input },
    );
    return { ok: true, item: data.item };
  } catch (error) {
    return fail(error);
  }
}

export async function updateProCartItem(
  itemId: string,
  quantity: number,
): Promise<Ok<{ itemId: string }> | Err> {
  try {
    await backendFetch(`/api/v1/b2b/cart/items/${itemId}`, {
      method: "PATCH",
      auth: "required",
      body: { quantity },
    });
    return { ok: true, itemId };
  } catch (error) {
    return fail(error);
  }
}

export async function removeProCartItem(
  itemId: string,
): Promise<Ok<{ itemId: string }> | Err> {
  try {
    await backendFetch(`/api/v1/b2b/cart/items/${itemId}`, {
      method: "DELETE",
      auth: "required",
    });
    return { ok: true, itemId };
  } catch (error) {
    return fail(error);
  }
}

export async function clearProCart(): Promise<Ok<{ cleared: boolean }> | Err> {
  try {
    await backendFetch("/api/v1/b2b/cart", {
      method: "DELETE",
      auth: "required",
    });
    return { ok: true, cleared: true };
  } catch (error) {
    return fail(error);
  }
}
