import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    window.localStorage.clear();
  });

  function renderToggle() {
    return render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
  }

  it("renders Sun icon when theme is dark", () => {
    renderToggle();
    expect(document.querySelector("svg[data-icon='sun']")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Basculer en mode clair");
  });

  it("toggles theme, localStorage and data-theme on click", () => {
    renderToggle();
    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(window.localStorage.getItem("merenza-theme")).toBe("light");
    expect(document.querySelector("svg[data-icon='moon']")).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Basculer en mode sombre");
  });

  it("persists light theme on re-render from localStorage", () => {
    window.localStorage.setItem("merenza-theme", "light");
    renderToggle();
    expect(document.querySelector("svg[data-icon='moon']")).toBeInTheDocument();
  });
});
