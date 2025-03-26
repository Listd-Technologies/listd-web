"use client";

import {
  DISABLED_PROPERTY_TYPES,
  type ListingType,
  type PropertyType,
  getPropertyListingsFilter,
  useListingContext,
} from "@/components/providers/listing-provider";
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
import { cn } from "@/lib/utils";
import { type BaseComponentProps, type LoadingProps } from "@/types";
import { ChevronDown, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

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
function PriceFilter({ compact = false, onPopoverClose }: FilterComponentProps) {
  const { state, updateFilters } = useListingContext();
  const [open, setOpen] = useState(false);
  const [priceType, setPriceType] = useState<"total" | "sqm">(state.activePriceType);
  const [minPrice, setMinPrice] = useState(state.minPrice?.toString() || "0");
  const [maxPrice, setMaxPrice] = useState(state.maxPrice?.toString() || "0");
  const [minSqmPrice, setMinSqmPrice] = useState(state.minSqmPrice?.toString() || "0");
  const [maxSqmPrice, setMaxSqmPrice] = useState(state.maxSqmPrice?.toString() || "0");

  // Get the appropriate price options based on listing type
  const minPriceOptions =
    state.currentListingType === "rent" ? RENT_MIN_PRICE_OPTIONS : BUY_MIN_PRICE_OPTIONS;
  const maxPriceOptions =
    state.currentListingType === "rent" ? RENT_MAX_PRICE_OPTIONS : BUY_MAX_PRICE_OPTIONS;

  // Update values when context state changes
  useEffect(() => {
    setMinPrice(state.minPrice?.toString() || "0");
    setMaxPrice(state.maxPrice?.toString() || "0");
    setMinSqmPrice(state.minSqmPrice?.toString() || "0");
    setMaxSqmPrice(state.maxSqmPrice?.toString() || "0");
    setPriceType(state.activePriceType);
  }, [state.minPrice, state.maxPrice, state.minSqmPrice, state.maxSqmPrice, state.activePriceType]);

  // Reset price values
  const handleReset = () => {
    // Reset all price inputs
    setMinPrice("0");
    setMaxPrice("0");
    setMinSqmPrice("0");
    setMaxSqmPrice("0");

    // Update context with cleared values
    updateFilters({
      minPrice: 0,
      maxPrice: 0,
      minSqmPrice: 0,
      maxSqmPrice: 0,
    });

    // Close popover if needed
    setOpen(false);
    if (onPopoverClose) {
      onPopoverClose();
    }
  };

  // Update filters on apply
  const handleApply = () => {
    // Create the price filter updates
    const priceUpdates = {
      minPrice: parseInt(minPrice) || 0,
      maxPrice: parseInt(maxPrice) || 0,
      minSqmPrice: parseInt(minSqmPrice) || 0,
      maxSqmPrice: parseInt(maxSqmPrice) || 0,
      activePriceType: priceType,
    };

    // Before updating, prepare URL parameters
    const urlParams: Record<string, string | number> = {};

    // Essential params - always include these
    urlParams["listing-type"] = state.currentListingType === "rent" ? "for-rent" : "for-sale";
    urlParams["property-type"] = state.currentPropertyType;
    urlParams["price-type"] = priceType;

    // Price specific parameters - set based on form values
    if (parseInt(minPrice) > 0) urlParams["min-price"] = parseInt(minPrice);
    if (parseInt(maxPrice) > 0) urlParams["max-price"] = parseInt(maxPrice);
    if (parseInt(minSqmPrice) > 0) urlParams["min-sqm-price"] = parseInt(minSqmPrice);
    if (parseInt(maxSqmPrice) > 0) urlParams["max-sqm-price"] = parseInt(maxSqmPrice);

    // Other existing parameters
    if (state.location) urlParams.location = state.location;
    if (state.minBedrooms && state.minBedrooms > 0) urlParams["min-bedrooms"] = state.minBedrooms;
    if (state.minBathrooms && state.minBathrooms > 0)
      urlParams["min-bathrooms"] = state.minBathrooms;
    if (state.minArea && state.minArea > 0) urlParams["min-area"] = state.minArea;
    if (state.maxArea && state.maxArea > 0) urlParams["max-area"] = state.maxArea;

    console.log("Setting URL params for price filters:", urlParams);

    // First update URL params
    updateFilters(priceUpdates);

    setOpen(false);

    if (onPopoverClose) {
      onPopoverClose();
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    // Different format based on listing type
    const isRent = state.currentListingType === "rent";

    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M${isRent ? "/mo" : ""}`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K${isRent ? "/mo" : ""}`;
    }
    return `${price}${isRent ? "/mo" : ""}`;
  };

  // Function to get display text for the price button
  const getPriceButtonText = () => {
    // Get values for both price types
    const minTotalPrice = parseInt(minPrice);
    const maxTotalPrice = parseInt(maxPrice);
    const minPerSqm = parseInt(minSqmPrice);
    const maxPerSqm = parseInt(maxSqmPrice);

    // When the popover is open, use the current tab selection (priceType)
    // When the popover is closed, use the saved context value (state.activePriceType)
    const activeType = open ? priceType : state.activePriceType;
    const isRent = state.currentListingType === "rent";

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
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
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

          <Tabs
            value={state.activePriceType}
            onValueChange={(value) =>
              updateFilters({
                activePriceType: value as "total" | "sqm",
              })
            }
            className="w-full"
          >
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
                    <Select value={minPrice} onValueChange={setMinPrice}>
                      <SelectTrigger
                        id="minPrice"
                        className="bg-background border border-input rounded-lg w-full h-11 text-sm md:text-base px-2 md:px-3"
                      >
                        <SelectValue placeholder="No Min" />
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

                  <div className="flex justify-center w-5 flex-shrink-0">
                    <div className="h-px w-4 bg-neutral-300"></div>
                  </div>

                  <div className="w-full">
                    <Select value={maxPrice} onValueChange={setMaxPrice}>
                      <SelectTrigger
                        id="maxPrice"
                        className="bg-background border border-input rounded-lg w-full h-11 text-sm md:text-base px-2 md:px-3"
                      >
                        <SelectValue placeholder="No Max" />
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

              <TabsContent value="sqm" className="mt-0 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-full">
                    <Select value={minSqmPrice} onValueChange={setMinSqmPrice}>
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
                    <Select value={maxSqmPrice} onValueChange={setMaxSqmPrice}>
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
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-base h-12 rounded-lg font-medium"
              onClick={handleApply}
            >
              Apply
            </Button>
            <Button variant="outline" className="h-12 rounded-lg" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Listing Type Filter Component
function ListingTypeFilter({
  compact = false,
  disabled = false,
  onPopoverClose,
}: FilterComponentProps) {
  const { state, updateFilters } = useListingContext();
  const [open, setOpen] = useState(false);

  // Handle selection of listing type
  const handleSelectListingType = (value: ListingType) => {
    console.log("Setting listing type to:", value);

    // Create a complete filter object with the new listing type
    const completeFilters = {
      ...getPropertyListingsFilter(state),
      listingType: value,
    };

    // Only update context
    updateFilters(completeFilters);

    // Close popover and notify parent
    setOpen(false);
    onPopoverClose?.();
  };

  // Don't open popover if disabled
  const handleOpenChange = (open: boolean) => {
    if (!disabled) {
      setOpen(open);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : undefined}
          className={cn(
            "flex items-center gap-1 text-foreground justify-between font-normal",
            compact ? "h-9 whitespace-nowrap shrink-0 min-w-[110px]" : "h-10",
            state.currentListingType === "buy" ? "min-w-[120px]" : "min-w-[120px]"
          )}
          disabled={disabled}
        >
          <span>{state.currentListingType === "buy" ? "For Sale" : "For Rent"}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="p-1">
          {LISTING_TYPES.map((option) => (
            <Button
              key={option.id}
              variant={state.currentListingType === option.value ? "default" : "ghost"}
              className="w-full justify-start h-10 rounded-md mb-1 last:mb-0"
              onClick={() => handleSelectListingType(option.value as ListingType)}
            >
              {option.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Property Type Filter Component
function PropertyTypeFilter({
  compact = false,
  disabled = false,
  onPopoverClose,
}: FilterComponentProps) {
  const { state, updateFilters } = useListingContext();
  const [open, setOpen] = useState(false);

  // Handle selection of property type
  const handleSelectPropertyType = (value: PropertyType) => {
    // Check if the property type is disabled
    if (DISABLED_PROPERTY_TYPES.includes(value)) {
      return; // Don't allow selection of disabled property types
    }

    console.log("Setting property type to:", value);

    // Create a complete filter object with the new property type
    const completeFilters = {
      ...getPropertyListingsFilter(state),
      propertyType: value,
    };

    // Only update context
    updateFilters(completeFilters);

    // Close popover and notify parent
    setOpen(false);
    onPopoverClose?.();
  };

  // Don't open popover if disabled
  const handleOpenChange = (open: boolean) => {
    if (!disabled) {
      setOpen(open);
    }
  };

  // Get display name for current property type
  const getCurrentPropertyName = () => {
    const currentOption = PROPERTY_TYPES.find(
      (option) => option.value === state.currentPropertyType
    );
    return currentOption ? currentOption.name : "Property Type";
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : undefined}
          className={cn(
            "flex items-center gap-1 text-foreground justify-between font-normal",
            compact ? "h-9 whitespace-nowrap shrink-0 min-w-[120px]" : "h-10",
            state.currentPropertyType === "vacant-lot" || state.currentPropertyType === "warehouse"
              ? "min-w-[120px]"
              : ""
          )}
          disabled={disabled}
        >
          <span>{getCurrentPropertyName()}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="p-1">
          {PROPERTY_TYPES.map((option) => {
            const isDisabled = DISABLED_PROPERTY_TYPES.includes(option.value as PropertyType);
            return (
              <Button
                key={option.id}
                variant={state.currentPropertyType === option.value ? "default" : "ghost"}
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
    </Popover>
  );
}

// Area Filter Component
function AreaFilter({ compact = false, onPopoverClose }: FilterComponentProps) {
  const { state, updateFilters } = useListingContext();
  const [open, setOpen] = useState(false);
  const [minArea, setMinArea] = useState(state.minArea?.toString() || "");
  const [maxArea, setMaxArea] = useState(state.maxArea?.toString() || "");

  // Update local state when context state changes
  useEffect(() => {
    setMinArea(state.minArea?.toString() || "");
    setMaxArea(state.maxArea?.toString() || "");
  }, [state.minArea, state.maxArea]);

  // Reset area values
  const handleReset = () => {
    setMinArea("");
    setMaxArea("");

    // Update context with cleared values
    updateFilters({
      minArea: 0,
      maxArea: 0,
    });

    // Close popover if needed
    if (onPopoverClose) {
      onPopoverClose();
    }
  };

  // Apply filters and close popover
  const handleApply = () => {
    // Create the area updates object for context
    const areaUpdates = {
      minArea: minArea ? Number(minArea) : 0,
      maxArea: maxArea ? Number(maxArea) : 0,
    };

    // Before updating, prepare URL parameters
    const urlParams: Record<string, string | number> = {};

    // Essential params - always include these
    urlParams["listing-type"] = state.currentListingType === "rent" ? "for-rent" : "for-sale";
    urlParams["property-type"] = state.currentPropertyType;
    urlParams["price-type"] = state.activePriceType || "total";

    // Area specific parameters
    if (minArea && Number(minArea) > 0) urlParams["min-area"] = Number(minArea);
    if (maxArea && Number(maxArea) > 0) urlParams["max-area"] = Number(maxArea);

    // Other existing parameters
    if (state.location) urlParams.location = state.location;
    if (state.minPrice && state.minPrice > 0) urlParams["min-price"] = state.minPrice;
    if (state.maxPrice && state.maxPrice > 0) urlParams["max-price"] = state.maxPrice;
    if (state.minSqmPrice && state.minSqmPrice > 0) urlParams["min-sqm-price"] = state.minSqmPrice;
    if (state.maxSqmPrice && state.maxSqmPrice > 0) urlParams["max-sqm-price"] = state.maxSqmPrice;
    if (state.minBedrooms && state.minBedrooms > 0) urlParams["min-bedrooms"] = state.minBedrooms;
    if (state.minBathrooms && state.minBathrooms > 0)
      urlParams["min-bathrooms"] = state.minBathrooms;

    console.log("Setting URL params for area filters:", urlParams);

    // First update URL params - Wrap in requestAnimationFrame to batch UI updates
    // This prevents multiple quick re-renders
    requestAnimationFrame(() => {
      updateFilters(areaUpdates);

      setOpen(false);

      if (onPopoverClose) {
        onPopoverClose();
      }
    });
  };

  // Get display text for the area button
  const getAreaButtonText = () => {
    const minValue = parseInt(minArea, 10) || 0;
    const maxValue = parseInt(maxArea, 10) || 0;

    if (minValue === 0 && maxValue === 0) return "Area";
    if (minValue > 0 && maxValue === 0) return `${minValue}+ sqm`;
    if (minValue === 0 && maxValue > 0) return `Up to ${maxValue} sqm`;
    if (minValue === maxValue) return `${minValue} sqm`;
    return `${minValue} - ${maxValue} sqm`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : undefined}
          className={cn(
            "flex items-center gap-1 text-foreground justify-between font-normal",
            compact ? "h-9 whitespace-nowrap shrink-0 min-w-[100px]" : "h-10",
            state.currentPropertyType === "vacant-lot" || state.currentPropertyType === "warehouse"
              ? "min-w-[120px]"
              : ""
          )}
        >
          <span className="truncate max-w-[85%] text-left">{getAreaButtonText()}</span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-0 z-50", compact ? "w-[95vw] max-w-[400px]" : "w-[320px]")}
        align="start"
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
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
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
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                className="h-10 text-sm md:text-base bg-background border border-input rounded-lg px-3"
              />
            </div>
          </div>
        </div>

        <div className="p-4 pt-6">
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-base h-12 rounded-lg font-medium"
              onClick={handleApply}
            >
              Apply
            </Button>
            <Button variant="outline" className="h-12 rounded-lg" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Bedrooms Filter Component
function BedroomsFilter({
  compact = false,
  disabled = false,
  onPopoverClose,
}: FilterComponentProps) {
  const { state, updateFilters } = useListingContext();
  const [open, setOpen] = useState(false);

  // Handle selection of minimum bedrooms
  const handleSelect = (value: string) => {
    // Create the update
    const update = { minBedrooms: Number(value) };

    // Update context
    updateFilters(update);

    // Close popover and notify parent
    setOpen(false);
    onPopoverClose?.();
  };

  // Don't open popover if disabled
  const handleOpenChange = (open: boolean) => {
    if (!disabled) {
      setOpen(open);
    }
  };

  // Get display text for the bedrooms button
  const getButtonText = () => {
    const minBedrooms = state.minBedrooms || 0;
    if (minBedrooms === 0) return "Bedrooms";
    return `${minBedrooms}+ Bedrooms`;
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : undefined}
          className={cn(
            "flex items-center gap-1 text-foreground justify-between font-normal",
            compact ? "h-9 whitespace-nowrap shrink-0 min-w-[100px]" : "h-10",
            state.currentPropertyType === "vacant-lot" || state.currentPropertyType === "warehouse"
              ? "min-w-[120px]"
              : ""
          )}
          disabled={disabled}
        >
          <span className="truncate max-w-[85%] text-left">{getButtonText()}</span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
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
                variant={state.minBedrooms === num ? "default" : "ghost"}
                className="w-full justify-start h-10 rounded-md"
                onClick={() => handleSelect(num.toString())}
              >
                {num === 0 ? "Any" : `${num}+`}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Bathrooms Filter Component
function BathroomsFilter({
  compact = false,
  disabled = false,
  onPopoverClose,
}: FilterComponentProps) {
  const { state, updateFilters } = useListingContext();
  const [open, setOpen] = useState(false);

  // Handle selection of minimum bathrooms
  const handleSelect = (value: string) => {
    // Create the update
    const update = { minBathrooms: Number(value) };

    // Update context
    updateFilters(update);

    // Close popover and notify parent
    setOpen(false);
    onPopoverClose?.();
  };

  // Don't open popover if disabled
  const handleOpenChange = (open: boolean) => {
    if (!disabled) {
      setOpen(open);
    }
  };

  // Get display text for the bathrooms button
  const getButtonText = () => {
    const minBathrooms = state.minBathrooms || 0;
    if (minBathrooms === 0) return "Bathrooms";
    return `${minBathrooms}+ Bathrooms`;
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : undefined}
          className={cn(
            "flex items-center gap-1 text-foreground justify-between font-normal",
            compact ? "h-9 whitespace-nowrap shrink-0 min-w-[100px]" : "h-10",
            state.currentPropertyType === "vacant-lot" || state.currentPropertyType === "warehouse"
              ? "min-w-[120px]"
              : ""
          )}
          disabled={disabled}
        >
          <span className="truncate max-w-[85%] text-left">{getButtonText()}</span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
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
                variant={state.minBathrooms === num ? "default" : "ghost"}
                className="w-full justify-start h-10 rounded-md"
                onClick={() => handleSelect(num.toString())}
              >
                {num === 0 ? "Any" : `${num}+`}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
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
  const { state, updateFilters, resetFilters } = useListingContext();
  const [initialLoad, setInitialLoad] = useState(true);
  const [locationInput, setLocationInput] = useState(state.location || "");

  // Check if property type should have bedroom/bathroom filters disabled
  const shouldDisableRoomFilters =
    state.currentPropertyType === "vacant-lot" || state.currentPropertyType === "warehouse";

  // Initialize filters from initial filters
  useEffect(() => {
    if (initialLoad) {
      // Just apply initial filters directly
      updateFilters(initialFilters);
      setInitialLoad(false);
    }
  }, [initialLoad, initialFilters, updateFilters]);

  // Update local state when context changes
  useEffect(() => {
    setLocationInput(state.location || "");
  }, [state.location]);

  // Debounce the location updates to prevent lag
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update context if the input differs from current state
      if (locationInput !== state.location) {
        // Update context with debounced value
        updateFilters({ location: locationInput });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [locationInput, updateFilters, state.location]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Get filters from state and ensure required fields are provided
    const stateFilters = getPropertyListingsFilter(state);
    const filters: PropertyListingsFilter = {
      ...stateFilters,
      // Ensure location is never undefined
      location: stateFilters.location || "",
    };

    // Prevent multiple rapid filter applications by using requestAnimationFrame
    // This batches DOM updates and React state changes for smoother UI
    requestAnimationFrame(() => {
      // Only notify parent component
      onApplyFilters(filters);
    });
  };

  // Handle form reset
  const handleReset = () => {
    // Reset the context
    resetFilters();
    // Reset local state
    setLocationInput("");

    // Create a complete default filter object
    const defaultFilters: PropertyListingsFilter = {
      ...DEFAULT_FILTERS,
      listingType: "buy",
      propertyType: "condominium",
      location: "",
      minPrice: 0,
      maxPrice: 0,
      minSqmPrice: 0,
      maxSqmPrice: 0,
      activePriceType: "total",
      minBedrooms: 0,
      minBathrooms: 0,
      minArea: 0,
      maxArea: 0,
    };

    // Notify parent component
    onApplyFilters(defaultFilters);
  };

  // Handle location change
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update local state (debounced update will happen in useEffect)
    setLocationInput(e.target.value);
  };

  // Handle filter apply for popover components
  const handleFilterApply = () => {
    // Get filters from state and ensure required fields are provided
    const stateFilters = getPropertyListingsFilter(state);
    const filters: PropertyListingsFilter = {
      ...stateFilters,
      // Ensure location is never undefined
      location: stateFilters.location || "",
    };

    // Notify parent component
    onApplyFilters(filters);
  };

  // Render compact mobile view
  if (displayStyle === "compact") {
    return (
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
            <ListingTypeFilter
              compact
              onPopoverClose={() => {
                handleFilterApply();
              }}
            />

            {/* Property Type Filter */}
            <PropertyTypeFilter
              compact
              onPopoverClose={() => {
                handleFilterApply();
              }}
            />

            {/* Area Filter */}
            <AreaFilter
              compact
              onPopoverClose={() => {
                handleFilterApply();
              }}
            />

            <PriceFilter
              compact
              onPopoverClose={() => {
                handleFilterApply();
              }}
            />

            {/* Bedrooms Filter */}
            <BedroomsFilter
              compact
              onPopoverClose={() => {
                handleFilterApply();
              }}
              disabled={shouldDisableRoomFilters}
            />

            {/* Bathrooms Filter */}
            <BathroomsFilter
              compact
              onPopoverClose={() => {
                handleFilterApply();
              }}
              disabled={shouldDisableRoomFilters}
            />
          </div>

          {/* Subtle fade effect on the right edge to indicate scrollability */}
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
        </div>
      </div>
    );
  }

  // Render horizontal layout for desktop nav
  if (displayStyle === "horizontal") {
    return (
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

          {/* Listing Type Filter */}
          <ListingTypeFilter
            onPopoverClose={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          />

          {/* Property Type Filter */}
          <PropertyTypeFilter
            onPopoverClose={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          />

          {/* Area Filter */}
          <AreaFilter
            onPopoverClose={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          />

          {/* Price Filter */}
          <PriceFilter
            onPopoverClose={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          />

          {/* Bedrooms Filter */}
          <BedroomsFilter
            onPopoverClose={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            disabled={shouldDisableRoomFilters}
          />

          {/* Bathrooms Filter */}
          <BathroomsFilter
            onPopoverClose={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            disabled={shouldDisableRoomFilters}
          />

          {/* Apply / Save Search Button */}
          <Button type="submit" className="h-10 ml-auto" disabled={isLoading}>
            {isLoading ? "Searching..." : "Save search"}
          </Button>
        </div>
      </form>
    );
  }

  // Standard vertical layout
  return (
    <div className={cn("p-6 border rounded-lg space-y-6 bg-card", className)} {...props}>
      <form onSubmit={handleSubmit}>
        {/* Listing Type */}
        <div className="space-y-2">
          <Label htmlFor="listingType">Listing Type</Label>
          <ListingTypeFilter
            onPopoverClose={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          />
        </div>

        {/* Property Type */}
        <div className="space-y-2 mt-4">
          <Label htmlFor="propertyType">Property Type</Label>
          <PropertyTypeFilter
            onPopoverClose={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          />
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
            value={state.activePriceType}
            onValueChange={(value) =>
              updateFilters({
                activePriceType: value as "total" | "sqm",
              })
            }
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
                    value={state.minPrice || ""}
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
                    value={state.maxPrice || ""}
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
                    value={state.minSqmPrice || ""}
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
                    value={state.maxSqmPrice || ""}
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
            <BedroomsFilter
              onPopoverClose={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minBathrooms">Min Bathrooms</Label>
            <BathroomsFilter
              onPopoverClose={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            />
          </div>
        </div>

        {/* Area Range */}
        <div className="space-y-2 mt-4">
          <Label>Area Range (sqm)</Label>
          <AreaFilter
            onPopoverClose={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          />
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
  );
}
