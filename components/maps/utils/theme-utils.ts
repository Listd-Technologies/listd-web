import { useTheme } from "next-themes";
import { useCallback } from "react";

/**
 * Returns theme-aware colors for map components
 */
export function useThemeColors(darkModeProp?: boolean) {
  const { resolvedTheme } = useTheme();

  // Use prop if explicitly provided, otherwise use theme context
  const isDarkMode = darkModeProp !== undefined ? darkModeProp : resolvedTheme === "dark";

  return useCallback(() => {
    return isDarkMode
      ? {
          primary: "#a78bfa", // Light purple for dark mode
          secondary: "#8b5cf6", // Brighter purple
          stroke: "#a78bfa", // Use primary color for stroke in dark mode
          fill: "rgba(167, 139, 250, 0.3)", // Semi-transparent purple
          background: "#1f2937", // Dark background
          text: "#e5e7eb", // Light text
          textMuted: "#9ca3af", // Secondary text color
          textHighlight: "#c4b5fd", // Highlighted text
          indicator: "#a78bfa", // Indicators and bullets
          shadow: "rgba(0, 0, 0, 0.5)", // Dark shadow
          backgroundTransparent: "rgba(31, 41, 55, 0.9)", // Transparent background
          border: "#4c1d95", // Border color
        }
      : {
          primary: "#6B21A8", // Default purple
          secondary: "#7928CA", // Darker purple
          stroke: "#6B21A8", // Use primary color for stroke in light mode
          fill: "rgba(107, 33, 168, 0.2)", // Semi-transparent purple
          background: "#ffffff", // White background
          text: "#334155", // Dark text
          textMuted: "#64748b", // Secondary text color
          textHighlight: "#6B21A8", // Highlighted text
          indicator: "#6B21A8", // Indicators and bullets
          shadow: "rgba(0, 0, 0, 0.2)", // Light shadow
          backgroundTransparent: "rgba(255, 255, 255, 0.9)", // Transparent background
          border: "#f3e8ff", // Border color
        };
  }, [isDarkMode]);
}
