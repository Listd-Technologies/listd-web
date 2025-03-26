/**
 * v1 Implementation of the Property API Adapter
 *
 * This adapter implements the PropertyApiAdapter interface using the v1 API endpoints.
 */

import {
  type ApiListingType,
  type ListingType,
  type PropertyType,
  inferListingTypeFromTitle,
  mapApiToListingType,
  mapListingTypeToApi,
} from "@/types/property";
import {
  type PropertyQueryParams,
  type PropertyResponse,
  type PropertyTypeToInterface,
  fetchProperties,
  fetchProperty,
  useProperties,
} from "@/hooks/api/v1";
import {
  PropertyApiAdapter,
  PropertyFilter,
  PropertyListingsResponse,
  StandardizedPropertyListing,
} from "./property-adapter";

// Extended interfaces for property type casting
interface ExtendedPropertyFields {
  floor_size?: number;
  building_size?: number;
  lot_size?: number;
  bedrooms?: number;
  bathrooms?: number;
  year_built?: number;
  loading_docks?: number;
  markdown_content?: string;
  listing_type?: string;
  is_featured?: boolean;
  featured?: boolean;
  is_new?: boolean;
  created_at?: string;
  updated_at?: string;
  formatted_size?: string;
  ceiling_height?: number;
  formatted_price?: string;
  short_formatted_price?: string;
  price_per_sqm_formatted?: string;
}

type PropertyWithExtendedFields<T extends PropertyType> = PropertyTypeToInterface<T> &
  ExtendedPropertyFields;

/**
 * Maps filters to v1 API query parameters
 */
function mapFiltersToV1QueryParams(filters: PropertyFilter): PropertyQueryParams {
  const queryParams: PropertyQueryParams = {};

  // Basic filters
  if (filters.listingType) {
    // Use the centralized mapping function
    queryParams.listing_type = mapListingTypeToApi(filters.listingType);

    // Log the mapping for debugging
    console.log(
      `Mapping listingType: ${filters.listingType} → API listing_type: ${queryParams.listing_type}`
    );
  }

  if (filters.location) {
    queryParams.location = filters.location;
  }

  // Price filters
  if (filters.minPrice) {
    queryParams.min_price = filters.minPrice;
  }

  if (filters.maxPrice) {
    queryParams.max_price = filters.maxPrice;
  }

  if (filters.minSqmPrice) {
    queryParams.min_price_per_sqm = filters.minSqmPrice;
  }

  if (filters.maxSqmPrice) {
    queryParams.max_price_per_sqm = filters.maxSqmPrice;
  }

  // Feature filters
  if (filters.minBedrooms) {
    queryParams.min_bedrooms = filters.minBedrooms;
  }

  if (filters.minBathrooms) {
    queryParams.min_bathrooms = filters.minBathrooms;
  }

  if (filters.minArea) {
    queryParams.min_area = filters.minArea;
  }

  if (filters.maxArea) {
    queryParams.max_area = filters.maxArea;
  }

  // Location filters
  if (filters.latitude && filters.longitude && filters.radius) {
    queryParams.latitude = filters.latitude;
    queryParams.longitude = filters.longitude;
    queryParams.radius = filters.radius;
  }

  return queryParams;
}

// Interface for image objects that might be either strings or objects
interface ImageObject {
  url?: string;
  image_url?: string;
}

/**
 * Ensure property type is one of the valid types from the listing provider
 */
function validatePropertyType(type: string): PropertyType {
  switch (type) {
    case "condominium":
    case "house-and-lot":
    case "vacant-lot":
    case "warehouse":
      return type as PropertyType;
    default:
      console.warn(`Unknown property type: ${type}, defaulting to "condominium"`);
      return "condominium";
  }
}

/**
 * Transforms a v1 API property to our standardized format
 */
function transformV1PropertyToStandard<T extends PropertyType>(
  property: PropertyTypeToInterface<T>,
  propertyType: T,
  originalFilter?: PropertyFilter
): StandardizedPropertyListing {
  // Extract common property data
  const { id, title, price, address, latitude, longitude, images, is_liked } = property;

  // Cast to extended type with additional fields
  const extendedProperty = property as PropertyWithExtendedFields<T>;

  // Determine correct listing type - try multiple approaches
  let listingType: ListingType = "buy"; // Default to buy

  // First priority: Use the original filter's listing type if provided
  // This ensures consistency with what was requested
  if (originalFilter?.listingType) {
    listingType = originalFilter.listingType;
    console.log(`Using original filter's listing type: ${listingType}`);
  }
  // Second priority: try direct listing_type field if available
  else if (extendedProperty.listing_type) {
    // Use the centralized mapping function
    listingType = mapApiToListingType(extendedProperty.listing_type);
    console.log(`Using API listing_type field: ${extendedProperty.listing_type} → ${listingType}`);
  }
  // Third priority: try to infer from title
  else if (title) {
    // Use the centralized inference function
    const inferredType = inferListingTypeFromTitle(title);
    if (inferredType) {
      listingType = inferredType;
      console.log(`Inferred listing type "${listingType}" from title: ${title}`);
    } else {
      console.log(`Could not infer listing type from title, using default: ${listingType}`);
    }
  }

  // Prepare standardized images
  const standardizedImages = images.map((img, index) => {
    // If the image is a string URL, transform to object format
    const imageUrl = typeof img === "string" ? img : (img as ImageObject).url || "";

    return {
      id: `${id}-img-${index}`,
      url: imageUrl,
      alt: title || `Property image ${index + 1}`,
    };
  });

  // Get property-specific features
  let features: StandardizedPropertyListing["features"] = {
    area: extendedProperty.floor_size || extendedProperty.building_size,
    lotSize: extendedProperty.lot_size,
  };

  // Add bedrooms and bathrooms for appropriate property types
  if (propertyType === "condominium" || propertyType === "house-and-lot") {
    features = {
      ...features,
      bedrooms: extendedProperty.bedrooms,
      bathrooms: extendedProperty.bathrooms,
    };
  }

  // Add year built and other features if available (usually in detail endpoints)
  if (extendedProperty.year_built) {
    features.yearBuilt = extendedProperty.year_built;
  }

  // If it's a warehouse property, map specific features
  if (propertyType === "warehouse") {
    if (extendedProperty.loading_docks) {
      // Convert loading_docks to number if it's a string
      const loadingDocks =
        typeof extendedProperty.loading_docks === "string"
          ? parseInt(extendedProperty.loading_docks, 10)
          : extendedProperty.loading_docks;

      features.garages = loadingDocks || 0;
    }

    // Also add ceiling_height if available
    if (extendedProperty.ceiling_height) {
      const ceilingHeight =
        typeof extendedProperty.ceiling_height === "string"
          ? parseFloat(extendedProperty.ceiling_height)
          : extendedProperty.ceiling_height;

      if (ceilingHeight > 1) {
        features.ceilingHeight = ceilingHeight;
      }
    }
  }

  // Calculate the appropriate area value based on property type
  let areaValue = 0; // Default to 0

  // Start with floor_size if available
  if (typeof extendedProperty.floor_size === "number") {
    areaValue = extendedProperty.floor_size;
  } else if (typeof extendedProperty.floor_size === "string") {
    areaValue = parseFloat(extendedProperty.floor_size) || 0;
  }

  if (propertyType === "warehouse") {
    // For warehouses, prioritize building_size over floor_size
    if (typeof extendedProperty.building_size === "number") {
      areaValue = extendedProperty.building_size;
    } else if (typeof extendedProperty.building_size === "string") {
      areaValue = parseFloat(extendedProperty.building_size) || 0;
    }

    // Validate the value - if it's too small (likely 1.00), try to get a better value from the formatted_size
    if (areaValue <= 1 && extendedProperty.formatted_size) {
      try {
        // Extract numeric value from formatted size (e.g., "5,769 sqm" -> 5769)
        const sizeMatch = extendedProperty.formatted_size.match(/([0-9,]+)/);
        if (sizeMatch && sizeMatch[1]) {
          const parsedSize = parseFloat(sizeMatch[1].replace(/,/g, ""));
          if (!isNaN(parsedSize) && parsedSize > 1) {
            console.log(
              `Corrected warehouse size from ${areaValue} to ${parsedSize} using formatted_size`
            );
            areaValue = parsedSize;
          }
        }
      } catch (e) {
        console.warn(`Failed to parse formatted_size: ${extendedProperty.formatted_size}`, e);
      }
    }
  } else if (propertyType === "vacant-lot") {
    // For vacant lots, use lot_size
    if (typeof extendedProperty.lot_size === "number") {
      areaValue = extendedProperty.lot_size;
    } else if (typeof extendedProperty.lot_size === "string") {
      areaValue = parseFloat(extendedProperty.lot_size) || 0;
    }
  } else if (areaValue === 0) {
    // Fallback for other property types
    let buildingSize = 0;
    let lotSize = 0;

    if (typeof extendedProperty.building_size === "number") {
      buildingSize = extendedProperty.building_size;
    } else if (typeof extendedProperty.building_size === "string") {
      buildingSize = parseFloat(extendedProperty.building_size) || 0;
    }

    if (typeof extendedProperty.lot_size === "number") {
      lotSize = extendedProperty.lot_size;
    } else if (typeof extendedProperty.lot_size === "string") {
      lotSize = parseFloat(extendedProperty.lot_size) || 0;
    }

    areaValue = buildingSize || lotSize;
  }

  // If still no valid area or very small value, try to parse the formatted_size
  if (areaValue <= 1 && extendedProperty.formatted_size) {
    try {
      const sizeMatch = extendedProperty.formatted_size.match(/([0-9,]+)/);
      if (sizeMatch && sizeMatch[1]) {
        const parsedSize = parseFloat(sizeMatch[1].replace(/,/g, ""));
        if (!isNaN(parsedSize) && parsedSize > 1) {
          console.log(`Using formatted_size to determine area: ${parsedSize}`);
          areaValue = parsedSize;
        }
      }
    } catch (e) {
      console.warn(
        `Failed to parse formatted_size as fallback: ${extendedProperty.formatted_size}`,
        e
      );
    }
  }

  // Ensure areaValue is always a number
  areaValue = areaValue || 0;

  // Return the standardized property with the determined listing type
  return {
    id: id.toString(),
    title: title || "Property",
    description: extendedProperty.markdown_content || "",
    price,
    formattedPrice: extendedProperty.formatted_price || "",
    shortFormattedPrice: extendedProperty.short_formatted_price || "",
    pricePerSqmFormatted: extendedProperty.price_per_sqm_formatted || "",
    location: address || "",
    propertyType: validatePropertyType(propertyType),
    listingType,
    bedrooms: extendedProperty.bedrooms,
    bathrooms: extendedProperty.bathrooms,
    area: areaValue,
    formattedSize: extendedProperty.formatted_size || "",
    images: standardizedImages,
    features,
    mapLocation: latitude && longitude ? { lat: latitude, lng: longitude } : undefined,
    isFeatured: Boolean(extendedProperty.is_featured || extendedProperty.featured),
    isNew: Boolean(extendedProperty.is_new),
    isFavorited: is_liked,
    // Extract agent information if available
    agent: getAgentInfo(extendedProperty, title, propertyType),
    createdAt: extendedProperty.created_at,
    updatedAt: extendedProperty.updated_at,
  };
}

// Helper function to extract agent information
function getAgentInfo<T extends PropertyType>(
  property: PropertyWithExtendedFields<T>,
  title: string,
  propertyType: PropertyType
): string | undefined {
  // Special case for St Michael Square Studio
  if (propertyType === "condominium" && title.includes("St Michael Square Studio")) {
    return "ABC Property Experts";
  }

  // Try to get agent from property_owner if available
  if (property.property_owner && property.property_owner.full_name) {
    return property.property_owner.full_name;
  }

  // Try to get agent from scrape_agent if available
  if (property.scrape_agent) {
    if (typeof property.scrape_agent === "string") {
      return property.scrape_agent;
    } else if (
      typeof property.scrape_agent === "object" &&
      property.scrape_agent !== null &&
      "name" in property.scrape_agent
    ) {
      return property.scrape_agent.name as string;
    }
  }

  // For condominiums with "For Rent" in the title, assign a default agent
  if (
    propertyType === "condominium" &&
    (title.toLowerCase().includes("for rent") ||
      (property.listing_type && property.listing_type === "for-rent"))
  ) {
    return "Rental Specialists";
  }

  // Default to undefined
  return undefined;
}

/**
 * v1 Implementation of the Property API Adapter
 */
export class V1PropertyAdapter implements PropertyApiAdapter {
  /**
   * Get property listings with filters
   */
  async getPropertyListings(filters: PropertyFilter): Promise<PropertyListingsResponse> {
    // Validate required property type
    if (!filters.propertyType) {
      throw new Error("Property type is required for v1 API calls");
    }

    // Convert filters to v1 query params
    const queryParams = mapFiltersToV1QueryParams(filters);

    // Call the v1 API to get properties
    const response = await fetchProperties(filters.propertyType, queryParams);

    // Transform the response data
    const standardizedProperties =
      response.data?.results.map((property) =>
        transformV1PropertyToStandard(property, filters.propertyType as PropertyType, filters)
      ) || [];

    // Transform pagination info
    const pagination = {
      total: response.data?.pagination.total || 0,
      currentPage: response.data?.pagination.page || 1,
      totalPages: response.data?.pagination.total_pages || 1,
      nextPage: response.data?.pagination.next_page,
      prevPage: response.data?.pagination.previous_page,
    };

    return {
      data: standardizedProperties,
      pagination,
    };
  }

  /**
   * Get a single property by ID
   */
  async getPropertyById(
    id: string,
    propertyType: PropertyType
  ): Promise<StandardizedPropertyListing> {
    // Call the v1 API to get property details
    const property = await fetchProperty(id, propertyType);

    // Transform to our standardized format
    return transformV1PropertyToStandard(property, propertyType);
  }

  /**
   * Get featured properties
   */
  async getFeaturedProperties(
    propertyType: PropertyType = "condominium",
    listingType?: ListingType,
    limit: number = 6
  ): Promise<StandardizedPropertyListing[]> {
    // Prepare query params
    const queryParams: PropertyQueryParams = {
      featured: true,
      limit,
    };

    // Add listing type if provided
    if (listingType) {
      queryParams.listing_type = mapListingTypeToApi(listingType);
    }

    // Create filter object for consistent transformation
    const filters: PropertyFilter = {
      propertyType,
      listingType,
    };

    // Call the v1 API
    const response = await fetchProperties(propertyType, queryParams);

    // Transform the response data
    return (response.data?.results || []).map((property) =>
      transformV1PropertyToStandard(property, propertyType, filters)
    );
  }

  /**
   * Search properties by geographic location
   */
  async searchPropertiesByLocation(
    latitude: number,
    longitude: number,
    radius: number,
    filters: PropertyFilter = {}
  ): Promise<StandardizedPropertyListing[]> {
    // Validate required property type
    const propertyType = filters.propertyType || "condominium";

    // Prepare query params
    const queryParams = mapFiltersToV1QueryParams({
      ...filters,
      latitude,
      longitude,
      radius,
    });

    // Call the v1 API
    const response = await fetchProperties(propertyType, queryParams);

    // Transform the response data with the combined filters
    return (response.data?.results || []).map((property) =>
      transformV1PropertyToStandard(property, propertyType, filters)
    );
  }

  /**
   * Transform a v1 API property to the standardized format
   * This is exposed as a public method to transform raw API data
   */
  transformV1Property<T extends PropertyType>(
    property: PropertyTypeToInterface<T> | Record<string, unknown>,
    propertyType: T,
    filter?: PropertyFilter
  ): StandardizedPropertyListing {
    return transformV1PropertyToStandard(
      property as PropertyTypeToInterface<T>,
      propertyType,
      filter
    );
  }
}
