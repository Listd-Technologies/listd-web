"use client";

import React, { memo } from "react";
import { FilterItem } from "../filter-item";
import { PropertyTypeFilterContent } from "./property-type-filter-content";
import { usePropertyTypeFilter } from "./use-property-type-filter";

interface PropertyTypeFilterProps {
  /** Whether to use compact mode (smaller size) */
  compact?: boolean;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Optional class name for custom styling */
  className?: string;
}

/**
 * Property type filter component for property listings
 */
export const PropertyTypeFilter = memo(function PropertyTypeFilter({
  compact = false,
  disabled = false,
  className,
}: PropertyTypeFilterProps) {
  const { propertyType, propertyTypeOptions, setPropertyType, getDisplayText } =
    usePropertyTypeFilter();

  return (
    <FilterItem
      label={getDisplayText()}
      compact={compact}
      disabled={disabled}
      className={className}
    >
      {(onClose) => (
        <PropertyTypeFilterContent
          propertyType={propertyType}
          propertyTypeOptions={propertyTypeOptions}
          onPropertyTypeChange={setPropertyType}
          onClose={onClose}
        />
      )}
    </FilterItem>
  );
});
