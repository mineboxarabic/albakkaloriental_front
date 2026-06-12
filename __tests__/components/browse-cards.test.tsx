// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarqueCard, CategoryCard } from "@/components/browse-cards";

describe("MarqueCard", () => {
  it("renders the brand name, link href and image alt", () => {
    render(
      <MarqueCard name="Panzani" imageUrl="https://cdn/x.png" href="/products?marque=Panzani" />,
    );
    expect(screen.getByText("Panzani")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/products?marque=Panzani");
    expect(screen.getByAltText("Panzani")).toBeInTheDocument();
  });

  it("pluralises the product count", () => {
    render(<MarqueCard name="A" imageUrl={null} href="/a" productCount={2} />);
    expect(screen.getByText("2 produits")).toBeInTheDocument();
  });

  it("uses the singular for a single product", () => {
    render(<MarqueCard name="A" imageUrl={null} href="/a" productCount={1} />);
    expect(screen.getByText("1 produit")).toBeInTheDocument();
  });

  it("omits the product count when the prop is absent", () => {
    render(<MarqueCard name="A" imageUrl={null} href="/a" />);
    expect(screen.queryByText(/produit/i)).not.toBeInTheDocument();
  });
});

describe("CategoryCard", () => {
  it("uppercases the name and links to the filtered catalog", () => {
    render(<CategoryCard name="Boissons" image="/img/boissons.jpg" href="/products?category=Boissons" />);
    expect(screen.getByText("BOISSONS")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/products?category=Boissons");
  });
});
