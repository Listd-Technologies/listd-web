"use client";

import React, { memo } from "react";
import { FilterItem } from "../filter-item";
import { ListingTypeFilterContent } from "./listing-type-filter-content";
import { useListingTypeFilter } from "./use-listing-type-filter";

interface ListingTypeFilterProps {
  /** Whether to use compact mode (smaller size) */
  compact?: boolean;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Optional class name for custom styling */
  className?: string;
}

/**
 * Listing type filter component for property listings
 * Toggles between "For Sale" and "For Rent"
 */
export const ListingTypeFilter = memo(function ListingTypeFilter({
  compact = false,
  disabled = false,
  className,
}: ListingTypeFilterProps) {
  const { listingType, listingTypeOptions, setListingType, getDisplayText } =
    useListingTypeFilter();

  return (
    <FilterItem
      label={getDisplayText()}
      compact={compact}
      disabled={disabled}
      className={className}
    >
      {(onClose) => (
        <ListingTypeFilterContent
          listingType={listingType}
          listingTypeOptions={listingTypeOptions}
          onListingTypeChange={setListingType}
          onClose={onClose}
        />
      )}
    </FilterItem>
  );
});
