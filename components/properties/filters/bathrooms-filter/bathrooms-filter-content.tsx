"use client";

import { Button } from "@/components/ui/button";
import React from "react";

interface BathroomsOption {
  label: string;
  value: number;
}

interface BathroomsFilterContentProps {
  // Current selected minimum bathrooms
  minBathrooms: number;

  // Available bathrooms options
  bathroomsOptions: BathroomsOption[];

  // Event handlers
  onBathroomsChange: (value: number) => void;
  onReset: () => void;
  onClose?: () => void;

  // Selection helper
  isSelected: (value: number) => boolean;
}

/**
 * The internal content component for the bathrooms filter
 * Displays a grid of buttons for quick selection of common bathroom values
 */
export function BathroomsFilterContent({
  minBathrooms,
  bathroomsOptions,
  onBathroomsChange,
  onReset,
  onClose,
  isSelected,
}: BathroomsFilterContentProps) {
  // Check if any filter is active (not selecting "Any")
  const hasActiveFilter = minBathrooms > 0;

  return (
    <div className="w-full p-4 flex flex-col">
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-2">
          {bathroomsOptions.map((option) => (
            <Button
              key={option.value}
              variant={isSelected(option.value) ? "default" : "outline"}
              className="w-full"
              onClick={() => onBathroomsChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mt-2">
          {minBathrooms === 0
            ? "Show all properties regardless of bathrooms"
            : `Show properties with ${minBathrooms} or more bathrooms`}
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
