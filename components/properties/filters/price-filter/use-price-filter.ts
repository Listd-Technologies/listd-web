"use client";

import { usePropertyFiltersStore } from "@/lib/stores/propertyFilters";
import { useCallback, useEffect, useMemo, useState } from "react";

// Price options for dropdowns - Buy (For Sale)
const BUY_MIN_PRICE_OPTIONS = [
  { label: "No Min", value: "0" },
  { label: "₱500,000", value: "500000" },
  { label: "₱1M", value: "1000000" },
  { label: "₱2M", value: "2000000" },
  { label: "₱3M", value: "3000000" },
  { label: "₱5M", value: "5000000" },
  { label: "₱10M", value: "10000000" },
  { label: "₱20M", value: "20000000" },
];

const BUY_MAX_PRICE_OPTIONS = [
  { label: "No Max", value: "0" },
  { label: "₱1M", value: "1000000" },
  { label: "₱2M", value: "2000000" },
  { label: "₱3M", value: "3000000" },
  { label: "₱5M", value: "5000000" },
  { label: "₱10M", value: "10000000" },
  { label: "₱20M", value: "20000000" },
  { label: "₱50M", value: "50000000" },
];

// Price options for dropdowns - Rent
const RENT_MIN_PRICE_OPTIONS = [
  { label: "No Min", value: "0" },
  { label: "₱5,000", value: "5000" },
  { label: "₱10,000", value: "10000" },
  { label: "₱15,000", value: "15000" },
  { label: "₱20,000", value: "20000" },
  { label: "₱30,000", value: "30000" },
  { label: "₱50,000", value: "50000" },
  { label: "₱100,000", value: "100000" },
];

const RENT_MAX_PRICE_OPTIONS = [
  { label: "No Max", value: "0" },
  { label: "₱15,000", value: "15000" },
  { label: "₱20,000", value: "20000" },
  { label: "₱30,000", value: "30000" },
  { label: "₱50,000", value: "50000" },
  { label: "₱100,000", value: "100000" },
  { label: "₱150,000", value: "150000" },
  { label: "₱200,000", value: "200000" },
];

// Min SQM price options
const MIN_SQM_PRICE_OPTIONS = [
  { label: "No Min", value: "0" },
  { label: "₱50K/sqm", value: "50000" },
  { label: "₱100K/sqm", value: "100000" },
  { label: "₱150K/sqm", value: "150000" },
  { label: "₱200K/sqm", value: "200000" },
  { label: "₱300K/sqm", value: "300000" },
];

// Max SQM price options
const MAX_SQM_PRICE_OPTIONS = [
  { label: "No Max", value: "0" },
  { label: "₱100K/sqm", value: "100000" },
  { label: "₱150K/sqm", value: "150000" },
  { label: "₱200K/sqm", value: "200000" },
  { label: "₱300K/sqm", value: "300000" },
  { label: "₱500K/sqm", value: "500000" },
];

export type PriceOption = {
  label: string;
  value: string;
};

export type PriceType = "total" | "sqm";

/**
 * Custom hook for managing price filter state and logic
 */
export function usePriceFilter() {
  // Use selective store access to prevent unnecessary rerenders
  const listingType = usePropertyFiltersStore((state) => state.filters.listingType);
  const minPrice = usePropertyFiltersStore((state) => state.filters.minPrice);
  const maxPrice = usePropertyFiltersStore((state) => state.filters.maxPrice);
  const minSqmPrice = usePropertyFiltersStore((state) => state.filters.minSqmPrice);
  const maxSqmPrice = usePropertyFiltersStore((state) => state.filters.maxSqmPrice);
  const activePriceType = usePropertyFiltersStore((state) => state.filters.activePriceType);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  // Local state for form inputs
  const [localMinPrice, setLocalMinPrice] = useState(minPrice?.toString() || "0");
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice?.toString() || "0");
  const [localMinSqmPrice, setLocalMinSqmPrice] = useState(minSqmPrice?.toString() || "0");
  const [localMaxSqmPrice, setLocalMaxSqmPrice] = useState(maxSqmPrice?.toString() || "0");

  // Get appropriate price options based on listing type
  const priceOptions = useMemo(
    () => ({
      minPriceOptions: listingType === "rent" ? RENT_MIN_PRICE_OPTIONS : BUY_MIN_PRICE_OPTIONS,
      maxPriceOptions: listingType === "rent" ? RENT_MAX_PRICE_OPTIONS : BUY_MAX_PRICE_OPTIONS,
      minSqmPriceOptions: MIN_SQM_PRICE_OPTIONS,
      maxSqmPriceOptions: MAX_SQM_PRICE_OPTIONS,
    }),
    [listingType]
  );

  // Update local state when store changes
  useEffect(() => {
    setLocalMinPrice(minPrice?.toString() || "0");
    setLocalMaxPrice(maxPrice?.toString() || "0");
  }, [minPrice, maxPrice]);

  useEffect(() => {
    setLocalMinSqmPrice(minSqmPrice?.toString() || "0");
    setLocalMaxSqmPrice(maxSqmPrice?.toString() || "0");
  }, [minSqmPrice, maxSqmPrice]);

  // Handlers
  const setMinPrice = useCallback(
    (value: string) => {
      setLocalMinPrice(value);
      updateFilters({ minPrice: parseInt(value) || 0 });
    },
    [updateFilters]
  );

  const setMaxPrice = useCallback(
    (value: string) => {
      setLocalMaxPrice(value);
      updateFilters({ maxPrice: parseInt(value) || 0 });
    },
    [updateFilters]
  );

  const setMinSqmPrice = useCallback(
    (value: string) => {
      setLocalMinSqmPrice(value);
      updateFilters({ minSqmPrice: parseInt(value) || 0 });
    },
    [updateFilters]
  );

  const setMaxSqmPrice = useCallback(
    (value: string) => {
      setLocalMaxSqmPrice(value);
      updateFilters({ maxSqmPrice: parseInt(value) || 0 });
    },
    [updateFilters]
  );

  const setActivePriceType = useCallback(
    (type: PriceType) => {
      updateFilters({ activePriceType: type });
    },
    [updateFilters]
  );

  // Reset all price values
  const reset = useCallback(() => {
    updateFilters({
      minPrice: 0,
      maxPrice: 0,
      minSqmPrice: 0,
      maxSqmPrice: 0,
    });
  }, [updateFilters]);

  // Format display text for the filter button
  const getDisplayText = useCallback(() => {
    if (activePriceType === "total") {
      // Total price display
      if (minPrice && maxPrice) {
        return `₱${formatPrice(minPrice)} - ₱${formatPrice(maxPrice)}`;
      } else if (minPrice) {
        return `Min ₱${formatPrice(minPrice)}`;
      } else if (maxPrice) {
        return `Max ₱${formatPrice(maxPrice)}`;
      }
    } else {
      // Per sqm price display
      if (minSqmPrice && maxSqmPrice) {
        return `₱${formatPrice(minSqmPrice)}/sqm - ₱${formatPrice(maxSqmPrice)}/sqm`;
      } else if (minSqmPrice) {
        return `Min ₱${formatPrice(minSqmPrice)}/sqm`;
      } else if (maxSqmPrice) {
        return `Max ₱${formatPrice(maxSqmPrice)}/sqm`;
      }
    }
    return "Price";
  }, [activePriceType, minPrice, maxPrice, minSqmPrice, maxSqmPrice]);

  // Check if any price filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      (activePriceType === "total" && ((minPrice ?? 0) > 0 || (maxPrice ?? 0) > 0)) ||
      (activePriceType === "sqm" && ((minSqmPrice ?? 0) > 0 || (maxSqmPrice ?? 0) > 0))
    );
  }, [activePriceType, minPrice, maxPrice, minSqmPrice, maxSqmPrice]);

  return {
    // State
    activePriceType,
    listingType,
    minPrice: localMinPrice,
    maxPrice: localMaxPrice,
    minSqmPrice: localMinSqmPrice,
    maxSqmPrice: localMaxSqmPrice,

    // Actions
    setMinPrice,
    setMaxPrice,
    setMinSqmPrice,
    setMaxSqmPrice,
    setActivePriceType,
    reset,

    // Options and utilities
    priceOptions,
    getDisplayText,
    hasActiveFilters,
  };
}

// Helper function to format price numbers
function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)}M`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K`;
  }
  return price.toLocaleString();
}
