"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type PropertyListingsFilter } from "@/hooks/api/usePropertyListings";
import { useUrlSync } from "@/hooks/useUrlSync";
import { type PropertyFiltersState, usePropertyFiltersStore } from "@/lib/stores/propertyFilters";
import { cn } from "@/lib/utils";
import { type BaseComponentProps, type LoadingProps } from "@/types";
import { DISABLED_PROPERTY_TYPES, type ListingType, type PropertyType } from "@/types/property";
import { debounce } from "lodash";
import { ChevronDown, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";

// Property types that match our context
const PROPERTY_TYPES = [
  { id: 1, name: "Condominium", value: "condominium" },
  { id: 2, name: "House and Lot", value: "house-and-lot" },
  { id: 3, name: "Vacant Lot", value: "vacant-lot" },
  { id: 4, name: "Warehouse", value: "warehouse" },
];

// Listing types that match our context
const LISTING_TYPES = [
  { id: 1, name: "For Sale", value: "buy" },
  { id: 2, name: "For Rent", value: "rent" },
];

// Price options for dropdowns - Buy (For Sale)
const BUY_MIN_PRICE_OPTIONS = [
  { label: "No Min", value: "0" },
  { label: "₱500,000", value: "500000" },
  { label: "₱1M", value: "1000000" },
  { label: "₱2M", value: "2000000" },
  { label: "₱3M", value: "3000000" },
  { label: "₱5M", value: "5000000" },
  { label: "₱10M", value: "10000000" },
  { label: "₱20M", value: "20000000" },
];

const BUY_MAX_PRICE_OPTIONS = [
  { label: "No Max", value: "0" },
  { label: "₱1M", value: "1000000" },
  { label: "₱2M", value: "2000000" },
  { label: "₱3M", value: "3000000" },
  { label: "₱5M", value: "5000000" },
  { label: "₱10M", value: "10000000" },
  { label: "₱20M", value: "20000000" },
  { label: "₱50M", value: "50000000" },
];

// Price options for dropdowns - Rent
const RENT_MIN_PRICE_OPTIONS = [
  { label: "No Min", value: "0" },
  { label: "₱5,000", value: "5000" },
  { label: "₱10,000", value: "10000" },
  { label: "₱15,000", value: "15000" },
  { label: "₱20,000", value: "20000" },
  { label: "₱30,000", value: "30000" },
  { label: "₱50,000", value: "50000" },
  { label: "₱100,000", value: "100000" },
];

const RENT_MAX_PRICE_OPTIONS = [
  { label: "No Max", value: "0" },
  { label: "₱15,000", value: "15000" },
  { label: "₱20,000", value: "20000" },
  { label: "₱30,000", value: "30000" },
  { label: "₱50,000", value: "50000" },
  { label: "₱100,000", value: "100000" },
  { label: "₱150,000", value: "150000" },
  { label: "₱200,000", value: "200000" },
];

// Min SQM price options
const MIN_SQM_PRICE_OPTIONS = [
  { label: "No Min", value: "0" },
  { label: "₱50K/sqm", value: "50000" },
  { label: "₱100K/sqm", value: "100000" },
  { label: "₱150K/sqm", value: "150000" },
  { label: "₱200K/sqm", value: "200000" },
  { label: "₱300K/sqm", value: "300000" },
];

// Max SQM price options
const MAX_SQM_PRICE_OPTIONS = [
  { label: "No Max", value: "0" },
  { label: "₱100K/sqm", value: "100000" },
  { label: "₱150K/sqm", value: "150000" },
  { label: "₱200K/sqm", value: "200000" },
  { label: "₱300K/sqm", value: "300000" },
  { label: "₱500K/sqm", value: "500000" },
];

// Default filter values
const DEFAULT_FILTERS: PropertyListingsFilter = {
  listingType: "buy", // Default to buy
  propertyType: "condominium", // Default to condominium
  location: "", // Add empty string for location
  minPrice: 0,
  maxPrice: 0,
  minSqmPrice: 0,
  maxSqmPrice: 0,
  activePriceType: "total", // Add default price type
  minBedrooms: 0,
  minBathrooms: 0,
  minArea: 0,
  maxArea: 0,
};

// Define the props interface for filter components
interface FilterComponentProps {
  compact?: boolean;
  disabled?: boolean;
  onPopoverClose?: () => void;
}

export interface PropertyFiltersProps extends BaseComponentProps, LoadingProps {
  /**
   * Callback for when filters are applied
   */
  onApplyFilters: (filters: PropertyListingsFilter) => void;

  /**
   * Initial filter values
   */
  initialFilters?: PropertyListingsFilter;

  /**
   * Display style for the filters
   * @default "standard" - Standard vertical layout
   * @option "horizontal" - Horizontal layout for top navigation
   * @option "compact" - Compact layout for mobile devices
   */
  displayStyle?: "standard" | "horizontal" | "compact";
}

// Price Filter Component
const PriceFilter = memo(function PriceFilter({
  compact = false,
  onPopoverClose,
}: FilterComponentProps) {
  // Selective store access to prevent unnecessary re-renders
  const listingType = usePropertyFiltersStore((state) => state.filters.listingType);
  const minPrice = usePropertyFiltersStore((state) => state.filters.minPrice);
  const maxPrice = usePropertyFiltersStore((state) => state.filters.maxPrice);
  const minSqmPrice = usePropertyFiltersStore((state) => state.filters.minSqmPrice);
  const maxSqmPrice = usePropertyFiltersStore((state) => state.filters.maxSqmPrice);
  const activePriceType = usePropertyFiltersStore((state) => state.filters.activePriceType);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  const [open, setOpen] = useState(false);
  const [priceType, setPriceType] = useState<"total" | "sqm">(activePriceType);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice?.toString() || "0");
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice?.toString() || "0");
  const [localMinSqmPrice, setLocalMinSqmPrice] = useState(minSqmPrice?.toString() || "0");
  const [localMaxSqmPrice, setLocalMaxSqmPrice] = useState(maxSqmPrice?.toString() || "0");

  // Get the appropriate price options based on listing type - memoized
  const priceOptions = useMemo(
    () => ({
      minPriceOptions: listingType === "rent" ? RENT_MIN_PRICE_OPTIONS : BUY_MIN_PRICE_OPTIONS,
      maxPriceOptions: listingType === "rent" ? RENT_MAX_PRICE_OPTIONS : BUY_MAX_PRICE_OPTIONS,
    }),
    [listingType]
  );

  // Update local state when store changes - more specific dependencies
  useEffect(() => {
    setLocalMinPrice(minPrice?.toString() || "0");
    setLocalMaxPrice(maxPrice?.toString() || "0");
  }, [minPrice, maxPrice]);

  useEffect(() => {
    setLocalMinSqmPrice(minSqmPrice?.toString() || "0");
    setLocalMaxSqmPrice(maxSqmPrice?.toString() || "0");
  }, [minSqmPrice, maxSqmPrice]);

  useEffect(() => {
    setPriceType(activePriceType);
  }, [activePriceType]);

  // Handle price selection with immediate updates
  const handlePriceChange = useCallback(
    (field: string, value: string) => {
      const numValue = parseInt(value) || 0;

      // Update local state
      switch (field) {
        case "minPrice":
          setLocalMinPrice(value);
          break;
        case "maxPrice":
          setLocalMaxPrice(value);
          break;
        case "minSqmPrice":
          setLocalMinSqmPrice(value);
          break;
        case "maxSqmPrice":
          setLocalMaxSqmPrice(value);
          break;
      }

      // Update store immediately
      updateFilters({
        [field]: numValue,
      });
    },
    [updateFilters]
  );

  // Reset price values - memoized callback
  const handleReset = useCallback(() => {
    console.log("🧹 Resetting price filter values");

    // Reset all price inputs
    setLocalMinPrice("0");
    setLocalMaxPrice("0");
    setLocalMinSqmPrice("0");
    setLocalMaxSqmPrice("0");

    // Get the clearAllFilters function from useUrlSync
    const { clearAllFilters } = useUrlSync();
    clearAllFilters();

    // Close popover if needed
    setOpen(false);
    onPopoverClose?.();
  }, [onPopoverClose]);

  // Update price type immediately
  const handlePriceTypeChange = useCallback(
    (value: string) => {
      setPriceType(value as "total" | "sqm");
      updateFilters({
        activePriceType: value as "total" | "sqm",
      });
    },
    [updateFilters]
  );

  // Format price for display - memoized
  const formatPrice = useCallback(
    (price: number) => {
      // Different format based on listing type
      const isRent = listingType === "rent";

      if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1)}M${isRent ? "/mo" : ""}`;
      } else if (price >= 1000) {
        return `${(price / 1000).toFixed(0)}K${isRent ? "/mo" : ""}`;
      }
      return `${price}${isRent ? "/mo" : ""}`;
    },
    [listingType]
  );

  // Function to get display text for the price button - memoized
  const getPriceButtonText = useCallback(() => {
    // Get values for both price types
    const minTotalPrice = parseInt(localMinPrice);
    const maxTotalPrice = parseInt(localMaxPrice);
    const minPerSqm = parseInt(localMinSqmPrice);
    const maxPerSqm = parseInt(localMaxSqmPrice);

    // When the popover is open, use the current tab selection (priceType)
    // When the popover is closed, use the saved context value (state.activePriceType)
    const activeType = open ? priceType : activePriceType;
    const isRent = listingType === "rent";

    if (activeType === "total") {
      if (minTotalPrice === 0 && maxTotalPrice === 0) return "Price";
      if (minTotalPrice > 0 && maxTotalPrice === 0) return `₱${formatPrice(minTotalPrice)}+`;
      if (minTotalPrice === 0 && maxTotalPrice > 0) return `Up to ₱${formatPrice(maxTotalPrice)}`;
      if (minTotalPrice === maxTotalPrice) return `₱${formatPrice(minTotalPrice)}`;
      return `₱${formatPrice(minTotalPrice)} - ₱${formatPrice(maxTotalPrice)}`;
    } else {
      if (minPerSqm === 0 && maxPerSqm === 0) return "Price";
      if (minPerSqm > 0 && maxPerSqm === 0)
        return `₱${formatPrice(minPerSqm)}/sqm${isRent ? "/mo" : ""}`;
      if (minPerSqm === 0 && maxPerSqm > 0)
        return `Up to ₱${formatPrice(maxPerSqm)}/sqm${isRent ? "/mo" : ""}`;
      if (minPerSqm === maxPerSqm) return `₱${formatPrice(minPerSqm)}/sqm${isRent ? "/mo" : ""}`;
      return `₱${formatPrice(minPerSqm)} - ₱${formatPrice(maxPerSqm)}/sqm${isRent ? "/mo" : ""}`;
    }
  }, [
    localMinPrice,
    localMaxPrice,
    localMinSqmPrice,
    localMaxSqmPrice,
    open,
    priceType,
    activePriceType,
    listingType,
    formatPrice,
  ]);

  // Handle tab value change
  const handleTabValueChange = useCallback(
    (value: string) => {
      handlePriceTypeChange(value as "total" | "sqm");
    },
    [handlePriceTypeChange]
  );

  // Memoize the Button component to prevent unnecessary rerenders
  const buttonContent = useMemo(
    () => (
      <Button
        variant="outline"
        size={compact ? "sm" : undefined}
        className={cn(
          "flex items-center gap-1 text-foreground justify-between font-normal",
          compact
            ? "h-9 whitespace-nowrap shrink-0 min-w-[120px] w-[120px]"
            : "h-10 min-w-[120px] w-[120px]"
        )}
      >
        <span className="truncate max-w-[80%] text-left">{getPriceButtonText()}</span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-1" />
      </Button>
    ),
    [compact, getPriceButtonText]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{buttonContent}</PopoverTrigger>
      <PopoverContent
        className={cn("p-0 z-50", compact ? "w-[95vw] max-w-[400px]" : "w-[360px]")}
        align={compact ? "center" : "start"}
        side="bottom"
        alignOffset={0}
        sideOffset={16}
        avoidCollisions={true}
        collisionPadding={20}
        sticky="always"
      >
        <div className={cn("p-4 pb-2", compact ? "p-5 pb-3" : "")}>
          <div className={cn("text-lg font-medium mb-4", compact ? "text-xl" : "")}>
            Price Range
          </div>

          <Tabs value={priceType} onValueChange={handleTabValueChange} className="w-full">
            <TabsList className={cn("w-full grid grid-cols-2", "h-[52px] p-1 bg-muted rounded-lg")}>
              <TabsTrigger
                value="total"
                className="h-[44px] rounded-md data-[state=active]:bg-white text-base font-medium"
              >
                Total Price
              </TabsTrigger>
              <TabsTrigger
                value="sqm"
                className="h-[44px] rounded-md data-[state=active]:bg-white text-sm md:text-base font-medium"
              >
                Per SQM
              </TabsTrigger>
            </TabsList>

            <div className={cn("mt-6", compact ? "mt-8" : "")}>
              <div className={cn("flex mb-2", compact ? "text-base" : "")}>
                <div
                  className={cn(
                    "text-muted-foreground w-[45%] pl-1",
                    compact ? "text-sm" : "text-sm"
                  )}
                >
                  Minimum
                </div>
                <div className="w-[10%]"></div>
                <div
                  className={cn(
                    "text-muted-foreground w-[45%] pl-1",
                    compact ? "text-sm" : "text-sm"
                  )}
                >
                  Maximum
                </div>
              </div>

              <TabsContent value="total" className="mt-0 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-full">
                    <Select
                      value={localMinPrice}
                      onValueChange={(value) => handlePriceChange("minPrice", value)}
                    >
                      <SelectTrigger
                        id="minPrice"
                        className="bg-background border border-input rounded-lg w-full h-11 text-sm md:text-base px-2 md:px-3"
                      >
                        <SelectValue placeholder="No Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {priceOptions.minPriceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-center w-5 flex-shrink-0">
                    <div className="h-px w-4 bg-neutral-300"></div>
                  </div>

                  <div className="w-full">
                    <Select
                      value={localMaxPrice}
                      onValueChange={(value) => handlePriceChange("maxPrice", value)}
                    >
                      <SelectTrigger
                        id="maxPrice"
                        className="bg-background border border-input rounded-lg w-full h-11 text-sm md:text-base px-2 md:px-3"
                      >
                        <SelectValue placeholder="No Max" />
                      </SelectTrigger>
                      <SelectContent>
                        {priceOptions.maxPriceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sqm" className="mt-0 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-full">
                    <Select
                      value={localMinSqmPrice}
                      onValueChange={(value) => handlePriceChange("minSqmPrice", value)}
                    >
                      <SelectTrigger
                        id="minSqmPrice"
                        className="bg-background border border-input rounded-lg w-full h-11 text-sm md:text-base px-2 md:px-3"
                      >
                        <SelectValue placeholder="No Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {MIN_SQM_PRICE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-center w-5 flex-shrink-0">
                    <div className="h-px w-4 bg-neutral-300"></div>
                  </div>

                  <div className="w-full">
                    <Select
                      value={localMaxSqmPrice}
                      onValueChange={(value) => handlePriceChange("maxSqmPrice", value)}
                    >
                      <SelectTrigger
                        id="maxSqmPrice"
                        className="bg-background border border-input rounded-lg w-full h-11 text-sm md:text-base px-2 md:px-3"
                      >
                        <SelectValue placeholder="No Max" />
                      </SelectTrigger>
                      <SelectContent>
                        {MAX_SQM_PRICE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className={cn("p-4 pt-6", compact ? "px-5 py-6" : "")}>
          <div className="flex flex-row gap-2 w-full">
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-base h-12 rounded-lg font-medium"
              onClick={() => {
                // Just close the popover, changes are already applied
                setOpen(false);
                onPopoverClose?.();
              }}
            >
              Close
            </Button>
            <Button variant="outline" className="h-12 rounded-lg" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

// Listing Type Filter Component
const ListingTypeFilter = memo(function ListingTypeFilter({
  compact = false,
  disabled = false,
  onPopoverClose,
}: FilterComponentProps) {
  // Selective store access
  const listingType = usePropertyFiltersStore((state) => state.filters.listingType);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  const [open, setOpen] = useState(false);

  // Handle selection of listing type - memoized callback
  const handleSelectListingType = useCallback(
    (value: ListingType) => {
      // Update store (URL sync middleware will handle URL updates)
      updateFilters({ listingType: value });

      // Close popover and notify parent
      setOpen(false);
      onPopoverClose?.();
    },
    [updateFilters, onPopoverClose]
  );

  // Don't open popover if disabled - memoized callback
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!disabled) {
        setOpen(open);
      }
    },
    [disabled]
  );

  // Memoize the button content
  const buttonContent = useMemo(
    () => (
      <Button
        variant="outline"
        size={compact ? "sm" : undefined}
        className={cn(
          "flex items-center gap-1 text-foreground justify-between font-normal",
          compact ? "h-9 whitespace-nowrap shrink-0 min-w-[110px]" : "h-10",
          listingType === "buy" ? "min-w-[120px]" : "min-w-[120px]"
        )}
        disabled={disabled}
      >
        <span>{listingType === "buy" ? "For Sale" : "For Rent"}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>
    ),
    [compact, disabled, listingType]
  );

  // Memoize the PopoverContent
  const popoverContent = useMemo(
    () => (
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="p-1">
          {LISTING_TYPES.map((option) => (
            <Button
              key={option.id}
              variant={listingType === option.value ? "default" : "ghost"}
              className="w-full justify-start h-10 rounded-md mb-1 last:mb-0"
              onClick={() => handleSelectListingType(option.value as ListingType)}
            >
              {option.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    ),
    [listingType, handleSelectListingType]
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{buttonContent}</PopoverTrigger>
      {popoverContent}
    </Popover>
  );
});

// Property Type Filter Component
const PropertyTypeFilter = memo(function PropertyTypeFilter({
  compact = false,
  disabled = false,
  onPopoverClose,
}: FilterComponentProps) {
  // Selective store access
  const propertyType = usePropertyFiltersStore((state) => state.filters.propertyType);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  const [open, setOpen] = useState(false);

  // Handle selection of property type - memoized callback
  const handleSelectPropertyType = useCallback(
    (value: PropertyType) => {
      // Check if the property type is disabled
      if (DISABLED_PROPERTY_TYPES.includes(value)) {
        return; // Don't allow selection of disabled property types
      }

      // Update store (URL sync middleware will handle URL updates)
      updateFilters({ propertyType: value });

      // Close popover and notify parent
      setOpen(false);
      onPopoverClose?.();
    },
    [updateFilters, onPopoverClose]
  );

  // Don't open popover if disabled - memoized callback
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!disabled) {
        setOpen(open);
      }
    },
    [disabled]
  );

  // Get display name for current property type - memoized function
  const getCurrentPropertyName = useCallback(() => {
    const currentOption = PROPERTY_TYPES.find((option) => option.value === propertyType);
    return currentOption ? currentOption.name : "Property Type";
  }, [propertyType]);

  // Memoize the button content
  const buttonContent = useMemo(
    () => (
      <Button
        variant="outline"
        size={compact ? "sm" : undefined}
        className={cn(
          "flex items-center gap-1 text-foreground justify-between font-normal",
          compact ? "h-9 whitespace-nowrap shrink-0 min-w-[120px]" : "h-10",
          propertyType === "vacant-lot" || propertyType === "warehouse" ? "min-w-[120px]" : ""
        )}
        disabled={disabled}
      >
        <span>{getCurrentPropertyName()}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>
    ),
    [compact, disabled, propertyType, getCurrentPropertyName]
  );

  // Memoize the PopoverContent
  const popoverContent = useMemo(
    () => (
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="p-1">
          {PROPERTY_TYPES.map((option) => {
            const isDisabled = DISABLED_PROPERTY_TYPES.includes(option.value as PropertyType);
            return (
              <Button
                key={option.id}
                variant={propertyType === option.value ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 rounded-md mb-1 last:mb-0",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => handleSelectPropertyType(option.value as PropertyType)}
                disabled={isDisabled}
              >
                <span className="flex-1 text-left">{option.name}</span>
                {isDisabled && (
                  <span className="text-xs text-muted-foreground font-normal whitespace-nowrap">
                    (Coming soon)
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    ),
    [propertyType, handleSelectPropertyType]
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{buttonContent}</PopoverTrigger>
      {popoverContent}
    </Popover>
  );
});

// Area Filter Component
const AreaFilter = memo(function AreaFilter({
  compact = false,
  onPopoverClose,
}: FilterComponentProps) {
  // Selective store access
  const minArea = usePropertyFiltersStore((state) => state.filters.minArea);
  const maxArea = usePropertyFiltersStore((state) => state.filters.maxArea);
  const propertyType = usePropertyFiltersStore((state) => state.filters.propertyType);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  const [open, setOpen] = useState(false);
  const [localMinArea, setLocalMinArea] = useState(minArea?.toString() || "");
  const [localMaxArea, setLocalMaxArea] = useState(maxArea?.toString() || "");

  // Update local state when store changes
  useEffect(() => {
    setLocalMinArea(minArea?.toString() || "");
    setLocalMaxArea(maxArea?.toString() || "");
  }, [minArea, maxArea]);

  // Reset area values - memoized callback
  const handleReset = useCallback(() => {
    console.log("🧹 Resetting area filter values");

    // Reset local area inputs
    setLocalMinArea("0");
    setLocalMaxArea("0");

    // Get the clearAllFilters function from useUrlSync
    const { clearAllFilters } = useUrlSync();
    clearAllFilters();

    // Close popover if needed
    setOpen(false);
    onPopoverClose?.();
  }, [onPopoverClose]);

  // Handle input changes - memoized callbacks
  const handleMinAreaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalMinArea(value);

      // Immediately update the store
      updateFilters({
        minArea: value ? Number(value) : 0,
      });
    },
    [updateFilters]
  );

  const handleMaxAreaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalMaxArea(value);

      // Immediately update the store
      updateFilters({
        maxArea: value ? Number(value) : 0,
      });
    },
    [updateFilters]
  );

  // Get display text for the area button - memoized function
  const getAreaButtonText = useCallback(() => {
    const minValue = parseInt(localMinArea, 10) || 0;
    const maxValue = parseInt(localMaxArea, 10) || 0;

    if (minValue === 0 && maxValue === 0) return "Area";
    if (minValue > 0 && maxValue === 0) return `${minValue}+ sqm`;
    if (minValue === 0 && maxValue > 0) return `Up to ${maxValue} sqm`;
    if (minValue === maxValue) return `${minValue} sqm`;
    return `${minValue} - ${maxValue} sqm`;
  }, [localMinArea, localMaxArea]);

  // Memoize the button content
  const buttonContent = useMemo(
    () => (
      <Button
        variant="outline"
        size={compact ? "sm" : undefined}
        className={cn(
          "flex items-center gap-1 text-foreground justify-between font-normal",
          compact ? "h-9 whitespace-nowrap shrink-0 min-w-[100px]" : "h-10",
          propertyType === "vacant-lot" || propertyType === "warehouse" ? "min-w-[120px]" : ""
        )}
      >
        <span className="truncate max-w-[85%] text-left">{getAreaButtonText()}</span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </Button>
    ),
    [compact, propertyType, getAreaButtonText]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{buttonContent}</PopoverTrigger>
      <PopoverContent
        className={cn("p-0 z-50", compact ? "w-[95vw] max-w-[400px]" : "w-[320px]")}
        align={compact ? "center" : "start"}
        side="bottom"
        alignOffset={0}
        sideOffset={16}
        avoidCollisions={true}
        collisionPadding={20}
        sticky="always"
      >
        <div className={cn("p-4 pb-2", compact ? "p-5 pb-3" : "")}>
          <div className={cn("text-lg font-medium mb-4", compact ? "text-xl" : "")}>Area Range</div>

          <div className={cn("flex mb-4", compact ? "text-base" : "")}>
            <div
              className={cn("text-muted-foreground w-[45%] pl-1", compact ? "text-sm" : "text-sm")}
            >
              Minimum
            </div>
            <div className="w-[10%]"></div>
            <div
              className={cn("text-muted-foreground w-[45%] pl-1", compact ? "text-sm" : "text-sm")}
            >
              Maximum
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-full">
              <Input
                id="minArea"
                type="number"
                placeholder="Min area"
                value={localMinArea}
                onChange={handleMinAreaChange}
                className="h-10 text-sm md:text-base bg-background border border-input rounded-lg px-3"
              />
            </div>

            <div className="flex justify-center w-5 flex-shrink-0">
              <div className="h-px w-4 bg-neutral-300"></div>
            </div>

            <div className="w-full">
              <Input
                id="maxArea"
                type="number"
                placeholder="Max area"
                value={localMaxArea}
                onChange={handleMaxAreaChange}
                className="h-10 text-sm md:text-base bg-background border border-input rounded-lg px-3"
              />
            </div>
          </div>
        </div>

        <div className={cn("p-4 pt-6", compact ? "px-5 py-6" : "")}>
          <div className="flex flex-row gap-2 w-full">
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-base h-12 rounded-lg font-medium"
              onClick={() => {
                // Just close the popover, changes are already applied
                setOpen(false);
                onPopoverClose?.();
              }}
            >
              Close
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-lg flex-shrink-0"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

// Bedrooms Filter Component
const BedroomsFilter = memo(function BedroomsFilter({
  compact = false,
  disabled = false,
  onPopoverClose,
}: FilterComponentProps) {
  // Selective store access
  const minBedrooms = usePropertyFiltersStore((state) => state.filters.minBedrooms);
  const propertyType = usePropertyFiltersStore((state) => state.filters.propertyType);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  const [open, setOpen] = useState(false);

  // Handle selection of minimum bedrooms - memoized callback
  const handleSelect = useCallback(
    (value: string) => {
      const numValue = Number(value);
      console.log(`🛏️ Setting minBedrooms to ${numValue}`, { value, numValue });

      // Update store (URL sync middleware will handle URL updates)
      updateFilters({ minBedrooms: numValue });

      // Log when "Any" (0) is selected to track URL updates
      if (numValue === 0) {
        console.log("📌 Selected 'Any' for bedrooms - this should be excluded from URL params");

        // Add a small delay to let the store update first
        setTimeout(() => {
          const currentParams = new URLSearchParams(window.location.search);
          console.log(
            "📌 Current URL params after selecting 'Any':",
            Object.fromEntries(currentParams.entries()),
            "Has bedrooms param:",
            currentParams.has("bedrooms")
          );
        }, 500);
      }

      // Close popover and notify parent
      setOpen(false);
      onPopoverClose?.();
    },
    [updateFilters, onPopoverClose]
  );

  // Don't open popover if disabled - memoized callback
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!disabled) {
        setOpen(open);
      }
    },
    [disabled]
  );

  // Get display text for the bedrooms button - memoized function
  const getButtonText = useCallback(() => {
    const bedroomsValue = minBedrooms || 0;
    if (bedroomsValue === 0) return "Bedrooms";
    return `${bedroomsValue}+ Bedrooms`;
  }, [minBedrooms]);

  // Memoize the button content
  const buttonContent = useMemo(
    () => (
      <Button
        variant="outline"
        size={compact ? "sm" : undefined}
        className={cn(
          "flex items-center gap-1 text-foreground justify-between font-normal",
          compact ? "h-9 whitespace-nowrap shrink-0 min-w-[100px]" : "h-10",
          propertyType === "vacant-lot" || propertyType === "warehouse" ? "min-w-[120px]" : ""
        )}
        disabled={disabled}
      >
        <span className="truncate max-w-[85%] text-left">{getButtonText()}</span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </Button>
    ),
    [compact, disabled, propertyType, getButtonText]
  );

  // Memoize the PopoverContent
  const popoverContent = useMemo(
    () => (
      <PopoverContent
        className="p-0 z-50 w-[220px]"
        align="start"
        side="bottom"
        alignOffset={0}
        sideOffset={16}
        avoidCollisions={true}
        collisionPadding={20}
        sticky="always"
      >
        <div className="p-4">
          <div className="text-lg font-medium mb-4">Minimum Bedrooms</div>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map((num) => (
              <Button
                key={num}
                variant={minBedrooms === num ? "default" : "ghost"}
                className="w-full justify-start h-10 rounded-md"
                onClick={() => handleSelect(num.toString())}
              >
                {num === 0 ? "Any" : `${num}+`}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    ),
    [minBedrooms, handleSelect]
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{buttonContent}</PopoverTrigger>
      {popoverContent}
    </Popover>
  );
});

// Bathrooms Filter Component
const BathroomsFilter = memo(function BathroomsFilter({
  compact = false,
  disabled = false,
  onPopoverClose,
}: FilterComponentProps) {
  // Selective store access
  const minBathrooms = usePropertyFiltersStore((state) => state.filters.minBathrooms);
  const propertyType = usePropertyFiltersStore((state) => state.filters.propertyType);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  const [open, setOpen] = useState(false);

  // Handle selection of minimum bathrooms - memoized callback
  const handleSelect = useCallback(
    (value: string) => {
      const numValue = Number(value);
      console.log(`🚿 Setting minBathrooms to ${numValue}`, { value, numValue });

      // Update store (URL sync middleware will handle URL updates)
      updateFilters({ minBathrooms: numValue });

      // Close popover and notify parent
      setOpen(false);
      onPopoverClose?.();
    },
    [updateFilters, onPopoverClose]
  );

  // Don't open popover if disabled - memoized callback
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!disabled) {
        setOpen(open);
      }
    },
    [disabled]
  );

  // Get display text for the bathrooms button - memoized function
  const getButtonText = useCallback(() => {
    const bathroomsValue = minBathrooms || 0;
    if (bathroomsValue === 0) return "Bathrooms";
    return `${bathroomsValue}+ Bathrooms`;
  }, [minBathrooms]);

  // Memoize the button content
  const buttonContent = useMemo(
    () => (
      <Button
        variant="outline"
        size={compact ? "sm" : undefined}
        className={cn(
          "flex items-center gap-1 text-foreground justify-between font-normal",
          compact ? "h-9 whitespace-nowrap shrink-0 min-w-[100px]" : "h-10",
          propertyType === "vacant-lot" || propertyType === "warehouse" ? "min-w-[120px]" : ""
        )}
        disabled={disabled}
      >
        <span className="truncate max-w-[85%] text-left">{getButtonText()}</span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </Button>
    ),
    [compact, disabled, propertyType, getButtonText]
  );

  // Memoize the PopoverContent
  const popoverContent = useMemo(
    () => (
      <PopoverContent
        className="p-0 z-50 w-[220px]"
        align="start"
        side="bottom"
        alignOffset={0}
        sideOffset={16}
        avoidCollisions={true}
        collisionPadding={20}
        sticky="always"
      >
        <div className="p-4">
          <div className="text-lg font-medium mb-4">Minimum Bathrooms</div>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map((num) => (
              <Button
                key={num}
                variant={minBathrooms === num ? "default" : "ghost"}
                className="w-full justify-start h-10 rounded-md"
                onClick={() => handleSelect(num.toString())}
              >
                {num === 0 ? "Any" : `${num}+`}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    ),
    [minBathrooms, handleSelect]
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{buttonContent}</PopoverTrigger>
      {popoverContent}
    </Popover>
  );
});

// Equivalent function to getPropertyListingsFilter from the old listing provider
function createPropertyListingsFilter(
  filterState: PropertyFiltersState["filters"]
): PropertyListingsFilter {
  return {
    listingType: filterState.listingType,
    propertyType: filterState.propertyType,
    location: filterState.location || "",
    minPrice: filterState.minPrice,
    maxPrice: filterState.maxPrice,
    minSqmPrice: filterState.minSqmPrice,
    maxSqmPrice: filterState.maxSqmPrice,
    activePriceType: filterState.activePriceType,
    minBedrooms: filterState.minBedrooms,
    minBathrooms: filterState.minBathrooms,
    minArea: filterState.minArea,
    maxArea: filterState.maxArea,
    sortField: filterState.sortField,
    sortOrder: filterState.sortOrder,
  };
}

/**
 * Property filters component with loading states
 */
export function PropertyFilters({
  className,
  onApplyFilters,
  initialFilters = DEFAULT_FILTERS,
  isLoading = false,
  displayStyle = "standard",
  ...props
}: PropertyFiltersProps) {
  // Selective store access
  const filters = usePropertyFiltersStore((state) => state.filters);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  // Initialize URL sync for direct access to clearAllFilters
  const { clearAllFilters } = useUrlSync();

  const [initialLoad, setInitialLoad] = useState(true);
  const [locationInput, setLocationInput] = useState(filters.location || "");
  const searchParams = useSearchParams();

  // Debug effect - log when filters change
  useEffect(() => {
    console.log("🔍 PropertyFilters component - Current filters:", filters);
  }, [filters]);

  // Check if property type should have bedroom/bathroom filters disabled - memoized
  const shouldDisableRoomFilters = useMemo(
    () => filters.propertyType === "vacant-lot" || filters.propertyType === "warehouse",
    [filters.propertyType]
  );

  // Initialize filters from initial filters or URL - run only once
  useEffect(() => {
    if (initialLoad) {
      const urlParams = new URLSearchParams(searchParams.toString());

      // Only apply initialFilters if there are no URL parameters
      // This ensures URL params take precedence on page reload
      if (urlParams.toString() === "") {
        // No URL params, apply initial filters
        updateFilters(initialFilters);
      }

      setInitialLoad(false);
    }
  }, [initialLoad, initialFilters, updateFilters, searchParams]);

  // Update local state when location store changes
  useEffect(() => {
    setLocationInput(filters.location || "");
  }, [filters.location]);

  // Debounced location update function - using debounce utility
  const debouncedLocationUpdate = useCallback(
    debounce((value: string) => {
      updateFilters({ location: value });
    }, 300),
    [updateFilters]
  );

  // Handle form submission - memoized callback
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Get filters from state and ensure required fields are provided
      const filtersWithLocation = {
        ...createPropertyListingsFilter(filters),
        location: filters.location || "",
      };
      onApplyFilters(filtersWithLocation);
    },
    [filters, onApplyFilters]
  );

  // Handle form reset - memoized callback
  const handleReset = useCallback(() => {
    console.log("🧹 Resetting all filters");

    // Use clearAllFilters for one-click reset
    clearAllFilters();

    // Reset local state
    setLocationInput("");

    // Notify parent component with default filters
    onApplyFilters({
      ...DEFAULT_FILTERS,
    });
  }, [clearAllFilters, onApplyFilters]);

  // Handle location change - memoized callback
  const handleLocationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Update local state immediately for responsive UI
      setLocationInput(value);
      // Debounce the store update to prevent lag
      debouncedLocationUpdate(value);
    },
    [debouncedLocationUpdate]
  );

  // Handle filter apply for popover components - memoized callback
  const handleFilterApply = useCallback(() => {
    // Get filters and ensure location is never undefined
    const filtersWithLocation = {
      ...createPropertyListingsFilter(filters),
      location: filters.location || "",
    };
    onApplyFilters(filtersWithLocation);
  }, [filters, onApplyFilters]);

  // Handle tab change callback - memoized
  const handleTabValueChange = useCallback(
    (value: string) => {
      updateFilters({
        activePriceType: value as "total" | "sqm",
      });
    },
    [updateFilters]
  );

  // Callback for filter popover close - memoized
  const getPopoverCloseHandler = useCallback(() => {
    return handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  }, [handleSubmit]);

  // Memoize compact layout - call unconditionally
  const compactLayout = useMemo(
    () => (
      <div className={cn("w-full overflow-x-visible", className)} {...props}>
        {/* Horizontally scrollable filter area */}
        <div className="relative w-full">
          <div
            className="flex items-center overflow-x-auto whitespace-nowrap gap-2 px-4 no-scrollbar touch-horizontal"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <ListingTypeFilter compact onPopoverClose={handleFilterApply} />
            <PropertyTypeFilter compact onPopoverClose={handleFilterApply} />
            <AreaFilter compact onPopoverClose={handleFilterApply} />
            <PriceFilter compact onPopoverClose={handleFilterApply} />
            <BedroomsFilter
              compact
              onPopoverClose={handleFilterApply}
              disabled={shouldDisableRoomFilters}
            />
            <BathroomsFilter
              compact
              onPopoverClose={handleFilterApply}
              disabled={shouldDisableRoomFilters}
            />
          </div>
          {/* Subtle fade effect on the right edge to indicate scrollability */}
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
        </div>
      </div>
    ),
    [className, props, handleFilterApply, shouldDisableRoomFilters]
  );

  // Memoize horizontal layout - call unconditionally
  const horizontalLayout = useMemo(
    () => (
      <form onSubmit={handleSubmit} className={cn("w-full", className)} {...props}>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-grow max-w-md flex items-center">
            <Input
              placeholder="Address, neighborhood, city, ZIP"
              className="pl-10 pr-4 h-10 rounded-md"
              value={locationInput}
              onChange={handleLocationChange}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Filter Components */}
          <ListingTypeFilter onPopoverClose={getPopoverCloseHandler} />
          <PropertyTypeFilter onPopoverClose={getPopoverCloseHandler} />
          <AreaFilter onPopoverClose={getPopoverCloseHandler} />
          <PriceFilter onPopoverClose={getPopoverCloseHandler} />
          <BedroomsFilter
            onPopoverClose={getPopoverCloseHandler}
            disabled={shouldDisableRoomFilters}
          />
          <BathroomsFilter
            onPopoverClose={getPopoverCloseHandler}
            disabled={shouldDisableRoomFilters}
          />

          {/* Apply / Save Search Button */}
          <Button type="submit" className="h-10 ml-auto" disabled={isLoading}>
            {isLoading ? "Searching..." : "Save search"}
          </Button>
        </div>
      </form>
    ),
    [
      className,
      props,
      handleSubmit,
      locationInput,
      handleLocationChange,
      getPopoverCloseHandler,
      shouldDisableRoomFilters,
      isLoading,
    ]
  );

  // Memoize standard layout - call unconditionally
  const standardLayout = useMemo(
    () => (
      <div className={cn("p-6 border rounded-lg space-y-6 bg-card", className)} {...props}>
        <form onSubmit={handleSubmit}>
          {/* Listing Type */}
          <div className="space-y-2">
            <Label htmlFor="listingType">Listing Type</Label>
            <ListingTypeFilter onPopoverClose={getPopoverCloseHandler} />
          </div>

          {/* Property Type */}
          <div className="space-y-2 mt-4">
            <Label htmlFor="propertyType">Property Type</Label>
            <PropertyTypeFilter onPopoverClose={getPopoverCloseHandler} />
          </div>

          {/* Location */}
          <div className="space-y-2 mt-4">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <Input
                id="location"
                placeholder="Enter location"
                value={locationInput}
                onChange={handleLocationChange}
                disabled={isLoading}
                className="pl-10 h-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 mt-4">
            <Label>Price Range</Label>
            <Tabs
              value={filters.activePriceType}
              onValueChange={handleTabValueChange}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="total">Total Price</TabsTrigger>
                <TabsTrigger value="sqm">Per SQM</TabsTrigger>
              </TabsList>
              <TabsContent value="total" className="pt-2">
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minPrice">Min Price</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      placeholder="Min price"
                      value={filters.minPrice || ""}
                      onChange={(e) =>
                        updateFilters({
                          minPrice: Number(e.target.value),
                        })
                      }
                      disabled={isLoading}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxPrice">Max Price</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="Max price"
                      value={filters.maxPrice || ""}
                      onChange={(e) =>
                        updateFilters({
                          maxPrice: Number(e.target.value),
                        })
                      }
                      disabled={isLoading}
                      className="h-10"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="sqm" className="pt-2">
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minSqmPrice">Min ₱/sqm</Label>
                    <Input
                      id="minSqmPrice"
                      type="number"
                      placeholder="Min price per sqm"
                      value={filters.minSqmPrice || ""}
                      onChange={(e) =>
                        updateFilters({
                          minSqmPrice: Number(e.target.value),
                        })
                      }
                      disabled={isLoading}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxSqmPrice">Max ₱/sqm</Label>
                    <Input
                      id="maxSqmPrice"
                      type="number"
                      placeholder="Max price per sqm"
                      value={filters.maxSqmPrice || ""}
                      onChange={(e) =>
                        updateFilters({
                          maxSqmPrice: Number(e.target.value),
                        })
                      }
                      disabled={isLoading}
                      className="h-10"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Bedroom/Bathroom/Area Filters */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mt-4">
            <div className="space-y-2">
              <Label htmlFor="minBedrooms">Min Bedrooms</Label>
              <BedroomsFilter onPopoverClose={getPopoverCloseHandler} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minBathrooms">Min Bathrooms</Label>
              <BathroomsFilter onPopoverClose={getPopoverCloseHandler} />
            </div>
          </div>

          {/* Area Range */}
          <div className="space-y-2 mt-4">
            <Label>Area Range (sqm)</Label>
            <AreaFilter onPopoverClose={getPopoverCloseHandler} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <LoadingButton
              type="submit"
              className="flex-1"
              isLoading={isLoading}
              loadingText="Applying..."
            >
              Apply Filters
            </LoadingButton>
            <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
              Reset
            </Button>
          </div>
        </form>
      </div>
    ),
    [
      className,
      props,
      handleSubmit,
      getPopoverCloseHandler,
      locationInput,
      handleLocationChange,
      filters,
      handleTabValueChange,
      updateFilters,
      isLoading,
      handleReset,
    ]
  );

  // Conditionally return the appropriate layout
  if (displayStyle === "compact") {
    return compactLayout;
  }

  if (displayStyle === "horizontal") {
    return horizontalLayout;
  }

  // Default to standard layout
  return standardLayout;
}
