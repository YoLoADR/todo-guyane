import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/merenza/Badge";

describe("Merenza Badge", () => {
  it("rend ses children", () => {
    render(<Badge>High</Badge>);
    expect(screen.getByText("High")).toBeDefined();
  });

  it("applique rounded-full", () => {
    const { container } = render(<Badge>Test</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("rounded-full");
  });

  const variants = [
    "priority-low",
    "priority-medium",
    "priority-high",
    "priority-urgent",
    "status-backlog",
    "status-todo",
    "status-in_progress",
    "status-done",
    "category",
    "default",
    "outline",
    "success",
    "danger",
  ] as const;

  variants.forEach((variant) => {
    it(`variant="${variant}" ne crash pas`, () => {
      const { container } = render(<Badge variant={variant}>X</Badge>);
      expect(container.firstChild).toBeDefined();
    });
  });

  it("variant priority-high utilise la couleur rouge", () => {
    const { container } = render(<Badge variant="priority-high">High</Badge>);
    expect((container.firstChild as HTMLElement).className).toContain("red");
  });

  it("variant priority-urgent utilise une couleur distinctive", () => {
    const { container } = render(
      <Badge variant="priority-urgent">Urgent</Badge>,
    );
    const cls = (container.firstChild as HTMLElement).className;
    expect(cls).toMatch(/red|orange|rose/);
  });

  it("variant status-done utilise la couleur verte", () => {
    const { container } = render(<Badge variant="status-done">Done</Badge>);
    expect((container.firstChild as HTMLElement).className).toContain("green");
  });
});