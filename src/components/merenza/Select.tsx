"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

/**
 * Select Merenza — label associé, options, placeholder, gestion d'erreur avec role=alert.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, placeholder, error, id, ...props }, ref) => {
    const autoId = useId();
    const selectId = id ?? autoId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium"
            style={{ color: "var(--mrz-text)" }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? "true" : undefined}
          className={cn(
            "w-full rounded-[var(--mrz-radius-md)] border px-3 py-2 text-base transition-colors",
            "focus:outline-2 focus:outline-offset-2 focus:outline-[#E8B04B]",
            error
              ? "border-red-500"
              : "border-[var(--mrz-border)] bg-[var(--mrz-surface)]",
            className,
          )}
          style={{ color: "var(--mrz-text)" }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";