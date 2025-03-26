"use client";

import { useListingContext } from "@/components/providers/listing-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  HomeIcon,
  LaptopIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ContextDevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");

  // Always render the toggle button
  const toggleButton = (
    <button
      onClick={() => setIsOpen((prev) => !prev)}
      className="fixed bottom-[4.5rem] left-5 bg-slate-800 text-white p-2 rounded-md z-50 opacity-50 hover:opacity-100 transition-opacity"
      title="Toggle Context DevTools"
    >
      <LaptopIcon size={18} />
    </button>
  );

  // If DevTools are closed, only show the toggle button
  if (!isOpen) {
    return toggleButton;
  }

  // If DevTools are open, show the full panel and the toggle button
  return (
    <>
      {toggleButton}

      <div className="fixed bottom-5 left-16 w-full md:w-96 bg-background border-t border-r md:border-t md:h-[70vh] shadow-lg z-40 flex flex-col">
        <div className="flex items-center justify-between p-2 border-b bg-muted">
          <h2 className="text-sm font-semibold">Listd DevTools</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon size={18} />
          </button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="p-0 bg-background border-b rounded-none justify-start">
            <TabsTrigger
              value="theme"
              className="data-[state=active]:bg-muted rounded-none gap-1 text-xs py-1 px-3"
            >
              <LaptopIcon size={14} />
              Theme
            </TabsTrigger>
            <TabsTrigger
              value="listing"
              className="data-[state=active]:bg-muted rounded-none gap-1 text-xs py-1 px-3"
            >
              <HomeIcon size={14} />
              Listing
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="theme" className="m-0 p-4 h-full">
              <ThemeDevTools />
            </TabsContent>

            <TabsContent value="listing" className="m-0 p-4 h-full">
              <ListingDevTools />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}

function ThemeDevTools() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Theme Context</h3>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => setTheme("system")}
        >
          <RefreshCwIcon size={12} />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Current Theme</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Resolved Theme</Label>
          <div className="h-10 px-3 border rounded-md flex items-center text-muted-foreground">
            {resolvedTheme}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingDevTools() {
  const { state, resetFilters, dispatch, updateFilters } = useListingContext();
  const [locationInput, setLocationInput] = useState(state.location || "");
  const [expanded, setExpanded] = useState({
    listingType: true,
    propertyType: true,
    priceFilters: false,
    roomFilters: false,
    areaFilters: false,
  });

  // Update local state when context changes
  useEffect(() => {
    setLocationInput(state.location || "");
  }, [state.location]);

  // Debounce the location updates to prevent lag
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update context if the input differs from current state
      if (locationInput !== state.location) {
        // Update context
        dispatch({ type: "SET_LOCATION", payload: locationInput });
        // Also update URL params
        updateFilters({ location: locationInput });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [locationInput, dispatch, updateFilters, state.location]);

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle location input change
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);
    // No longer immediately dispatching - debounced by the useEffect above
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Listing Context</h3>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => resetFilters()}
        >
          <RefreshCwIcon size={12} />
          Reset Filters
        </Button>
      </div>

      {/* Listing Type Section */}
      <div className="border rounded-md overflow-hidden">
        <div
          className="flex items-center justify-between p-2 bg-muted cursor-pointer"
          onClick={() => toggleSection("listingType")}
        >
          <h4 className="text-sm font-medium">Listing Type</h4>
          {expanded.listingType ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </div>

        {expanded.listingType && (
          <div className="p-3 space-y-3">
            <div className="flex gap-2">
              {state.listingTypes.map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={state.currentListingType === type ? "default" : "outline"}
                  onClick={() => dispatch({ type: "SET_LISTING_TYPE", payload: type })}
                >
                  {type === "buy" ? "For Sale" : "For Rent"}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Property Type Section */}
      <div className="border rounded-md overflow-hidden">
        <div
          className="flex items-center justify-between p-2 bg-muted cursor-pointer"
          onClick={() => toggleSection("propertyType")}
        >
          <h4 className="text-sm font-medium">Property Type</h4>
          {expanded.propertyType ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </div>

        {expanded.propertyType && (
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {state.propertyTypes.map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={state.currentPropertyType === type ? "default" : "outline"}
                  onClick={() => dispatch({ type: "SET_PROPERTY_TYPE", payload: type })}
                  className="text-xs justify-start"
                >
                  {type === "condominium"
                    ? "Condominium"
                    : type === "house-and-lot"
                      ? "House and Lot"
                      : type === "vacant-lot"
                        ? "Vacant Lot"
                        : "Warehouse"}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price Filters Section */}
      <div className="border rounded-md overflow-hidden">
        <div
          className="flex items-center justify-between p-2 bg-muted cursor-pointer"
          onClick={() => toggleSection("priceFilters")}
        >
          <h4 className="text-sm font-medium">Price Filters</h4>
          {expanded.priceFilters ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </div>

        {expanded.priceFilters && (
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="price-type" className="text-xs whitespace-nowrap">
                Price Type:
              </Label>
              <Select
                value={state.activePriceType}
                onValueChange={(value) =>
                  dispatch({
                    type: "SET_ACTIVE_PRICE_TYPE",
                    payload: value as "total" | "sqm",
                  })
                }
              >
                <SelectTrigger id="price-type" className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Total Price</SelectItem>
                  <SelectItem value="sqm">Per SQM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="min-price" className="text-xs">
                  Min Price
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  value={state.minPrice || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_MIN_PRICE",
                      payload: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="max-price" className="text-xs">
                  Max Price
                </Label>
                <Input
                  id="max-price"
                  type="number"
                  value={state.maxPrice || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_MAX_PRICE",
                      payload: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="min-sqm-price" className="text-xs">
                  Min SQM Price
                </Label>
                <Input
                  id="min-sqm-price"
                  type="number"
                  value={state.minSqmPrice || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_MIN_SQM_PRICE",
                      payload: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="max-sqm-price" className="text-xs">
                  Max SQM Price
                </Label>
                <Input
                  id="max-sqm-price"
                  type="number"
                  value={state.maxSqmPrice || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_MAX_SQM_PRICE",
                      payload: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-8"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Room Filters Section */}
      <div className="border rounded-md overflow-hidden">
        <div
          className="flex items-center justify-between p-2 bg-muted cursor-pointer"
          onClick={() => toggleSection("roomFilters")}
        >
          <h4 className="text-sm font-medium">Room Filters</h4>
          {expanded.roomFilters ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </div>

        {expanded.roomFilters && (
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="min-bedrooms" className="text-xs">
                  Min Bedrooms
                </Label>
                <Select
                  value={state.minBedrooms?.toString() || "0"}
                  onValueChange={(value) =>
                    dispatch({
                      type: "SET_MIN_BEDROOMS",
                      payload: parseInt(value),
                    })
                  }
                  disabled={
                    state.currentPropertyType === "vacant-lot" ||
                    state.currentPropertyType === "warehouse"
                  }
                >
                  <SelectTrigger id="min-bedrooms" className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num === 0 ? "Any" : `${num}+`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="min-bathrooms" className="text-xs">
                  Min Bathrooms
                </Label>
                <Select
                  value={state.minBathrooms?.toString() || "0"}
                  onValueChange={(value) =>
                    dispatch({
                      type: "SET_MIN_BATHROOMS",
                      payload: parseInt(value),
                    })
                  }
                  disabled={
                    state.currentPropertyType === "vacant-lot" ||
                    state.currentPropertyType === "warehouse"
                  }
                >
                  <SelectTrigger id="min-bathrooms" className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num === 0 ? "Any" : `${num}+`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Area Filters Section */}
      <div className="border rounded-md overflow-hidden">
        <div
          className="flex items-center justify-between p-2 bg-muted cursor-pointer"
          onClick={() => toggleSection("areaFilters")}
        >
          <h4 className="text-sm font-medium">Area Filters</h4>
          {expanded.areaFilters ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </div>

        {expanded.areaFilters && (
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="min-area" className="text-xs">
                  Min Area (sqm)
                </Label>
                <Input
                  id="min-area"
                  type="number"
                  value={state.minArea || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_MIN_AREA",
                      payload: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="max-area" className="text-xs">
                  Max Area (sqm)
                </Label>
                <Input
                  id="max-area"
                  type="number"
                  value={state.maxArea || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_MAX_AREA",
                      payload: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-8"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Section */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-xs">
          Location
        </Label>
        <Input
          id="location"
          value={locationInput}
          onChange={handleLocationChange}
          placeholder="Enter location"
          className="h-8"
        />
      </div>
    </div>
  );
}
