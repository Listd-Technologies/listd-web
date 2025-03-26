"use client";

import { Badge } from "@/components/ui/badge";
import React, { memo } from "react";
import { FilterItem } from "../filter-item";
import { AreaFilterContent } from "./area-filter-content";
import { useAreaFilter } from "./use-area-filter";

interface AreaFilterProps {
  /** Whether to use compact mode (smaller size) */
  compact?: boolean;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Optional class name for custom styling */
  className?: string;
}

/**
 * Area filter component for property listings
 * Allows users to select minimum and maximum property area (sq.m.)
 */
export const AreaFilter = memo(function AreaFilter({
  compact = false,
  disabled = false,
  className,
}: AreaFilterProps) {
  const {
    minArea,
    maxArea,
    areaMinOptions,
    areaMaxOptions,
    setMinArea,
    setMaxArea,
    reset,
    getDisplayText,
    hasActiveFilter,
    isMinSelected,
    isMaxSelected,
  } = useAreaFilter();

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
        <AreaFilterContent
          minArea={minArea}
          maxArea={maxArea}
          areaMinOptions={areaMinOptions}
          areaMaxOptions={areaMaxOptions}
          onMinAreaChange={setMinArea}
          onMaxAreaChange={setMaxArea}
          onReset={reset}
          onClose={onClose}
          isMinSelected={isMinSelected}
          isMaxSelected={isMaxSelected}
        />
      )}
    </FilterItem>
  );
});
