import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuantityStepper } from "@/components/quantity-stepper";

function setup(value = 1) {
  const onChange = vi.fn();
  render(
    <QuantityStepper
      value={value}
      onChange={onChange}
      decreaseLabel="Diminuer"
      increaseLabel="Augmenter"
      inputLabel="Quantité"
    />,
  );
  const input = screen.getByLabelText("Quantité") as HTMLInputElement;
  const type = (text: string) => {
    fireEvent.focus(input);
    // Typed one key at a time, like a person.
    let draft = "";
    for (const char of text) {
      draft = `${input.value === String(value) && draft === "" ? "" : input.value}${char}`;
      fireEvent.change(input, { target: { value: draft } });
    }
    fireEvent.blur(input);
  };
  return { onChange, input, type };
}

describe("QuantityStepper typed quantities", () => {
  it("keeps 12 when 12 is typed", () => {
    const { onChange, type } = setup();
    type("12");
    expect(onChange).toHaveBeenCalledWith(12);
  });

  it("does not turn 1.5 into 15: only the whole part is kept", () => {
    const { onChange, type } = setup(3);
    type("1.5");
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("does the same with a French decimal comma", () => {
    const { onChange, type } = setup(3);
    type("2,5");
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("explains that only whole quantities are accepted while a decimal is typed", () => {
    const { input } = setup();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "1.5" } });
    expect(screen.getByRole("status")).toHaveTextContent("Quantité entière uniquement");
  });

  it("accepts at most three digits (999 at most)", () => {
    const { onChange, type } = setup();
    type("1500");
    expect(onChange).toHaveBeenCalledWith(150);
  });
});
