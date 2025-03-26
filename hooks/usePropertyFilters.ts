"use client";

import { type ListingType, type PropertyType } from "@/components/providers/listing-provider";
import { type PropertyListingsFilter } from "@/hooks/api/usePropertyListings";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";

// Default filter values for internal use
const DEFAULT_FILTERS: PropertyListingsFilter = {
  listingType: "buy",
  propertyType: "condominium",
  location: "",
  minPrice: 0,
  maxPrice: 0,
  minSqmPrice: 0,
  maxSqmPrice: 0,
  activePriceType: "total",
  minBedrooms: 0,
  minBathrooms: 0,
  minArea: 0,
  maxArea: 0,
};

// Define Zod schema for filter validation
const propertyTypeSchema = z.enum(["condominium", "house-and-lot", "vacant-lot", "warehouse"]);
const listingTypeSchema = z.enum(["buy", "rent"]);
const priceTypeSchema = z.enum(["total", "sqm"]);

// Full schema for all filters
const filtersSchema = z.object({
  listingType: listingTypeSchema.default("buy"),
  propertyType: propertyTypeSchema.default("condominium"),
  location: z.string().default(""),
  minPrice: z.number().min(0).default(0),
  maxPrice: z.number().min(0).default(0),
  minSqmPrice: z.number().min(0).default(0),
  maxSqmPrice: z.number().min(0).default(0),
  activePriceType: priceTypeSchema.default("total"),
  minBedrooms: z.number().min(0).default(0),
  minBathrooms: z.number().min(0).default(0),
  minArea: z.number().min(0).default(0),
  maxArea: z.number().min(0).default(0),
});

// Schema for partial filter updates
const partialFiltersSchema = filtersSchema.partial();

// Type extraction from schema
type PartialValidatedFilters = z.infer<typeof partialFiltersSchema>;

/**
 * Hook for managing property filters in URL parameters
 *
 * This implementation uses Next.js's native routing capabilities:
 * 1. Reads filters from URL search params
 * 2. Provides a method to update filters that updates both state and URL
 * 3. Handles conversion between URL parameters and application state
 */
export function usePropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters state from URL parameters
  const [filters, setFilters] = useState<PropertyListingsFilter>(() => {
    // Get the initial parameters from the URL
    const params = paramsToObject(searchParams);
    console.log("Initial URL params:", params);

    // Convert to our filter format
    const initialFilters = urlParamsToFilters(params);
    console.log("Initial filters:", initialFilters);

    return initialFilters;
  });

  // Update internal state when URL changes
  useEffect(() => {
    const params = paramsToObject(searchParams);
    const newFilters = urlParamsToFilters(params);
    console.log("URL params changed:", params);
    console.log("New filters from URL:", newFilters);

    // Compare current filters with new ones to avoid unnecessary updates
    const hasChanged = Object.entries(newFilters).some(
      ([key, value]) => filters[key as keyof PropertyListingsFilter] !== value
    );

    if (hasChanged) {
      console.log("Updating filters from URL changes");
      setFilters(newFilters);
    }
  }, [searchParams, filters]);

  // Update URL and internal state when filters change
  const updateFilters = useCallback(
    (newFilters: PartialValidatedFilters) => {
      // Validate new filters with Zod
      const validatedNewFilters = partialFiltersSchema.parse(newFilters);

      // Merge existing filters with validated new ones
      const mergedFilters = {
        ...filters,
        ...validatedNewFilters,
      };

      // Calculate new URL params
      const newParams = filtersToUrlParams(mergedFilters);
      const newUrl = createUrlWithParams(newParams);

      // Get current URL path + search
      const currentUrl = window.location.pathname + window.location.search;

      // Only update if there's an actual change to avoid loops
      if (newUrl !== currentUrl) {
        // Update internal state first
        setFilters(mergedFilters);

        // Return a promise that resolves after the URL is updated
        // This allows components to await the URL update before navigating
        return new Promise<void>((resolve) => {
          // Update URL and resolve the promise when done
          router.push(newUrl, { scroll: false });
          // Use a small timeout to ensure the URL update completes
          setTimeout(resolve, 50);
        });
      }

      // Return a resolved promise if no changes are needed
      return Promise.resolve();
    },
    [filters, router]
  );

  return {
    filters,
    updateFilters,
  };
}

/**
 * Helper to convert URLSearchParams to a plain object
 */
function paramsToObject(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Helper to create a URL with the given parameters
 */
function createUrlWithParams(params: Record<string, string | number | undefined>): string {
  const url = new URL(window.location.href);

  // Clear existing params
  url.search = "";

  // Add new params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== 0) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.pathname + url.search;
}

/**
 * Helper to convert URL parameters to our internal filter format
 * with Zod validation for type safety
 *
 * @param params The URL parameters to convert
 * @returns A complete PropertyListingsFilter object
 */
export function urlParamsToFilters(
  params: Record<string, string | number | undefined>
): PropertyListingsFilter {
  const getNumberValue = (key: string, fallbackKey?: string) => {
    // Try with the primary key first
    const value = params[key];
    if (value != null) {
      return Number(value);
    }

    // If fallbackKey is provided and primary key isn't found, try with fallback
    if (fallbackKey && params[fallbackKey] != null) {
      return Number(params[fallbackKey]);
    }

    // Default to 0 if neither key exists
    return 0;
  };

  // Handle listing type with careful checking
  let listingType: ListingType = "buy"; // Default
  if (params["listing-type"] === "for-rent") {
    listingType = "rent";
  } else if (params["listing-type"] === "for-sale") {
    listingType = "buy";
  }

  // Handle property type with validation
  let propertyType = (params["property-type"] as PropertyType) || "condominium";
  // Ensure it's a valid property type
  if (!["condominium", "house-and-lot", "vacant-lot", "warehouse"].includes(propertyType)) {
    propertyType = "condominium"; // Default if invalid
  }

  // Create filter object from params - using kebab-case params
  // but with fallbacks to camelCase for backward compatibility
  const rawFilters = {
    listingType,
    propertyType,
    location: (params["location"] as string) || "",
    minPrice: getNumberValue("min-price", "minPrice"),
    maxPrice: getNumberValue("max-price", "maxPrice"),
    minSqmPrice: getNumberValue("min-sqm-price", "minSqmPrice"),
    maxSqmPrice: getNumberValue("max-sqm-price", "maxSqmPrice"),
    activePriceType: (params["price-type"] as "total" | "sqm") || "total",
    minBedrooms: getNumberValue("min-bedrooms", "minBedrooms"),
    minBathrooms: getNumberValue("min-bathrooms", "minBathrooms"),
    minArea: getNumberValue("min-area", "minArea"),
    maxArea: getNumberValue("max-area", "maxArea"),
  };

  // Validate with Zod schema and apply defaults
  try {
    return filtersSchema.parse(rawFilters);
  } catch (error) {
    console.error("Filter validation error:", error);
    return DEFAULT_FILTERS;
  }
}

/**
 * Helper to convert our internal filter format to URL parameters
 *
 * @param filters The filters to convert
 * @returns URL parameters
 */
export function filtersToUrlParams(
  filters: Partial<PropertyListingsFilter>
): Record<string, string | number | undefined> {
  const params: Record<string, string | number | undefined> = {};

  // Handle listing type with careful checking
  if (filters.listingType === "rent") {
    params["listing-type"] = "for-rent";
  } else if (filters.listingType === "buy") {
    params["listing-type"] = "for-sale";
  } else {
    // Default fallback
    params["listing-type"] = "for-sale";
  }

  // Set property type with default fallback
  if (filters.propertyType) {
    params["property-type"] = filters.propertyType;
  } else {
    params["property-type"] = "condominium";
  }

  // Set location if present
  if (filters.location?.trim()) {
    params.location = filters.location.trim();
  }

  // Set price type
  params["price-type"] = filters.activePriceType || "total";

  // Add numeric filters only if they have meaningful values - all in kebab-case
  if (filters.minPrice && filters.minPrice > 0) {
    params["min-price"] = filters.minPrice;
  }

  if (filters.maxPrice && filters.maxPrice > 0) {
    params["max-price"] = filters.maxPrice;
  }

  if (filters.minSqmPrice && filters.minSqmPrice > 0) {
    params["min-sqm-price"] = filters.minSqmPrice;
  }

  if (filters.maxSqmPrice && filters.maxSqmPrice > 0) {
    params["max-sqm-price"] = filters.maxSqmPrice;
  }

  if (filters.minBedrooms && filters.minBedrooms > 0) {
    params["min-bedrooms"] = filters.minBedrooms;
  }

  if (filters.minBathrooms && filters.minBathrooms > 0) {
    params["min-bathrooms"] = filters.minBathrooms;
  }

  if (filters.minArea && filters.minArea > 0) {
    params["min-area"] = filters.minArea;
  }

  if (filters.maxArea && filters.maxArea > 0) {
    params["max-area"] = filters.maxArea;
  }

  return params;
}
