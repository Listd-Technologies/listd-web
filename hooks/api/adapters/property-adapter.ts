/**
 * Property API Adapter Interface
 *
 * This adapter provides a unified interface for working with both v1 and v2
 * property API endpoints. Implementations of this interface can be found in:
 *
 * - v1PropertyAdapter.ts - Legacy API implementation
 * - v2PropertyAdapter.ts - Modern API implementation (will be implemented when the v2 API is ready)
 */

import { type PropertyImage } from "@/components/listings/property-cards/property-card";
import { type ListingType, type PropertyType } from "@/types/property";
import { PropertyTypeToInterface } from "../v1/types/property.types";

// Common features for properties
export interface PropertyFeatures {
  // Common features
  area?: number;
  lotSize?: number;
  yearBuilt?: number;
  garages?: number;
  bedrooms?: number;
  bathrooms?: number;
  ceilingHeight?: number;
  // Allow for additional features with string keys and number values
  [key: string]: number | undefined;
}

/**
 * Standardized property listing object used across the app
 */
export interface StandardizedPropertyListing {
  id: string;
  title: string;
  description: string;
  price: number;
  formattedPrice?: string; // Formatted price from API (e.g., "₱ 11,000")
  shortFormattedPrice?: string; // Short formatted price (e.g., "₱11K")
  pricePerSqmFormatted?: string; // Price per sqm formatted (e.g., "₱ 423")
  formattedSize?: string; // Formatted size (e.g., "26 sqm")
  location: string;
  propertyType: PropertyType;
  listingType: "buy" | "rent";
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  features: PropertyFeatures;
  images: PropertyImage[];
  mapLocation?: {
    lat: number;
    lng: number;
  };
  // UI enhancement flags
  isFeatured?: boolean;
  isNew?: boolean;
  isFavorited?: boolean;
  // Agent or broker information
  agent?: string;
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Standardized filters for property listings
 */
export interface PropertyFilter {
  listingType?: ListingType;
  propertyType?: PropertyType;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minSqmPrice?: number;
  maxSqmPrice?: number;
  activePriceType?: "total" | "sqm";
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

/**
 * Standardized pagination response
 */
export interface PaginationInfo {
  total: number;
  currentPage: number;
  totalPages: number;
  nextPage?: number;
  prevPage?: number;
}

/**
 * Standardized response for property listings
 */
export interface PropertyListingsResponse {
  data: StandardizedPropertyListing[];
  pagination: PaginationInfo;
}

/**
 * Property API Adapter Interface
 */
export interface PropertyApiAdapter {
  /**
   * Get property listings with filters
   */
  getPropertyListings(filters: PropertyFilter): Promise<PropertyListingsResponse>;

  /**
   * Get a single property by ID
   */
  getPropertyById(id: string, propertyType: PropertyType): Promise<StandardizedPropertyListing>;

  /**
   * Get featured properties
   */
  getFeaturedProperties(
    propertyType?: PropertyType,
    listingType?: ListingType,
    limit?: number
  ): Promise<StandardizedPropertyListing[]>;

  /**
   * Search properties by geographic location
   */
  searchPropertiesByLocation(
    latitude: number,
    longitude: number,
    radius: number,
    filters?: PropertyFilter
  ): Promise<StandardizedPropertyListing[]>;

  /**
   * Transform a raw v1 API property to the standardized format
   * This is used by components that receive raw API data and need to transform it
   */
  transformV1Property<T extends PropertyType>(
    property: PropertyTypeToInterface<T> | Record<string, unknown>,
    propertyType: T,
    filter?: PropertyFilter
  ): StandardizedPropertyListing;
}
