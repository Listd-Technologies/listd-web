/**
 * Adapter file for v1 API
 * This file provides backwards compatibility for components that were using the old usePropertyListings hook
 */

import { type PropertyType, mapListingTypeToApi } from "@/components/providers/listing-provider";
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
}

/**
 * Adapter hook that maps the old usePropertyListings to the new v1 useProperties hook
 * @deprecated Use useProperties from v1 directly instead
 */
export function usePropertyListings(filters?: Partial<PropertyListingsFilter>) {
  // Convert PropertyListingsFilter to the format expected by v1 API
  const propertyType = filters?.propertyType || "condominium";

  // Ensure listing type is correctly passed
  const listingType = filters?.listingType || "buy";

  // Log what we're passing to the API for debugging
  console.log("usePropertyListings adapter", {
    filterListingType: listingType,
    apiListingType: mapListingTypeToApi(listingType),
    filterPropertyType: propertyType,
    filters,
  });

  const query: Record<string, unknown> = {
    listingType: listingType, // Ensure this is explicitly set
    minPrice: filters?.minPrice,
    maxPrice: filters?.maxPrice,
    minSize: filters?.minArea,
    maxSize: filters?.maxArea,
    bedrooms: filters?.minBedrooms,
    bathrooms: filters?.minBathrooms,
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
