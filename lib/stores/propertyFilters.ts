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
