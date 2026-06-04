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

import {
  updateProProfile,
  changeProPassword,
  listProInvoices,
} from "@/actions/pro-me";

describe("updateProProfile", () => {
  beforeEach(() => backendFetchMock.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it("PATCHes /api/v1/b2b/me with phone + mobile", async () => {
    backendFetchMock.mockResolvedValueOnce({ customer: { id: "c1" } });
    const result = await updateProProfile({
      phone: "+33600000001",
      mobilePhone: "+33611112222",
    });
    expect(result).toMatchObject({ ok: true });
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/b2b/me",
      expect.objectContaining({
        method: "PATCH",
        body: { phone: "+33600000001", mobilePhone: "+33611112222" },
      }),
    );
  });

  it("returns errors on invalid phone", async () => {
    const result = await updateProProfile({ phone: "abc" });
    expect(result).toMatchObject({ ok: false });
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("maps backend error to form error", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(500, "boom"));
    const result = await updateProProfile({ phone: "+33600000001" });
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.errors.form).toBeDefined();
  });
});

describe("changeProPassword", () => {
  beforeEach(() => backendFetchMock.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it("returns errors when newPassword too short", async () => {
    const result = await changeProPassword({
      currentPassword: "old!1",
      newPassword: "abc",
      confirmPassword: "abc",
    });
    expect(result).toMatchObject({ ok: false });
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("POSTs to /api/v1/b2b/auth/change-password and returns ok", async () => {
    backendFetchMock.mockResolvedValueOnce({});
    const result = await changeProPassword({
      currentPassword: "old!1",
      newPassword: "Brand!New123",
      confirmPassword: "Brand!New123",
    });
    expect(result).toMatchObject({ ok: true });
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/b2b/auth/change-password",
      expect.objectContaining({
        method: "POST",
        body: { currentPassword: "old!1", newPassword: "Brand!New123" },
      }),
    );
  });

  it("maps 403 to errors.currentPassword", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(403, "incorrect"));
    const result = await changeProPassword({
      currentPassword: "wrong",
      newPassword: "Brand!New123",
      confirmPassword: "Brand!New123",
    });
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.errors.currentPassword).toBeDefined();
  });
});

describe("listProInvoices", () => {
  beforeEach(() => backendFetchMock.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it("GETs /api/v1/b2b/invoices and returns the list", async () => {
    backendFetchMock.mockResolvedValueOnce({
      invoices: [
        {
          id: "i1",
          invoiceNumber: "INV-001",
          invoiceDate: "2026-05-01",
          dueDate: "2026-06-01",
          status: "UNPAID",
          totalAmount: 100,
          paidAmount: 0,
          isSent: true,
          order: null,
        },
      ],
    });
    const result = await listProInvoices();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.invoices).toHaveLength(1);
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/b2b/invoices",
      expect.objectContaining({ auth: "required" }),
    );
  });

  it("returns ok=false on ApiClientError", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(401, "Unauthorized"));
    const result = await listProInvoices();
    expect(result.ok).toBe(false);
  });
});
