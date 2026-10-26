// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { checkZone } = vi.hoisted(() => ({ checkZone: vi.fn() }));
vi.mock("@/actions/delivery-zone", () => ({ checkDeliveryZone: checkZone }));
vi.mock("@/actions/retail-auth", () => ({ registerRetail: vi.fn() }));
vi.mock("@/components/language-provider", () => ({ useLanguage: () => ({ t: (text: string) => text }) }));

import { RegisterParticulierForm } from "@/app/(retail)/register/particulier/register-particulier-form";
import { AddressAutocompleteFields } from "@/components/address-autocomplete-fields";

beforeEach(() => {
  vi.useFakeTimers();
  checkZone.mockReset().mockResolvedValue({ allowed: false, label: null });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("registration outside the delivery area", () => {
  it("keeps registration available and shows no delivery warning for Paris", async () => {
    render(<RegisterParticulierForm />);
    fireEvent.change(screen.getByLabelText("Code postal"), { target: { value: "75001" } });
    fireEvent.change(screen.getByLabelText("Ville"), { target: { value: "Paris" } });
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(screen.queryByText(/Nous ne livrons pas encore/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Créer mon compte" })).toBeEnabled();
    expect(checkZone).not.toHaveBeenCalled();
  });

  it("still checks delivery availability by default in delivery address forms", async () => {
    render(<AddressAutocompleteFields defaults={{ address: "", postalCode: "75001", city: "Paris" }} errors={{}} />);
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(checkZone).toHaveBeenCalledWith("75001");
    expect(screen.getByText(/Nous ne livrons pas encore/)).toBeInTheDocument();
  });
});
