"use client";

import { PropertyFilters } from "@/components/listings/property-filters";
import { PropertyListingGrid } from "@/components/listings/property-listing-grid";
import { type PropertyListingsFilter } from "@/hooks/api/usePropertyListings";
import { cn } from "@/lib/utils";
import { type BaseComponentProps } from "@/types";
import React, { useState } from "react";

// Default filter values
const DEFAULT_FILTERS: PropertyListingsFilter = {
  listingType: "buy", // Default to buy
  propertyType: "condominium", // Default to condominium
};

export interface PropertySearchProps extends BaseComponentProps {
  /**
   * Initial filters
   */
  initialFilters?: Partial<PropertyListingsFilter>;
}

/**
 * Property search component that combines filters and listings grid
 * with proper loading states
 */
export function PropertySearch({ className, initialFilters = {}, ...props }: PropertySearchProps) {
  // State for current filters
  const [filters, setFilters] = useState<PropertyListingsFilter>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  // State for loading during filter submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle applying filters
  const handleApplyFilters = (newFilters: PropertyListingsFilter) => {
    // Simulate loading state for a short duration
    setIsSubmitting(true);

    // Apply the new filters after a short delay
    setTimeout(() => {
      setFilters(newFilters);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className={cn("space-y-6", className)} {...props}>
      <PropertyFilters
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
        isLoading={isSubmitting}
      />

      <PropertyListingGrid filters={filters} />
    </div>
  );
}
