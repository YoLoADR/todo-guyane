import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";

global.fetch = vi.fn();

describe("TaskFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens when isOpen is true and shows form fields", () => {
    render(
      <TaskFormDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priorité/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/échéance/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enregistrer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /annuler/i })).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <TaskFormDialog
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskFormDialog
        isOpen={true}
        onClose={onClose}
        onSubmit={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /annuler/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows validation error when title is empty", async () => {
    const user = userEvent.setup();

    render(
      <TaskFormDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(screen.getByText(/titre est obligatoire/i)).toBeInTheDocument();
    });
  });

  it("shows validation error when title is too long", async () => {
    const user = userEvent.setup();

    render(
      <TaskFormDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const titleInput = screen.getByLabelText(/titre/i);
    await user.type(titleInput, "x".repeat(201));
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(screen.getByText(/200 caractères/i)).toBeInTheDocument();
    });
  });

  it("shows validation error when due date is in the past", async () => {
    const user = userEvent.setup();
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    render(
      <TaskFormDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const dueDateInput = screen.getByLabelText(/échéance/i);
    await user.type(dueDateInput, pastDate);
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(screen.getByText(/passé/i)).toBeInTheDocument();
    });
  });

  it("submits successfully with valid data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onClose = vi.fn();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1, title: "Test task", priority: "medium", status: "todo" }),
    });

    render(
      <TaskFormDialog
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    await user.type(screen.getByLabelText(/titre/i), "Test task");
    await user.type(screen.getByLabelText(/description/i), "Test description");
    await user.selectOptions(screen.getByLabelText(/priorité/i), "high");
    await user.type(screen.getByLabelText(/catégorie/i), "Frontend");

    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tasks",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("defaults priority to medium when not selected", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1, title: "Test", priority: "medium", status: "todo" }),
    });

    render(
      <TaskFormDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await user.type(screen.getByLabelText(/titre/i), "Test");
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.priority).toBe("medium");
  });
});
