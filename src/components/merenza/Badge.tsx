"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "priority-low"
  | "priority-medium"
  | "priority-high"
  | "priority-urgent"
  | "status-backlog"
  | "status-todo"
  | "status-in_progress"
  | "status-done"
  | "category"
  | "default"
  | "outline"
  | "success"
  | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  "priority-low": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "priority-medium": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "priority-high": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "priority-urgent": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "status-backlog": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "status-todo": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "status-in_progress": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  "status-done": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  category: "bg-[#E8B04B]/20 text-[#E8B04B]",
  default: "bg-[var(--mrz-surface)] text-[var(--mrz-text-muted)] border border-[var(--mrz-border)]",
  outline: "border border-[var(--mrz-border)] text-[var(--mrz-text)]",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

/**
 * Badge Merenza — 13 variants (priorités × 4, statuts × 4, category, default, outline, success, danger).
 * rounded-full, petit padding, texte centré.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";