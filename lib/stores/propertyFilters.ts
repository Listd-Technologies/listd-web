import type { PropertyQueryParams } from "@/hooks/api/v1/types/property.types";
import { PropertyType } from "@/types/property";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Define the shape of our filters state
export interface PropertyFiltersState {
  filters: {
    // Listing and property type
    listingType: "buy" | "rent";
    propertyType: PropertyType;

    // Price filters
    minPrice?: number;
    maxPrice?: number;
    minSqmPrice?: number;
    maxSqmPrice?: number;
    activePriceType: "total" | "sqm";

    // Room filters
    minBedrooms?: number;
    minBathrooms?: number;

    // Size filters
    minArea?: number;
    maxArea?: number;

    // Location
    location?: string;

    // Sorting
    sortField?: string;
    sortOrder?: "asc" | "desc";
  };

  // Actions
  updateFilters: (updates: Partial<PropertyFiltersState["filters"]>) => void;
  resetFilters: () => void;

  // V1 API specific
  getV1QueryParams: () => Omit<PropertyQueryParams, "propertyType">;
}

// Default filter values
const DEFAULT_FILTERS = {
  listingType: "buy" as const,
  propertyType: "condominium" as PropertyType,
  activePriceType: "total" as const,
  location: "",
  minPrice: 0,
  maxPrice: 0,
  minSqmPrice: 0,
  maxSqmPrice: 0,
  minBedrooms: 0,
  minBathrooms: 0,
  minArea: 0,
  maxArea: 0,
  sortField: "price",
  sortOrder: "asc" as const,
};

// Create the store with devtools but without URL middleware
// URL synchronization is now handled by the useUrlSync hook
export const usePropertyFiltersStore = create<PropertyFiltersState>()(
  devtools(
    (set, get) => ({
      // Initial state
      filters: DEFAULT_FILTERS,

      // Update filters
      updateFilters: (updates) =>
        set((state) => ({
          filters: { ...state.filters, ...updates },
        })),

      // Reset filters
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      // Get V1 API query params
      getV1QueryParams: () => {
        const { filters } = get();

        return {
          listingType: filters.listingType === "buy" ? "buy" : "rent",
          priceType: filters.activePriceType === "total" ? "total-price" : "price-per-sqm",
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          bedrooms: filters.minBedrooms || undefined,
          bathrooms: filters.minBathrooms || undefined,
          minSize: filters.minArea || undefined,
          maxSize: filters.maxArea || undefined,
          sortField: filters.sortField ? `pps.${filters.sortField}` : undefined,
          sortOrder: filters.sortOrder,
        };
      },
    }),
    {
      name: "property-filters-store",
    }
  )
);

// Optimized selectors to prevent unnecessary rerenders

/**
 * Selectors for property type filter
 * Use these instead of directly accessing the full filters object
 */
export const selectPropertyType = (state: PropertyFiltersState) => state.filters.propertyType;

/**
 * Selectors for listing type filter
 */
export const selectListingType = (state: PropertyFiltersState) => state.filters.listingType;

/**
 * Selectors for price filters
 */
export const selectMinPrice = (state: PropertyFiltersState) => state.filters.minPrice;
export const selectMaxPrice = (state: PropertyFiltersState) => state.filters.maxPrice;
export const selectMinSqmPrice = (state: PropertyFiltersState) => state.filters.minSqmPrice;
export const selectMaxSqmPrice = (state: PropertyFiltersState) => state.filters.maxSqmPrice;
export const selectActivePriceType = (state: PropertyFiltersState) => state.filters.activePriceType;

/**
 * Selectors for room filters
 */
export const selectMinBedrooms = (state: PropertyFiltersState) => state.filters.minBedrooms;
export const selectMinBathrooms = (state: PropertyFiltersState) => state.filters.minBathrooms;

/**
 * Selectors for area filters
 */
export const selectMinArea = (state: PropertyFiltersState) => state.filters.minArea;
export const selectMaxArea = (state: PropertyFiltersState) => state.filters.maxArea;

/**
 * Selector for location filter
 */
export const selectLocation = (state: PropertyFiltersState) => state.filters.location;

/**
 * Selectors for sorting options
 */
export const selectSortField = (state: PropertyFiltersState) => state.filters.sortField;
export const selectSortOrder = (state: PropertyFiltersState) => state.filters.sortOrder;

/**
 * Selectors for actions
 */
export const selectUpdateFilters = (state: PropertyFiltersState) => state.updateFilters;
export const selectResetFilters = (state: PropertyFiltersState) => state.resetFilters;
export const selectGetV1QueryParams = (state: PropertyFiltersState) => state.getV1QueryParams;

// Example usage:
// const propertyType = usePropertyFiltersStore(selectPropertyType);
// const { updateFilters } = usePropertyFiltersStore(state => ({ updateFilters: state.updateFilters }));
