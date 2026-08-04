"use client";

import { type ReactNode } from "react";
import { EmptyState } from "@/components/merenza/EmptyState";
import { Inbox } from "lucide-react";

export interface ColumnProps {
  title: string;
  count: number;
  status: string;
  children?: ReactNode;
}

/**
 * Column — colonne du Kanban avec titre, compteur, et contenu.
 * Affiche un EmptyState si aucune tâche.
 */
export function Column({ title, count, children }: ColumnProps) {
  return (
    <div
      className="flex w-72 flex-col gap-3 rounded-[var(--mrz-radius-lg)] border border-[var(--mrz-border)] bg-[var(--mrz-surface)] p-3"
      data-status={title}
    >
      <div className="flex items-center justify-between">
        <h3
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: "var(--mrz-text)" }}
        >
          {title}
        </h3>
        <span
          role="status"
          aria-label={`Compteur ${title}`}
          className="rounded-full bg-[var(--mrz-bg)] px-2 py-0.5 text-xs font-medium"
          style={{ color: "var(--mrz-text-muted)" }}
        >
          {count}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {count === 0 ? (
          <EmptyState
            icon={<Inbox size={32} />}
            title="Aucune tâche"
            description="Glissez une tâche ici"
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}