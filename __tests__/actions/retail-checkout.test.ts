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

import { checkoutRetail } from "@/actions/retail-order";

const validInput = {
  deliveryName: "Jean",
  deliveryPhone: "+33600000001",
  deliveryCity: "Draguignan",
  deliveryAddress: "13 rue test",
};

describe("checkoutRetail", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("POSTs delivery info to /api/v1/retail/orders/checkout and returns order id+number", async () => {
    backendFetchMock.mockResolvedValueOnce({
      order: {
        id: "ord1",
        orderNumber: "RO-001",
        status: "PENDING",
        totalAmount: 30,
      },
    });

    const result = await checkoutRetail(validInput);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.orderId).toBe("ord1");
      expect(result.orderNumber).toBe("RO-001");
    }
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/retail/orders/checkout",
      expect.objectContaining({
        method: "POST",
        auth: "required",
        body: validInput,
      }),
    );
  });

  it("returns ok=false with error message on 400 (cart empty)", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(400, "Cart is empty"));

    const result = await checkoutRetail(validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/cart/i);
    }
  });

  it("validates required fields before calling backend", async () => {
    const result = await checkoutRetail({
      deliveryName: "",
      deliveryPhone: "+33600000001",
      deliveryCity: "Draguignan",
      deliveryAddress: "13 rue test",
    });
    expect(result.ok).toBe(false);
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("forwards optional notes", async () => {
    backendFetchMock.mockResolvedValueOnce({
      order: { id: "x", orderNumber: "RO-002", status: "PENDING", totalAmount: 0 },
    });

    await checkoutRetail({ ...validInput, notes: "Sonner deux fois" });

    const body = backendFetchMock.mock.calls[0][1].body;
    expect(body.notes).toBe("Sonner deux fois");
  });
});
