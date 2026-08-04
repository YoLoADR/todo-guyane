import { cn } from "@/lib/utils";
import { Card } from "@/components/merenza/Card";
import type { Task } from "./Board";

export interface ColumnProps {
  title: string;
  count: number;
  children: React.ReactNode;
  className?: string;
  status?: Task["status"];
  onDrop?: (status: Task["status"]) => void;
}

export function Column({ title, count, children, className, status, onDrop }: ColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDrop && status) {
      onDrop(status);
    }
  };

  return (
    <section
      className={cn("flex flex-col gap-3", className)}
      aria-label={title}
    >
      <header className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-mrz-text">{title}</h2>
        <span className="text-sm text-mrz-text-muted">({count})</span>
      </header>
      <div
        data-drop-zone
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex flex-col gap-2 min-h-[200px]"
      >
        {children}
      </div>
    </section>
  );
}