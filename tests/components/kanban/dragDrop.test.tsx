import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Board } from "@/components/kanban/Board";

global.fetch = vi.fn();

function mockFetchOnce(tasks: any[]) {
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => tasks,
  });
}

function mockFetchOK() {
  (global.fetch as any).mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
  });
}

const taskInTodo = {
  id: 1,
  title: "Draggable Task",
  status: "todo",
  priority: "medium",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const taskInProgress = {
  id: 2,
  title: "In Progress Task",
  status: "in_progress",
  priority: "low",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("Board — Drag & Drop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchOK(); // default for PATCH calls
  });

  it("marks task cards as draggable", async () => {
    mockFetchOnce([taskInTodo]);

    render(<Board />);

    await waitFor(() => {
      expect(screen.getByText("Draggable Task")).toBeInTheDocument();
    });

    const card = screen.getByText("Draggable Task").closest("[draggable]");
    expect(card).toHaveAttribute("draggable", "true");
  });

  it("sends PATCH to update status when task is dropped on a new column", async () => {
    mockFetchOnce([taskInTodo]);

    render(<Board />);

    await waitFor(() => {
      expect(screen.getByText("Draggable Task")).toBeInTheDocument();
    });

    // Find the "En cours" column drop zone
    const enCoursColumn = screen.getByLabelText("En cours");
    const dropZone = enCoursColumn.querySelector("[data-drop-zone]") as HTMLElement;

    // Simulate dragStart on the task card and drop on the column
    const card = screen.getByText("Draggable Task").closest("[draggable]")!;

    fireEvent.dragStart(card, { dataTransfer: { setData: vi.fn(), effectAllowed: "move" } });
    fireEvent.dragOver(dropZone, { dataTransfer: { dropEffect: "move" } });
    fireEvent.drop(dropZone, { dataTransfer: { getData: () => "1" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/tasks/1",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "in_progress" }),
        })
      );
    });
  });

  it("moves task visually after successful drop", async () => {
    mockFetchOnce([taskInTodo]);

    render(<Board />);

    await waitFor(() => {
      expect(screen.getByText("Draggable Task")).toBeInTheDocument();
    });

    // Task should be in "À faire" column initially
    const aFaireColumn = screen.getByLabelText("À faire");
    expect(aFaireColumn).toHaveTextContent("Draggable Task");

    // Drop on "En cours"
    const enCoursColumn = screen.getByLabelText("En cours");
    const dropZone = enCoursColumn.querySelector("[data-drop-zone]") as HTMLElement;

    const card = screen.getByText("Draggable Task").closest("[draggable]") as HTMLElement;

    fireEvent.dragStart(card, { dataTransfer: { setData: vi.fn(), effectAllowed: "move" } });
    fireEvent.dragOver(dropZone, { dataTransfer: { dropEffect: "move" } });
    fireEvent.drop(dropZone, { dataTransfer: { getData: () => "1" } });

    await waitFor(() => {
      expect(enCoursColumn).toHaveTextContent("Draggable Task");
    });
  });

  it("announces drag move via aria-live", async () => {
    mockFetchOnce([taskInTodo]);

    render(<Board />);

    await waitFor(() => {
      expect(screen.getByText("Draggable Task")).toBeInTheDocument();
    });

    const liveRegion = screen.getByTestId("drag-announcement");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");

    const enCoursColumn = screen.getByLabelText("En cours");
    const dropZone = enCoursColumn.querySelector("[data-drop-zone]") as HTMLElement;
    const card = screen.getByText("Draggable Task").closest("[draggable]") as HTMLElement;

    fireEvent.dragStart(card, { dataTransfer: { setData: vi.fn(), effectAllowed: "move" } });
    fireEvent.dragOver(dropZone, { dataTransfer: { dropEffect: "move" } });
    fireEvent.drop(dropZone, { dataTransfer: { getData: () => "1" } });

    await waitFor(() => {
      expect(liveRegion).toHaveTextContent(/en cours/i);
    });
  });

  it("shows alert on PATCH failure and keeps task in original column", async () => {
    mockFetchOnce([taskInTodo]);
    // Make PATCH fail
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    render(<Board />);

    await waitFor(() => {
      expect(screen.getByText("Draggable Task")).toBeInTheDocument();
    });

    const enCoursColumn = screen.getByLabelText("En cours");
    const dropZone = enCoursColumn.querySelector("[data-drop-zone]") as HTMLElement;
    const card = screen.getByText("Draggable Task").closest("[draggable]") as HTMLElement;

    fireEvent.dragStart(card, { dataTransfer: { setData: vi.fn(), effectAllowed: "move" } });
    fireEvent.dragOver(dropZone, { dataTransfer: { dropEffect: "move" } });
    fireEvent.drop(dropZone, { dataTransfer: { getData: () => "1" } });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    // Task should stay in "À faire"
    const aFaireColumn = screen.getByLabelText("À faire");
    expect(aFaireColumn).toHaveTextContent("Draggable Task");
  });

  it("moves task with keyboard arrow right to next column", async () => {
    mockFetchOnce([taskInTodo]);

    render(<Board />);

    await waitFor(() => {
      expect(screen.getByText("Draggable Task")).toBeInTheDocument();
    });

    const card = screen.getByText("Draggable Task").closest("[draggable]") as HTMLElement;
    card.focus();

    fireEvent.keyDown(card, { key: "ArrowRight" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/tasks/1",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "in_progress" }),
        })
      );
    });
  });

  it("moves task with keyboard arrow left to previous column", async () => {
    mockFetchOnce([taskInProgress]);

    render(<Board />);

    await waitFor(() => {
      expect(screen.getByText("In Progress Task")).toBeInTheDocument();
    });

    const card = screen.getByText("In Progress Task").closest("[draggable]") as HTMLElement;
    card.focus();

    fireEvent.keyDown(card, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/tasks/2",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "todo" }),
        })
      );
    });
  });
});