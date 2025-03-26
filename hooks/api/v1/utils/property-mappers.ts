/**
 * Property-specific parameter mapping utilities for v1 API
 * Handles transformation between frontend property parameters and API formats
 */

import { PropertyType } from "@/components/providers/listing-provider";
import {
  PropertyQueryParams,
  PropertyResponse,
  PropertyTypeMap,
  PropertyTypeToInterface,
} from "../types/property.types";

/**
 * Clean and transform property query parameters for API compatibility
 */
export function cleanPropertyQueryParams(query: Record<string, unknown>): PropertyQueryParams {
  const cleanQuery: PropertyQueryParams = {};

  // Debug log input
  const propertyType = query.propertyType as PropertyType;
  const isWarehouse = propertyType === "warehouse";

  if (isWarehouse) {
    console.log("🏭 Cleaning warehouse query params, input:", query);
  }

  // Handle property type separately - it's part of the URL path, not a query param
  if (query.propertyType) {
    delete cleanQuery.propertyType;
  }

  // Map min/max price
  if (query.minPrice !== undefined) {
    cleanQuery.minPrice = Number(query.minPrice);
  }

  if (query.maxPrice !== undefined) {
    cleanQuery.maxPrice = Number(query.maxPrice);
  }

  // Map listing type
  if (query.listingType) {
    // Convert from frontend "buy"/"rent" to API "for-sale"/"for-rent"
    const listingType = query.listingType as "buy" | "rent";
    cleanQuery.listing_type = listingType === "buy" ? "for-sale" : "for-rent";

    // Log the mapping for debugging
    console.log(
      `🔄 Mapping frontend listingType "${listingType}" → API listing_type "${cleanQuery.listing_type}"`
    );
  }

  // Map bedroom/bathroom filters
  if (query.minBedrooms !== undefined) {
    cleanQuery.bedrooms = Number(query.minBedrooms);
  }

  if (query.minBathrooms !== undefined) {
    cleanQuery.bathrooms = Number(query.minBathrooms);
  }

  // Map area filters
  if (query.minArea !== undefined) {
    cleanQuery.minSize = Number(query.minArea);
  }

  if (query.maxArea !== undefined) {
    cleanQuery.maxSize = Number(query.maxArea);
  }

  // Handle location parameters (centerX, centerY, radius)
  if (query.centerX !== undefined && query.centerY !== undefined) {
    cleanQuery["location.centerX"] = Number(query.centerX);
    cleanQuery["location.centerY"] = Number(query.centerY);
  }

  // Handle location bounds
  if (
    query.minX !== undefined &&
    query.minY !== undefined &&
    query.maxX !== undefined &&
    query.maxY !== undefined
  ) {
    cleanQuery["location.bounds.minX"] = Number(query.minX);
    cleanQuery["location.bounds.minY"] = Number(query.minY);
    cleanQuery["location.bounds.maxX"] = Number(query.maxX);
    cleanQuery["location.bounds.maxY"] = Number(query.maxY);
  }

  // Handle radius
  if (query.radius !== undefined) {
    cleanQuery["location.radius"] = Number(query.radius);
  }

  // Copy other parameters that don't need transformation
  const directCopyFields = [
    "page",
    "limit",
    "sortField",
    "sortOrder",
    "priceType",
    "parkingSpaces",
    "features",
    "amenities",
    "landmark",
    "listingCityId",
  ];

  for (const field of directCopyFields) {
    if (query[field] !== undefined) {
      cleanQuery[field] = query[field];
    }
  }

  // Debug log output for warehouse
  if (isWarehouse) {
    console.log("🏭 Cleaned warehouse query params, output:", cleanQuery);
  }

  return cleanQuery;
}

/**
 * Get the API endpoint path segment for a given property type
 */
export function getPropertyTypePathSegment(propertyType: PropertyType): string {
  switch (propertyType) {
    case "condominium":
      return "condominiums";
    case "house-and-lot":
      return "house-and-lots";
    case "vacant-lot":
      return "vacant-lots";
    case "warehouse":
      return "warehouses";
    default:
      return "condominiums";
  }
}

/**
 * Convert API property path segment back to frontend property type
 */
export function apiPathToPropertyType(pathSegment: string): PropertyType {
  return PropertyTypeMap[pathSegment as keyof typeof PropertyTypeMap] || "condominium";
}

/**
 * Transform a single property from API format to frontend format
 */
export function transformProperty<T extends PropertyType>(
  property: PropertyTypeToInterface<T>
): PropertyTypeToInterface<T> {
  // The API format is already close to what we need, so return as is
  // If in the future we need to transform properties, we can add logic here
  return property;
}

/**
 * Transform property list response from API format to frontend format
 */
export function transformPropertyResponse<T extends PropertyType>(
  response: PropertyResponse<T>
): PropertyResponse<T> {
  if (!response.data?.results) {
    return response;
  }

  // Map pagination fields to match our expected format if needed
  const transformedResponse = {
    ...response,
    data: {
      ...response.data,
      results: response.data.results.map((property) => transformProperty<T>(property)),
    },
  };

  return transformedResponse;
}
