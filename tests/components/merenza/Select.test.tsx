import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "@/components/merenza/Select";

const OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

describe("Merenza Select", () => {
  it("rend un label associé", () => {
    render(<Select label="Priorité" id="priority" options={OPTIONS} />);
    expect(screen.getByLabelText(/priorité/i)).toBeDefined();
  });

  it("rend toutes les options", () => {
    render(<Select label="Priorité" id="priority" options={OPTIONS} />);
    expect(screen.getByRole("option", { name: /low/i })).toBeDefined();
    expect(screen.getByRole("option", { name: /medium/i })).toBeDefined();
    expect(screen.getByRole("option", { name: /high/i })).toBeDefined();
    expect(screen.getByRole("option", { name: /urgent/i })).toBeDefined();
  });

  it("appelle onChange quand on sélectionne une option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select label="Priorité" id="priority" options={OPTIONS} onChange={onChange} />,
    );
    await user.selectOptions(screen.getByLabelText(/priorité/i), "high");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("affiche la valeur sélectionnée", () => {
    render(
      <Select label="Priorité" id="priority" options={OPTIONS} value="high" />,
    );
    const select = screen.getByLabelText(/priorité/i) as HTMLSelectElement;
    expect(select.value).toBe("high");
  });

  it("affiche un placeholder si fourni", () => {
    render(
      <Select
        label="Priorité"
        id="priority"
        options={OPTIONS}
        placeholder="Choisir..."
      />,
    );
    expect(screen.getByRole("option", { name: /choisir/i })).toBeDefined();
  });

  it("affiche une erreur avec role=alert", () => {
    render(
      <Select label="Priorité" id="priority" options={OPTIONS} error="Requis" />,
    );
    expect(screen.getByRole("alert")).toBeDefined();
  });

  it("génère un id automatiquement si non fourni", () => {
    render(<Select label="Auto" options={OPTIONS} />);
    expect(screen.getByLabelText(/auto/i)).toBeDefined();
  });
});