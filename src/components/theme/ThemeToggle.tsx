"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Button } from "@/components/merenza/Button";

/** Bascule de thème Merenza : icône Sun/Moon (lucide), data-theme + localStorage. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={isDark ? "Basculer en mode clair" : "Basculer en mode sombre"}
      onClick={toggle}
    >
      {isDark ? (
        <Sun data-icon="sun" className="size-5" />
      ) : (
        <Moon data-icon="moon" className="size-5" />
      )}
    </Button>
  );
}
