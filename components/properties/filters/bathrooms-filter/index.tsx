"use client";

import { Badge } from "@/components/ui/badge";
import React, { memo } from "react";
import { FilterItem } from "../filter-item";
import { BathroomsFilterContent } from "./bathrooms-filter-content";
import { useBathroomsFilter } from "./use-bathrooms-filter";

interface BathroomsFilterProps {
  /** Whether to use compact mode (smaller size) */
  compact?: boolean;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Optional class name for custom styling */
  className?: string;
}

/**
 * Bathrooms filter component for property listings
 * Allows users to select minimum number of bathrooms
 */
export const BathroomsFilter = memo(function BathroomsFilter({
  compact = false,
  disabled = false,
  className,
}: BathroomsFilterProps) {
  const {
    minBathrooms,
    bathroomsOptions,
    setMinBathrooms,
    reset,
    getDisplayText,
    hasActiveFilter,
    isSelected,
  } = useBathroomsFilter();

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
        <BathroomsFilterContent
          minBathrooms={minBathrooms}
          bathroomsOptions={bathroomsOptions}
          onBathroomsChange={setMinBathrooms}
          onReset={reset}
          onClose={onClose}
          isSelected={isSelected}
        />
      )}
    </FilterItem>
  );
});
