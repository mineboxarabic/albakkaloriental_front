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

import { requestPasswordReset, resetPassword } from "@/actions/password-reset";

function makeForm(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.append(k, v);
  return fd;
}

describe("requestPasswordReset", () => {
  beforeEach(() => backendFetchMock.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it("returns ok=false on invalid email format", async () => {
    const result = await requestPasswordReset(null, makeForm({ email: "not-an-email" }));
    expect(result).toMatchObject({ ok: false });
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("POSTs lowercase email to /api/v1/auth/forgot-password and returns sent=true", async () => {
    backendFetchMock.mockResolvedValueOnce({ sent: true });
    const result = await requestPasswordReset(null, makeForm({ email: "USER@x.fr" }));
    expect(result).toMatchObject({ ok: true, sent: true });
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/auth/forgot-password",
      expect.objectContaining({ method: "POST", body: { email: "user@x.fr" } }),
    );
  });

  it("returns ok=true sent=true even on backend error (anti-énumération)", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(500, "boom"));
    const result = await requestPasswordReset(null, makeForm({ email: "x@x.fr" }));
    expect(result).toMatchObject({ ok: true, sent: true });
  });

  it("surfaces 400 backend validation error", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(400, "email invalide"));
    const result = await requestPasswordReset(null, makeForm({ email: "x@x.fr" }));
    expect(result).toMatchObject({ ok: false });
  });
});

describe("resetPassword", () => {
  beforeEach(() => backendFetchMock.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it("returns errors when password too short", async () => {
    const result = await resetPassword(
      null,
      makeForm({ token: "x", password: "abc", confirmPassword: "abc" }),
    );
    expect(result).toMatchObject({ ok: false });
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("returns errors when password != confirm", async () => {
    const result = await resetPassword(
      null,
      makeForm({
        token: "x",
        password: "Password!23",
        confirmPassword: "different",
      }),
    );
    expect(result).toMatchObject({ ok: false });
    if (result && !result.ok) {
      expect(result.errors.confirmPassword).toBeDefined();
    }
  });

  it("POSTs token+password (without confirm) and returns ok on success", async () => {
    backendFetchMock.mockResolvedValueOnce({ userId: "u1" });
    const result = await resetPassword(
      null,
      makeForm({
        token: "abc",
        password: "Password!23",
        confirmPassword: "Password!23",
      }),
    );
    expect(result).toMatchObject({ ok: true });
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/auth/reset-password",
      expect.objectContaining({
        method: "POST",
        body: { token: "abc", password: "Password!23" },
      }),
    );
  });

  it("surfaces 410 token expired/already used as form error", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(
      new ApiClientError(410, "Token expiré"),
    );
    const result = await resetPassword(
      null,
      makeForm({
        token: "abc",
        password: "Password!23",
        confirmPassword: "Password!23",
      }),
    );
    expect(result).toMatchObject({ ok: false });
    if (result && !result.ok) {
      expect(result.errors.form).toMatch(/expir/i);
    }
  });
});
