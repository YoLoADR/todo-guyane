import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Card } from "@/components/merenza/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Contenu</Card>);
    expect(screen.getByText("Contenu")).toBeInTheDocument();
  });

  it("supports padding sizes", () => {
    const { rerender, container } = render(<Card padding="sm">Small</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveClass("p-3");

    rerender(<Card padding="md">Medium</Card>);
    expect(card).toHaveClass("p-4");

    rerender(<Card padding="lg">Large</Card>);
    expect(card).toHaveClass("p-6");
  });

  it("has interactive hover styles when interactive", () => {
    const { container } = render(<Card interactive>Hover me</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveClass("hover:border-mrz-accent");
  });

  it("shows selected state", () => {
    const { container } = render(<Card selected>Selected</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveClass("border-mrz-accent");
  });

  it("is keyboard accessible when interactive with onClick", () => {
    const onClick = vi.fn();
    const { container } = render(<Card interactive onClick={onClick}>Interactive</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveAttribute("role", "button");
    expect(card).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(card, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(card, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("has no role=button when not interactive", () => {
    const { container } = render(<Card>Plain</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
  });
});
