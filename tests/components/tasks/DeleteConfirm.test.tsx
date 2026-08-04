import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteConfirmDialog } from "@/components/tasks/DeleteConfirmDialog";

global.fetch = vi.fn();

describe("DeleteConfirmDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(
      <DeleteConfirmDialog
        isOpen={false}
        taskId={1}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders confirmation message when open", () => {
    render(
      <DeleteConfirmDialog
        isOpen={true}
        taskId={1}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/confirmer la suppression/i)).toBeInTheDocument();
  });

  it("renders Cancel and Delete buttons", () => {
    render(
      <DeleteConfirmDialog
        isOpen={true}
        taskId={1}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /annuler/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /supprimer/i })).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked without deleting", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onDeleted = vi.fn();

    render(
      <DeleteConfirmDialog
        isOpen={true}
        taskId={1}
        onClose={onClose}
        onDeleted={onDeleted}
      />
    );

    await user.click(screen.getByRole("button", { name: /annuler/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDeleted).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("sends DELETE request and calls onDeleted on confirm", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onDeleted = vi.fn();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    render(
      <DeleteConfirmDialog
        isOpen={true}
        taskId={42}
        onClose={onClose}
        onDeleted={onDeleted}
      />
    );

    await user.click(screen.getByRole("button", { name: /supprimer/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/tasks/42", {
        method: "DELETE",
      });
    });

    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalledTimes(1);
    });
  });

  it("shows error alert when DELETE fails", async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(
      <DeleteConfirmDialog
        isOpen={true}
        taskId={1}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />
    );

    await user.click(screen.getByRole("button", { name: /supprimer/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/échec/i)).toBeInTheDocument();
    });

    expect(onDeleted).not.toHaveBeenCalled();
  });
});