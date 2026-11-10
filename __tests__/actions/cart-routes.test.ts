// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const pro = vi.hoisted(() => ({
  getProCart: vi.fn(),
  addProCartItem: vi.fn(),
  updateProCartItem: vi.fn(),
  removeProCartItem: vi.fn(),
  clearProCart: vi.fn(),
}));
vi.mock("@/actions/pro-cart", () => pro);
vi.mock("@/actions/retail-cart", () => ({
  getRetailCart: vi.fn(),
  addRetailCartItem: vi.fn(),
  updateRetailCartItem: vi.fn(),
  removeRetailCartItem: vi.fn(),
  clearRetailCart: vi.fn(),
}));

import { GET } from "@/app/api/cart/[audience]/route";
import { POST } from "@/app/api/cart/[audience]/items/route";
import { PATCH } from "@/app/api/cart/[audience]/items/[itemId]/route";

const ctx = <T extends object>(params: T) => ({ params: Promise.resolve(params) });
const jsonRequest = (body: unknown) =>
  new Request("http://test/api", { method: "POST", body: JSON.stringify(body) });

beforeEach(() => {
  Object.values(pro).forEach((fn) => fn.mockReset());
});

describe("cart routes", () => {
  it("returns the pro cart action result", async () => {
    pro.getProCart.mockResolvedValue({ ok: true, cart: { id: "c", items: [], total: 0 } });
    const response = await GET(new Request("http://test"), ctx({ audience: "pro" }));
    expect(await response.json()).toEqual({ ok: true, cart: { id: "c", items: [], total: 0 } });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects an unknown audience", async () => {
    const response = await GET(new Request("http://test"), ctx({ audience: "admin" }));
    expect(response.status).toBe(404);
  });

  it("validates an added line before calling the back-end", async () => {
    const response = await POST(jsonRequest({ productId: "p1", quantity: 0, saleUnit: "PACK" }), ctx({ audience: "pro" }));
    expect(response.status).toBe(400);
    expect(pro.addProCartItem).not.toHaveBeenCalled();
  });

  it("forwards a valid line to the pro cart", async () => {
    pro.addProCartItem.mockResolvedValue({ ok: true, item: { id: "l1" } });
    const response = await POST(jsonRequest({ productId: "p1", quantity: 2, saleUnit: "PACK" }), ctx({ audience: "pro" }));
    expect(await response.json()).toEqual({ ok: true, item: { id: "l1" } });
    expect(pro.addProCartItem).toHaveBeenCalledWith({ productId: "p1", quantity: 2, saleUnit: "PACK" });
  });

  it("passes refusals through so the client can explain them", async () => {
    pro.updateProCartItem.mockResolvedValue({ ok: false, error: "Stock insuffisant pour la quantité demandée." });
    const response = await PATCH(
      new Request("http://test", { method: "PATCH", body: JSON.stringify({ quantity: 40 }) }),
      ctx({ audience: "pro", itemId: "l1" }),
    );
    expect(pro.updateProCartItem).toHaveBeenCalledWith("l1", 40);
    expect(await response.json()).toEqual({ ok: false, error: "Stock insuffisant pour la quantité demandée." });
  });
});
