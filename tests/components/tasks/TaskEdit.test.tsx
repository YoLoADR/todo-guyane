import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";

global.fetch = vi.fn();

const existingTask = {
  id: 5,
  title: "Ancien titre",
  description: "Ancienne description",
  priority: "low" as const,
  category: "Backend",
  dueDate: "2026-12-31T00:00:00.000Z",
  status: "todo" as const,
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
};

describe("TaskFormDialog — edit mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pre-fills form fields with initialData in edit mode", () => {
    render(
      <TaskFormDialog
        isOpen={true}
        mode="edit"
        taskId={existingTask.id}
        initialData={existingTask}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Ancien titre")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Ancienne description")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Backend")).toBeInTheDocument();
  });

  it("displays 'Modifier la tâche' as dialog title in edit mode", () => {
    render(
      <TaskFormDialog
        isOpen={true}
        mode="edit"
        taskId={existingTask.id}
        initialData={existingTask}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText("Modifier la tâche")).toBeInTheDocument();
  });

  it("sends PATCH request with updated title on submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onClose = vi.fn();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ...existingTask, title: "Nouveau titre", updatedAt: "2026-08-04T00:00:00.000Z" }),
    });

    render(
      <TaskFormDialog
        isOpen={true}
        mode="edit"
        taskId={existingTask.id}
        initialData={existingTask}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    const titleInput = screen.getByDisplayValue("Ancien titre");
    await user.clear(titleInput);
    await user.type(titleInput, "Nouveau titre");
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/tasks/5",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it("shows validation error when title is cleared in edit mode", async () => {
    const user = userEvent.setup();

    render(
      <TaskFormDialog
        isOpen={true}
        mode="edit"
        taskId={existingTask.id}
        initialData={existingTask}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const titleInput = screen.getByDisplayValue("Ancien titre");
    await user.clear(titleInput);
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(screen.getByText(/titre est obligatoire/i)).toBeInTheDocument();
    });
  });

  it("does not send PATCH when validation fails", async () => {
    const user = userEvent.setup();

    render(
      <TaskFormDialog
        isOpen={true}
        mode="edit"
        taskId={existingTask.id}
        initialData={existingTask}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const titleInput = screen.getByDisplayValue("Ancien titre");
    await user.clear(titleInput);
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(screen.getByText(/titre est obligatoire/i)).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});