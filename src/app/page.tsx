"use client";

import { useState, useCallback } from "react";
import { Board, type Task } from "@/components/kanban/Board";
import { FilterBar, type FilterValues } from "@/components/filters/FilterBar";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { DeleteConfirmDialog } from "@/components/tasks/DeleteConfirmDialog";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PageHeader } from "@/components/merenza/PageHeader";
import { Button } from "@/components/merenza/Button";
import { Plus } from "lucide-react";

export default function HomePage() {
  const [filters, setFilters] = useState<FilterValues>({
    q: "",
    priority: "",
    category: "",
    status: "",
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const handleDeleteTask = useCallback((task: Task) => {
    setDeletingTask(task);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader title="Todo Guyane" subtitle="Gérez vos tâches en Kanban" actions={<ThemeToggle />} />

      <FilterBar onFilterChange={handleFilterChange} hasResults />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-mrz-text">Tableau Kanban</h2>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="size-5" />
          Nouvelle tâche
        </Button>
      </div>

      <Board
        filters={filters}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        refreshKey={refreshKey}
      />

      {/* Create dialog */}
      <TaskFormDialog
        isOpen={showCreateDialog}
        mode="create"
        onClose={() => setShowCreateDialog(false)}
        onSubmit={async () => {
          refresh();
        }}
      />

      {/* Edit dialog */}
      {editingTask && (
        <TaskFormDialog
          isOpen={true}
          mode="edit"
          taskId={editingTask.id}
          initialData={{
            title: editingTask.title,
            description: editingTask.description ?? undefined,
            priority: editingTask.priority,
            category: editingTask.category ?? undefined,
            dueDate: editingTask.dueDate ?? undefined,
          }}
          onClose={() => setEditingTask(null)}
          onSubmit={async () => {
            refresh();
          }}
        />
      )}

      {/* Delete confirmation */}
      {deletingTask && (
        <DeleteConfirmDialog
          isOpen={true}
          taskId={deletingTask.id}
          onClose={() => setDeletingTask(null)}
          onDeleted={() => {
            setDeletingTask(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}