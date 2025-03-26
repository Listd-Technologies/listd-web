"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

interface AreaOption {
  label: string;
  value: number;
}

interface AreaFilterContentProps {
  // Current selected area values
  minArea: number;
  maxArea: number;

  // Available area options
  areaMinOptions: AreaOption[];
  areaMaxOptions: AreaOption[];

  // Event handlers
  onMinAreaChange: (value: number) => void;
  onMaxAreaChange: (value: number) => void;
  onReset: () => void;
  onClose?: () => void;

  // Selection helpers
  isMinSelected: (value: number) => boolean;
  isMaxSelected: (value: number) => boolean;
}

/**
 * The internal content component for the area filter
 * Displays a tabbed interface for min and max area selection
 */
export function AreaFilterContent({
  minArea,
  maxArea,
  areaMinOptions,
  areaMaxOptions,
  onMinAreaChange,
  onMaxAreaChange,
  onReset,
  onClose,
  isMinSelected,
  isMaxSelected,
}: AreaFilterContentProps) {
  // Check if any filter is active
  const hasActiveFilter = minArea > 0 || maxArea > 0;

  return (
    <div className="w-full p-4 flex flex-col">
      <div className="mb-6">
        <Tabs defaultValue="min" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="min">Minimum Area</TabsTrigger>
            <TabsTrigger value="max">Maximum Area</TabsTrigger>
          </TabsList>

          <TabsContent value="min" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {areaMinOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={isMinSelected(option.value) ? "default" : "outline"}
                  className="w-full"
                  onClick={() => onMinAreaChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-2">
              {minArea === 0
                ? "No minimum area requirement"
                : `Show properties with at least ${minArea} sq.m.`}
            </p>
          </TabsContent>

          <TabsContent value="max" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {areaMaxOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={isMaxSelected(option.value) ? "default" : "outline"}
                  className="w-full"
                  onClick={() => onMaxAreaChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-2">
              {maxArea === 0
                ? "No maximum area constraint"
                : `Show properties with at most ${maxArea} sq.m.`}
            </p>
          </TabsContent>
        </Tabs>
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
