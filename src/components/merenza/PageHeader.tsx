import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  /** Titre principal de la page (rendu en h1). */
  title: string;
  /** Sous-titre optionnel (rendu en p). */
  subtitle?: string;
  /** Slot d'actions (boutons, liens…) aligné à droite. */
  actions?: React.ReactNode;
  className?: string;
}

/** En-tête de page Merenza : h1 + sous-titre + actions, bordure inférieure. */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-mrz-border pb-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-mrz-text">{title}</h1>
        {subtitle && <p className="text-mrz-text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
