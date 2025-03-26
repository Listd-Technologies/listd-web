import { type PropertyFiltersState } from "@/lib/stores/propertyFilters";
import { ReadonlyURLSearchParams } from "next/navigation";

// Map camelCase filter properties to kebab-case URL parameters
const paramNameMap: Record<string, string> = {
  listingType: "listing-type",
  propertyType: "property-type",
  activePriceType: "price-type",
  minPrice: "min-price",
  maxPrice: "max-price",
  minSqmPrice: "min-sqm-price",
  maxSqmPrice: "max-sqm-price",
  minBedrooms: "bedrooms", // Keep as is for backward compatibility
  minBathrooms: "bathrooms", // Keep as is for backward compatibility
  minArea: "min-area",
  maxArea: "max-area",
  sortField: "sort-field",
  sortOrder: "sort-order",
  location: "location", // No change needed
};

// Reverse mapping for URL param to camelCase property
const reverseParamMap = Object.entries(paramNameMap).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Parse search params from URL into property filter values
 */
export function parseSearchParams(
  searchParams: ReadonlyURLSearchParams
): Partial<PropertyFiltersState["filters"]> {
  const result: Partial<PropertyFiltersState["filters"]> = {};

  // Process all URL parameters
  for (const [param, value] of Array.from(searchParams.entries())) {
    // Convert kebab-case param to camelCase property name
    const propertyName = reverseParamMap[param] || param;

    // Handle numeric parameters
    if (
      [
        "minPrice",
        "maxPrice",
        "minSqmPrice",
        "maxSqmPrice",
        "minArea",
        "maxArea",
        "minBedrooms",
        "minBathrooms",
      ].includes(propertyName)
    ) {
      (result as Record<string, number | string>)[propertyName] = Number(value);
    } else {
      // Handle string parameters
      (result as Record<string, number | string>)[propertyName] = value;
    }
  }

  return result;
}

/**
 * Generate URL search params string from property filters
 */
export function generateSearchParams(filters: PropertyFiltersState["filters"]): string {
  const params = new URLSearchParams();
  const mappedParams: Record<string, string> = {};

  // Process all filter properties that have values
  Object.entries(filters).forEach(([key, value]) => {
    // Skip empty/zero values
    if (value === undefined || value === null || value === 0 || value === "") {
      return;
    }

    // For string values, ensure they're not empty strings
    if (typeof value === "string" && value.trim() === "") {
      return;
    }

    // Convert camelCase property name to kebab-case URL parameter
    const paramName = paramNameMap[key] || key;
    params.append(paramName, String(value));
    mappedParams[paramName] = String(value);
  });

  console.log("🔄 URL parameters in kebab-case:", mappedParams);
  return params.toString();
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use generateSearchParams instead
 */
export function createQueryString(filters: PropertyFiltersState["filters"]): string {
  return generateSearchParams(filters);
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use parseSearchParams instead
 */
export function getFiltersFromUrl(
  searchParams: URLSearchParams
): Partial<PropertyFiltersState["filters"]> {
  // Create a ReadonlyURLSearchParams wrapper to match the new function signature
  const readonlyParams = {
    get: (key: string) => searchParams.get(key),
    getAll: (key: string) => searchParams.getAll(key),
    has: (key: string) => searchParams.has(key),
    keys: () => searchParams.keys(),
    values: () => searchParams.values(),
    entries: () => searchParams.entries(),
    forEach: (callback: (value: string, key: string) => void) => searchParams.forEach(callback),
    toString: () => searchParams.toString(),
  } as ReadonlyURLSearchParams;

  return parseSearchParams(readonlyParams);
}
