"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

// Get theme from localStorage - default to dark (ignore system preference)
function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return "dark";

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  // Default to dark (ignore system preference)
  return "dark";
}

// Server snapshot - always dark
function getServerSnapshot(): Theme {
  return "dark";
}

// Subscribe to theme changes
function subscribeToTheme(callback: () => void) {
  // Listen for storage changes (cross-tab sync)
  const handleStorage = () => callback();

  // Listen for custom theme change event
  const handleThemeChange = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener("themechange", handleThemeChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("themechange", handleThemeChange);
  };
}

// Apply theme to DOM
function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
}

export function useTheme() {
  // Use useSyncExternalStore to read theme - this handles hydration correctly
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot
  );

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const currentTheme = getThemeSnapshot();
    const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);

    // Dispatch custom event to trigger re-render
    window.dispatchEvent(new Event("themechange"));
  }, []);

  // Set specific theme
  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    window.dispatchEvent(new Event("themechange"));
  }, []);

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
    // mounted is always true after hydration since useSyncExternalStore handles it
    mounted: typeof window !== "undefined",
  };
}
