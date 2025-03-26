/**
 * Parameter and type mapping utilities for v1 API integration
 * These functions handle the conversion between application types and API expected formats
 */

import { ListingType, PropertyType } from "@/types/property";
import { Property, PropertySearchParams } from "../types";

/**
 * Converts application listing type to API format
 */
export function mapListingTypeToApi(listingType: ListingType): string {
  // In this case, the listing types match between app and API
  return listingType;
}

/**
 * Converts application property type to API format
 */
export function mapPropertyTypeToApi(propertyType: PropertyType): string {
  // Map kebab-case property types to the API's expected format
  switch (propertyType) {
    case "house-and-lot":
      return "houseAndLot"; // Example: API might use camelCase
    default:
      return propertyType; // For others, the format might be the same
  }
}

/**
 * Converts API property type back to application format
 */
export function mapPropertyTypeFromApi(apiPropertyType: string): PropertyType {
  // Map API property types back to application's kebab-case format
  switch (apiPropertyType) {
    case "houseAndLot":
      return "house-and-lot";
    default:
      return apiPropertyType as PropertyType;
  }
}

// Type for API filters to make transformations type-safe
interface ApiFilters {
  listing_type?: string;
  property_type?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  min_sqm_price?: number;
  max_sqm_price?: number;
  min_bedrooms?: number;
  min_bathrooms?: number;
  min_area?: number;
  max_area?: number;
  [key: string]: unknown;
}

/**
 * Transforms application search filters to API expected parameters
 */
export function transformFiltersToApiFormat(filters: Record<string, unknown>): ApiFilters {
  const result: ApiFilters = {};

  // Handle each parameter with appropriate mapping
  if (filters.listingType && typeof filters.listingType === "string") {
    result.listing_type = mapListingTypeToApi(filters.listingType as ListingType);
  }

  if (filters.propertyType && typeof filters.propertyType === "string") {
    result.property_type = mapPropertyTypeToApi(filters.propertyType as PropertyType);
  }

  // Map price parameters - assume API uses snake_case
  if (filters.minPrice !== undefined && typeof filters.minPrice === "number") {
    result.min_price = filters.minPrice;
  }

  if (filters.maxPrice !== undefined && typeof filters.maxPrice === "number") {
    result.max_price = filters.maxPrice;
  }

  if (filters.minSqmPrice !== undefined && typeof filters.minSqmPrice === "number") {
    result.min_sqm_price = filters.minSqmPrice;
  }

  if (filters.maxSqmPrice !== undefined && typeof filters.maxSqmPrice === "number") {
    result.max_sqm_price = filters.maxSqmPrice;
  }

  // Map other parameters
  if (filters.location && typeof filters.location === "string") {
    result.location = filters.location;
  }

  if (filters.minBedrooms !== undefined && typeof filters.minBedrooms === "number") {
    result.min_bedrooms = filters.minBedrooms;
  }

  if (filters.minBathrooms !== undefined && typeof filters.minBathrooms === "number") {
    result.min_bathrooms = filters.minBathrooms;
  }

  if (filters.minArea !== undefined && typeof filters.minArea === "number") {
    result.min_area = filters.minArea;
  }

  if (filters.maxArea !== undefined && typeof filters.maxArea === "number") {
    result.max_area = filters.maxArea;
  }

  return result;
}

// API property interface for mapping
interface ApiProperty {
  id: string;
  title: string;
  description: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type: string;
  listing_type: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  images?: Array<{
    id: string;
    url: string;
    is_primary: boolean;
  }>;
  features?: string[];
  owner_id: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

// Response pagination interface
interface ApiPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

// API Response interface
interface ApiResponse<T> {
  data?: T[];
  meta?: {
    pagination?: ApiPagination;
  };
}

/**
 * Transforms API response to application-compatible format
 */
export function transformPropertyFromApi(apiProperty: ApiProperty): Property {
  if (!apiProperty) return null as unknown as Property;

  return {
    id: apiProperty.id,
    title: apiProperty.title,
    description: apiProperty.description,
    price: apiProperty.price,
    area: apiProperty.area,
    bedrooms: apiProperty.bedrooms,
    bathrooms: apiProperty.bathrooms,
    propertyType: mapPropertyTypeFromApi(apiProperty.property_type),
    listingType: apiProperty.listing_type as "rent" | "buy",
    // Map other properties from snake_case to camelCase
    address: {
      street: apiProperty.address?.street || "",
      city: apiProperty.address?.city || "",
      state: apiProperty.address?.state || "",
      zipCode: apiProperty.address?.zip_code || "",
      country: apiProperty.address?.country || "",
      coordinates: apiProperty.address?.coordinates
        ? {
            latitude: apiProperty.address.coordinates.latitude || 0,
            longitude: apiProperty.address.coordinates.longitude || 0,
          }
        : undefined,
    },
    images:
      apiProperty.images?.map((img) => ({
        id: img.id,
        url: img.url,
        isPrimary: img.is_primary,
      })) || [],
    features: apiProperty.features || [],
    ownerId: apiProperty.owner_id,
    createdAt: apiProperty.created_at,
    updatedAt: apiProperty.updated_at,
  };
}

/**
 * Transforms API property list response to application format
 */
export function transformPropertyListFromApi(apiResponse: ApiResponse<ApiProperty>): {
  properties: Property[];
  pagination: {
    total: number;
    count: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
  } | null;
} {
  if (!apiResponse?.data) return { properties: [], pagination: null };

  return {
    properties: apiResponse.data.map(transformPropertyFromApi),
    pagination: apiResponse.meta?.pagination
      ? {
          total: apiResponse.meta.pagination.total,
          count: apiResponse.meta.pagination.count,
          perPage: apiResponse.meta.pagination.per_page,
          currentPage: apiResponse.meta.pagination.current_page,
          totalPages: apiResponse.meta.pagination.total_pages,
        }
      : null,
  };
}
