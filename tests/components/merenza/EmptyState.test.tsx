import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/merenza/EmptyState";
import { Inbox } from "lucide-react";
import { Button } from "@/components/merenza/Button";

describe("EmptyState", () => {
  it("renders icon, title and description", () => {
    render(
      <EmptyState icon={Inbox} title="Aucune tâche" description="Créez votre première tâche" />
    );
    expect(document.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Aucune tâche" })).toBeInTheDocument();
    expect(screen.getByText("Créez votre première tâche")).toBeInTheDocument();
  });

  it("has role=status for assistive tech", () => {
    render(<EmptyState icon={Inbox} title="Aucune tâche" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders icon at 32px", () => {
    render(<EmptyState icon={Inbox} title="Aucune tâche" />);
    expect(document.querySelector("svg")).toHaveAttribute("width", "32");
    expect(document.querySelector("svg")).toHaveAttribute("height", "32");
  });

  it("renders an action button", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="Vide"
        description="Rien à voir"
        action={<Button>Créer une tâche</Button>}
      />
    );
    expect(screen.getByRole("button", { name: "Créer une tâche" })).toBeInTheDocument();
  });
});
