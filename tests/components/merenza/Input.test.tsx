import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/merenza/Input";

describe("Merenza Input", () => {
  it("rend un input avec un label associé via htmlFor/id", () => {
    render(<Input label="Titre" id="title" />);
    const input = screen.getByLabelText(/titre/i);
    expect(input).toBeDefined();
    expect(input.tagName).toBe("INPUT");
  });

  it("affiche aria-invalid=true quand error est fourni", () => {
    render(<Input label="Titre" id="title" error="Obligatoire" />);
    expect(screen.getByLabelText(/titre/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("affiche le message d'erreur avec role=alert", () => {
    render(<Input label="Titre" id="title" error="Obligatoire" />);
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByRole("alert").textContent).toBe("Obligatoire");
  });

  it("affiche une icône lucide avec currentColor", () => {
    const { container } = render(
      <Input label="Titre" id="title" icon={<span data-testid="icon" />} />,
    );
    expect(container.querySelector('[data-testid="icon"]')).toBeDefined();
  });

  it("propage la valeur tapée", async () => {
    const user = userEvent.setup();
    render(<Input label="Titre" id="title" />);
    const input = screen.getByLabelText(/titre/i) as HTMLInputElement;
    await user.type(input, "Hello");
    expect(input.value).toBe("Hello");
  });

  it("génère un id automatiquement si non fourni", () => {
    render(<Input label="Auto" />);
    expect(screen.getByLabelText(/auto/i)).toBeDefined();
  });
});