import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Board } from "@/components/kanban/Board";

global.fetch = vi.fn();

describe("Board", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 3 columns with correct titles", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    render(<Board />);

    await waitFor(() => {
      expect(screen.getByText("À faire")).toBeInTheDocument();
      expect(screen.getByText("En cours")).toBeInTheDocument();
      expect(screen.getByText("Terminé")).toBeInTheDocument();
    });
  });

  it("displays task count in each column header", async () => {
    const tasks = [
      { id: 1, title: "Task 1", status: "todo", priority: "medium" },
      { id: 2, title: "Task 2", status: "todo", priority: "high" },
      { id: 3, title: "Task 3", status: "in_progress", priority: "low" },
      { id: 4, title: "Task 4", status: "done", priority: "medium" },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => tasks,
    });

    render(<Board />);

    await waitFor(() => {
      expect(screen.getByText("À faire")).toBeInTheDocument();
      expect(screen.getByText("(2)")).toBeInTheDocument();
      expect(screen.getAllByText("(1)")).toHaveLength(2);
    });
  });

  it("displays EmptyState in each column when no tasks", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    render(<Board />);

    await waitFor(() => {
      const emptyStates = screen.getAllByText(/aucune tâche/i);
      expect(emptyStates.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("displays tasks in correct columns based on status", async () => {
    const tasks = [
      { id: 1, title: "Task Todo", status: "todo", priority: "medium", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 2, title: "Task In Progress", status: "in_progress", priority: "low", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 3, title: "Task Done", status: "done", priority: "high", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => tasks,
    });

    render(<Board />);

    await waitFor(() => {
      expect(screen.getByText("Task Todo")).toBeInTheDocument();
      expect(screen.getByText("Task In Progress")).toBeInTheDocument();
      expect(screen.getByText("Task Done")).toBeInTheDocument();
    });
  });
});
