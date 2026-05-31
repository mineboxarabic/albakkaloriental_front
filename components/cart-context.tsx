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
  addItem: (item: AddCartItem, quantity?: number) => Promise<void>;
  updateQty: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
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

  const actions = useMemo(() => getActions(audience), [audience]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await actions.get();
    if (result.ok) {
      setItems(result.cart.items.map(mapItem));
      setError(null);
    } else {
      setItems([]);
      setError(result.error);
    }
    setLoading(false);
  }, [actions]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (item: AddCartItem, quantity = 1) => {
      if (quantity <= 0) return;
      const existingQty =
        items.find((i) => i.productId === item.productId)?.quantity ?? 0;
      if (existingQty + quantity > MAX_QTY_PER_PRODUCT) {
        setError(
          `Vous ne pouvez pas commander plus de ${MAX_QTY_PER_PRODUCT} unités du même produit.`,
        );
        return;
      }
      const result = await actions.add({
        productId: item.productId,
        quantity,
        saleUnit: item.saleUnit ?? "UNIT",
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await refresh();
    },
    [actions, refresh, items],
  );

  const updateQty = useCallback(
    async (lineId: string, quantity: number) => {
      const clamped = Math.min(MAX_QTY_PER_PRODUCT, Math.max(0, quantity));
      const result = await actions.update(lineId, clamped);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await refresh();
    },
    [actions, refresh],
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      const result = await actions.remove(lineId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await refresh();
    },
    [actions, refresh],
  );

  const clearCart = useCallback(async () => {
    const result = await actions.clear();
    if (!result.ok) {
      setError(result.error);
      return;
    }
    await refresh();
  }, [actions, refresh]);

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
