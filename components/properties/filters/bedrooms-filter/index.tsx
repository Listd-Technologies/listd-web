"use client";

import { Badge } from "@/components/ui/badge";
import React, { memo } from "react";
import { FilterItem } from "../filter-item";
import { BedroomsFilterContent } from "./bedrooms-filter-content";
import { useBedroomsFilter } from "./use-bedrooms-filter";

interface BedroomsFilterProps {
  /** Whether to use compact mode (smaller size) */
  compact?: boolean;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Optional class name for custom styling */
  className?: string;
}

/**
 * Bedrooms filter component for property listings
 * Allows users to select minimum number of bedrooms
 */
export const BedroomsFilter = memo(function BedroomsFilter({
  compact = false,
  disabled = false,
  className,
}: BedroomsFilterProps) {
  const {
    minBedrooms,
    bedroomsOptions,
    setMinBedrooms,
    reset,
    getDisplayText,
    hasActiveFilter,
    isSelected,
  } = useBedroomsFilter();

  return (
    <FilterItem
      label={getDisplayText()}
      compact={compact}
      disabled={disabled}
      className={className}
      badge={
        hasActiveFilter ? (
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
        <BedroomsFilterContent
          minBedrooms={minBedrooms}
          bedroomsOptions={bedroomsOptions}
          onBedroomsChange={setMinBedrooms}
          onReset={reset}
          onClose={onClose}
          isSelected={isSelected}
        />
      )}
    </FilterItem>
  );
});
