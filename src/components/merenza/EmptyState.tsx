import { cn } from "@/lib/utils";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export interface EmptyStateProps {
  /** Icône lucide affichée à 32px. */
  icon: ComponentType<LucideProps>;
  /** Titre court (h3). */
  title: string;
  /** Description optionnelle sous le titre. */
  description?: string;
  /** Slot d'action (bouton, lien…). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * État vide Merenza : bordure dashed, icône 32px centrée.
 * Rôle ARIA `status` pour signaler une absence de contenu.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-mrz-md border border-dashed border-mrz-border p-6 text-center",
        className
      )}
    >
      <Icon className="text-mrz-text-muted" width={32} height={32} stroke="currentColor" aria-hidden />
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-mrz-text">{title}</h3>
        {description && (
          <p className="text-sm text-mrz-text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
