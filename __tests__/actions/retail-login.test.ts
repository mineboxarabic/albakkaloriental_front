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

  it("calls backend with identifier+password, stores returned token, redirects", async () => {
    backendFetchMock.mockResolvedValueOnce({
      token: "jwt.token.here",
      customer: { id: "rc1", name: "Test", phone: "+33600000001" },
    });

    await expect(
      loginRetail(null, makeForm({ identifier: "test@x.fr", password: "Password!23" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/retail/auth/login",
      expect.objectContaining({
        method: "POST",
        body: { identifier: "test@x.fr", password: "Password!23" },
      }),
    );
    expect(storeTokenMock).toHaveBeenCalledWith("jwt.token.here");
    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("accepts legacy 'email' field name for the identifier", async () => {
    backendFetchMock.mockResolvedValueOnce({
      token: "t",
      customer: { id: "x", name: "x", phone: "x" },
    });

    await expect(
      loginRetail(null, makeForm({ email: "test@x.fr", password: "Password!23" })),
    ).rejects.toThrow("NEXT_REDIRECT");
    const body = backendFetchMock.mock.calls[0][1].body;
    expect(body.identifier).toBe("test@x.fr");
  });

  it("returns ok=false on 401 from backend", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(401, "Unauthorized"));

    const result = await loginRetail(
      null,
      makeForm({ identifier: "x", password: "bad" }),
    );
    expect(result).toMatchObject({ ok: false });
    expect(storeTokenMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("returns ok=false on validation error (empty identifier)", async () => {
    const result = await loginRetail(
      null,
      makeForm({ identifier: "", password: "x" }),
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
        makeForm({ identifier: "x", password: "Password!23", redirectTo: "/account" }),
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
        makeForm({ identifier: "x", password: "Password!23", redirectTo: "//evil.com" }),
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
