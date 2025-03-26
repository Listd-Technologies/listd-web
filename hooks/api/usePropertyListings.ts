/**
 * Adapter file for v1 API
 * This file provides backwards compatibility for components that were using the old usePropertyListings hook
 */

import { usePropertyFiltersStore } from "@/lib/stores/propertyFilters";
import { type PropertyType } from "@/types/property";
import { useProperties } from "./v1";
import { type PropertyQueryParams } from "./v1/types/property.types";

/**
 * Property listings filter interface
 * This is used by the property filters components
 */
export interface PropertyListingsFilter {
  listingType: "buy" | "rent";
  propertyType: PropertyType;
  location: string;
  minPrice?: number;
  maxPrice?: number;
  minSqmPrice?: number;
  maxSqmPrice?: number;
  activePriceType: "total" | "sqm";
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  // Location boundary fields
  centerLat?: number;
  centerLng?: number;
  radius?: number;
  boundMinX?: number;
  boundMinY?: number;
  boundMaxX?: number;
  boundMaxY?: number;
}

/**
 * Adapter hook that maps the old usePropertyListings to the new v1 useProperties hook
 * Uses the Zustand store for filters
 */
export function usePropertyListings(filters?: Partial<PropertyListingsFilter>) {
  // Get default values from the Zustand store if no filters are provided
  const storeFilters = usePropertyFiltersStore((state) => state.filters);
  const getV1QueryParams = usePropertyFiltersStore((state) => state.getV1QueryParams);

  // Merge provided filters with store filters, with provided filters taking precedence
  const mergedFilters = {
    ...storeFilters,
    ...filters,
  };

  // Convert PropertyListingsFilter to the format expected by v1 API
  const propertyType = mergedFilters.propertyType || "condominium";

  // Log what we're passing to the API for debugging
  console.log("usePropertyListings adapter", {
    filterListingType: mergedFilters.listingType,
    filterPropertyType: propertyType,
    mergedFilters,
  });

  // Use the store's getV1QueryParams function to generate query parameters
  const baseQuery = getV1QueryParams();

  // Merge with any explicitly passed filters
  const query: Record<string, unknown> = {
    ...baseQuery,
    // Override with any explicitly passed filters
    ...(filters?.minPrice !== undefined && { minPrice: filters.minPrice }),
    ...(filters?.maxPrice !== undefined && { maxPrice: filters.maxPrice }),
    ...(filters?.minArea !== undefined && { minSize: filters.minArea }),
    ...(filters?.maxArea !== undefined && { maxSize: filters.maxArea }),
    ...(filters?.minBedrooms !== undefined && { bedrooms: filters.minBedrooms }),
    ...(filters?.minBathrooms !== undefined && { bathrooms: filters.minBathrooms }),
  };

  // Use the v1 API hook
  return useProperties(query, {
    propertyType: propertyType as PropertyType,
    limit: 20,
    enabled: true,
  });
}

// Export types from v1 for backwards compatibility
export { type PropertyQueryParams };
