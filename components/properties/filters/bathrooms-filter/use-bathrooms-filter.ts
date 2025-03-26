"use client";

import { usePropertyFiltersStore } from "@/lib/stores/propertyFilters";
import { useCallback, useMemo } from "react";

// Bathrooms options with labels and values
const BATHROOMS_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "1+", value: 1 },
  { label: "1.5+", value: 1.5 },
  { label: "2+", value: 2 },
  { label: "2.5+", value: 2.5 },
  { label: "3+", value: 3 },
];

/**
 * Custom hook for managing bathrooms filter state and logic
 */
export function useBathroomsFilter() {
  // Use selective store access to prevent unnecessary rerenders
  const minBathrooms = usePropertyFiltersStore((state) => state.filters.minBathrooms);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  // Set minimum number of bathrooms
  const setMinBathrooms = useCallback(
    (value: number) => {
      updateFilters({ minBathrooms: value });
    },
    [updateFilters]
  );

  // Reset bathrooms filter
  const reset = useCallback(() => {
    updateFilters({ minBathrooms: 0 });
  }, [updateFilters]);

  // Get display text for the filter button
  const getDisplayText = useCallback(() => {
    if (!minBathrooms || minBathrooms === 0) {
      return "Bathrooms";
    }

    return `${minBathrooms}+ Bath${minBathrooms === 1 ? "" : "s"}`;
  }, [minBathrooms]);

  // Check if the filter is active
  const hasActiveFilter = useMemo(() => {
    return minBathrooms !== undefined && minBathrooms > 0;
  }, [minBathrooms]);

  // Check if a specific value is selected
  const isSelected = useCallback(
    (value: number) => {
      return minBathrooms === value;
    },
    [minBathrooms]
  );

  return {
    // State
    minBathrooms: minBathrooms ?? 0,

    // Actions
    setMinBathrooms,
    reset,

    // Options and utilities
    bathroomsOptions: BATHROOMS_OPTIONS,
    getDisplayText,
    hasActiveFilter,
    isSelected,
  };
}
