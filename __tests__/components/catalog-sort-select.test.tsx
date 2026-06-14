// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CatalogSortSelect } from "@/components/catalog-sort-select";

const routerPush = vi.fn();
const searchParamsStore = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
  useSearchParams: () => searchParamsStore,
  usePathname: () => "/products",
}));

function setParams(init: Record<string, string>) {
  for (const key of Array.from(searchParamsStore.keys())) searchParamsStore.delete(key);
  for (const [k, v] of Object.entries(init)) searchParamsStore.set(k, v);
}

beforeEach(() => {
  routerPush.mockReset();
  setParams({});
});

describe("CatalogSortSelect", () => {
  it("renders all sort options", () => {
    render(<CatalogSortSelect />);
    expect(screen.getByRole("option", { name: "Pertinence" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Prix : croissant" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Prix : décroissant" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Nom : A → Z" })).toBeInTheDocument();
  });

  it("reflects the current ?sort param as the selected value", () => {
    setParams({ sort: "price-asc" });
    render(<CatalogSortSelect />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("price-asc");
  });

  it("falls back to default for a missing or unknown sort value", () => {
    setParams({ sort: "bogus" });
    render(<CatalogSortSelect />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("default");
  });

  it("pushes ?sort= when a non-default option is chosen", () => {
    render(<CatalogSortSelect />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "price-desc" } });
    expect(routerPush).toHaveBeenCalledWith("/products?sort=price-desc");
  });

  it("removes the sort param when returning to Pertinence and preserves other params", () => {
    setParams({ category: "Boissons", sort: "name-asc" });
    render(<CatalogSortSelect />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "default" } });
    expect(routerPush).toHaveBeenCalledWith("/products?category=Boissons");
  });
});
