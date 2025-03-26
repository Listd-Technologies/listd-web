"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Circle, Map, MapPin, Trash } from "lucide-react";
import React from "react";
import { LocationState } from "./use-location-filter";

interface LocationFilterContentProps {
  /** Current location state */
  locationState: LocationState;
  /** Function to toggle drawing mode */
  onToggleDrawingMode: () => void;
  /** Function to clear boundary */
  onClearBoundary: () => void;
  /** Function to close the popover */
  onClose: () => void;
}

/**
 * Content component for location filter popover
 */
export function LocationFilterContent({
  locationState,
  onToggleDrawingMode,
  onClearBoundary,
  onClose,
}: LocationFilterContentProps) {
  const { isDrawingMode, bounds, center, radius } = locationState;
  const hasActiveBoundary = Boolean(bounds || center);

  // Helper function to format distance
  const formatDistance = (meters: number): string => {
    return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div className="w-full max-w-md p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Location Filter</h3>
      </div>

      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">Define Area</span>
        <Separator className="flex-1" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={isDrawingMode ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
            onClick={onToggleDrawingMode}
          >
            <Map className="h-4 w-4" />
            {isDrawingMode ? "Cancel Drawing" : "Draw on Map"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={!hasActiveBoundary}
            onClick={onClearBoundary}
          >
            <Trash className="h-4 w-4" />
            Clear Boundary
          </Button>
        </div>

        <div className="rounded-md border p-3 bg-muted/50">
          {isDrawingMode ? (
            <div className="text-sm flex flex-col gap-1">
              <p className="font-medium text-primary animate-pulse">Drawing Mode Active</p>
              <p className="text-xs text-muted-foreground">
                Draw a shape on the map to define your search area
              </p>
            </div>
          ) : hasActiveBoundary ? (
            <div className="text-sm flex flex-col gap-1">
              <p className="font-medium">Active Boundary:</p>
              {center && radius && (
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  <span>Circle with {formatDistance(radius)} radius</span>
                </div>
              )}
              {bounds && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Custom area boundary</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Properties will be filtered to this area
              </p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>No boundary defined</p>
              <p>Use the draw tool to define a search area on the map</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={hasActiveBoundary ? "default" : "outline"} size="sm" onClick={onClose}>
          Apply
        </Button>
      </div>
    </div>
  );
}
