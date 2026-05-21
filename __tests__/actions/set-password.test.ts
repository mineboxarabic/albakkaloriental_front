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

import { submitSetPassword } from "@/actions/set-password";

describe("submitSetPassword", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ok=true when back-end accepts the token + password", async () => {
    backendFetchMock.mockResolvedValueOnce({ userId: "u1" });

    const result = await submitSetPassword(null, makeForm({
      token: "raw-token",
      password: "NewPassword!23",
      confirmPassword: "NewPassword!23",
    }));

    expect(result).toMatchObject({ ok: true });
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/auth/set-password",
      expect.objectContaining({
        method: "POST",
        body: { token: "raw-token", password: "NewPassword!23" },
        auth: "none",
      }),
    );
  });

  it("returns ok=false with field error when passwords mismatch", async () => {
    const result = await submitSetPassword(null, makeForm({
      token: "raw-token",
      password: "Password!23",
      confirmPassword: "Different!23",
    }));

    expect(result).toMatchObject({ ok: false });
    if (result && !result.ok) {
      expect(result.error).toMatch(/correspond/i);
    }
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("returns ok=false when password too short", async () => {
    const result = await submitSetPassword(null, makeForm({
      token: "raw-token",
      password: "short",
      confirmPassword: "short",
    }));

    expect(result).toMatchObject({ ok: false });
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("returns ok=false when token missing", async () => {
    const result = await submitSetPassword(null, makeForm({
      token: "",
      password: "Password!23",
      confirmPassword: "Password!23",
    }));

    expect(result).toMatchObject({ ok: false });
  });

  it("surfaces back-end 410 error message", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(
      new ApiClientError(410, "Auth token has expired"),
    );

    const result = await submitSetPassword(null, makeForm({
      token: "expired",
      password: "Password!23",
      confirmPassword: "Password!23",
    }));

    expect(result).toMatchObject({ ok: false });
    if (result && !result.ok) {
      expect(result.error).toMatch(/expir/i);
    }
  });
});

function makeForm(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) {
    fd.append(k, v);
  }
  return fd;
}
