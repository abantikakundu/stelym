"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex size-10 items-center justify-center border-[2.5px] border-ink bg-white shadow-[3px_3px_0_0_#111111] dark:bg-[#131927] dark:shadow-[3px_3px_0_0_#000000]" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex size-10 items-center justify-center border-[2.5px] border-ink bg-white text-ink shadow-[3px_3px_0_0_#111111] transition-[transform,box-shadow,background-color] duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#111111] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none dark:bg-[#131927] dark:text-[#f8fafc] dark:shadow-[3px_3px_0_0_#000000] dark:hover:shadow-[2px_2px_0_0_#000000]"
    >
      {isDark ? (
        <Sun className="size-5 text-amber-400" weight="fill" />
      ) : (
        <Moon className="size-5 text-indigo-600" weight="fill" />
      )}
    </button>
  );
}
