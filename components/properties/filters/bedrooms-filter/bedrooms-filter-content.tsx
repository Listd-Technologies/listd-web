"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React from "react";

interface BedroomsOption {
  label: string;
  value: number;
}

interface BedroomsFilterContentProps {
  // Current selected minimum bedrooms
  minBedrooms: number;

  // Available bedrooms options
  bedroomsOptions: BedroomsOption[];

  // Event handlers
  onBedroomsChange: (value: number) => void;
  onReset: () => void;
  onClose?: () => void;

  // Selection helper
  isSelected: (value: number) => boolean;
}

/**
 * The internal content component for the bedrooms filter
 * Displays a grid of buttons for quick selection of common bedroom values
 */
export function BedroomsFilterContent({
  minBedrooms,
  bedroomsOptions,
  onBedroomsChange,
  onReset,
  onClose,
  isSelected,
}: BedroomsFilterContentProps) {
  // Check if any filter is active (not selecting "Any")
  const hasActiveFilter = minBedrooms > 0;

  return (
    <div className="w-full p-4 flex flex-col">
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-2">
          {bedroomsOptions.map((option) => (
            <Button
              key={option.value}
              variant={isSelected(option.value) ? "default" : "outline"}
              className="w-full"
              onClick={() => onBedroomsChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mt-2">
          {minBedrooms === 0
            ? "Show all properties regardless of bedrooms"
            : `Show properties with ${minBedrooms} or more bedrooms`}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onReset} disabled={!hasActiveFilter}>
          Reset
        </Button>
        <Button size="sm" onClick={onClose}>
          Apply
        </Button>
      </div>
    </div>
  );
}
