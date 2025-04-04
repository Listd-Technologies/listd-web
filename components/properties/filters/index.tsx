"use client";

import React from "react";
import { AreaFilter } from "./area-filter";
import { BathroomsFilter } from "./bathrooms-filter";
import { BedroomsFilter } from "./bedrooms-filter";
import { FilterContainer } from "./filter-container";
import { FilterItem } from "./filter-item";
import { ListingTypeFilter } from "./listing-type-filter";
import { PriceFilter } from "./price-filter";
import { PropertyTypeFilter } from "./property-type-filter";
import { ResponsiveFilters } from "./responsive-filters";

/**
 * Re-export filter components and containers
 */
export { AreaFilter } from "./area-filter";
export { BathroomsFilter } from "./bathrooms-filter";
export { BedroomsFilter } from "./bedrooms-filter";
export { FilterContainer } from "./filter-container";
export { FilterItem } from "./filter-item";
export { ListingTypeFilter } from "./listing-type-filter";
export { PriceFilter } from "./price-filter";
export { PropertyTypeFilter } from "./property-type-filter";
export { ResponsiveFilters } from "./responsive-filters";

/**
 * Placeholder for the main Filters component
 * This will be replaced with the actual implementation as we build out filter components
 */
export function PropertyFilters({
  compact = false,
  className,
}: { compact?: boolean; className?: string }) {
  return (
    <div className={`flex w-full flex-wrap gap-2 ${className || ""}`}>
      <ListingTypeFilter compact={compact} />

      <PropertyTypeFilter compact={compact} />

      <AreaFilter compact={compact} />

      <PriceFilter compact={compact} />

      <BedroomsFilter compact={compact} />

      <BathroomsFilter compact={compact} />
    </div>
  );
}
