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
 * Changes apply immediately when an option is selected
 */
export function PropertyTypeFilterContent({
  propertyType,
  propertyTypeOptions,
  onPropertyTypeChange,
  onClose,
}: PropertyTypeFilterContentProps) {
  // Handler to apply changes and close the popover
  const handleOptionClick = (type: PropertyType) => {
    onPropertyTypeChange(type);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-full p-4 flex flex-col">
      <div className="space-y-2">
        {propertyTypeOptions.map((option) => (
          <Button
            key={option.id}
            variant={propertyType === option.value ? "default" : "outline"}
            className="w-full justify-start font-normal"
            disabled={option.disabled}
            onClick={() => handleOptionClick(option.value)}
          >
            {option.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
