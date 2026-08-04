"use client";

import { Column } from "@/components/kanban/Column";
import { TaskCard } from "@/components/kanban/TaskCard";
import type { Task, Status } from "@/lib/db/schema";

export interface BoardProps {
  tasks: Task[];
  loading?: boolean;
  onRefresh?: () => void;
}

const COLUMNS: { title: string; status: Status }[] = [
  { title: "Backlog", status: "backlog" },
  { title: "À faire", status: "todo" },
  { title: "En cours", status: "in_progress" },
  { title: "Terminé", status: "done" },
];

/**
 * Board — tableau Kanban avec 4 colonnes (Backlog, À faire, En cours, Terminé).
 * Répartit les tâches selon leur statut. Affiche un compteur par colonne.
 */
export function Board({ tasks, loading }: BoardProps) {
  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            className="w-72 animate-pulse rounded-[var(--mrz-radius-lg)] border border-[var(--mrz-border)] bg-[var(--mrz-surface)] p-3"
            style={{ minHeight: "200px" }}
          >
            <div
              className="h-4 w-24 rounded bg-[var(--mrz-border)]"
              aria-label="Chargement"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        return (
          <Column
            key={col.status}
            title={col.title}
            count={columnTasks.length}
            status={col.status}
          >
            {columnTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </Column>
        );
      })}
    </div>
  );
}