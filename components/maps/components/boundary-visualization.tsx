"use client";

import { useTheme } from "next-themes";
import { useCallback, useRef } from "react";

/**
 * Hook for accessing boundary visualization utilities
 * Provides functions for creating and managing map boundary visualizations
 */
export function useBoundaryVisualization(
  mapRef: React.RefObject<google.maps.Map | null>,
  darkMode?: boolean
) {
  // Refs for boundary visualizations
  const centerMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const boundingBoxRef = useRef<google.maps.Rectangle | null>(null);

  // Get theme from the ThemeProvider if not explicitly provided
  const { resolvedTheme } = useTheme();
  const isDarkMode = darkMode !== undefined ? darkMode : resolvedTheme === "dark";

  // Color constants based on theme
  const getThemeColors = useCallback(() => {
    return isDarkMode
      ? {
          primary: "#a78bfa", // Light purple for dark mode
          secondary: "#8b5cf6", // Brighter purple
          stroke: "#ffffff", // White stroke
          fill: "rgba(167, 139, 250, 0.3)", // Semi-transparent purple
          background: "#1f2937", // Dark background
          text: "#e5e7eb", // Light text
          shadow: "rgba(0, 0, 0, 0.5)", // Dark shadow
        }
      : {
          primary: "#6B21A8", // Default purple
          secondary: "#7928CA", // Darker purple
          stroke: "#FFFFFF", // White stroke
          fill: "rgba(107, 33, 168, 0.2)", // Semi-transparent purple
          background: "#ffffff", // White background
          text: "#334155", // Dark text
          shadow: "rgba(0, 0, 0, 0.2)", // Light shadow
        };
  }, [isDarkMode]);

  // Clear all boundary visualizations
  const clearVisualizations = useCallback(() => {
    // Clean up center marker
    if (centerMarkerRef.current) {
      centerMarkerRef.current.map = null;
      centerMarkerRef.current = null;
    }

    // Clean up bounding box
    if (boundingBoxRef.current) {
      boundingBoxRef.current.setMap(null);
      boundingBoxRef.current = null;
    }
  }, []);

  // Display center marker at search area center
  const showCenterMarker = useCallback(
    (center: google.maps.LatLng) => {
      if (!mapRef.current) return;

      const colors = getThemeColors();

      // Create marker HTML element
      const createMarkerElement = () => {
        const element = document.createElement("div");
        element.innerHTML = `
          <div style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: ${colors.primary};
            border: 2px solid ${colors.stroke};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px ${colors.shadow};
          "></div>
        `;
        return element;
      };

      // Create advanced marker with modern API
      const createAdvancedMarker = async () => {
        try {
          const { AdvancedMarkerElement } = (await google.maps.importLibrary("marker")) as {
            AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
          };

          const centerMarker = new AdvancedMarkerElement({
            position: center,
            map: mapRef.current,
            content: createMarkerElement(),
            title: "Center of Search Area",
            zIndex: 1000,
          });

          centerMarkerRef.current = centerMarker;
        } catch (error) {
          console.error("Error creating advanced marker:", error);
        }
      };

      createAdvancedMarker();
    },
    [mapRef, getThemeColors]
  );

  // Display rectangle around search area bounds
  const showBoundingBox = useCallback(
    (bounds: google.maps.LatLngBounds) => {
      if (!mapRef.current) return;

      const colors = getThemeColors();

      const boundingBox = new google.maps.Rectangle({
        bounds: bounds,
        strokeColor: colors.primary,
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: "transparent",
        fillOpacity: 0,
        map: mapRef.current,
        zIndex: 50,
      });

      boundingBoxRef.current = boundingBox;
    },
    [mapRef, getThemeColors]
  );

  return {
    clearVisualizations,
    showCenterMarker,
    showBoundingBox,
    centerMarkerRef,
    boundingBoxRef,
    getThemeColors,
  };
}
