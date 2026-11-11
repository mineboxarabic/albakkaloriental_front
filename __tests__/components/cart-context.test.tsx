// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { SessionProvider } from "@/components/session-provider";
import { DEFAULT_RETAIL_ORDER_RULES } from "@/lib/order-rules";
import {
  CartProvider,
  useCart,
  type CartContextValue,
} from "@/components/cart-context";

vi.mock("next/navigation", () => ({ usePathname: () => "/pro/products" }));

type Route = { method: string; path: string; body?: unknown };
type Reply = { ok: boolean; [key: string]: unknown };

let calls: Route[] = [];
let respond: (route: Route) => Reply | Promise<Reply>;
let serverItems: Array<Record<string, unknown>> = [];

function line(id: string, productId: string, quantity: number, saleUnit = "PACK") {
  return {
    id,
    productId,
    quantity,
    saleUnit,
    product: { name: productId, imageUrl: null, unitsPerPack: 6, effectivePrice: 60 },
  };
}

function defaultReply(route: Route): Reply {
  if (route.method === "GET") return { ok: true, cart: { id: "c", items: serverItems, total: 0 } };
  if (route.method === "POST") {
    const body = route.body as { productId: string; quantity: number; saleUnit: string };
    const created = line(`line-${body.productId}`, body.productId, body.quantity, body.saleUnit);
    serverItems = [...serverItems, created];
    return { ok: true, item: created };
  }
  return { ok: true };
}

let cart: CartContextValue;
function Probe() {
  const value = useCart();
  useEffect(() => {
    cart = value;
  });
  return (
    <ul>
      {value.items.map((it) => (
        <li key={it.key}>{`${it.productId}:${it.saleUnit}:${it.quantity}`}</li>
      ))}
    </ul>
  );
}

function renderCart() {
  return render(
    <CartProvider audience="pro" isAuthenticated>
      <Probe />
    </CartProvider>,
  );
}

const flush = () => act(async () => { await vi.advanceTimersByTimeAsync(0); });

beforeEach(() => {
  vi.useFakeTimers();
  calls = [];
  serverItems = [];
  respond = defaultReply;
  (window as Window & { __fetchIntercepted?: boolean }).__fetchIntercepted = true;
  window.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const route: Route = {
      method: init?.method ?? "GET",
      path: String(input),
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    };
    calls.push(route);
    return new Response(JSON.stringify(await respond(route)));
  }) as typeof fetch;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("CartProvider", () => {
  it("uses the saved retail minimum for quick adds and rejects quantities over the saved maximum", async () => {
    render(
      <SessionProvider value={{ isConnected: true, type: "retail", name: "Test" }}>
        <CartProvider audience="retail" retailRules={{ ...DEFAULT_RETAIL_ORDER_RULES, minQtyPerProduct: 2, maxQtyPerProduct: 5 }}>
          <Probe />
        </CartProvider>
      </SessionProvider>,
    );
    await flush();

    const product = { productId: "p1", name: "P1", unitPrice: 10 };
    await act(async () => { await cart.addItem(product); });
    expect(calls).toContainEqual({
      method: "POST",
      path: "/api/cart/retail/items",
      body: { productId: "p1", saleUnit: "UNIT", quantity: 2 },
    });

    await act(async () => {
      expect((await cart.addItem(product, 4)).ok).toBe(false);
    });
    expect(calls.filter(({ method }) => method === "POST")).toHaveLength(1);
  });

  it("loads the cart from the cart route, not a server action", async () => {
    serverItems = [line("l1", "p1", 2)];
    renderCart();
    await flush();
    expect(calls[0]).toMatchObject({ method: "GET", path: "/api/cart/pro" });
    expect(screen.getByText("p1:PACK:2")).toBeInTheDocument();
    expect(cart.loading).toBe(false);
  });

  it("shows an added product before the server answers", async () => {
    renderCart();
    await flush();
    let release!: () => void;
    respond = (route) =>
      route.method === "POST"
        ? new Promise((resolve) => { release = () => resolve(defaultReply(route)); })
        : defaultReply(route);

    act(() => { void cart.addItem({ productId: "p1", name: "P1", unitPrice: 60, saleUnit: "PACK" }); });

    expect(screen.getByText("p1:PACK:1")).toBeInTheDocument();
    expect(cart.itemCount).toBe(1);
    expect(cart.syncing).toBe(true);

    await flush();
    expect(cart.items[0].lineId).toMatch(/^temp-/);
    await act(async () => { release(); await vi.advanceTimersByTimeAsync(0); });
    expect(cart.items[0].lineId).toBe("line-p1");
    expect(cart.syncing).toBe(false);
  });

  it("keeps the same React key when the server id replaces the temporary one", async () => {
    renderCart();
    await flush();
    act(() => { void cart.addItem({ productId: "p1", name: "P1", unitPrice: 60, saleUnit: "PACK" }); });
    const key = cart.items[0].key;
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(cart.items[0].lineId).toBe("line-p1");
    expect(cart.items[0].key).toBe(key);
  });

  it("collapses rapid quantity taps into one request with the final quantity", async () => {
    serverItems = [line("l1", "p1", 1)];
    renderCart();
    await flush();
    let release!: () => void;
    respond = (route) =>
      route.method === "PATCH" && !release
        ? new Promise((resolve) => { release = () => resolve({ ok: true }); })
        : defaultReply(route);

    // First tap goes out; the next three wait behind it and merge into one.
    act(() => { void cart.updateQty("l1", 2); });
    await flush();
    act(() => { void cart.updateQty("l1", 3); });
    act(() => { void cart.updateQty("l1", 4); });
    act(() => { void cart.updateQty("l1", 5); });
    expect(screen.getByText("p1:PACK:5")).toBeInTheDocument();

    await act(async () => { release(); await vi.advanceTimersByTimeAsync(0); });
    const patches = calls.filter((c) => c.method === "PATCH");
    expect(patches.map((p) => p.body)).toEqual([{ quantity: 2 }, { quantity: 5 }]);
  });

  it("updates a line that is still being created once its server id is known", async () => {
    renderCart();
    await flush();
    act(() => { void cart.addItem({ productId: "p1", name: "P1", unitPrice: 60, saleUnit: "PACK" }); });
    const tempId = cart.items[0].lineId;
    act(() => { void cart.updateQty(tempId, 3); });
    await flush();
    const patch = calls.find((c) => c.method === "PATCH");
    expect(patch).toMatchObject({ path: "/api/cart/pro/items/line-p1", body: { quantity: 3 } });
  });

  it("removes a line instantly and treats quantity zero as a removal", async () => {
    serverItems = [line("l1", "p1", 1)];
    renderCart();
    await flush();
    act(() => { void cart.updateQty("l1", 0); });
    expect(screen.queryByText(/p1:/)).not.toBeInTheDocument();
    await flush();
    expect(calls.at(-1)).toMatchObject({ method: "DELETE", path: "/api/cart/pro/items/l1" });
  });

  it("undoes a refused add and explains why", async () => {
    renderCart();
    await flush();
    respond = (route) =>
      route.method === "POST"
        ? { ok: false, error: "Stock insuffisant pour la quantité demandée." }
        : defaultReply(route);

    let result: { ok: boolean } | undefined;
    await act(async () => {
      result = await cart.addItem({ productId: "p1", name: "P1", unitPrice: 60, saleUnit: "PACK" });
    });

    expect(result).toEqual({ ok: false, error: "Stock insuffisant pour la quantité demandée." });
    expect(screen.queryByText(/p1:/)).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Stock insuffisant");
  });

  it("re-reads the cart once after a burst of changes", async () => {
    renderCart();
    await flush();
    act(() => { void cart.addItem({ productId: "p1", name: "P1", unitPrice: 60, saleUnit: "PACK" }); });
    act(() => { void cart.addItem({ productId: "p2", name: "P2", unitPrice: 60, saleUnit: "PACK" }); });
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(calls.filter((c) => c.method === "GET")).toHaveLength(2);
  });

  it("lets checkout wait until queued changes are saved", async () => {
    serverItems = [line("l1", "p1", 1)];
    renderCart();
    await flush();
    let release!: () => void;
    respond = (route) =>
      route.method === "PATCH"
        ? new Promise((resolve) => { release = () => resolve({ ok: true }); })
        : defaultReply(route);
    act(() => { void cart.updateQty("l1", 4); });
    await flush();

    let settled = false;
    void cart.whenSettled().then(() => { settled = true; });
    await flush();
    expect(settled).toBe(false);

    await act(async () => { release(); await vi.advanceTimersByTimeAsync(0); });
    expect(settled).toBe(true);
  });
});
