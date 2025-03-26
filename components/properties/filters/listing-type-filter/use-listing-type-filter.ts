"use client";

import { usePropertyFiltersStore } from "@/lib/stores/propertyFilters";
import { useCallback, useMemo } from "react";

// Listing types that match our context
const LISTING_TYPES = [
  { id: 1, name: "For Sale", value: "buy" as const },
  { id: 2, name: "For Rent", value: "rent" as const },
];

export type ListingType = "buy" | "rent";

/**
 * Custom hook for managing listing type filter state and logic
 */
export function useListingTypeFilter() {
  // Use selective store access to prevent unnecessary rerenders
  const listingType = usePropertyFiltersStore((state) => state.filters.listingType);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  // Set listing type with type safety
  const setListingType = useCallback(
    (type: ListingType) => {
      updateFilters({ listingType: type });
    },
    [updateFilters]
  );

  // Get display text for the filter button
  const getDisplayText = useCallback(() => {
    const selectedType = LISTING_TYPES.find((type) => type.value === listingType);
    return selectedType ? selectedType.name : "Listing Type";
  }, [listingType]);

  // Check if a specific listing type is selected
  const isSelected = useCallback(
    (type: ListingType) => {
      return listingType === type;
    },
    [listingType]
  );

  return {
    // State
    listingType,

    // Actions
    setListingType,

    // Options and utilities
    listingTypeOptions: LISTING_TYPES,
    getDisplayText,
    isSelected,
  };
}
