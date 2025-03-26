/**
 * Hooks for fetching property data from the v1 API
 */

import { PropertyType } from "@/components/providers/listing-provider";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseQueryResult,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { ENDPOINTS } from "./constants";
import {
  CondominiumDetail,
  PropertyQueryParams,
  PropertyResponse,
  PropertyTypeToInterface,
  WarehouseDetail,
} from "./types/property.types";
import { apiClient } from "./utils/client";
import { handleApiError } from "./utils/error-handlers";
import {
  cleanPropertyQueryParams,
  getPropertyTypePathSegment,
  transformPropertyResponse,
} from "./utils/property-mappers";

/**
 * Hook to fetch properties with infinite scrolling support
 *
 * @param query - Query parameters for filtering properties
 * @param options - Configuration options including property type and limits
 * @returns An infinite query result with paginated property data
 */
export function useProperties<T extends PropertyType>(
  query: Record<string, unknown>,
  options: {
    propertyType: T;
    limit?: number;
    enabled?: boolean;
  }
): UseInfiniteQueryResult<InfiniteData<PropertyResponse<T>>, Error> {
  const { propertyType, limit = 20, enabled = true } = options;

  // Clean and transform query parameters
  const cleanedQuery = cleanPropertyQueryParams(query);

  // Get the endpoint for the property type
  const endpoint = ENDPOINTS.PROPERTY.getPublicEndpoint(propertyType);

  // Debug logging
  console.log(`🏢 useProperties Hook - ${propertyType}:`, {
    endpoint,
    baseURL: apiClient.defaults.baseURL,
    fullEndpoint: `${apiClient.defaults.baseURL}${endpoint}`,
    cleanedQuery,
    enabled,
    queryKey: ["properties", propertyType, limit, cleanedQuery],
  });

  return useInfiniteQuery({
    queryKey: ["properties", propertyType, limit, cleanedQuery],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        // Add page parameter to query
        const params = {
          ...cleanedQuery,
          page: pageParam,
          limit,
        };

        // Make API request
        const response = await apiClient.get<PropertyResponse<T>>(endpoint, { params });

        // Special debug for warehouse data
        if (propertyType === "warehouse") {
          console.log("🏭 Warehouse API Response:", {
            status: response.status,
            dataExists: !!response.data,
            results: response.data?.data?.results?.length || 0,
            total: response.data?.data?.pagination?.total || 0,
          });
        }

        // Transform the response if needed
        return transformPropertyResponse(response.data);
      } catch (error) {
        throw handleApiError(error);
      }
    },
    initialPageParam: 1,
    getPreviousPageParam: (firstPage) => {
      if (!firstPage.data?.pagination.previous_page) {
        return undefined;
      }
      return firstPage.data.pagination.previous_page;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.data?.pagination.next_page) {
        return undefined;
      }
      return lastPage.data.pagination.next_page;
    },
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 60000, // Data considered fresh for 1 minute
  });
}

/**
 * Hook to fetch a single property by ID
 *
 * @param id - Property ID to fetch
 * @param propertyType - Type of property
 * @param options - Additional options
 * @returns Query result with property data
 */
export function useProperty<T extends PropertyType>(
  id: string,
  propertyType: T,
  options?: { enabled?: boolean }
): UseQueryResult<PropertyTypeToInterface<T>, Error> {
  const { enabled = !!id } = options || {};

  // Get the appropriate endpoint
  const endpoint = ENDPOINTS.PROPERTY.getDetailsEndpoint(propertyType, id);

  // Debug logging
  console.log(`🔍 useProperty Hook - ${propertyType} - ID: ${id}:`, {
    endpoint,
    enabled,
    queryKey: ["property", id, propertyType],
  });

  return useQuery({
    queryKey: ["property", id, propertyType],
    queryFn: async () => {
      try {
        // Make API request
        const response = await apiClient.get<{
          success: boolean;
          data: PropertyTypeToInterface<T>;
        }>(endpoint);

        // Debug logging - property specific
        if (propertyType === "warehouse") {
          console.log("🏭 Single Warehouse Property Response:", {
            status: response.status,
            id,
            title: response.data.data.title,
          });
        }

        return response.data.data;
      } catch (error) {
        console.error(`❌ Error fetching ${propertyType} property ID ${id}:`, error);
        throw handleApiError(error);
      }
    },
    enabled,
    refetchOnWindowFocus: false,
  });
}

/**
 * Programmatically fetch properties (for server-side or one-time fetches)
 */
export async function fetchProperties<T extends PropertyType>(
  propertyType: T,
  params: PropertyQueryParams
): Promise<PropertyResponse<T>> {
  try {
    const endpoint = ENDPOINTS.PROPERTY.getPublicEndpoint(propertyType);
    const response = await apiClient.get<PropertyResponse<T>>(endpoint, { params });
    return transformPropertyResponse(response.data);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Programmatically fetch a single property by ID (for server-side or one-time fetches)
 */
export async function fetchProperty<T extends PropertyType>(
  id: string,
  propertyType: T
): Promise<PropertyTypeToInterface<T>> {
  try {
    const endpoint = ENDPOINTS.PROPERTY.getDetailsEndpoint(propertyType, id);
    console.log(`🔄 Fetching single ${propertyType} property ID ${id}:`, { endpoint });

    const response = await apiClient.get<{
      success: boolean;
      data: PropertyTypeToInterface<T>;
    }>(endpoint);

    return response.data.data;
  } catch (error) {
    console.error(`❌ Error fetching ${propertyType} property ID ${id}:`, error);
    throw handleApiError(error);
  }
}

/**
 * Re-export types for convenience
 */
export type {
  PropertyQueryParams,
  PropertyResponse,
  PropertyTypeToInterface,
  CondominiumDetail,
  WarehouseDetail,
} from "./types/property.types";
