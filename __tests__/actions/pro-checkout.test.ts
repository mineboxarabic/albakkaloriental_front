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

import { checkoutPro } from "@/actions/pro-order";

describe("checkoutPro", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("POSTs to /api/v1/b2b/orders/checkout with optional notes + dueDate", async () => {
    backendFetchMock.mockResolvedValueOnce({
      order: {
        id: "ord1",
        orderNumber: "CMD-00001",
        status: "PENDING",
        totalAmount: 120,
      },
    });

    const result = await checkoutPro({
      notes: "Livraison urgente",
      dueDate: new Date("2026-06-15"),
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.orderId).toBe("ord1");
      expect(result.orderNumber).toBe("CMD-00001");
    }
    const args = backendFetchMock.mock.calls[0];
    expect(args[0]).toBe("/api/v1/b2b/orders/checkout");
    expect(args[1].body.notes).toBe("Livraison urgente");
    expect(args[1].body.dueDate).toBeInstanceOf(Date);
  });

  it("works with empty input", async () => {
    backendFetchMock.mockResolvedValueOnce({
      order: { id: "x", orderNumber: "CMD-00002", status: "PENDING", totalAmount: 0 },
    });

    const result = await checkoutPro({});
    expect(result.ok).toBe(true);
  });

  it("returns 403 mapped error when no pricing level", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(
      new ApiClientError(403, "No pricing level assigned"),
    );

    const result = await checkoutPro({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/pricing/i);
    }
  });

  it("returns 400 mapped error when cart empty", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(400, "Cart is empty"));

    const result = await checkoutPro({});
    expect(result.ok).toBe(false);
  });
});
