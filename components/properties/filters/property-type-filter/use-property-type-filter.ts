"use client";

import { usePropertyFiltersStore } from "@/lib/stores/propertyFilters";
import { DISABLED_PROPERTY_TYPES, PropertyType } from "@/types/property";
import { useCallback, useMemo } from "react";

// Property types that match our context
const PROPERTY_TYPES = [
  { id: 1, name: "Condominium", value: "condominium" as PropertyType },
  { id: 2, name: "House and Lot", value: "house-and-lot" as PropertyType },
  { id: 3, name: "Vacant Lot", value: "vacant-lot" as PropertyType },
  { id: 4, name: "Warehouse", value: "warehouse" as PropertyType },
];

/**
 * Custom hook for managing property type filter state and logic
 */
export function usePropertyTypeFilter() {
  // Use selective store access to prevent unnecessary rerenders
  const propertyType = usePropertyFiltersStore((state) => state.filters.propertyType);
  const listingType = usePropertyFiltersStore((state) => state.filters.listingType);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  // Set property type with type safety
  const setPropertyType = useCallback(
    (type: PropertyType) => {
      updateFilters({ propertyType: type });
    },
    [updateFilters]
  );

  // Property types with disabled state based on listing type
  const propertyTypeOptions = useMemo(() => {
    return PROPERTY_TYPES.map((type) => ({
      ...type,
      disabled: DISABLED_PROPERTY_TYPES.includes(type.value),
    }));
  }, []);

  // Get display text for the filter button
  const getDisplayText = useCallback(() => {
    const selectedType = PROPERTY_TYPES.find((type) => type.value === propertyType);
    return selectedType ? selectedType.name : "Property Type";
  }, [propertyType]);

  // Check if the current property type is valid for the current listing type
  const isCurrentTypeValid = useMemo(() => {
    return !DISABLED_PROPERTY_TYPES.includes(propertyType);
  }, [propertyType]);

  return {
    // State
    propertyType,
    listingType,

    // Actions
    setPropertyType,

    // Options and utilities
    propertyTypeOptions,
    getDisplayText,
    isCurrentTypeValid,
  };
}
