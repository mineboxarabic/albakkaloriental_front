import type { ActionErr, CartDTO, CartItemDTO } from "@/actions/retail-cart";

export type CartAudience = "retail" | "pro";
export type CartSaleUnit = "PACK" | "UNIT";

type Ok<T> = { ok: true } & T;
export type CartResult<T = object> = Ok<T> | ActionErr;

export const NETWORK_ERROR =
  "Connexion impossible. Vérifiez votre réseau et réessayez.";

async function call<T>(
  path: string,
  init: { method: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown },
): Promise<CartResult<T>> {
  try {
    const response = await fetch(path, {
      method: init.method,
      headers:
        init.body === undefined
          ? undefined
          : { "content-type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      credentials: "same-origin",
    });
    const parsed = (await response.json().catch(() => null)) as
      | CartResult<T>
      | null;
    if (parsed && typeof parsed === "object" && "ok" in parsed) return parsed;
    return { ok: false, error: NETWORK_ERROR };
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }
}

export function cartClient(audience: CartAudience) {
  const base = `/api/cart/${audience}`;
  return {
    get: () => call<{ cart: CartDTO }>(base, { method: "GET" }),
    add: (input: { productId: string; quantity: number; saleUnit: CartSaleUnit }) =>
      call<{ item: CartItemDTO }>(`${base}/items`, { method: "POST", body: input }),
    update: (itemId: string, quantity: number) =>
      call<{ itemId: string }>(`${base}/items/${encodeURIComponent(itemId)}`, {
        method: "PATCH",
        body: { quantity },
      }),
    remove: (itemId: string) =>
      call<{ itemId: string }>(`${base}/items/${encodeURIComponent(itemId)}`, {
        method: "DELETE",
      }),
    clear: () => call<{ cleared: boolean }>(base, { method: "DELETE" }),
  };
}

export type CartClient = ReturnType<typeof cartClient>;
