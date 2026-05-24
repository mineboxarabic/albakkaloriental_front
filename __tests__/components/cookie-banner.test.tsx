// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CookieBanner } from "@/components/cookie-banner";

const STORAGE_KEY = "cookie-consent";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("CookieBanner", () => {
  it("renders banner when no consent stored", () => {
    render(<CookieBanner />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /j'ai compris/i })).toBeInTheDocument();
  });

  it("does not render when consent already stored", () => {
    window.localStorage.setItem(STORAGE_KEY, "accepted");
    render(<CookieBanner />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("persists accepted on J'ai compris click and hides banner", () => {
    render(<CookieBanner />);
    fireEvent.click(screen.getByRole("button", { name: /j'ai compris/i }));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("accepted");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("persists rejected on X close click and hides banner", () => {
    render(<CookieBanner />);
    fireEvent.click(screen.getByRole("button", { name: /fermer/i }));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("rejected");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
