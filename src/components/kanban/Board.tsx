"use client";

import { useCallback, useEffect, useState } from "react";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { EmptyState } from "@/components/merenza/EmptyState";
import { Plus } from "lucide-react";
import type { FilterValues } from "@/components/filters/FilterBar";

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: "low" | "medium" | "high";
  category?: string | null;
  dueDate?: string | null;
  status: "todo" | "in_progress" | "done";
  createdAt: string;
  updatedAt: string;
}

export interface BoardProps {
  filters?: FilterValues;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  refreshKey?: number;
}

const COLUMNS = [
  { id: "todo", title: "À faire", status: "todo" as const },
  { id: "in_progress", title: "En cours", status: "in_progress" as const },
  { id: "done", title: "Terminé", status: "done" as const },
];

const STATUS_ORDER: Record<Task["status"], number> = {
  todo: 0,
  in_progress: 1,
  done: 2,
};

function buildQueryString(filters?: FilterValues): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function Board({ filters, onEditTask, onDeleteTask, refreshKey = 0 }: BoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks${buildQueryString(filters)}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Initial data fetch — setState in effect is expected here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, [fetchTasks, refreshKey]);

  const getTasksForColumn = (status: string) =>
    tasks.filter((task) => task.status === status);

  const updateTaskStatus = useCallback(
    async (taskId: number, newStatus: Task["status"]) => {
      const columnTitle = COLUMNS.find((c) => c.status === newStatus)?.title ?? newStatus;

      // Find and save old status for potential rollback
      const oldTask = tasks.find((t) => t.id === taskId);
      const oldStatus = oldTask?.status;

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      setError(null);

      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error("PATCH failed");
        }

        setAnnouncement(`Tâche déplacée vers ${columnTitle}`);
      } catch {
        // Rollback to old status
        if (oldStatus) {
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: oldStatus } : t))
          );
        }
        setError("Échec de la mise à jour de la tâche");
        setAnnouncement("Échec du déplacement");
      }
    },
    [tasks]
  );

  const handleDragStart = (taskId: number) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDrop = (newStatus: Task["status"]) => {
    if (draggedTaskId !== null) {
      updateTaskStatus(draggedTaskId, newStatus);
      setDraggedTaskId(null);
    }
  };

  const handleKeyDown = (task: Task, e: React.KeyboardEvent) => {
    const currentIdx = STATUS_ORDER[task.status];
    if (e.key === "ArrowRight" && currentIdx < 2) {
      e.preventDefault();
      const newStatus = COLUMNS[currentIdx + 1].status;
      updateTaskStatus(task.id, newStatus);
    } else if (e.key === "ArrowLeft" && currentIdx > 0) {
      e.preventDefault();
      const newStatus = COLUMNS[currentIdx - 1].status;
      updateTaskStatus(task.id, newStatus);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-mrz-text-muted">
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* aria-live for drag announcements */}
      <span
        role="status"
        aria-live="polite"
        className="sr-only"
        data-testid="drag-announcement"
      >
        {announcement}
      </span>

      {error && (
        <p role="alert" className="text-sm text-red-500 mb-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksForColumn(column.status);
          return (
            <Column
              key={column.id}
              title={column.title}
              count={columnTasks.length}
              status={column.status}
              onDrop={handleDrop}
            >
              {columnTasks.length === 0 ? (
                <EmptyState
                  icon={Plus}
                  title="Aucune tâche"
                  description="Créez une nouvelle tâche pour commencer"
                />
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    onDragEnd={handleDragEnd}
                    onKeyDown={(e) => handleKeyDown(task, e)}
                    onClick={onEditTask ? () => onEditTask(task) : undefined}
                    onDelete={onDeleteTask ? () => onDeleteTask(task) : undefined}
                  />
                ))
              )}
            </Column>
          );
        })}
      </div>
    </div>
  );
}