import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/merenza/Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Haute</Badge>);
    expect(screen.getByText("Haute")).toBeInTheDocument();
  });

  it("is rounded-full by default", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toHaveClass("rounded-full");
  });

  it("supports priority variants", () => {
    const { rerender } = render(<Badge variant="priority-low">Low</Badge>);
    expect(screen.getByText("Low")).toHaveClass("text-blue-400");

    rerender(<Badge variant="priority-medium">Medium</Badge>);
    expect(screen.getByText("Medium")).toHaveClass("text-amber-400");

    rerender(<Badge variant="priority-high">High</Badge>);
    expect(screen.getByText("High")).toHaveClass("text-red-400");
  });

  it("supports status variants", () => {
    const { rerender } = render(<Badge variant="status-todo">À faire</Badge>);
    expect(screen.getByText("À faire")).toHaveClass("text-zinc-400");

    rerender(<Badge variant="status-in_progress">En cours</Badge>);
    expect(screen.getByText("En cours")).toHaveClass("text-amber-400");

    rerender(<Badge variant="status-done">Terminé</Badge>);
    expect(screen.getByText("Terminé")).toHaveClass("text-green-400");
  });

  it("supports outline, success and danger variants", () => {
    const { rerender } = render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).toHaveClass("border");

    rerender(<Badge variant="success">Success</Badge>);
    expect(screen.getByText("Success")).toHaveClass("text-green-400");

    rerender(<Badge variant="danger">Danger</Badge>);
    expect(screen.getByText("Danger")).toHaveClass("text-red-400");
  });
});
