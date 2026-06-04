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
    priceLevelC: null,
    priceLevelD: null,
    priceLevelE: null,
    priceLevelF: null,
    retailStatus: "VISIBLE",
    wholesaleStatus: "VISIBLE",
    isOutOfStock: false,
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

    const { products: result } = await getProducts({ audience: "retail" });

    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/retail/catalog",
      expect.objectContaining({ auth: "optional" }),
    );
    expect(result).toHaveLength(2);
    expect(result[0].sellingPrice).toBe(4.99);
  });

  it("only includes products visible to retail and respects retail status", async () => {
    backendFetchMock.mockResolvedValueOnce({
      products: [
        fakeProduct({ id: "retail", visibility: "RETAIL" }),
        fakeProduct({ id: "both", visibility: "BOTH" }),
        fakeProduct({ id: "wholesale", visibility: "WHOLESALE" }),
        fakeProduct({ id: "hidden", visibility: "BOTH", retailStatus: "HIDDEN" }),
        fakeProduct({
          id: "manual-oos",
          visibility: "BOTH",
          retailStatus: "OUT_OF_STOCK",
          isOutOfStock: false,
        }),
      ],
    });

    const { products: result } = await getProducts({ audience: "retail" });

    expect(result.map((p) => p.id)).toEqual(["retail", "both", "manual-oos"]);
    expect(result.find((p) => p.id === "manual-oos")?.isOutOfStock).toBe(true);
  });

  it("supports legacy B2C status names from older catalog responses", async () => {
    backendFetchMock.mockResolvedValueOnce({
      products: [
        fakeProduct({ id: "legacy-hidden", retailStatus: undefined, b2cStatus: "HIDDEN" }),
        fakeProduct({ id: "legacy-oos", retailStatus: undefined, b2cStatus: "OUT_OF_STOCK" }),
      ],
    });

    const { products: result } = await getProducts({ audience: "retail" });

    expect(result.map((p) => p.id)).toEqual(["legacy-oos"]);
    expect(result[0].isOutOfStock).toBe(true);
  });

  it("getProducts filters by category client-side", async () => {
    backendFetchMock.mockResolvedValueOnce({
      products: [
        fakeProduct({ id: "a", category: "epicerie" }),
        fakeProduct({ id: "b", category: "boissons" }),
      ],
    });
    const { products: result } = await getProducts({ audience: "retail", category: "boissons" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("b");
  });

  it("getProducts filters by category client-side (including multi-category products)", async () => {
    backendFetchMock.mockResolvedValue({
      products: [
        fakeProduct({ id: "a", category: "epicerie, boissons" }),
        fakeProduct({ id: "b", category: "boissons" }),
        fakeProduct({ id: "c", category: "epicerie" }),
      ],
    });
    const { products: resBoissons } = await getProducts({ audience: "retail", category: "boissons" });
    expect(resBoissons).toHaveLength(2);
    expect(resBoissons.map(p => p.id)).toEqual(["a", "b"]);

    const { products: resEpicerie } = await getProducts({ audience: "retail", category: "epicerie" });
    expect(resEpicerie).toHaveLength(2);
    expect(resEpicerie.map(p => p.id)).toEqual(["a", "c"]);
  });

  it("getProducts applies take + skip pagination client-side", async () => {
    backendFetchMock.mockResolvedValueOnce({
      products: Array.from({ length: 5 }, (_, i) =>
        fakeProduct({ id: `p${i}` }),
      ),
    });
    const { products: result } = await getProducts({ audience: "retail", skip: 1, take: 2 });
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

  it("only includes products visible to pros and respects wholesale status", async () => {
    backendFetchMock.mockResolvedValueOnce({
      products: [
        fakeProduct({ id: "retail", visibility: "RETAIL" }),
        fakeProduct({ id: "wholesale", visibility: "WHOLESALE" }),
        fakeProduct({ id: "both", visibility: "BOTH" }),
        fakeProduct({ id: "hidden", visibility: "BOTH", wholesaleStatus: "HIDDEN" }),
        fakeProduct({
          id: "stock-empty",
          visibility: "WHOLESALE",
          wholesaleStatus: "VISIBLE",
          isOutOfStock: true,
        }),
      ],
    });

    const { products: result } = await getProducts({ audience: "pro" });

    expect(result.map((p) => p.id)).toEqual(["wholesale", "both", "stock-empty"]);
    expect(result.find((p) => p.id === "stock-empty")?.isOutOfStock).toBe(true);
  });

  it("supports legacy B2B status names from older catalog responses", async () => {
    backendFetchMock.mockResolvedValueOnce({
      products: [
        fakeProduct({
          id: "legacy-hidden",
          visibility: "WHOLESALE",
          wholesaleStatus: undefined,
          b2bStatus: "HIDDEN",
        }),
        fakeProduct({
          id: "legacy-visible",
          visibility: "WHOLESALE",
          wholesaleStatus: undefined,
          b2bStatus: "VISIBLE",
        }),
      ],
    });

    const { products: result } = await getProducts({ audience: "pro" });

    expect(result.map((p) => p.id)).toEqual(["legacy-visible"]);
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

  it("returns null for a product hidden from that audience", async () => {
    backendFetchMock.mockResolvedValueOnce({
      products: [fakeProduct({ id: "a", visibility: "WHOLESALE" })],
    });

    const result = await getProduct("a", "retail");

    expect(result).toBeNull();
  });
});

describe("getCategories", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });

  it("returns sorted categories from the backend categories API", async () => {
    backendFetchMock.mockResolvedValueOnce({
      categories: [
        { id: "1", name: "apple" },
        { id: "2", name: "milk" },
        { id: "3", name: "zucchini" },
      ],
    });
    const result = await getCategories("retail");
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/public/categories",
      expect.objectContaining({ auth: "none" }),
    );
    expect(result).toEqual(["apple", "milk", "zucchini"]);
  });
});
