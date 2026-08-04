import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/merenza/Input";
import { Search } from "lucide-react";

describe("Input", () => {
  it("renders a label linked to the input", () => {
    render(<Input label="Titre" name="title" />);
    const input = screen.getByLabelText("Titre");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("renders an error message and aria-invalid", () => {
    render(<Input label="Titre" name="title" error="Le titre est obligatoire" />);
    const input = screen.getByLabelText("Titre");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Le titre est obligatoire");
  });

  it("renders an icon with currentColor", () => {
    render(<Input label="Recherche" name="search" icon={Search} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(document.querySelector("svg")).toHaveAttribute("stroke", "currentColor");
  });

  it("forwards type and placeholder", () => {
    render(<Input label="Date" name="dueDate" type="date" placeholder="jj/mm/aaaa" />);
    const input = screen.getByLabelText("Date");
    expect(input).toHaveAttribute("type", "date");
    expect(input).toHaveAttribute("placeholder", "jj/mm/aaaa");
  });
});
