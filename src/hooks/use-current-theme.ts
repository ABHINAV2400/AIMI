"use client"

import { useTheme } from "next-themes";

/**
 * Current Theme Hook
 * 
 * A utility hook that resolves the actual current theme being used,
 * taking into account the user's theme preference and system theme.
 * 
 * This hook handles the "system" theme setting by falling back to
 * the actual system theme (light/dark) when the user hasn't explicitly
 * chosen a theme preference.
 */

/**
 * Get the currently active theme
 * 
 * Resolves the actual theme being displayed, handling the case where
 * the user has selected "system" theme by returning the system's
 * actual preference.
 * 
 * @returns {"light" | "dark" | undefined} The current active theme
 * 
 * @example
 * const currentTheme = useCurrentTheme();
 * const isDark = currentTheme === "dark";
 * 
 * return (
 *   <div className={isDark ? "bg-gray-900" : "bg-white"}>
 *     Content with theme-aware styling
 *   </div>
 * );
 */
export const useCurrentTheme = () => {
  const { theme, systemTheme } = useTheme();

  // If user has explicitly chosen light or dark, use that
  if (theme === "dark" || theme === "light") {
    return theme;
  }
  
  // Otherwise, fall back to system theme preference
  return systemTheme;
};
