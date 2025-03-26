"use client";

import { type PropertyListingsFilter } from "@/hooks/api/usePropertyListings";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

// Define the available listing types
export type ListingType = "buy" | "rent";

// Define the available property types
export type PropertyType = "condominium" | "house-and-lot" | "vacant-lot" | "warehouse";

// API listing types - what the backend expects
export type ApiListingType = "for-sale" | "for-rent";

// Define the currently disabled property types (temporarily)
export const DISABLED_PROPERTY_TYPES = ["house-and-lot", "vacant-lot"];

// Helper functions for mapping between UI and API listing types
export function mapListingTypeToApi(listingType: ListingType): ApiListingType {
  return listingType === "buy" ? "for-sale" : "for-rent";
}

export function mapApiToListingType(apiListingType: string): ListingType {
  return apiListingType === "for-sale" ? "buy" : "rent";
}

// Helper function to infer listing type from title
export function inferListingTypeFromTitle(title: string): ListingType | null {
  const lowerTitle = title.toLowerCase();
  if (
    lowerTitle.includes("for rent") ||
    lowerTitle.includes("lease") ||
    lowerTitle.includes("/month")
  ) {
    return "rent";
  }
  if (lowerTitle.includes("for sale")) {
    return "buy";
  }
  return null; // Couldn't determine
}

// Define the shape of our state
interface ListingState {
  // Original listing context properties
  listingTypes: ListingType[];
  currentListingType: ListingType;
  propertyTypes: PropertyType[];
  currentPropertyType: PropertyType;

  // Add all filter properties
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minSqmPrice?: number;
  maxSqmPrice?: number;
  activePriceType: "total" | "sqm";
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
}

// Define action types
type ListingAction =
  | { type: "SET_LISTING_TYPE"; payload: ListingType }
  | { type: "SET_PROPERTY_TYPE"; payload: PropertyType }
  | { type: "SET_LOCATION"; payload: string }
  | { type: "SET_MIN_PRICE"; payload: number }
  | { type: "SET_MAX_PRICE"; payload: number }
  | { type: "SET_MIN_SQM_PRICE"; payload: number }
  | { type: "SET_MAX_SQM_PRICE"; payload: number }
  | { type: "SET_ACTIVE_PRICE_TYPE"; payload: "total" | "sqm" }
  | { type: "SET_MIN_BEDROOMS"; payload: number }
  | { type: "SET_MIN_BATHROOMS"; payload: number }
  | { type: "SET_MIN_AREA"; payload: number }
  | { type: "SET_MAX_AREA"; payload: number }
  | { type: "RESET_FILTERS" }
  | { type: "UPDATE_ALL_FILTERS"; payload: Partial<ListingState> };

// Initial state
const initialState: ListingState = {
  listingTypes: ["rent", "buy"],
  currentListingType: "buy", // Default to buy
  propertyTypes: ["condominium", "warehouse"], // Temporarily removed "house-and-lot" and "vacant-lot"
  currentPropertyType: "condominium", // Default to condominium
  activePriceType: "total", // Default to total price
  location: "",
  minPrice: 0,
  maxPrice: 0,
  minSqmPrice: 0,
  maxSqmPrice: 0,
  minBedrooms: 0,
  minBathrooms: 0,
  minArea: 0,
  maxArea: 0,
};

// Define default filters
const DEFAULT_FILTERS: PropertyListingsFilter = {
  listingType: "buy",
  propertyType: "condominium",
  location: "",
  minPrice: 0,
  maxPrice: 0,
  minSqmPrice: 0,
  maxSqmPrice: 0,
  activePriceType: "total",
  minBedrooms: 0,
  minBathrooms: 0,
  minArea: 0,
  maxArea: 0,
};

// Create context with defaults
const ListingContext = createContext<{
  state: ListingState;
  dispatch: React.Dispatch<ListingAction>;
  updateFilters: (filters: Partial<PropertyListingsFilter>) => Promise<void>;
  resetFilters: () => void;
}>({
  state: initialState,
  dispatch: () => null,
  updateFilters: () => Promise.resolve(),
  resetFilters: () => null,
});

// Reducer function
function listingReducer(state: ListingState, action: ListingAction): ListingState {
  switch (action.type) {
    case "SET_LISTING_TYPE":
      return {
        ...state,
        currentListingType: action.payload,
      };
    case "SET_PROPERTY_TYPE":
      // Reset bedroom and bathroom values if property type is vacant-lot or warehouse
      if (action.payload === "vacant-lot" || action.payload === "warehouse") {
        return {
          ...state,
          currentPropertyType: action.payload,
          minBedrooms: 0,
          minBathrooms: 0,
        };
      }
      return {
        ...state,
        currentPropertyType: action.payload,
      };
    case "SET_LOCATION":
      return {
        ...state,
        location: action.payload,
      };
    case "SET_MIN_PRICE":
      return {
        ...state,
        minPrice: action.payload,
      };
    case "SET_MAX_PRICE":
      return {
        ...state,
        maxPrice: action.payload,
      };
    case "SET_MIN_SQM_PRICE":
      return {
        ...state,
        minSqmPrice: action.payload,
      };
    case "SET_MAX_SQM_PRICE":
      return {
        ...state,
        maxSqmPrice: action.payload,
      };
    case "SET_ACTIVE_PRICE_TYPE":
      return {
        ...state,
        activePriceType: action.payload,
      };
    case "SET_MIN_BEDROOMS":
      return {
        ...state,
        minBedrooms: action.payload,
      };
    case "SET_MIN_BATHROOMS":
      return {
        ...state,
        minBathrooms: action.payload,
      };
    case "SET_MIN_AREA":
      return {
        ...state,
        minArea: action.payload,
      };
    case "SET_MAX_AREA":
      return {
        ...state,
        maxArea: action.payload,
      };
    case "RESET_FILTERS":
      return {
        ...initialState,
      };
    case "UPDATE_ALL_FILTERS":
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}

// Provider component
export function ListingProvider({ children }: { children: React.ReactNode }) {
  // Get property filters from URL
  const { filters: urlFilters, updateFilters: updateUrlParams } = usePropertyFilters();

  // Log the URL filters for debugging
  useEffect(() => {
    console.log("ListingProvider received URL filters:", urlFilters);
  }, [urlFilters]);

  // Create initial state from URL parameters
  const initialStateWithUrlParams: ListingState = {
    ...initialState,
    // Override with values from URL parameters if they exist
    currentListingType: (urlFilters.listingType || initialState.currentListingType) as ListingType,
    currentPropertyType: (urlFilters.propertyType ||
      initialState.currentPropertyType) as PropertyType,
    location: urlFilters.location || initialState.location,
    minPrice: urlFilters.minPrice ?? initialState.minPrice,
    maxPrice: urlFilters.maxPrice ?? initialState.maxPrice,
    minSqmPrice: urlFilters.minSqmPrice ?? initialState.minSqmPrice,
    maxSqmPrice: urlFilters.maxSqmPrice ?? initialState.maxSqmPrice,
    activePriceType: (urlFilters.activePriceType || initialState.activePriceType) as
      | "total"
      | "sqm",
    minBedrooms: urlFilters.minBedrooms ?? initialState.minBedrooms,
    minBathrooms: urlFilters.minBathrooms ?? initialState.minBathrooms,
    minArea: urlFilters.minArea ?? initialState.minArea,
    maxArea: urlFilters.maxArea ?? initialState.maxArea,
  };

  // Initialize reducer with state from URL parameters
  const [state, dispatch] = useReducer(listingReducer, initialStateWithUrlParams);

  // Track if we're currently updating from URL to prevent loops
  const isUpdatingFromUrlRef = React.useRef(false);

  // Listen for URL parameter changes and update the state
  useEffect(() => {
    // Skip if we're currently updating from a state change
    if (isUpdatingFromUrlRef.current) return;

    // Convert filters to the format needed for the context
    const contextUpdates: Partial<ListingState> = {
      currentListingType: urlFilters.listingType as ListingType,
      currentPropertyType: urlFilters.propertyType as PropertyType,
      location: urlFilters.location,
      minPrice: urlFilters.minPrice,
      maxPrice: urlFilters.maxPrice,
      minSqmPrice: urlFilters.minSqmPrice,
      maxSqmPrice: urlFilters.maxSqmPrice,
      activePriceType: urlFilters.activePriceType as "total" | "sqm",
      minBedrooms: urlFilters.minBedrooms,
      minBathrooms: urlFilters.minBathrooms,
      minArea: urlFilters.minArea,
      maxArea: urlFilters.maxArea,
    };

    // Update context state only if there are changes
    const hasChanges = Object.entries(contextUpdates).some(
      ([key, value]) => state[key as keyof ListingState] !== value
    );

    if (hasChanges) {
      dispatch({
        type: "UPDATE_ALL_FILTERS",
        payload: contextUpdates,
      });
    }
  }, [urlFilters, state]);

  // Helper function to update context state and URL params
  const updateFilters = useCallback(
    async (filters: Partial<PropertyListingsFilter>) => {
      // Create a complete filter object by merging with defaults and current state
      const completeFilters = {
        ...DEFAULT_FILTERS,
        ...getPropertyListingsFilter(state),
        ...filters,
      };

      // Safety check: if a disabled property type is set, force it to condominium
      if (DISABLED_PROPERTY_TYPES.includes(completeFilters.propertyType as PropertyType)) {
        console.warn(
          `Attempted to use disabled property type: ${completeFilters.propertyType}. Redirecting to condominium.`
        );
        completeFilters.propertyType = "condominium";
      }

      // Mark that we're updating from state to prevent loops
      isUpdatingFromUrlRef.current = true;

      try {
        // Check if the new filters are actually different from current state
        // to prevent unnecessary updates
        const hasChanges = Object.entries(completeFilters).some(([key, value]) => {
          const currentValue = state[key as keyof ListingState];
          // Special check for numbers - only consider actual changes
          if (typeof value === "number" && typeof currentValue === "number") {
            return Math.abs(value - currentValue) > 0.001; // Small epsilon for floating point comparison
          }
          return currentValue !== value;
        });

        // Skip update if no actual changes
        if (!hasChanges) {
          console.log("Skipping filter update - no changes detected");
          return Promise.resolve();
        }

        // Update URL parameters and context state within an animation frame
        // to batch the changes and reduce renders
        return new Promise<void>((resolve) => {
          requestAnimationFrame(async () => {
            try {
              // Update URL parameters
              await updateUrlParams({
                ...completeFilters,
                listingType: completeFilters.listingType as "buy" | "rent",
                propertyType: completeFilters.propertyType as PropertyType,
                activePriceType: completeFilters.activePriceType as "total" | "sqm",
              });

              // Update context state
              dispatch({
                type: "UPDATE_ALL_FILTERS",
                payload: {
                  currentListingType: completeFilters.listingType as ListingType,
                  currentPropertyType: completeFilters.propertyType as PropertyType,
                  location: completeFilters.location,
                  minPrice: completeFilters.minPrice,
                  maxPrice: completeFilters.maxPrice,
                  minSqmPrice: completeFilters.minSqmPrice,
                  maxSqmPrice: completeFilters.maxSqmPrice,
                  activePriceType: completeFilters.activePriceType as "total" | "sqm",
                  minBedrooms: completeFilters.minBedrooms,
                  minBathrooms: completeFilters.minBathrooms,
                  minArea: completeFilters.minArea,
                  maxArea: completeFilters.maxArea,
                },
              });

              resolve();
            } catch (error) {
              console.error("Error updating filters:", error);
              resolve();
            }
          });
        });
      } finally {
        // Clear the update flag after a short delay to ensure updates complete
        setTimeout(() => {
          isUpdatingFromUrlRef.current = false;
        }, 100);
      }
    },
    [state, updateUrlParams]
  );

  // Helper function to reset context state
  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
    // Also reset URL parameters with explicit type assertion
    updateUrlParams({
      listingType: "buy" as const,
      propertyType: "condominium" as const,
      location: "",
      minPrice: 0,
      maxPrice: 0,
      minSqmPrice: 0,
      maxSqmPrice: 0,
      activePriceType: "total" as const,
      minBedrooms: 0,
      minBathrooms: 0,
      minArea: 0,
      maxArea: 0,
    });
  }, [updateUrlParams]);

  const value = {
    state,
    dispatch,
    updateFilters,
    resetFilters,
  };

  return <ListingContext.Provider value={value}>{children}</ListingContext.Provider>;
}

// Custom hook to use the listing context
export function useListingContext() {
  const context = useContext(ListingContext);
  if (context === undefined) {
    throw new Error("useListingContext must be used within a ListingProvider");
  }
  return context;
}

// Helper function to convert context state to PropertyListingsFilter
export function getPropertyListingsFilter(state: ListingState) {
  return {
    listingType: state.currentListingType,
    propertyType: state.currentPropertyType,
    location: state.location,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    minSqmPrice: state.minSqmPrice,
    maxSqmPrice: state.maxSqmPrice,
    activePriceType: state.activePriceType,
    minBedrooms: state.minBedrooms,
    minBathrooms: state.minBathrooms,
    minArea: state.minArea,
    maxArea: state.maxArea,
  };
}
