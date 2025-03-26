"use client";

import { usePropertyFiltersStore } from "@/lib/stores/propertyFilters";
import { useCallback, useMemo } from "react";

// Bedrooms options with labels and values
const BEDROOMS_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "1+", value: 1 },
  { label: "2+", value: 2 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "5+", value: 5 },
];

/**
 * Custom hook for managing bedrooms filter state and logic
 */
export function useBedroomsFilter() {
  // Use selective store access to prevent unnecessary rerenders
  const minBedrooms = usePropertyFiltersStore((state) => state.filters.minBedrooms);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  // Set minimum number of bedrooms
  const setMinBedrooms = useCallback(
    (value: number) => {
      updateFilters({ minBedrooms: value });
    },
    [updateFilters]
  );

  // Reset bedrooms filter
  const reset = useCallback(() => {
    updateFilters({ minBedrooms: 0 });
  }, [updateFilters]);

  // Get display text for the filter button
  const getDisplayText = useCallback(() => {
    if (!minBedrooms || minBedrooms === 0) {
      return "Bedrooms";
    }

    return `${minBedrooms}+ Bed${minBedrooms === 1 ? "" : "s"}`;
  }, [minBedrooms]);

  // Check if the filter is active
  const hasActiveFilter = useMemo(() => {
    return minBedrooms !== undefined && minBedrooms > 0;
  }, [minBedrooms]);

  // Check if a specific value is selected
  const isSelected = useCallback(
    (value: number) => {
      return minBedrooms === value;
    },
    [minBedrooms]
  );

  return {
    // State
    minBedrooms: minBedrooms ?? 0,

    // Actions
    setMinBedrooms,
    reset,

    // Options and utilities
    bedroomsOptions: BEDROOMS_OPTIONS,
    getDisplayText,
    hasActiveFilter,
    isSelected,
  };
}
