import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "@/components/merenza/Modal";

describe("Merenza Modal", () => {
  it("ne rend rien quand open=false", () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <p>Contenu modal</p>
      </Modal>,
    );
    expect(screen.queryByText("Contenu modal")).toBeNull();
  });

  it("rend ses children quand open=true", () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Contenu modal</p>
      </Modal>,
    );
    expect(screen.getByText("Contenu modal")).toBeDefined();
  });

  it("a role=dialog et aria-modal=true", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Titre modal">
        <p>Contenu</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("affiche le titre fourni", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Mon titre">
        <p>X</p>
      </Modal>,
    );
    expect(screen.getByText("Mon titre")).toBeDefined();
  });

  it("appelle onClose quand on clique sur le bouton fermer", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>X</p>
      </Modal>,
    );
    const buttons = screen.getAllByRole("button");
    // Le bouton X (fermer) est le 2e (overlay = 1er)
    const closeBtn = buttons.find((b) => b.getAttribute("aria-label") === "Fermer");
    expect(closeBtn).toBeDefined();
    await user.click(closeBtn!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onClose quand on clique sur l'overlay", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>X</p>
      </Modal>,
    );
    const overlay = screen.getByTestId("modal-overlay").querySelector("button");
    expect(overlay).toBeDefined();
    await user.click(overlay!);
    expect(onClose).toHaveBeenCalled();
  });

  it("appelle onClose avec la touche Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>X</p>
      </Modal>,
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});