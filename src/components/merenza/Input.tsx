"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

/**
 * Input Merenza — label associé via htmlFor/id, aria-invalid si erreur, icône optionnelle.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium"
            style={{ color: "var(--mrz-text)" }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "currentColor" }}
              aria-hidden
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? "true" : undefined}
            className={cn(
              "w-full rounded-[var(--mrz-radius-md)] border px-3 py-2 text-base transition-colors",
              "focus:outline-2 focus:outline-offset-2 focus:outline-[#E8B04B]",
              icon && "pl-10",
              error
                ? "border-red-500"
                : "border-[var(--mrz-border)] bg-[var(--mrz-surface)]",
              className,
            )}
            style={{ color: "var(--mrz-text)" }}
            {...props}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";