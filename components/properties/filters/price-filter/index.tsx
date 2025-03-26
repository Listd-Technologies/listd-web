"use client";

import { Badge } from "@/components/ui/badge";
import React, { memo } from "react";
import { FilterItem } from "../filter-item";
import { PriceFilterContent } from "./price-filter-content";
import { usePriceFilter } from "./use-price-filter";

interface PriceFilterProps {
  /** Whether to use compact mode (smaller size) */
  compact?: boolean;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Optional class name for custom styling */
  className?: string;
}

/**
 * Price filter component for property listings
 */
export const PriceFilter = memo(function PriceFilter({
  compact = false,
  disabled = false,
  className,
}: PriceFilterProps) {
  const {
    activePriceType,
    minPrice,
    maxPrice,
    minSqmPrice,
    maxSqmPrice,
    priceOptions,
    setMinPrice,
    setMaxPrice,
    setMinSqmPrice,
    setMaxSqmPrice,
    setActivePriceType,
    reset,
    getDisplayText,
    hasActiveFilters,
  } = usePriceFilter();

  return (
    <FilterItem
      label={getDisplayText()}
      compact={compact}
      disabled={disabled}
      className={className}
      badge={
        hasActiveFilters ? (
          <Badge
            variant="secondary"
            className="h-5 w-5 p-0 flex items-center justify-center rounded-full"
          >
            •
          </Badge>
        ) : undefined
      }
    >
      {(onClose) => (
        <PriceFilterContent
          minPrice={minPrice}
          maxPrice={maxPrice}
          minSqmPrice={minSqmPrice}
          maxSqmPrice={maxSqmPrice}
          activePriceType={activePriceType}
          minPriceOptions={priceOptions.minPriceOptions}
          maxPriceOptions={priceOptions.maxPriceOptions}
          minSqmPriceOptions={priceOptions.minSqmPriceOptions}
          maxSqmPriceOptions={priceOptions.maxSqmPriceOptions}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onMinSqmPriceChange={setMinSqmPrice}
          onMaxSqmPriceChange={setMaxSqmPrice}
          onPriceTypeChange={setActivePriceType}
          onReset={reset}
          onClose={onClose}
        />
      )}
    </FilterItem>
  );
});
