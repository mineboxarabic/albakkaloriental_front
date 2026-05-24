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

import { loginPro, logoutPro } from "@/actions/pro-auth";

function makeForm(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.append(k, v);
  return fd;
}

describe("loginPro", () => {
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

  it("posts email+password, stores token, redirects to /pro/account by default", async () => {
    backendFetchMock.mockResolvedValueOnce({
      token: "b2b.token",
      user: { id: "u1", email: "pro@x.fr" },
    });

    await expect(
      loginPro(null, makeForm({ email: "pro@x.fr", password: "Password!23" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/b2b/auth/login",
      expect.objectContaining({
        method: "POST",
        body: { email: "pro@x.fr", password: "Password!23" },
      }),
    );
    expect(storeTokenMock).toHaveBeenCalledWith("b2b.token");
    expect(redirectMock).toHaveBeenCalledWith("/pro/account");
  });

  it("returns explicit FR message on 401 from backend", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(401, "Unauthorized"));

    const result = await loginPro(
      null,
      makeForm({ email: "x@x.fr", password: "bad" }),
    );
    expect(result).toMatchObject({ ok: false });
    if (result && !result.ok) {
      expect(result.error).toMatch(/incorrect/i);
    }
    expect(storeTokenMock).not.toHaveBeenCalled();
  });

  it("passes back-end FR message through on 403 (account disabled)", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(
      new ApiClientError(403, "Compte désactivé. Contactez votre commercial."),
    );

    const result = await loginPro(
      null,
      makeForm({ email: "x@x.fr", password: "Password!23" }),
    );
    expect(result).toMatchObject({ ok: false });
    if (result && !result.ok) {
      expect(result.error).toMatch(/désactivé/i);
    }
  });

  it("returns ok=false on invalid email", async () => {
    const result = await loginPro(
      null,
      makeForm({ email: "not-an-email", password: "Password!23" }),
    );
    expect(result).toMatchObject({ ok: false });
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it("honours redirectTo when safe", async () => {
    backendFetchMock.mockResolvedValueOnce({ token: "t", user: { id: "u", email: "x" } });
    await expect(
      loginPro(
        null,
        makeForm({
          email: "pro@x.fr",
          password: "Password!23",
          redirectTo: "/pro/cart",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/pro/cart");
  });
});

describe("logoutPro", () => {
  beforeEach(() => {
    clearMock.mockReset();
    redirectMock.mockClear();
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("clears cookie and redirects to /pro/login", async () => {
    await expect(logoutPro()).rejects.toThrow("NEXT_REDIRECT");
    expect(clearMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/pro/login");
  });
});
