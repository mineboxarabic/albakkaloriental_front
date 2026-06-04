"use server";

import { ApiClientError, backendFetch, handleActionError } from "@/lib/api-client";
import type { CartDTO, CartItemDTO, ActionErr } from "./retail-cart";

type Ok<T> = { ok: true } & T;

async function fail(error: unknown): Promise<ActionErr> {
  return handleActionError(error);
}

export async function getProCart(): Promise<Ok<{ cart: CartDTO }> | ActionErr> {
  try {
    const data = await backendFetch<{ cart: CartDTO }>("/api/v1/b2b/cart", {
      auth: "required",
    });
    return { ok: true, cart: data.cart };
  } catch (error) {
    return await fail(error);
  }
}

export async function addProCartItem(input: {
  productId: string;
  quantity: number;
  saleUnit: "UNIT" | "PACK";
}): Promise<Ok<{ item: CartItemDTO }> | ActionErr> {
  try {
    const data = await backendFetch<{ item: CartItemDTO }>(
      "/api/v1/b2b/cart/items",
      { method: "POST", auth: "required", body: input },
    );
    return { ok: true, item: data.item };
  } catch (error) {
    return await fail(error);
  }
}

export async function updateProCartItem(
  itemId: string,
  quantity: number,
): Promise<Ok<{ itemId: string }> | ActionErr> {
  try {
    await backendFetch(`/api/v1/b2b/cart/items/${itemId}`, {
      method: "PATCH",
      auth: "required",
      body: { quantity },
    });
    return { ok: true, itemId };
  } catch (error) {
    return await fail(error);
  }
}

export async function removeProCartItem(
  itemId: string,
): Promise<Ok<{ itemId: string }> | ActionErr> {
  try {
    await backendFetch(`/api/v1/b2b/cart/items/${itemId}`, {
      method: "DELETE",
      auth: "required",
    });
    return { ok: true, itemId };
  } catch (error) {
    return await fail(error);
  }
}

export async function clearProCart(): Promise<Ok<{ cleared: boolean }> | ActionErr> {
  try {
    await backendFetch("/api/v1/b2b/cart", {
      method: "DELETE",
      auth: "required",
    });
    return { ok: true, cleared: true };
  } catch (error) {
    return await fail(error);
  }
}
