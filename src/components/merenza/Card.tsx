"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Padding = "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  interactive?: boolean;
  selected?: boolean;
}

const paddingClasses: Record<Padding, string> = {
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
};

/**
 * Card Merenza — 3 paddings (sm/md/lg), mode interactive (clickable), mode selected (bordure accent).
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      padding = "md",
      interactive = false,
      selected = false,
      onClick,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
        className={cn(
          "rounded-[var(--mrz-radius-md)] border bg-[var(--mrz-surface)] transition-colors",
          "border-[var(--mrz-border)]",
          paddingClasses[padding],
          selected && "border-[#E8B04B]",
          interactive &&
            "cursor-pointer hover:border-[#E8B04B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8B04B]",
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";