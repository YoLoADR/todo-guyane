import { cn } from "@/lib/utils";
import { KeyboardEvent } from "react";

export interface CardProps {
  children: React.ReactNode;
  /** Padding interne : sm (12px), md (16px), lg (24px). */
  padding?: "sm" | "md" | "lg";
  /** Rend la carte interactive (hover, focus, navigation clavier). */
  interactive?: boolean;
  /** État sélectionné (bordure accent). */
  selected?: boolean;
  /** Handler de clic (active automatiquement le support clavier). */
  onClick?: () => void;
  className?: string;
}

/**
 * Carte Merenza : conteneur avec bordure (pas d'ombre en dark).
 * Quand `onClick` est fourni, la carte devient accessible clavier
 * (role="button", tabIndex=0, Enter/Espace déclenchent le clic).
 */
export function Card({
  children,
  padding = "md",
  interactive = false,
  selected = false,
  onClick,
  className,
}: CardProps) {
  const isInteractive = interactive || Boolean(onClick);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      aria-pressed={isInteractive && selected ? true : undefined}
      className={cn(
        "rounded-mrz-md border border-mrz-border bg-mrz-surface transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-6",
        interactive && "cursor-pointer hover:border-mrz-accent",
        selected && "border-mrz-accent",
        className
      )}
    >
      {children}
    </div>
  );
}
