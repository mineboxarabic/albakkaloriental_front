import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { CartProvider, useCart } from "@/components/cart-context";
import type { ReactNode } from "react";

function makeWrapper(key: string) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <CartProvider storageKey={key}>{children}</CartProvider>;
  }
  Wrapper.displayName = `CartWrapper(${key})`;
  return Wrapper;
}

const wrapper = (key: string) => makeWrapper(key);

beforeEach(() => {
  window.localStorage.clear();
});

describe("CartContext", () => {
  it("starts empty and adds an item", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: wrapper("retail_cart"),
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);

    act(() => {
      result.current.addItem({
        productId: "p1",
        name: "Couscous",
        unitPrice: 2.35,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.total).toBeCloseTo(2.35);
    expect(result.current.itemCount).toBe(1);
  });

  it("merges quantity when the same product is added twice", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: wrapper("retail_cart"),
    });

    act(() => {
      result.current.addItem(
        { productId: "p1", name: "Riz", unitPrice: 5 },
        2,
      );
    });
    act(() => {
      result.current.addItem(
        { productId: "p1", name: "Riz", unitPrice: 5 },
        3,
      );
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.total).toBe(25);
  });

  it("updates quantity and removes when set to 0", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: wrapper("retail_cart"),
    });

    act(() => {
      result.current.addItem({ productId: "p1", name: "X", unitPrice: 1 }, 1);
      result.current.addItem({ productId: "p2", name: "Y", unitPrice: 2 }, 1);
    });

    act(() => result.current.updateQty("p1", 4));
    expect(result.current.items.find((i) => i.productId === "p1")?.quantity).toBe(4);

    act(() => result.current.updateQty("p2", 0));
    expect(result.current.items.find((i) => i.productId === "p2")).toBeUndefined();
  });

  it("removes a specific item and clears the cart", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: wrapper("retail_cart"),
    });

    act(() => {
      result.current.addItem({ productId: "p1", name: "A", unitPrice: 1 });
      result.current.addItem({ productId: "p2", name: "B", unitPrice: 2 });
    });

    act(() => result.current.removeItem("p1"));
    expect(result.current.items).toHaveLength(1);

    act(() => result.current.clearCart());
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it("keeps retail and pro carts strictly separate via storage keys", () => {
    const retail = renderHook(() => useCart(), {
      wrapper: wrapper("retail_cart"),
    });
    act(() => {
      retail.result.current.addItem({
        productId: "p1",
        name: "Retail item",
        unitPrice: 3,
      });
    });

    const pro = renderHook(() => useCart(), {
      wrapper: wrapper("pro_cart"),
    });
    expect(pro.result.current.items).toHaveLength(0);

    act(() => {
      pro.result.current.addItem(
        { productId: "p2", name: "Pro item", unitPrice: 10 },
        4,
      );
    });

    expect(retail.result.current.items).toHaveLength(1);
    expect(retail.result.current.items[0].productId).toBe("p1");
    expect(pro.result.current.items).toHaveLength(1);
    expect(pro.result.current.items[0].quantity).toBe(4);

    expect(JSON.parse(window.localStorage.getItem("retail_cart") || "[]")).toHaveLength(1);
    expect(JSON.parse(window.localStorage.getItem("pro_cart") || "[]")).toHaveLength(1);
  });

  it("rehydrates items from localStorage on mount", () => {
    window.localStorage.setItem(
      "retail_cart",
      JSON.stringify([
        { productId: "p9", name: "Stored", unitPrice: 7, quantity: 2 },
      ]),
    );
    const { result } = renderHook(() => useCart(), {
      wrapper: wrapper("retail_cart"),
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe("p9");
    expect(result.current.total).toBe(14);
  });
});
