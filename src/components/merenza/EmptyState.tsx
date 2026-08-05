"use client";

import { type ReactNode } from "react";

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * EmptyState — état vide avec icône (32px), titre, description, action optionnelle.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-[var(--mrz-radius-md)] border border-dashed border-[var(--mrz-border)] p-6 text-center"
      role="status"
    >
      <div
        className="flex items-center justify-center"
        style={{ color: "var(--mrz-text-muted)" }}
      >
        {icon}
      </div>
      <h4
        className="text-sm font-medium"
        style={{ color: "var(--mrz-text)" }}
      >
        {title}
      </h4>
      {description && (
        <p
          className="text-xs"
          style={{ color: "var(--mrz-text-muted)" }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}