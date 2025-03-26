"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { ListingType } from "./use-listing-type-filter";

interface ListingTypeOption {
  id: number;
  name: string;
  value: ListingType;
}

interface ListingTypeFilterContentProps {
  // Current selected listing type
  listingType: ListingType;

  // Available listing type options
  listingTypeOptions: ListingTypeOption[];

  // Event handlers
  onListingTypeChange: (type: ListingType) => void;
  onClose?: () => void;
}

/**
 * The internal content component for the listing type filter
 * Uses a toggle button style for the two options
 */
export function ListingTypeFilterContent({
  listingType,
  listingTypeOptions,
  onListingTypeChange,
  onClose,
}: ListingTypeFilterContentProps) {
  return (
    <div className="w-full p-4 flex flex-col">
      {/* Toggle button style for Buy/Rent */}
      <div className="mb-6">
        <div className="flex rounded-md overflow-hidden border">
          {listingTypeOptions.map((option) => (
            <Button
              key={option.id}
              type="button"
              variant={listingType === option.value ? "default" : "ghost"}
              className="flex-1 rounded-none text-center"
              onClick={() => onListingTypeChange(option.value)}
            >
              {option.name}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {listingType === "buy"
            ? "Search for properties that are for sale"
            : "Search for properties that are for rent"}
        </p>
      </div>

      {/* Action button */}
      <div className="flex justify-end">
        <Button size="sm" onClick={onClose}>
          Apply
        </Button>
      </div>
    </div>
  );
}
