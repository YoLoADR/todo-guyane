"use client";

import { Badge, type BadgeVariant } from "@/components/merenza/Badge";
import { Card } from "@/components/merenza/Card";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/lib/db/schema";

const PRIORITY_LABELS: Record<Task["priority"], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const PRIORITY_BADGE_VARIANT: Record<Task["priority"], BadgeVariant> = {
  low: "priority-low",
  medium: "priority-medium",
  high: "priority-high",
  urgent: "priority-urgent",
};

/**
 * TaskCard — carte d'une tâche dans le Kanban.
 * Affiche: titre, badge priorité, badge statut, catégorie, date d'échéance.
 */
export function TaskCard({ task }: { task: Task }) {
  return (
    <Card padding="md" className="mb-2">
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold" style={{ color: "var(--mrz-text)" }}>
          {task.title}
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]}>
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          {task.category && (
            <Badge variant="category">{task.category}</Badge>
          )}
        </div>
        {task.dueDate && (
          <p className="text-xs" style={{ color: "var(--mrz-text-muted)" }}>
            Échéance: {formatDate(task.dueDate)}
          </p>
        )}
      </div>
    </Card>
  );
}