import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/merenza/PageHeader";

describe("PageHeader", () => {
  it("renders h1 title and subtitle", () => {
    render(<PageHeader title="Todo Guyane" subtitle="Kanban board" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Todo Guyane");
    expect(screen.getByText("Kanban board")).toHaveClass("text-mrz-text-muted");
  });

  it("renders actions slot", () => {
    render(<PageHeader title="Todo" actions={<button>Action</button>} />);
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});
