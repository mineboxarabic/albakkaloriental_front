// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { backendFetchMock } = vi.hoisted(() => ({ backendFetchMock: vi.fn() }));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/api-client", () => ({
  backendFetch: backendFetchMock,
  ApiClientError: class ApiClientError extends Error {
    constructor(public status: number, message: string) {
      super(message);
      this.name = "ApiClientError";
    }
  },
}));

import {
  getCategories,
  getProduct,
  getProducts,
} from "@/lib/catalog";

function fakeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: "p1",
    name: "Test Product",
    sku: "TP-1",
    category: "epicerie",
    imageUrl: null,
    unitsPerPack: 6,
    baseUnit: "PIECE",
    visibility: "RETAIL",
    sellingPrice: 4.99,
    unitSellingPrice: null,
    price: 4.99,
    ...overrides,
  };
}

describe("catalog (retail)", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getProducts({audience:retail}) calls /api/v1/retail/catalog as public (auth:none)", async () => {
    backendFetchMock.mockResolvedValueOnce({
      products: [fakeProduct({ id: "a" }), fakeProduct({ id: "b", category: "boissons" })],
    });

    const result = await getProducts({ audience: "retail" });

    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/retail/catalog",
      expect.objectContaining({ auth: "none" }),
    );
    expect(result).toHaveLength(2);
    expect(result[0].sellingPrice).toBe(4.99);
  });

  it("getProducts filters by category client-side", async () => {
    backendFetchMock.mockResolvedValueOnce({
      products: [
        fakeProduct({ id: "a", category: "epicerie" }),
        fakeProduct({ id: "b", category: "boissons" }),
      ],
    });
    const result = await getProducts({ audience: "retail", category: "boissons" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("b");
  });

  it("getProducts applies take + skip pagination client-side", async () => {
    backendFetchMock.mockResolvedValueOnce({
      products: Array.from({ length: 5 }, (_, i) =>
        fakeProduct({ id: `p${i}` }),
      ),
    });
    const result = await getProducts({ audience: "retail", skip: 1, take: 2 });
    expect(result.map((p) => p.id)).toEqual(["p1", "p2"]);
  });
});

describe("catalog (pro)", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getProducts({audience:pro}) calls /api/v1/b2b/catalog", async () => {
    backendFetchMock.mockResolvedValueOnce({ products: [] });
    await getProducts({ audience: "pro" });
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/b2b/catalog",
      expect.objectContaining({ auth: "required" }),
    );
  });
});

describe("getProduct", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });

  it("returns the product when found in the visible catalog", async () => {
    backendFetchMock.mockResolvedValueOnce({
      products: [fakeProduct({ id: "a" }), fakeProduct({ id: "b" })],
    });
    const result = await getProduct("b", "retail");
    expect(result?.id).toBe("b");
  });

  it("returns null when product not in catalog for audience", async () => {
    backendFetchMock.mockResolvedValueOnce({ products: [fakeProduct({ id: "a" })] });
    const result = await getProduct("nope", "retail");
    expect(result).toBeNull();
  });
});

describe("getCategories", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });

  it("returns unique sorted categories from the catalog", async () => {
    backendFetchMock.mockResolvedValueOnce({
      products: [
        fakeProduct({ category: "zucchini" }),
        fakeProduct({ category: "apple" }),
        fakeProduct({ category: "apple" }),
        fakeProduct({ category: "milk" }),
      ],
    });
    const result = await getCategories("retail");
    expect(result).toEqual(["apple", "milk", "zucchini"]);
  });
});
