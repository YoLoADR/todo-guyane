import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";

// Mock global.fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

function renderDialog(props = {}) {
  const onSaved = vi.fn();
  const onClose = vi.fn();
  render(
    <TaskFormDialog open={true} onClose={onClose} onSaved={onSaved} {...props} />,
  );
  return { onSaved, onClose };
}

describe("TaskFormDialog — Création de tâche", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("affiche le formulaire quand open=true", () => {
    renderDialog();
    expect(screen.getByLabelText(/titre/i)).toBeDefined();
    expect(screen.getByLabelText(/priorité/i)).toBeDefined();
  });

  it("ne rend rien quand open=false", () => {
    renderDialog({ open: false });
    expect(screen.queryByLabelText(/titre/i)).toBeNull();
  });

  it("affiche le bouton Enregistrer", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: /enregistrer/i })).toBeDefined();
  });

  it("affiche le bouton Annuler", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: /annuler/i })).toBeDefined();
  });

  it("appelle onClose quand on clique sur Annuler", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();
    await user.click(screen.getByRole("button", { name: /annuler/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("affiche une erreur si titre vide au submit", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText(/titre est obligatoire/i)).toBeDefined();
  });

  it("affiche une erreur si titre > 200 caractères", async () => {
    const user = userEvent.setup();
    renderDialog();
    const titleInput = screen.getByLabelText(/titre/i);
    await user.type(titleInput, "a".repeat(201));
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));
    expect(screen.getByText(/200 caractères/i)).toBeDefined();
  });

  it("soumet un POST valide et appelle onSaved", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1, title: "Test", status: "todo", priority: "medium" }),
    });
    const { onSaved } = renderDialog();

    await user.type(screen.getByLabelText(/titre/i), "Corriger le bug");
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tasks",
      expect.objectContaining({ method: "POST" }),
    );
    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  it("soumet avec la priorité par défaut medium si non sélectionnée", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1, title: "Test", priority: "medium" }),
    });
    renderDialog();

    await user.type(screen.getByLabelText(/titre/i), "Acheter du café");
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.priority).toBe("medium");
  });

  it("permet de sélectionner une priorité", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1, title: "Test", priority: "high" }),
    });
    renderDialog();

    await user.type(screen.getByLabelText(/titre/i), "Tâche urgente");
    await user.selectOptions(screen.getByLabelText(/priorité/i), "high");
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.priority).toBe("high");
  });

  it("permet de remplir une catégorie", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1, title: "Test", category: "Frontend" }),
    });
    renderDialog();

    await user.type(screen.getByLabelText(/titre/i), "Test");
    await user.type(screen.getByLabelText(/catégorie/i), "Frontend");
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.category).toBe("Frontend");
    });
  });

  it("affiche une erreur serveur si POST échoue", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ errors: [{ field: "title", message: "Titre invalide" }] }),
    });
    renderDialog();

    await user.type(screen.getByLabelText(/titre/i), "Test");
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
    });
  });
});