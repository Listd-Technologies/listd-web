"use client";

import { usePropertyFiltersStore } from "@/lib/stores/propertyFilters";
import { useCallback, useMemo } from "react";

// Area presets with labels and values in square meters
const AREA_MIN_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "50 sq.m.+", value: 50 },
  { label: "100 sq.m.+", value: 100 },
  { label: "150 sq.m.+", value: 150 },
  { label: "200 sq.m.+", value: 200 },
  { label: "300 sq.m.+", value: 300 },
];

const AREA_MAX_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "100 sq.m.", value: 100 },
  { label: "150 sq.m.", value: 150 },
  { label: "200 sq.m.", value: 200 },
  { label: "300 sq.m.", value: 300 },
  { label: "500 sq.m.", value: 500 },
];

/**
 * Custom hook for managing area filter state and logic
 */
export function useAreaFilter() {
  // Use selective store access to prevent unnecessary rerenders
  const minArea = usePropertyFiltersStore((state) => state.filters.minArea);
  const maxArea = usePropertyFiltersStore((state) => state.filters.maxArea);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  // Set minimum area
  const setMinArea = useCallback(
    (value: number) => {
      updateFilters({ minArea: value });
    },
    [updateFilters]
  );

  // Set maximum area
  const setMaxArea = useCallback(
    (value: number) => {
      updateFilters({ maxArea: value });
    },
    [updateFilters]
  );

  // Reset area filter
  const reset = useCallback(() => {
    updateFilters({ minArea: 0, maxArea: 0 });
  }, [updateFilters]);

  // Get display text for the filter button
  const getDisplayText = useCallback(() => {
    if (!minArea && !maxArea) {
      return "Area";
    }

    if (minArea && maxArea) {
      return `${minArea} - ${maxArea} sq.m.`;
    }

    if (minArea) {
      return `${minArea}+ sq.m.`;
    }

    if (maxArea) {
      return `0 - ${maxArea} sq.m.`;
    }

    return "Area";
  }, [minArea, maxArea]);

  // Check if the filter is active
  const hasActiveFilter = useMemo(() => {
    return (minArea !== undefined && minArea > 0) || (maxArea !== undefined && maxArea > 0);
  }, [minArea, maxArea]);

  // Check if a specific min value is selected
  const isMinSelected = useCallback(
    (value: number) => {
      return minArea === value;
    },
    [minArea]
  );

  // Check if a specific max value is selected
  const isMaxSelected = useCallback(
    (value: number) => {
      return maxArea === value;
    },
    [maxArea]
  );

  return {
    // State
    minArea: minArea ?? 0,
    maxArea: maxArea ?? 0,

    // Actions
    setMinArea,
    setMaxArea,
    reset,

    // Options and utilities
    areaMinOptions: AREA_MIN_OPTIONS,
    areaMaxOptions: AREA_MAX_OPTIONS,
    getDisplayText,
    hasActiveFilter,
    isMinSelected,
    isMaxSelected,
  };
}
