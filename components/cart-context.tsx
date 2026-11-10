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
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { useSession } from "@/components/session-provider";
import { CartToast } from "@/components/cart-toast";
import { translate } from "@/lib/translations";
import { parseLanguage } from "@/lib/language";
import { MAX_QTY_PER_PRODUCT } from "@/lib/order-rules";
import {
  NETWORK_ERROR,
  cartClient,
  type CartAudience,
  type CartSaleUnit,
} from "@/lib/cart-client";
import type { CartItemDTO } from "@/actions/retail-cart";

export type { CartAudience, CartSaleUnit } from "@/lib/cart-client";

/**
 * Cart item shape exposed to UI components.
 * `lineId` is the back-end CartItem.id once the server has confirmed the line;
 * a freshly added line carries a temporary id until then. `key` never changes
 * for the life of a line, so use it as the React key.
 */
export type CartItem = {
  lineId: string;
  key: string;
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

export type CartMutationResult = { ok: boolean; error?: string };

export type CartContextValue = {
  items: CartItem[];
  /** True only until the first server load; mutations never set it. */
  loading: boolean;
  /** True while changes are still being saved in the background. */
  syncing: boolean;
  error: string | null;
  addItem: (item: AddCartItem, quantity?: number) => Promise<CartMutationResult>;
  updateQty: (lineId: string, quantity: number) => Promise<CartMutationResult>;
  removeItem: (lineId: string) => Promise<CartMutationResult>;
  clearCart: () => Promise<CartMutationResult>;
  refresh: () => Promise<void>;
  /** Resolves once every queued change has reached the server. */
  whenSettled: () => Promise<void>;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const TEMP_PREFIX = "temp-";
// After a burst of clicks, wait this long before re-reading the cart, so a
// quick series of taps costs one read instead of one per tap.
const RESYNC_DELAY_MS = 400;
const SESSION_EXPIRED = "Votre session a expiré. Veuillez vous reconnecter.";

let tempSeq = 0;
let sessionExpiredHandled = false;

function handleSessionExpired() {
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true;
  // Read the live <html lang> so a language switch is honoured.
  alert(translate(SESSION_EXPIRED, parseLanguage(document.documentElement.lang)));
  window.location.href = window.location.pathname.startsWith("/pro")
    ? "/pro/login"
    : "/login";
}

function mapItem(it: CartItemDTO): Omit<CartItem, "key"> {
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

/** Server data wins, but lines keep their React key across the id swap. */
export function mergeServerItems(prev: CartItem[], server: CartItemDTO[]): CartItem[] {
  const used = new Set<string>();
  return server.map((dto) => {
    const match =
      prev.find((p) => !used.has(p.key) && p.lineId === dto.id) ??
      prev.find(
        (p) =>
          !used.has(p.key) &&
          p.productId === dto.productId &&
          p.saleUnit === dto.saleUnit,
      );
    const key = match?.key ?? dto.id;
    used.add(key);
    return { ...mapItem(dto), key };
  });
}

export function CartProvider({
  audience,
  isAuthenticated,
  productNames,
  children,
}: {
  audience: CartAudience;
  /** Localized product names by id (Arabic); the cart API only sends French. */
  productNames?: Record<string, string>;
  /** Pro audience only: whether a B2B session exists. Pro pages are now public,
   *  so the cart must not call the auth-required endpoint for guests. */
  isAuthenticated?: boolean;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  const session = useSession();
  const pathname = usePathname();
  const isConnected =
    audience === "pro" ? Boolean(isAuthenticated) : session.isConnected;
  const isLoginPage =
    pathname === "/login" ||
    pathname === "/pro/login" ||
    pathname?.startsWith("/pro/login/");
  const active = isConnected && !isLoginPage;
  const api = useMemo(() => cartClient(audience), [audience]);
  const maxQty = audience === "retail" ? MAX_QTY_PER_PRODUCT : 999;

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ id: number; message: string } | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  // The ref is the source of truth so rapid clicks between renders always
  // build on the latest cart.
  const itemsRef = useRef<CartItem[]>([]);
  const commit = useCallback(
    (next: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
      itemsRef.current = typeof next === "function" ? next(itemsRef.current) : next;
      setItems(itemsRef.current);
    },
    [],
  );

  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  const pendingRef = useRef(0);
  const versionRef = useRef(0);
  const resyncTimerRef = useRef<number | null>(null);
  const waitersRef = useRef<Array<() => void>>([]);
  const idMapRef = useRef(new Map<string, string>());
  const queuedQtyRef = useRef(new Map<string, number>());
  const queuedQtyPromiseRef = useRef(new Map<string, Promise<CartMutationResult>>());

  useEffect(() => {
    const w = window as Window & { __fetchIntercepted?: boolean };
    if (!w.__fetchIntercepted) {
      w.__fetchIntercepted = true;
      const originalFetch = window.fetch;
      window.fetch = async function (...args) {
        const response = await originalFetch(...args);
        try {
          const text = await response.clone().text();
          if (text.includes('"isUnauthorized":true')) handleSessionExpired();
        } catch {
          // Ignore
        }
        return response;
      };
    }
  }, []);

  const reportFailure = useCallback(
    (result: { error: string; isUnauthorized?: boolean }) => {
      if (result.isUnauthorized) {
        handleSessionExpired();
        return;
      }
      setError(result.error);
      setNotice({ id: Date.now(), message: result.error });
    },
    [],
  );

  const resync = useCallback(async () => {
    const startVersion = versionRef.current;
    const result = await api.get();
    // Changes made while this read was in flight are newer than its answer;
    // the resync that follows them will apply the server state instead.
    const stale = versionRef.current !== startVersion || pendingRef.current > 0;
    if (!stale) {
      if (result.ok) {
        commit((prev) => mergeServerItems(prev, result.cart.items));
        setError(null);
      } else if (result.isUnauthorized) {
        handleSessionExpired();
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  }, [api, commit]);

  const scheduleResync = useCallback(() => {
    if (resyncTimerRef.current !== null) window.clearTimeout(resyncTimerRef.current);
    resyncTimerRef.current = window.setTimeout(() => {
      resyncTimerRef.current = null;
      void resync();
    }, RESYNC_DELAY_MS);
  }, [resync]);

  useEffect(
    () => () => {
      if (resyncTimerRef.current !== null) window.clearTimeout(resyncTimerRef.current);
    },
    [],
  );

  /** Runs server calls one after another, in click order, off the UI path. */
  const enqueue = useCallback(
    (task: () => Promise<CartMutationResult>): Promise<CartMutationResult> => {
      pendingRef.current += 1;
      setSyncing(true);
      if (resyncTimerRef.current !== null) {
        window.clearTimeout(resyncTimerRef.current);
        resyncTimerRef.current = null;
      }
      const run = queueRef.current
        .then(task)
        .catch((): CartMutationResult => ({ ok: false, error: NETWORK_ERROR }));
      queueRef.current = run.then(() => {
        pendingRef.current -= 1;
        if (pendingRef.current > 0) return;
        setSyncing(false);
        const waiters = waitersRef.current;
        waitersRef.current = [];
        waiters.forEach((resolve) => resolve());
        scheduleResync();
      });
      return run;
    },
    [scheduleResync],
  );

  const whenSettled = useCallback(() => {
    if (pendingRef.current === 0) return Promise.resolve();
    return new Promise<void>((resolve) => waitersRef.current.push(resolve));
  }, []);

  useEffect(() => {
    if (!active) {
      commit([]);
      setLoading(false);
      return;
    }
    void resync();
  }, [active, commit, resync]);

  /** The server id of a line, once its creation has gone through. */
  const serverId = useCallback((lineId: string) => {
    return lineId.startsWith(TEMP_PREFIX)
      ? (idMapRef.current.get(lineId) ?? null)
      : lineId;
  }, []);

  const addItem = useCallback(
    async (item: AddCartItem, quantity = 1): Promise<CartMutationResult> => {
      if (quantity <= 0) {
        return { ok: false, error: t("La quantité doit être positive.") };
      }
      const saleUnit = item.saleUnit ?? "UNIT";
      const existing = itemsRef.current.find(
        (i) => i.productId === item.productId && i.saleUnit === saleUnit,
      );
      if ((existing?.quantity ?? 0) + quantity > maxQty) {
        const message =
          audience === "retail"
            ? t(
                "Vous ne pouvez pas commander plus de {max} unités du même produit.",
                { max: MAX_QTY_PER_PRODUCT },
              )
            : t(
                "Vous ne pouvez pas commander plus de 999 unités/cartons du même produit.",
              );
        reportFailure({ error: message });
        return { ok: false, error: message };
      }

      versionRef.current += 1;
      const lineKey = existing?.key ?? `${TEMP_PREFIX}${++tempSeq}`;
      if (existing) {
        commit((prev) =>
          prev.map((i) =>
            i.key === lineKey ? { ...i, quantity: i.quantity + quantity } : i,
          ),
        );
      } else {
        commit((prev) => [
          ...prev,
          {
            lineId: lineKey,
            key: lineKey,
            productId: item.productId,
            name: item.name,
            unitPrice: item.unitPrice,
            quantity,
            imageUrl: item.imageUrl ?? null,
            saleUnit,
            unitsPerPack: item.unitsPerPack,
          },
        ]);
      }

      return enqueue(async () => {
        const result = await api.add({ productId: item.productId, quantity, saleUnit });
        if (!result.ok) {
          // Undo this add straight away; the resync after the burst restores
          // anything else the server disagrees with.
          commit((prev) =>
            prev.flatMap((i) => {
              if (i.key !== lineKey) return [i];
              const left = i.quantity - quantity;
              return left > 0 ? [{ ...i, quantity: left }] : [];
            }),
          );
          reportFailure(result);
          return { ok: false, error: result.error };
        }
        if (!existing) {
          const realId = result.item.id;
          idMapRef.current.set(lineKey, realId);
          commit((prev) =>
            prev.map((i) => (i.lineId === lineKey ? { ...i, lineId: realId } : i)),
          );
        }
        return { ok: true };
      });
    },
    [api, audience, commit, enqueue, maxQty, reportFailure, t],
  );

  const removeItem = useCallback(
    async (lineId: string): Promise<CartMutationResult> => {
      const line = itemsRef.current.find((i) => i.lineId === lineId);
      if (!line) return { ok: true };
      versionRef.current += 1;
      queuedQtyRef.current.delete(line.key);
      commit((prev) => prev.filter((i) => i.key !== line.key));
      return enqueue(async () => {
        const id = serverId(line.lineId);
        if (!id) return { ok: true }; // the line never reached the server
        const result = await api.remove(id);
        if (!result.ok) {
          reportFailure(result);
          return { ok: false, error: result.error };
        }
        return { ok: true };
      });
    },
    [api, commit, enqueue, reportFailure, serverId],
  );

  const updateQty = useCallback(
    async (lineId: string, quantity: number): Promise<CartMutationResult> => {
      const line = itemsRef.current.find((i) => i.lineId === lineId);
      if (!line) return { ok: true };
      const clamped = Math.min(maxQty, Math.max(0, Math.round(quantity)));
      if (clamped === 0) return removeItem(lineId);
      if (clamped === line.quantity) return { ok: true };

      versionRef.current += 1;
      const lineKey = line.key;
      commit((prev) =>
        prev.map((i) => (i.key === lineKey ? { ...i, quantity: clamped } : i)),
      );

      // Rapid +/− taps collapse into one request carrying the final quantity.
      queuedQtyRef.current.set(lineKey, clamped);
      const queued = queuedQtyPromiseRef.current.get(lineKey);
      if (queued) return queued;

      const promise = enqueue(async () => {
        const qty = queuedQtyRef.current.get(lineKey);
        queuedQtyRef.current.delete(lineKey);
        queuedQtyPromiseRef.current.delete(lineKey);
        if (qty === undefined) return { ok: true }; // removed meanwhile
        const current = itemsRef.current.find((i) => i.key === lineKey);
        const id = serverId(current?.lineId ?? line.lineId);
        if (!id) return { ok: false, error: NETWORK_ERROR };
        const result = await api.update(id, qty);
        if (!result.ok) {
          reportFailure(result);
          return { ok: false, error: result.error };
        }
        return { ok: true };
      });
      queuedQtyPromiseRef.current.set(lineKey, promise);
      return promise;
    },
    [api, commit, enqueue, maxQty, removeItem, reportFailure, serverId],
  );

  const clearCart = useCallback(async (): Promise<CartMutationResult> => {
    versionRef.current += 1;
    queuedQtyRef.current.clear();
    commit([]);
    return enqueue(async () => {
      const result = await api.clear();
      if (!result.ok) {
        reportFailure(result);
        return { ok: false, error: result.error };
      }
      return { ok: true };
    });
  }, [api, commit, enqueue, reportFailure]);

  const refresh = useCallback(async () => {
    if (!active) return;
    await resync();
  }, [active, resync]);

  const dismissNotice = useCallback(() => setNotice(null), []);

  const value = useMemo<CartContextValue>(() => {
    const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const itemCount = items.reduce((s, it) => s + it.quantity, 0);
    return {
      items: productNames
        ? items.map((it) => ({
            ...it,
            name: productNames[it.productId] ?? it.name,
          }))
        : items,
      loading,
      syncing,
      error,
      addItem,
      updateQty,
      removeItem,
      clearCart,
      refresh,
      whenSettled,
      total,
      itemCount,
      isCartOpen,
      openCart,
      closeCart,
    };
  }, [items, productNames, loading, syncing, error, addItem, updateQty, removeItem, clearCart, refresh, whenSettled, isCartOpen, openCart, closeCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartToast notice={notice} onDismiss={dismissNotice} />
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>.");
  return ctx;
}
