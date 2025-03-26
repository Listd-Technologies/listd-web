import type { PropertyType } from "@/types/property";
import { usePropertyFiltersStore } from "@/lib/stores/propertyFilters";
import { useProperties } from "./useProperties";

export function usePropertyFilters<T extends PropertyType>(
  propertyType: T,
  options?: {
    limit?: number;
    enabled?: boolean;
  }
) {
  const { filters, getV1QueryParams } = usePropertyFiltersStore();

  // Get query params from store
  const queryParams = getV1QueryParams();

  // Use the API hook with store params
  const query = useProperties(queryParams, {
    propertyType,
    ...options,
  });

  return {
    ...query,
    filters,
  };
}
