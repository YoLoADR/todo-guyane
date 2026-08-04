import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "@/components/filters/FilterBar";

describe("FilterBar", () => {
  it("renders search input, priority, category, status filters and reset button", () => {
    render(
      <FilterBar
        onFilterChange={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priorité/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/statut/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /réinitialiser/i })).toBeInTheDocument();
  });

  it("calls onFilterChange when search text is typed", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(<FilterBar onFilterChange={onFilterChange} />);

    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    await user.type(searchInput, "login");

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ q: "login" })
    );
  });

  it("calls onFilterChange when priority is selected", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(<FilterBar onFilterChange={onFilterChange} />);

    await user.selectOptions(screen.getByLabelText(/priorité/i), "high");

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ priority: "high" })
    );
  });

  it("calls onFilterChange when category is typed", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(<FilterBar onFilterChange={onFilterChange} />);

    const categoryInput = screen.getByLabelText(/catégorie/i);
    await user.type(categoryInput, "Frontend");

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: "Frontend" })
    );
  });

  it("calls onFilterChange when status is selected", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(<FilterBar onFilterChange={onFilterChange} />);

    await user.selectOptions(screen.getByLabelText(/statut/i), "done");

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: "done" })
    );
  });

  it("resets all filters when reset button is clicked", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(<FilterBar onFilterChange={onFilterChange} />);

    // Set some filters first
    await user.type(screen.getByPlaceholderText(/rechercher/i), "test");
    await user.selectOptions(screen.getByLabelText(/priorité/i), "high");

    onFilterChange.mockClear();

    await user.click(screen.getByRole("button", { name: /réinitialiser/i }));

    expect(onFilterChange).toHaveBeenCalledWith({
      q: "",
      priority: "",
      category: "",
      status: "",
    });
  });

  it("displays empty state message when no results", () => {
    render(
      <FilterBar
        onFilterChange={vi.fn()}
        hasResults={false}
      />
    );

    expect(screen.getByText(/aucune tâche ne correspond/i)).toBeInTheDocument();
  });

  it("does not display empty state when results exist", () => {
    render(
      <FilterBar
        onFilterChange={vi.fn()}
        hasResults={true}
      />
    );

    expect(screen.queryByText(/aucune tâche ne correspond/i)).not.toBeInTheDocument();
  });
});