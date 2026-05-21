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

import { submitVerifyEmail } from "@/actions/verify-email";

describe("submitVerifyEmail", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ok=true when back-end confirms verification", async () => {
    backendFetchMock.mockResolvedValueOnce({ userId: "u1", verified: true });

    const result = await submitVerifyEmail("raw-token");

    expect(result).toMatchObject({ ok: true });
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/auth/verify-email",
      expect.objectContaining({
        method: "POST",
        body: { token: "raw-token" },
        auth: "none",
      }),
    );
  });

  it("returns ok=false when token missing", async () => {
    const result = await submitVerifyEmail("");
    expect(result).toMatchObject({ ok: false });
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("surfaces 410 error from back-end", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(
      new ApiClientError(410, "Auth token has expired"),
    );

    const result = await submitVerifyEmail("expired");
    expect(result).toMatchObject({ ok: false });
    if (result && !result.ok) {
      expect(result.error).toMatch(/expir/i);
    }
  });
});
