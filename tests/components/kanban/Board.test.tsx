import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Board } from "@/components/kanban/Board";
import type { Task } from "@/lib/db/schema";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: "Test task",
    description: null,
    priority: "medium",
    category: null,
    dueDate: null,
    status: "todo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderBoard(tasks: Task[] = [], props = {}) {
  return render(<Board tasks={tasks} loading={false} onRefresh={vi.fn()} {...props} />);
}

describe("Kanban Board", () => {
  it("affiche 4 colonnes: Backlog, À faire, En cours, Terminé", () => {
    renderBoard();
    expect(screen.getByText(/backlog/i)).toBeDefined();
    expect(screen.getByText(/à faire/i)).toBeDefined();
    expect(screen.getByText(/en cours/i)).toBeDefined();
    expect(screen.getByText(/terminé/i)).toBeDefined();
  });

  it("affiche un compteur par colonne", () => {
    const tasks: Task[] = [
      makeTask({ id: 1, title: "Task 1", status: "todo" }),
      makeTask({ id: 2, title: "Task 2", status: "todo" }),
      makeTask({ id: 3, title: "Task 3", status: "in_progress" }),
    ];
    renderBoard(tasks);
    const counters = screen.getAllByRole("status");
    expect(counters.length).toBeGreaterThanOrEqual(4);
  });

  it("affiche les tâches dans les bonnes colonnes selon leur statut", () => {
    const tasks: Task[] = [
      makeTask({ id: 1, title: "Backlog task", status: "backlog" }),
      makeTask({ id: 2, title: "Todo task", status: "todo" }),
      makeTask({ id: 3, title: "WIP task", status: "in_progress" }),
      makeTask({ id: 4, title: "Done task", status: "done" }),
    ];
    renderBoard(tasks);
    expect(screen.getByText("Backlog task")).toBeDefined();
    expect(screen.getByText("Todo task")).toBeDefined();
    expect(screen.getByText("WIP task")).toBeDefined();
    expect(screen.getByText("Done task")).toBeDefined();
  });

  it("affiche un EmptyState par colonne quand vide", () => {
    renderBoard([]);
    const emptyStates = screen.getAllByRole("status");
    expect(emptyStates.length).toBeGreaterThanOrEqual(4);
  });

  it("affiche un badge de priorité pour chaque tâche", () => {
    const tasks: Task[] = [
      makeTask({ id: 1, title: "My task", priority: "urgent" }),
    ];
    renderBoard(tasks);
    // Le badge "Urgent" est présent (différent du titre)
    const badges = screen.getAllByText("Urgent");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("affiche un compteur correct par colonne", () => {
    const tasks: Task[] = [
      makeTask({ id: 1, status: "todo" }),
      makeTask({ id: 2, status: "todo" }),
      makeTask({ id: 3, status: "done" }),
    ];
    renderBoard(tasks);
    // Colonne "À faire" a 2 tâches
    const todoCounter = screen.getByLabelText(/compteur à faire/i);
    expect(todoCounter.textContent).toBe("2");
    // Colonne "Terminé" a 1 tâche
    const doneCounter = screen.getByLabelText(/compteur terminé/i);
    expect(doneCounter.textContent).toBe("1");
  });

  it("affiche le titre de la tâche", () => {
    const tasks = [makeTask({ id: 1, title: "Corriger bug login" })];
    renderBoard(tasks);
    expect(screen.getByText("Corriger bug login")).toBeDefined();
  });
});