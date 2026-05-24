// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { backendFetchMock, headersMock } = vi.hoisted(() => {
  const headersStore = new Map<string, string>();
  return {
    backendFetchMock: vi.fn(),
    headersMock: {
      store: headersStore,
      get: vi.fn(async () => ({
        get: (key: string) => headersStore.get(key.toLowerCase()) ?? null,
      })),
    },
  };
});

vi.mock("@/lib/api-client", () => ({
  backendFetch: backendFetchMock,
  ApiClientError: class ApiClientError extends Error {
    constructor(public status: number, message: string) {
      super(message);
      this.name = "ApiClientError";
    }
  },
}));

vi.mock("next/headers", () => ({
  headers: headersMock.get,
}));

import { acceptQuote, getQuote, listQuotes } from "@/actions/pro-quote";

describe("getQuote", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("GETs /api/v1/b2b/quotes/[id] and returns the quote", async () => {
    backendFetchMock.mockResolvedValueOnce({
      quote: {
        id: "q1",
        quoteNumber: "QUO-001",
        total: 100,
        validUntil: "2026-06-14T21:00:00.000Z",
        acceptedAt: null,
        lines: [],
        order: { orderNumber: "CMD-001", status: "PENDING" },
      },
    });

    const result = await getQuote("q1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.quote.id).toBe("q1");
      expect(result.quote.acceptedAt).toBeNull();
    }
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/b2b/quotes/q1",
      expect.objectContaining({ auth: "required" }),
    );
  });

  it("returns ok=false on 404", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(404, "Not found"));

    const result = await getQuote("missing");
    expect(result.ok).toBe(false);
  });
});

describe("listQuotes", () => {
  beforeEach(() => backendFetchMock.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it("GETs /api/v1/b2b/quotes and returns the list", async () => {
    backendFetchMock.mockResolvedValueOnce({
      quotes: [
        {
          id: "q1",
          quoteNumber: "QUO-001",
          subtotal: 50,
          taxTotal: 10,
          total: 60,
          validUntil: "2026-06-14T21:00:00.000Z",
          acceptedAt: null,
          createdAt: "2026-05-01T10:00:00.000Z",
          order: { id: "o1", orderNumber: "CMD-001", status: "PENDING", lockedAt: null },
        },
      ],
    });
    const result = await listQuotes();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.quotes).toHaveLength(1);
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/b2b/quotes",
      expect.objectContaining({ auth: "required" }),
    );
  });

  it("returns ok=false on backend error", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(401, "Unauthorized"));
    const result = await listQuotes();
    expect(result.ok).toBe(false);
  });
});

describe("acceptQuote", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
    headersMock.store.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("POSTs /api/v1/b2b/quotes/[id]/accept", async () => {
    backendFetchMock.mockResolvedValueOnce({
      quoteId: "q1",
      orderId: "ord1",
      deliveryCityId: "city1",
    });

    const result = await acceptQuote("q1");
    expect(result.ok).toBe(true);
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/b2b/quotes/q1/accept",
      expect.objectContaining({ method: "POST", auth: "required" }),
    );
  });

  it("forwards user-agent + x-forwarded-for to the back-end for signature audit", async () => {
    headersMock.store.set("user-agent", "Mozilla/5.0 TestSig");
    headersMock.store.set("x-forwarded-for", "82.65.10.42");
    backendFetchMock.mockResolvedValueOnce({
      quoteId: "q1",
      orderId: "ord1",
      deliveryCityId: "city1",
    });

    await acceptQuote("q1");

    const call = backendFetchMock.mock.calls[0][1];
    expect(call.forwardHeaders).toMatchObject({
      "user-agent": "Mozilla/5.0 TestSig",
      "x-forwarded-for": "82.65.10.42",
    });
  });

  it("surfaces 410 (expired/already accepted)", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(410, "Devis expiré"));

    const result = await acceptQuote("q1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/expir/i);
    }
  });

  it("surfaces 422 (no geocoding)", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(
      new ApiClientError(422, "Adresse client non géocodée"),
    );

    const result = await acceptQuote("q1");
    expect(result.ok).toBe(false);
  });
});
