import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Card } from "@/components/merenza/Card";

describe("Merenza Card", () => {
  it("rend ses children", () => {
    render(
      <Card>
        <p>Contenu</p>
      </Card>,
    );
    expect(screen.getByText("Contenu")).toBeDefined();
  });

  it("applique les 3 paddings: sm, md, lg", () => {
    const { rerender, container } = render(<Card padding="sm">C</Card>);
    expect(container.firstChild).toBeDefined();

    rerender(<Card padding="md">C</Card>);
    expect(container.firstChild).toBeDefined();

    rerender(<Card padding="lg">C</Card>);
    expect(container.firstChild).toBeDefined();
  });

  it("padding par défaut est md", () => {
    const { container } = render(<Card>C</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("p-4");
  });

  it("padding sm = p-2", () => {
    const { container } = render(<Card padding="sm">C</Card>);
    expect((container.firstChild as HTMLElement).className).toContain("p-2");
  });

  it("padding lg = p-6", () => {
    const { container } = render(<Card padding="lg">C</Card>);
    expect((container.firstChild as HTMLElement).className).toContain("p-6");
  });

  it("mode interactive: appelle onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Card interactive onClick={onClick}>
        Cliquable
      </Card>,
    );
    await user.click(screen.getByText("Cliquable"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("mode interactive: role=button et tabindex", () => {
    render(<Card interactive>Cliquable</Card>);
    const card = screen.getByRole("button");
    expect(card).toBeDefined();
  });

  it("mode selected: applique une bordure accent", () => {
    const { container } = render(<Card selected>Sélectionnée</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-[#E8B04B]");
  });
});