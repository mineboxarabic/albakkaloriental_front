// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { backendFetchMock } = vi.hoisted(() => ({ backendFetchMock: vi.fn() }));

vi.mock("@/lib/api-client", () => ({
  backendFetch: backendFetchMock,
  ApiClientError: class ApiClientError extends Error {
    constructor(public status: number, message: string) {
      super(message);
      this.name = "ApiClientError";
    }
  },
  handleActionError: async (error: any) => {
    if (error && error.status === 401) {
      return { ok: false, error: "Unauthorized", isUnauthorized: true };
    }
    return { ok: false, error: error?.message || "Error" };
  },
}));

vi.mock("@/lib/session", () => ({
  clearSessionCookie: vi.fn(),
}));

import {
  addProCartItem,
  clearProCart,
  getProCart,
  removeProCartItem,
  updateProCartItem,
} from "@/actions/pro-cart";

describe("pro cart actions", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getProCart fetches /api/v1/b2b/cart", async () => {
    backendFetchMock.mockResolvedValueOnce({ cart: { id: "c1", items: [] } });
    const result = await getProCart();
    expect(result).toEqual({ ok: true, cart: { id: "c1", items: [] } });
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/b2b/cart",
      expect.objectContaining({ auth: "required" }),
    );
  });

  it("getProCart returns ok=false with error on 401", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(401, "Unauthorized"));
    const result = await getProCart();
    expect(result).toMatchObject({ ok: false, isUnauthorized: true });
  });

  it("addProCartItem POSTs to /b2b/cart/items with saleUnit", async () => {
    backendFetchMock.mockResolvedValueOnce({
      item: { id: "ci1", productId: "p1", quantity: 3, saleUnit: "PACK" },
    });
    const result = await addProCartItem({
      productId: "p1",
      quantity: 3,
      saleUnit: "PACK",
    });
    expect(result.ok).toBe(true);
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/b2b/cart/items",
      expect.objectContaining({
        method: "POST",
        body: { productId: "p1", quantity: 3, saleUnit: "PACK" },
      }),
    );
  });

  it("updateProCartItem PATCHes the item id", async () => {
    backendFetchMock.mockResolvedValueOnce({ itemId: "ci1" });
    const result = await updateProCartItem("ci1", 7);
    expect(result.ok).toBe(true);
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/b2b/cart/items/ci1",
      expect.objectContaining({ method: "PATCH", body: { quantity: 7 } }),
    );
  });

  it("removeProCartItem DELETEs the item id", async () => {
    backendFetchMock.mockResolvedValueOnce({ itemId: "ci1" });
    const result = await removeProCartItem("ci1");
    expect(result.ok).toBe(true);
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/b2b/cart/items/ci1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("clearProCart issues a single DELETE /api/v1/b2b/cart", async () => {
    backendFetchMock.mockResolvedValueOnce({ cleared: true });
    const result = await clearProCart();
    expect(result.ok).toBe(true);
    expect(backendFetchMock).toHaveBeenCalledTimes(1);
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/b2b/cart",
      expect.objectContaining({ method: "DELETE", auth: "required" }),
    );
  });
});
