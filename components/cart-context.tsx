"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type CartSaleUnit = "PACK" | "UNIT";

export type CartItem = {
  /** Unique line identifier; equals productId for retail, productId:saleUnit for pro. */
  lineId: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string | null;
  saleUnit?: CartSaleUnit;
  unitsPerPack?: number;
};

export type AddCartItem = Omit<CartItem, "quantity" | "lineId">;

export type CartContextValue = {
  items: CartItem[];
  addItem: (item: AddCartItem, quantity?: number) => void;
  updateQty: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
};

function computeLineId(productId: string, saleUnit?: CartSaleUnit): string {
  return saleUnit ? `${productId}:${saleUnit}` : productId;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(key: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (it) =>
          it &&
          typeof it.productId === "string" &&
          typeof it.name === "string" &&
          typeof it.unitPrice === "number" &&
          typeof it.quantity === "number" &&
          it.quantity > 0,
      )
      .map((it): CartItem => {
        const saleUnit: CartSaleUnit | undefined =
          it.saleUnit === "PACK" || it.saleUnit === "UNIT" ? it.saleUnit : undefined;
        return {
          lineId: typeof it.lineId === "string" ? it.lineId : computeLineId(it.productId, saleUnit),
          productId: it.productId,
          name: it.name,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          imageUrl: it.imageUrl ?? null,
          saleUnit,
          unitsPerPack: typeof it.unitsPerPack === "number" ? it.unitsPerPack : undefined,
        };
      });
  } catch {
    return [];
  }
}

export function CartProvider({
  storageKey,
  children,
}: {
  storageKey: string;
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    setItems(readStorage(storageKey));
    hydrated.current = true;
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated.current) return;
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem = useCallback(
    (item: AddCartItem, quantity = 1) => {
      if (quantity <= 0) return;
      const lineId = computeLineId(item.productId, item.saleUnit);
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.lineId === lineId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            unitPrice: item.unitPrice,
            quantity: next[idx].quantity + quantity,
          };
          return next;
        }
        return [...prev, { ...item, lineId, quantity }];
      });
    },
    [],
  );

  const updateQty = useCallback((lineId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((p) => p.lineId !== lineId);
      return prev.map((p) => (p.lineId === lineId ? { ...p, quantity } : p));
    });
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((p) => p.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const itemCount = items.reduce((s, it) => s + it.quantity, 0);
    return { items, addItem, updateQty, removeItem, clearCart, total, itemCount };
  }, [items, addItem, updateQty, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>.");
  return ctx;
}
