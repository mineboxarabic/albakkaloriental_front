// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CatalogSearchInput } from "@/components/catalog-search-input";

const routerPush = vi.fn();
const searchParamsStore = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
  useSearchParams: () => searchParamsStore,
  usePathname: () => "/products",
}));

beforeEach(() => {
  routerPush.mockReset();
  for (const key of Array.from(searchParamsStore.keys())) {
    searchParamsStore.delete(key);
  }
  vi.useFakeTimers();
});

describe("CatalogSearchInput", () => {
  it("renders an empty search input by default", () => {
    render(<CatalogSearchInput />);
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("debounces typing and pushes ?q= to the router", async () => {
    render(<CatalogSearchInput />);
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "olive" } });
    expect(routerPush).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(260);
    });
    expect(routerPush).toHaveBeenCalledWith("/products?q=olive");
    vi.useRealTimers();
  });

  it("shows a clear button once typed and resets value on click", async () => {
    render(<CatalogSearchInput />);
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "olive" } });
    const clear = screen.getByRole("button", { name: /effacer/i });
    fireEvent.click(clear);
    expect(input.value).toBe("");
    vi.useRealTimers();
  });
});
