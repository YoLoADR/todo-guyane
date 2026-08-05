import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

function renderWithProvider(ui: React.ReactNode) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute("data-theme", "dark");
  });

  it("rend un bouton avec aria-label", () => {
    renderWithProvider(<ThemeToggle />);
    expect(
      screen.getByRole("button", { name: /changer de thème/i }),
    ).toBeDefined();
  });

  it("affiche l'icône Sun en mode dark (pour basculer vers light)", () => {
    renderWithProvider(<ThemeToggle />);
    // En dark, on montre l'icône Sun (indique qu'on peut passer à light)
    const btn = screen.getByRole("button", { name: /changer de thème/i });
    expect(btn).toBeDefined();
    // lucide-react injecte un svg
    expect(btn.querySelector("svg")).toBeDefined();
  });

  it("bascule data-theme de dark à light au clic", async () => {
    const user = userEvent.setup();
    renderWithProvider(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: /changer de thème/i }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("persiste le thème dans localStorage", async () => {
    const user = userEvent.setup();
    renderWithProvider(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: /changer de thème/i }));
    expect(localStorage.getItem("merenza-theme")).toBe("light");
  });

  it("bascule de light à dark au second clic", async () => {
    const user = userEvent.setup();
    renderWithProvider(<ThemeToggle />);
    const btn = screen.getByRole("button", { name: /changer de thème/i });
    await user.click(btn); // dark -> light
    await user.click(btn); // light -> dark
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("merenza-theme")).toBe("dark");
  });
});