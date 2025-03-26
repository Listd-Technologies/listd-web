"use client";

import { allProperties } from "@/components/listings/property-cards/sample-properties";
import { PropertyMap } from "@/components/maps/v2";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Map as MapIcon, Moon, MousePointer, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";

/**
 * Client component for testing the V2 map components with theme support
 */
export default function MapsV2Client() {
  // State for drawn area
  const [drawnArea, setDrawnArea] = useState<{
    bounds: google.maps.LatLngBounds | null;
    center: google.maps.LatLng | null;
    radius: number | null;
  }>({
    bounds: null,
    center: null,
    radius: null,
  });

  // State for the drawing mode
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // State to track if a boundary exists
  const [hasBoundary, setHasBoundary] = useState(false);

  // Get current theme to show in the UI
  const { theme, resolvedTheme, setTheme } = useTheme();

  // Toggle drawing mode
  const toggleDrawingMode = useCallback(() => {
    // If we're currently in drawing mode, just exit drawing mode without triggering
    // additional state changes that might cause loops
    if (isDrawingMode) {
      console.log("🖌️ Exiting drawing mode");
      setIsDrawingMode(false);
    } else {
      // Only toggle from false to true
      console.log("🖌️ Entering drawing mode");
      setIsDrawingMode(true);
    }
  }, [isDrawingMode]);

  // Handle drawing completion
  const handleDrawComplete = useCallback(
    (data: {
      polygon: google.maps.Polygon;
      bounds: google.maps.LatLngBounds;
      center: google.maps.LatLng;
      radius: number;
    }) => {
      console.log("🎯 Drawing completed:", {
        center: {
          lat: data.center.lat(),
          lng: data.center.lng(),
        },
        radius: data.radius,
      });

      // Update drawn area state
      setDrawnArea({
        bounds: data.bounds,
        center: data.center,
        radius: data.radius,
      });
    },
    []
  );

  // Handle boundary change (added/removed)
  const handleBoundaryChange = useCallback((boundaryExists: boolean) => {
    console.log(`🌐 Boundary ${boundaryExists ? "created" : "removed"}`);
    setHasBoundary(boundaryExists);
  }, []);

  // Add coordinates to sample properties if they don't have them
  const propertiesWithLocations = allProperties.map((property) => {
    // Generate random coordinates around Manila
    const lat = 14.5995 + (Math.random() - 0.5) * 0.1;
    const lng = 120.9842 + (Math.random() - 0.5) * 0.1;

    return {
      ...property,
      mapLocation: { lat, lng },
    };
  });

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-background border-b">
        <h1 className="text-2xl font-bold">Maps V2 Test</h1>
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Theme: {resolvedTheme === "dark" ? "Dark" : "Light"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-1.5"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              Toggle Theme
            </Button>
          </div>

          {/* Drawing Button */}
          {!isDrawingMode && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={toggleDrawingMode}
            >
              <MousePointer className="h-4 w-4" />
              Draw Area
            </Button>
          )}
        </div>
      </div>

      {/* Map Container - Taking all remaining space */}
      <div className="flex-1 relative">
        <PropertyMap
          properties={propertiesWithLocations}
          onDrawComplete={handleDrawComplete}
          isDrawingMode={isDrawingMode}
          toggleDrawingMode={toggleDrawingMode}
          onBoundaryChange={handleBoundaryChange}
          // The darkMode prop is intentionally not provided
          // Map will automatically use theme from the ThemeProvider
        />

        {/* Stats Overlay */}
        {hasBoundary && drawnArea.radius && (
          <div className="absolute bottom-4 left-4 z-10 bg-card p-4 rounded-md shadow-md border border-border">
            <h3 className="font-semibold text-sm">Search Area</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Radius: {(drawnArea.radius / 1000).toFixed(2)} km
            </p>
            <p className="text-xs text-muted-foreground">
              Properties: {propertiesWithLocations.length} total
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
