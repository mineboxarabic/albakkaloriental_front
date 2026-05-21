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
}));

import {
  addRetailCartItem,
  clearRetailCart,
  getRetailCart,
  removeRetailCartItem,
  updateRetailCartItem,
} from "@/actions/retail-cart";

describe("retail cart actions", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getRetailCart fetches GET /api/v1/retail/cart with auth", async () => {
    backendFetchMock.mockResolvedValueOnce({
      cart: { id: "c1", items: [] },
    });
    const result = await getRetailCart();
    expect(result).toEqual({ ok: true, cart: { id: "c1", items: [] } });
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/retail/cart",
      expect.objectContaining({ auth: "required" }),
    );
  });

  it("getRetailCart returns ok=false with error on 401", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(401, "Unauthorized"));
    const result = await getRetailCart();
    expect(result).toMatchObject({ ok: false });
  });

  it("addRetailCartItem POSTs to /cart/items", async () => {
    backendFetchMock.mockResolvedValueOnce({
      item: { id: "ci1", quantity: 2, productId: "p1", saleUnit: "UNIT" },
    });

    const result = await addRetailCartItem({
      productId: "p1",
      quantity: 2,
      saleUnit: "UNIT",
    });

    expect(result.ok).toBe(true);
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/retail/cart/items",
      expect.objectContaining({
        method: "POST",
        auth: "required",
        body: { productId: "p1", quantity: 2, saleUnit: "UNIT" },
      }),
    );
  });

  it("updateRetailCartItem PATCHes the item id", async () => {
    backendFetchMock.mockResolvedValueOnce({ itemId: "ci1" });

    const result = await updateRetailCartItem("ci1", 5);
    expect(result.ok).toBe(true);
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/retail/cart/items/ci1",
      expect.objectContaining({
        method: "PATCH",
        body: { quantity: 5 },
      }),
    );
  });

  it("removeRetailCartItem DELETEs the item id", async () => {
    backendFetchMock.mockResolvedValueOnce({ itemId: "ci1" });
    const result = await removeRetailCartItem("ci1");
    expect(result.ok).toBe(true);
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/retail/cart/items/ci1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("clearRetailCart issues a single DELETE /api/v1/retail/cart", async () => {
    backendFetchMock.mockResolvedValueOnce({ cleared: true });
    const result = await clearRetailCart();
    expect(result.ok).toBe(true);
    expect(backendFetchMock).toHaveBeenCalledTimes(1);
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/retail/cart",
      expect.objectContaining({ method: "DELETE", auth: "required" }),
    );
  });
});
