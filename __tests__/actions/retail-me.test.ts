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

import { updateRetailProfile, changeRetailPassword } from "@/actions/retail-me";

describe("updateRetailProfile", () => {
  beforeEach(() => backendFetchMock.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it("PATCHes /api/v1/retail/me with provided fields", async () => {
    backendFetchMock.mockResolvedValueOnce({ customer: { id: "c1" } });
    const result = await updateRetailProfile({
      firstName: "Jean",
      lastName: "Martin",
      phone: "+33600000001",
      city: "Marseille",
      postalCode: "13001",
      address: "10 Rue Test",
    });
    expect(result).toMatchObject({ ok: true });
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/retail/me",
      expect.objectContaining({
        method: "PATCH",
        body: {
          firstName: "Jean",
          lastName: "Martin",
          phone: "+33600000001",
          city: "Marseille",
          postalCode: "13001",
          address: "10 Rue Test",
        },
      }),
    );
  });

  it("returns errors on validation (invalid phone)", async () => {
    const result = await updateRetailProfile({ phone: "abc" });
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.errors.phone).toBeDefined();
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("maps backend 409 (phone conflict) to errors.phone", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(
      new ApiClientError(409, "Ce numéro de téléphone est déjà utilisé."),
    );
    const result = await updateRetailProfile({ phone: "+33611112222" });
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.errors.phone).toMatch(/téléphone/i);
  });
});

describe("changeRetailPassword", () => {
  beforeEach(() => backendFetchMock.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it("returns errors when confirmPassword does not match", async () => {
    const result = await changeRetailPassword({
      currentPassword: "old!1",
      newPassword: "NewPass!23",
      confirmPassword: "different",
    });
    expect(result).toMatchObject({ ok: false });
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("POSTs current+new (without confirm) and returns ok", async () => {
    backendFetchMock.mockResolvedValueOnce({});
    const result = await changeRetailPassword({
      currentPassword: "old!1",
      newPassword: "NewPass!23",
      confirmPassword: "NewPass!23",
    });
    expect(result).toMatchObject({ ok: true });
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/retail/auth/change-password",
      expect.objectContaining({
        method: "POST",
        body: { currentPassword: "old!1", newPassword: "NewPass!23" },
      }),
    );
  });

  it("maps 403 (current password wrong) to errors.currentPassword", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(
      new ApiClientError(403, "Mot de passe actuel incorrect."),
    );
    const result = await changeRetailPassword({
      currentPassword: "wrong",
      newPassword: "NewPass!23",
      confirmPassword: "NewPass!23",
    });
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.errors.currentPassword).toBeDefined();
  });
});
