"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
import { MAX_QTY_PER_PRODUCT } from "@/lib/order-rules";
import { useSession } from "@/components/session-provider";
import { usePathname } from "next/navigation";

export type CartSaleUnit = "PACK" | "UNIT";
export type CartAudience = "retail" | "pro";

/**
 * Cart item shape exposed to UI components.
 * `lineId` is the back-end CartItem.id (server is source of truth now).
 */
export type CartItem = {
  lineId: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string | null;
  saleUnit: CartSaleUnit;
  unitsPerPack?: number;
};

export type AddCartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  imageUrl?: string | null;
  saleUnit?: CartSaleUnit;
  unitsPerPack?: number;
};

export type CartContextValue = {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addItem: (item: AddCartItem, quantity?: number) => Promise<{ ok: boolean; error?: string }>;
  updateQty: (lineId: string, quantity: number) => Promise<{ ok: boolean; error?: string }>;
  removeItem: (lineId: string) => Promise<{ ok: boolean; error?: string }>;
  clearCart: () => Promise<{ ok: boolean; error?: string }>;
  refresh: () => Promise<void>;
  total: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

type ServerItem = {
  id: string;
  productId: string;
  quantity: number;
  saleUnit: CartSaleUnit;
  product?: {
    name: string;
    imageUrl: string | null;
    unitsPerPack: number;
    effectivePrice: number;
  };
};

function mapItem(it: ServerItem): CartItem {
  return {
    lineId: it.id,
    productId: it.productId,
    quantity: it.quantity,
    saleUnit: it.saleUnit,
    name: it.product?.name ?? "",
    unitPrice: it.product?.effectivePrice ?? 0,
    imageUrl: it.product?.imageUrl ?? null,
    unitsPerPack: it.product?.unitsPerPack,
  };
}

function getActions(audience: CartAudience) {
  return audience === "retail"
    ? {
        get: getRetailCart,
        add: addRetailCartItem,
        update: updateRetailCartItem,
        remove: removeRetailCartItem,
        clear: clearRetailCart,
      }
    : {
        get: getProCart,
        add: addProCartItem,
        update: updateProCartItem,
        remove: removeProCartItem,
        clear: clearProCart,
      };
}

export function CartProvider({
  audience,
  children,
}: {
  audience: CartAudience;
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const session = useSession();
  const isConnected = audience === "pro" ? true : session.isConnected;
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/pro/login" || pathname?.startsWith("/pro/login/");

  const actions = useMemo(() => getActions(audience), [audience]);

  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).__fetchIntercepted) {
      (window as any).__fetchIntercepted = true;
      const originalFetch = window.fetch;
      window.fetch = async function (...args) {
        const response = await originalFetch(...args);
        try {
          const clone = response.clone();
          const text = await clone.text();
          if (text.includes('"isUnauthorized":true')) {
            alert("Votre session a expiré. Veuillez vous reconnecter.");
            window.location.href = window.location.pathname.startsWith("/pro")
              ? "/pro/login"
              : "/login";
          }
        } catch (e) {
          // Ignore
        }
        return response;
      };
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isConnected || isLoginPage) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await actions.get();
    if (result.ok) {
      setItems(result.cart.items.map(mapItem));
      setError(null);
    } else {
      setItems([]);
      setError(result.error);
      if (result.isUnauthorized) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        window.location.href = audience === "retail" ? "/login" : "/pro/login";
      }
    }
    setLoading(false);
  }, [actions, audience, isConnected, isLoginPage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (item: AddCartItem, quantity = 1) => {
      if (quantity <= 0) return { ok: false, error: "La quantité doit être positive." };
      const existingQty =
        items.find((i) => i.productId === item.productId)?.quantity ?? 0;
      const maxQty = audience === "retail" ? MAX_QTY_PER_PRODUCT : 999;
      if (existingQty + quantity > maxQty) {
        const errMsg =
          audience === "retail"
            ? `Vous ne pouvez pas commander plus de ${MAX_QTY_PER_PRODUCT} unités du même produit.`
            : `Vous ne pouvez pas commander plus de 999 unités/cartons du même produit.`;
        setError(errMsg);
        return { ok: false, error: errMsg };
      }
      const result = await actions.add({
        productId: item.productId,
        quantity,
        saleUnit: item.saleUnit ?? "UNIT",
      });
      if (!result.ok) {
        setError(result.error);
        if (result.isUnauthorized) {
          alert("Votre session a expiré. Veuillez vous reconnecter.");
          window.location.href = audience === "retail" ? "/login" : "/pro/login";
        }
        return { ok: false, error: result.error };
      }
      await refresh();
      return { ok: true };
    },
    [actions, refresh, items, audience],
  );

  const updateQty = useCallback(
    async (lineId: string, quantity: number) => {
      const maxQty = audience === "retail" ? MAX_QTY_PER_PRODUCT : 999;
      const clamped = Math.min(maxQty, Math.max(0, quantity));
      const result = await actions.update(lineId, clamped);
      if (!result.ok) {
        setError(result.error);
        if (result.isUnauthorized) {
          alert("Votre session a expiré. Veuillez vous reconnecter.");
          window.location.href = audience === "retail" ? "/login" : "/pro/login";
        }
        return { ok: false, error: result.error };
      }
      await refresh();
      return { ok: true };
    },
    [actions, refresh, audience],
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      const result = await actions.remove(lineId);
      if (!result.ok) {
        setError(result.error);
        if (result.isUnauthorized) {
          alert("Votre session a expiré. Veuillez vous reconnecter.");
          window.location.href = audience === "retail" ? "/login" : "/pro/login";
        }
        return { ok: false, error: result.error };
      }
      await refresh();
      return { ok: true };
    },
    [actions, refresh, audience],
  );

  const clearCart = useCallback(async () => {
    const result = await actions.clear();
    if (!result.ok) {
      setError(result.error);
      if (result.isUnauthorized) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        window.location.href = audience === "retail" ? "/login" : "/pro/login";
      }
      return { ok: false, error: result.error };
    }
    await refresh();
    return { ok: true };
  }, [actions, refresh, audience]);

  const value = useMemo<CartContextValue>(() => {
    const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const itemCount = items.reduce((s, it) => s + it.quantity, 0);
    return {
      items,
      loading,
      error,
      addItem,
      updateQty,
      removeItem,
      clearCart,
      refresh,
      total,
      itemCount,
    };
  }, [items, loading, error, addItem, updateQty, removeItem, clearCart, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>.");
  return ctx;
}
