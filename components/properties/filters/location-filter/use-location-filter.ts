"use client";

import { useDrawingMode } from "@/components/properties/page-client";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";
import { useCallback, useMemo } from "react";

/**
 * Type for the location state
 */
export interface LocationState {
  /** The center point coordinates of the location search */
  center: google.maps.LatLng | null;
  /** The search radius in meters */
  radius: number | null;
  /** The boundary box for the location search */
  bounds: google.maps.LatLngBounds | null;
  /** Whether the search is in drawing mode */
  isDrawingMode: boolean;
}

/**
 * Custom hook for managing location filter state and actions
 * Uses the shared DrawingModeContext for state
 */
export function useLocationFilter() {
  // Use the property filters store - we'll use these in Phase 3
  const { filters: _filters, updateFilters: _updateFilters } = usePropertyFilters();

  // Use the drawing mode context for shared state
  const { isDrawingMode, toggleDrawingMode, drawnArea, handleBoundaryChange } = useDrawingMode();

  // Create a location state object from the drawing mode context
  const locationState: LocationState = {
    center: drawnArea.center,
    radius: drawnArea.radius,
    bounds: drawnArea.bounds,
    isDrawingMode,
  };

  /**
   * Clear the boundary and reset location filters
   */
  const clearBoundary = useCallback(() => {
    handleBoundaryChange(null, null, null);

    // Here we would update the filters store if needed
    // This will be fully implemented in Phase 3
  }, [handleBoundaryChange]);

  /**
   * Check if location filter has active boundaries
   */
  const hasActiveBoundary = useMemo(() => {
    return Boolean(locationState.bounds || locationState.center);
  }, [locationState.bounds, locationState.center]);

  /**
   * Get display text for the filter based on current state
   */
  const getDisplayText = useCallback(() => {
    if (hasActiveBoundary) {
      return "Location: Custom Area";
    }
    return "Location";
  }, [hasActiveBoundary]);

  return {
    locationState,
    toggleDrawingMode,
    updateBoundary: handleBoundaryChange,
    clearBoundary,
    hasActiveBoundary,
    getDisplayText,
  };
}
