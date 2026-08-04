import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, type ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Libellé associé (génère label + htmlFor). */
  label?: string;
  /** Message d'erreur (active aria-invalid + role="alert"). */
  error?: string;
  /** Icône lucide à gauche (16px, currentColor). */
  icon?: ComponentType<LucideProps>;
}

/**
 * Champ texte Merenza : label associé via htmlFor/id, icône optionnelle,
 * gestion d'erreur avec aria-invalid + aria-describedby + role="alert".
 * Focus ring amber-500/50.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-mrz-text">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-mrz-text-muted"
              stroke="currentColor"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              "w-full rounded-mrz-md border border-mrz-border bg-mrz-surface px-3 py-2 text-mrz-text placeholder:text-mrz-text-muted",
              "focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2",
              "aria-[invalid=true]:border-red-500",
              Icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
