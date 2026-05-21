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

import { getUpcomingDeliveries } from "@/lib/catalog";

describe("getUpcomingDeliveries", () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls /api/v1/public/deliveries/upcoming with auth:none", async () => {
    backendFetchMock.mockResolvedValueOnce({ deliveries: [] });
    await getUpcomingDeliveries();
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/public/deliveries/upcoming?limit=6",
      expect.objectContaining({ auth: "none" }),
    );
  });

  it("maps back response into UpcomingDelivery shape", async () => {
    backendFetchMock.mockResolvedValueOnce({
      deliveries: [
        {
          id: "d1",
          scheduledDate: "2026-06-15T08:00:00.000Z",
          comment: "Tournée test",
          cities: [
            { id: "c1", name: "Draguignan", position: 0 },
            { id: "c2", name: "Le Muy", position: 1 },
          ],
        },
      ],
    });

    const result = await getUpcomingDeliveries();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("d1");
    expect(result[0].scheduledDate).toBeInstanceOf(Date);
    expect(result[0].comment).toBe("Tournée test");
    expect(result[0].cities).toEqual([
      { id: "c1", name: "Draguignan", position: 0 },
      { id: "c2", name: "Le Muy", position: 1 },
    ]);
  });

  it("forwards the limit param", async () => {
    backendFetchMock.mockResolvedValueOnce({ deliveries: [] });
    await getUpcomingDeliveries(3);
    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/v1/public/deliveries/upcoming?limit=3",
      expect.anything(),
    );
  });

  it("returns empty array on backend error (silent degradation for home page)", async () => {
    const ApiClientError = (await import("@/lib/api-client")).ApiClientError;
    backendFetchMock.mockRejectedValueOnce(new ApiClientError(500, "boom"));
    const result = await getUpcomingDeliveries();
    expect(result).toEqual([]);
  });
});
