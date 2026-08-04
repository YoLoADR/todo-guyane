import { cn } from "@/lib/utils";

/** Variants de badge (11 au total : 3 priorité, 3 statut, catégorie, défaut, outline, success, danger). */
export type BadgeVariant =
  | "default"
  | "outline"
  | "priority-low"
  | "priority-medium"
  | "priority-high"
  | "status-todo"
  | "status-in_progress"
  | "status-done"
  | "category"
  | "success"
  | "danger";

export interface BadgeProps {
  children: React.ReactNode;
  /** Variante du badge. */
  variant?: BadgeVariant;
  className?: string;
}

/**
 * Badge Merenza : pastille arrondie (rounded-full) avec bordure.
 * Palette zinc + amber + couleurs sémantiques (rouge/vert/bleu pour priorités/statuts).
 */
const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-mrz-surface text-mrz-text border border-mrz-border",
  outline: "bg-transparent text-mrz-text border border-mrz-border",
  "priority-low": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "priority-medium": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  "priority-high": "bg-red-500/10 text-red-400 border border-red-500/20",
  "status-todo": "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
  "status-in_progress": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  "status-done": "bg-green-500/10 text-green-400 border border-green-500/20",
  category: "bg-mrz-surface text-mrz-text-muted border border-mrz-border",
  success: "bg-green-500/10 text-green-400 border border-green-500/20",
  danger: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
