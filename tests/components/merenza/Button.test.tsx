import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/merenza/Button";

describe("Merenza Button", () => {
  it("rend un bouton avec le texte fourni", () => {
    render(<Button>Cliquer</Button>);
    expect(screen.getByRole("button", { name: /cliquer/i })).toBeDefined();
  });

  it("applique les 4 variants: primary, secondary, ghost, danger", () => {
    const { rerender } = render(<Button variant="primary">P</Button>);
    expect(screen.getByRole("button").className).toContain("bg-[#0F4C81]");

    rerender(<Button variant="secondary">S</Button>);
    expect(screen.getByRole("button").className).toContain("bg-[#E8B04B]");

    rerender(<Button variant="ghost">G</Button>);
    expect(screen.getByRole("button").className).toContain("bg-transparent");

    rerender(<Button variant="danger">D</Button>);
    expect(screen.getByRole("button").className).toContain("bg-red-600");
  });

  it("applique les 3 tailles: sm, md, lg", () => {
    const { rerender } = render(<Button size="sm">S</Button>);
    expect(screen.getByRole("button").className).toContain("text-sm");
    expect(screen.getByRole("button").className).toContain("px-3");

    rerender(<Button size="md">M</Button>);
    expect(screen.getByRole("button").className).toContain("text-base");
    expect(screen.getByRole("button").className).toContain("px-4");

    rerender(<Button size="lg">L</Button>);
    expect(screen.getByRole("button").className).toContain("text-lg");
    expect(screen.getByRole("button").className).toContain("px-6");
  });

  it("est désactivé quand disabled=true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("appelle onClick quand cliqué", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("ne déclenche pas onClick quand désactivé", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        No click
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});