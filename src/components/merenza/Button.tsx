import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visuelle Merenza. */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Taille : sm, md (défaut), lg. */
  size?: "sm" | "md" | "lg";
}

/**
 * Bouton Merenza : bordures > ombres, focus ring amber-500/50.
 * - `primary` : fond accent (amber), texte zinc-900.
 * - `secondary` : fond surface + bordure.
 * - `ghost` : transparent, hover surface.
 * - `danger` : texte rouge, hover rouge translucide.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-mrz-md font-medium transition-colors",
          "focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variant === "primary" && "bg-mrz-accent text-mrz-text hover:bg-mrz-accent-hover",
          variant === "secondary" && "bg-mrz-surface border border-mrz-border text-mrz-text hover:bg-zinc-700/50",
          variant === "ghost" && "bg-transparent text-mrz-text hover:bg-mrz-surface",
          variant === "danger" && "bg-transparent text-red-500 hover:bg-red-500/10",
          size === "sm" && "px-2.5 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-base",
          size === "lg" && "px-6 py-3 text-lg",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
