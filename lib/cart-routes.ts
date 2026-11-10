import "server-only";
import { z } from "zod";
import {
  addRetailCartItem,
  clearRetailCart,
  getRetailCart,
  removeRetailCartItem,
  updateRetailCartItem,
} from "@/actions/retail-cart";
import {
  addProCartItem,
  clearProCart,
  getProCart,
  removeProCartItem,
  updateProCartItem,
} from "@/actions/pro-cart";

/**
 * Cart mutations are called with plain fetch through /api/cart/<audience>/*
 * instead of server actions. Next.js runs server actions one at a time on the
 * client router queue, so every cart click used to delay the next page change
 * and show the navigation progress bar. Route handlers have neither cost.
 */
const ACTIONS = {
  retail: {
    get: getRetailCart,
    add: addRetailCartItem,
    update: updateRetailCartItem,
    remove: removeRetailCartItem,
    clear: clearRetailCart,
  },
  pro: {
    get: getProCart,
    add: addProCartItem,
    update: updateProCartItem,
    remove: removeProCartItem,
    clear: clearProCart,
  },
} as const;

export type CartRouteAudience = keyof typeof ACTIONS;

export function cartActions(audience: string) {
  return audience === "retail" || audience === "pro" ? ACTIONS[audience] : null;
}

export const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(999),
  saleUnit: z.enum(["UNIT", "PACK"]),
});

export const updateItemSchema = z.object({
  quantity: z.number().int().min(0).max(999),
});

export function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export const NOT_FOUND = () => json({ ok: false, error: "Not found" }, 404);
export const INVALID = () =>
  json({ ok: false, error: "Requête invalide." }, 400);

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
