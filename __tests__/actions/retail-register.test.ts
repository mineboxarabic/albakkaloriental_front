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

import { registerRetail } from "@/actions/retail-auth";

function makeForm(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.append(k, v);
  return fd;
}

const validValues = {
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean@example.test",
  phone: "+33600000001",
  city: "Draguignan",
  postalCode: "83300",
  address: "13 Rue Test",
  password: "Password!23",
};

describe("registerRetail", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("POSTs the full body (name combined, email, phone, password, city, address)", async () => {
    backendFetchMock.mockResolvedValueOnce({
      needsEmailVerification: true,
      customer: { id: "rc1", name: "Jean Dupont", phone: "+33600000001" },
    });

    const result = await registerRetail(null, makeForm(validValues));

    expect(result).toMatchObject({ ok: true });
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/retail/auth/register",
      expect.objectContaining({
        method: "POST",
        auth: "none",
        body: {
          name: "Jean Dupont",
          email: "jean@example.test",
          phone: "+33600000001",
          city: "Draguignan",
          postalCode: "83300",
          address: "13 Rue Test",
          password: "Password!23",
        },
      }),
    );
  });

  it("returns ok=false with field error when email is invalid", async () => {
    const result = await registerRetail(
      null,
      makeForm({ ...validValues, email: "not-an-email" }),
    );
    expect(result).toMatchObject({ ok: false });
    if (result && !result.ok) {
      expect(result.errors.email).toBeDefined();
    }
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("returns ok=false with form-level error on backend 409", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(
      new ApiClientError(409, "Email already registered"),
    );

    const result = await registerRetail(null, makeForm(validValues));
    expect(result).toMatchObject({ ok: false });
    if (result && !result.ok) {
      expect(result.errors.form ?? result.errors.email).toMatch(/already|exist/i);
    }
  });
});
