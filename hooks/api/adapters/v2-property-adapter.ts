/**
 * v2 Implementation of the Property API Adapter (Placeholder)
 *
 * This adapter implements the PropertyApiAdapter interface using the v2 API endpoints.
 * Note: This is a placeholder implementation that will be completed when the v2 API
 * is ready for integration.
 */

import { type ListingType, type PropertyType } from "@/components/providers/listing-provider";
import { PropertyTypeToInterface } from "../v1/types/property.types";
import {
  PropertyApiAdapter,
  PropertyFilter,
  PropertyListingsResponse,
  StandardizedPropertyListing,
} from "./property-adapter";

/**
 * v2 Implementation of the Property API Adapter
 *
 * This is a placeholder that will be implemented when the v2 API is ready.
 * Currently, it throws an error if any methods are called.
 */
export class V2PropertyAdapter implements PropertyApiAdapter {
  /**
   * Get property listings with filters
   * @throws Error This is a placeholder implementation
   */
  async getPropertyListings(_filters: PropertyFilter): Promise<PropertyListingsResponse> {
    // Parameters are intentionally unused in this placeholder implementation
    throw new Error("V2 API is not yet implemented. Please use the V1PropertyAdapter instead.");
  }

  /**
   * Get a single property by ID
   * @throws Error This is a placeholder implementation
   */
  async getPropertyById(
    _id: string,
    _propertyType: PropertyType
  ): Promise<StandardizedPropertyListing> {
    // Parameters are intentionally unused in this placeholder implementation
    throw new Error("V2 API is not yet implemented. Please use the V1PropertyAdapter instead.");
  }

  /**
   * Get featured properties
   * @throws Error This is a placeholder implementation
   */
  async getFeaturedProperties(
    _propertyType?: PropertyType,
    _listingType?: ListingType,
    _limit?: number
  ): Promise<StandardizedPropertyListing[]> {
    // Parameters are intentionally unused in this placeholder implementation
    throw new Error("V2 API is not yet implemented. Please use the V1PropertyAdapter instead.");
  }

  /**
   * Search properties by geographic location
   * @throws Error This is a placeholder implementation
   */
  async searchPropertiesByLocation(
    _latitude: number,
    _longitude: number,
    _radius: number,
    _filters?: PropertyFilter
  ): Promise<StandardizedPropertyListing[]> {
    // Parameters are intentionally unused in this placeholder implementation
    throw new Error("V2 API is not yet implemented. Please use the V1PropertyAdapter instead.");
  }

  /**
   * Transform a v1 API property to the standardized format
   * This is a placeholder implementation since v2 adapter shouldn't need to transform v1 data
   * @throws Error This is a placeholder implementation
   */
  transformV1Property<T extends PropertyType>(
    _property: PropertyTypeToInterface<T> | Record<string, unknown>,
    _propertyType: T,
    _filter?: PropertyFilter
  ): StandardizedPropertyListing {
    throw new Error("V2 API is not yet implemented. Please use the V1PropertyAdapter instead.");
  }
}
