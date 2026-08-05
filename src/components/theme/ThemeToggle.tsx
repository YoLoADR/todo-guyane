"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * ThemeToggle Merenza — bouton de bascule dark/light.
 * Icône Sun en dark (pour passer à light), Moon en light (pour passer à dark).
 * Persistance via localStorage (géré par ThemeProvider).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Changer de thème"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-[var(--mrz-radius-md)]",
        "border border-[var(--mrz-border)] bg-[var(--mrz-surface)] transition-colors",
        "hover:border-[#E8B04B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8B04B]",
        className,
      )}
      style={{ color: "var(--mrz-text)" }}
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}