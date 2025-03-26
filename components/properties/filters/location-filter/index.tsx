"use client";

import { Badge } from "@/components/ui/badge";
import React, { memo } from "react";
import { FilterItem } from "../filter-item";
import { LocationFilterContent } from "./location-filter-content";
import { useLocationFilter } from "./use-location-filter";

interface LocationFilterProps {
  /** Whether to use compact mode (smaller size) */
  compact?: boolean;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Optional class name for custom styling */
  className?: string;
}

/**
 * Location filter component for property listings
 */
export const LocationFilter = memo(function LocationFilter({
  compact = false,
  disabled = false,
  className,
}: LocationFilterProps) {
  const { locationState, toggleDrawingMode, clearBoundary, hasActiveBoundary, getDisplayText } =
    useLocationFilter();

  return (
    <FilterItem
      label={getDisplayText()}
      compact={compact}
      disabled={disabled}
      className={className}
      badge={
        hasActiveBoundary ? (
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
        <LocationFilterContent
          locationState={locationState}
          onToggleDrawingMode={toggleDrawingMode}
          onClearBoundary={clearBoundary}
          onClose={onClose}
        />
      )}
    </FilterItem>
  );
});
