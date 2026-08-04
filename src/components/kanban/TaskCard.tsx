import { Card } from "@/components/merenza/Card";
import { Badge } from "@/components/merenza/Badge";
import type { Task } from "./Board";
import { formatDate } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/merenza/Button";

export interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onDelete?: () => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const priorityLabels: Record<Task["priority"], string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
};

const priorityVariants: Record<Task["priority"], "priority-low" | "priority-medium" | "priority-high"> = {
  low: "priority-low",
  medium: "priority-medium",
  high: "priority-high",
};

export function TaskCard({
  task,
  onClick,
  onDelete,
  draggable = false,
  onDragStart,
  onDragEnd,
  onKeyDown,
}: TaskCardProps) {
  return (
    <Card
      padding="sm"
      interactive
      onClick={onClick}
      className="group"
    >
      <div
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onKeyDown={onKeyDown}
        tabIndex={draggable ? 0 : undefined}
        role={draggable ? "button" : undefined}
        aria-label={draggable ? `Tâche: ${task.title}, utiliser flèches gauche/droite pour déplacer` : undefined}
        className="flex flex-col gap-2 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-mrz-text line-clamp-2">{task.title}</h3>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="Supprimer la tâche"
              className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="size-4 text-red-500" />
            </Button>
          )}
        </div>

        {task.description && (
          <p className="text-sm text-mrz-text-muted line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Badge variant={priorityVariants[task.priority]}>
            {priorityLabels[task.priority]}
          </Badge>

          {task.category && (
            <Badge variant="category">{task.category}</Badge>
          )}

          {task.dueDate && (
            <Badge variant="default">
              Échéance: {formatDate(task.dueDate)}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}