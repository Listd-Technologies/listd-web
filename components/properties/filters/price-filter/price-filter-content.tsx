"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { type PriceType } from "./use-price-filter";

interface PriceFilterContentProps {
  // Price values
  minPrice: string;
  maxPrice: string;
  minSqmPrice: string;
  maxSqmPrice: string;
  activePriceType: PriceType;

  // Price options
  minPriceOptions: { label: string; value: string }[];
  maxPriceOptions: { label: string; value: string }[];
  minSqmPriceOptions: { label: string; value: string }[];
  maxSqmPriceOptions: { label: string; value: string }[];

  // Event handlers
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onMinSqmPriceChange: (value: string) => void;
  onMaxSqmPriceChange: (value: string) => void;
  onPriceTypeChange: (value: PriceType) => void;
  onReset: () => void;
  onClose?: () => void;
}

/**
 * The internal content component for the price filter
 */
export function PriceFilterContent({
  minPrice,
  maxPrice,
  minSqmPrice,
  maxSqmPrice,
  activePriceType,
  minPriceOptions,
  maxPriceOptions,
  minSqmPriceOptions,
  maxSqmPriceOptions,
  onMinPriceChange,
  onMaxPriceChange,
  onMinSqmPriceChange,
  onMaxSqmPriceChange,
  onPriceTypeChange,
  onReset,
  onClose,
}: PriceFilterContentProps) {
  // Handler for tab change
  const handleTabChange = (value: string) => {
    onPriceTypeChange(value as PriceType);
  };

  return (
    <div className="w-full p-4 flex flex-col">
      <div className="mb-4">
        <Tabs defaultValue={activePriceType} onValueChange={handleTabChange}>
          <TabsList className="w-full">
            <TabsTrigger value="total" className="flex-1">
              Total Price
            </TabsTrigger>
            <TabsTrigger value="sqm" className="flex-1">
              Price per sqm
            </TabsTrigger>
          </TabsList>

          {/* Total price content */}
          <TabsContent value="total" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Price</label>
                <Select value={minPrice} onValueChange={onMinPriceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Min Price" />
                  </SelectTrigger>
                  <SelectContent>
                    {minPriceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Price</label>
                <Select value={maxPrice} onValueChange={onMaxPriceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Max Price" />
                  </SelectTrigger>
                  <SelectContent>
                    {maxPriceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Price per sqm content */}
          <TabsContent value="sqm" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Price</label>
                <Select value={minSqmPrice} onValueChange={onMinSqmPriceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Min Price" />
                  </SelectTrigger>
                  <SelectContent>
                    {minSqmPriceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Price</label>
                <Select value={maxSqmPrice} onValueChange={onMaxSqmPriceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Max Price" />
                  </SelectTrigger>
                  <SelectContent>
                    {maxSqmPriceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between mt-4">
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset
        </Button>
        <Button size="sm" onClick={onClose}>
          Apply
        </Button>
      </div>
    </div>
  );
}
