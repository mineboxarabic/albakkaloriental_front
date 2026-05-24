// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { backendFetchMock, storeTokenMock, redirectMock, clearMock } = vi.hoisted(
  () => ({
    backendFetchMock: vi.fn(),
    storeTokenMock: vi.fn(),
    redirectMock: vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    }),
    clearMock: vi.fn(),
  }),
);

vi.mock("@/lib/api-client", () => ({
  backendFetch: backendFetchMock,
  ApiClientError: class ApiClientError extends Error {
    constructor(public status: number, message: string) {
      super(message);
      this.name = "ApiClientError";
    }
  },
}));

vi.mock("@/lib/session", () => ({
  storeBackendToken: storeTokenMock,
  clearSessionCookie: clearMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import { loginRetail, logoutRetail } from "@/actions/retail-auth";

function makeForm(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.append(k, v);
  return fd;
}

describe("loginRetail", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
    storeTokenMock.mockReset();
    redirectMock.mockClear();
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls backend with email+password, stores returned token, redirects", async () => {
    backendFetchMock.mockResolvedValueOnce({
      token: "jwt.token.here",
      customer: { id: "rc1", name: "Test", phone: "+33600000001" },
    });

    await expect(
      loginRetail(null, makeForm({ email: "test@x.fr", password: "Password!23" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/retail/auth/login",
      expect.objectContaining({
        method: "POST",
        body: { email: "test@x.fr", password: "Password!23" },
      }),
    );
    expect(storeTokenMock).toHaveBeenCalledWith("jwt.token.here");
    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("returns explicit FR message on 401 from backend (wrong credentials)", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(401, "Unauthorized"));

    const result = await loginRetail(
      null,
      makeForm({ email: "test@x.fr", password: "bad" }),
    );
    expect(result).toMatchObject({ ok: false });
    if (result && !result.ok) {
      expect(result.error).toMatch(/incorrect/i);
    }
    expect(storeTokenMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("passes back-end FR message through on 403 (account disabled)", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(
      new ApiClientError(403, "Compte désactivé. Contactez le support."),
    );

    const result = await loginRetail(
      null,
      makeForm({ email: "test@x.fr", password: "Password!23" }),
    );
    expect(result).toMatchObject({ ok: false });
    if (result && !result.ok) {
      expect(result.error).toMatch(/désactivé/i);
    }
  });

  it("returns ok=false on validation error (empty email)", async () => {
    const result = await loginRetail(
      null,
      makeForm({ email: "", password: "x" }),
    );
    expect(result).toMatchObject({ ok: false });
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("returns ok=false on validation error (malformed email)", async () => {
    const result = await loginRetail(
      null,
      makeForm({ email: "not-an-email", password: "x" }),
    );
    expect(result).toMatchObject({ ok: false });
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("honours sanitized redirectTo", async () => {
    backendFetchMock.mockResolvedValueOnce({
      token: "t",
      customer: { id: "x", name: "x", phone: "x" },
    });
    await expect(
      loginRetail(
        null,
        makeForm({ email: "test@x.fr", password: "Password!23", redirectTo: "/account" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/account");
  });

  it("ignores external redirect targets", async () => {
    backendFetchMock.mockResolvedValueOnce({
      token: "t",
      customer: { id: "x", name: "x", phone: "x" },
    });
    await expect(
      loginRetail(
        null,
        makeForm({ email: "test@x.fr", password: "Password!23", redirectTo: "//evil.com" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});

describe("logoutRetail", () => {
  beforeEach(() => {
    clearMock.mockReset();
    redirectMock.mockClear();
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("clears the cookie and redirects home", async () => {
    await expect(logoutRetail()).rejects.toThrow("NEXT_REDIRECT");
    expect(clearMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});
