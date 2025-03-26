"use client";

import { Button } from "@/components/ui/button";
import { PropertyType } from "@/types/property";
import React from "react";

interface PropertyTypeOption {
  id: number;
  name: string;
  value: PropertyType;
  disabled?: boolean;
}

interface PropertyTypeFilterContentProps {
  // Current selected property type
  propertyType: PropertyType;

  // Available property type options
  propertyTypeOptions: PropertyTypeOption[];

  // Event handlers
  onPropertyTypeChange: (type: PropertyType) => void;
  onClose?: () => void;
}

/**
 * The internal content component for the property type filter
 */
export function PropertyTypeFilterContent({
  propertyType,
  propertyTypeOptions,
  onPropertyTypeChange,
  onClose,
}: PropertyTypeFilterContentProps) {
  return (
    <div className="w-full p-4 flex flex-col">
      <div className="mb-6 space-y-2">
        {propertyTypeOptions.map((option) => (
          <Button
            key={option.id}
            variant={propertyType === option.value ? "default" : "outline"}
            className="w-full justify-start font-normal"
            disabled={option.disabled}
            onClick={() => onPropertyTypeChange(option.value)}
          >
            {option.name}
          </Button>
        ))}
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
