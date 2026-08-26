import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";

function TestThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

describe("ThemeProvider and Theme toggling", () => {
  it("toggles between light and dark themes", () => {
    render(
      <ThemeProvider>
        <TestThemeConsumer />
      </ThemeProvider>
    );

    const themeDisplay = screen.getByTestId("current-theme");
    const toggleButton = screen.getByRole("button", { name: /toggle theme/i });

    expect(themeDisplay.textContent).toBe("light");
    fireEvent.click(toggleButton);
    expect(themeDisplay.textContent).toBe("dark");
    fireEvent.click(toggleButton);
    expect(themeDisplay.textContent).toBe("light");
  });
});
