"use client";

import { allProperties } from "@/components/listings/property-cards/sample-properties";
import { PropertyFilters } from "@/components/listings/property-filters";
import { PropertyListingGrid } from "@/components/listings/property-listing-grid";
import { Button } from "@/components/ui/button";
import { getPropertyAdapter } from "@/hooks/api/adapters/property-adapter-factory";
import { type PropertyListingsFilter } from "@/hooks/api/usePropertyListings";
import { useProperties as usePropertiesV1 } from "@/hooks/api/v1";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";
import { cn } from "@/lib/utils";
import { PropertyType } from "@/types/property";
import { useQueryClient } from "@tanstack/react-query";
import { List, Map as MapIcon, MousePointer, X } from "lucide-react";
import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";

// Lazy load the PropertyMap component - it's only needed when map view is active
const PropertyMap = lazy(() =>
  import("@/components/maps").then((module) => ({
    default: module.PropertyMap,
  }))
);

/**
 * Client component for the Properties page
 */
export default function PropertiesPageClient() {
  // Use our property filters hook to ensure state persists across page reloads
  const { filters, updateFilters } = usePropertyFilters();

  // Get query client for cache invalidation
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Log the current filters on mount/update for debugging
  useEffect(() => {
    console.log("PropertiesPageClient filters:", filters);
    console.log("Current URL:", window.location.href);
  }, [filters]);

  // State for drawn area
  const [drawnArea, setDrawnArea] = useState<{
    bounds: google.maps.LatLngBounds | null;
    center: google.maps.LatLng | null;
    radius: number | null;
  }>({
    bounds: null,
    center: null,
    radius: null,
  });

  // Toggle between map and list view (default to split on desktop, list on mobile)
  const [viewMode, setViewMode] = useState<"map" | "list" | "split">("split");

  // State to track if a boundary exists
  const [hasBoundary, setHasBoundary] = useState(false);

  // Fetch properties using our v1 API
  const {
    data: propertiesDataV1,
    fetchNextPage: _fetchNextPageV1,
    hasNextPage: _hasNextPageV1,
    isFetching: isFetchingV1,
    isLoading: isLoadingV1,
    error: errorV1,
    refetch: refetchPropertiesV1,
  } = usePropertiesV1(
    {
      listingType: filters.listingType,
      minPrice: filters.minPrice && filters.minPrice > 0 ? filters.minPrice : undefined,
      maxPrice: filters.maxPrice && filters.maxPrice > 0 ? filters.maxPrice : undefined,
      minArea: filters.minArea && filters.minArea > 0 ? filters.minArea : undefined,
      maxArea: filters.maxArea && filters.maxArea > 0 ? filters.maxArea : undefined,
      minBedrooms: filters.minBedrooms && filters.minBedrooms > 0 ? filters.minBedrooms : undefined,
      minBathrooms:
        filters.minBathrooms && filters.minBathrooms > 0 ? filters.minBathrooms : undefined,
      // Location params if available - properly extract values and convert units
      ...(drawnArea.center && {
        centerX: drawnArea.center.lng(),
        centerY: drawnArea.center.lat(),
        // Convert radius from meters to kilometers (divide by 1000)
        radius: drawnArea.radius ? Math.max(drawnArea.radius / 1000, 0.1) : 1,
      }),
      // Bounds if available - properly extract values first
      ...(drawnArea.bounds && {
        minX: drawnArea.bounds.getSouthWest().lng(),
        minY: drawnArea.bounds.getSouthWest().lat(),
        maxX: drawnArea.bounds.getNorthEast().lng(),
        maxY: drawnArea.bounds.getNorthEast().lat(),
      }),
    },
    {
      propertyType: filters.propertyType as PropertyType,
      limit: 20,
      enabled: true, // Always enabled since we're not using sample data anymore
    }
  );

  // Add additional debug logging for filters and properties
  useEffect(() => {
    console.log("🔍 Current filters for API call:", {
      listingType: filters.listingType,
      propertyType: filters.propertyType,
    });

    // Log property data received from API with listing types
    if (propertiesDataV1?.pages?.[0]?.data?.results?.length) {
      const firstPageResults = propertiesDataV1.pages[0].data.results;
      console.log(
        "📊 First few properties from API:",
        firstPageResults.slice(0, 3).map((p) => {
          // Extract known properties safely
          const { id, title, price, formatted_price } = p;

          // Access listing_type safely with optional chaining
          // @ts-ignore - We know this property exists but TypeScript doesn't
          const listing_type = p.listing_type;

          return {
            id,
            title,
            listing_type,
            price,
            formatted_price,
          };
        })
      );
    }
  }, [filters.listingType, filters.propertyType, propertiesDataV1]);

  // Add effect to refetch properties when property type changes
  useEffect(() => {
    // Only refetch if component is already mounted
    console.log(`Property type changed to ${filters.propertyType}, refetching...`);
    refetchPropertiesV1();
  }, [filters.propertyType, refetchPropertiesV1]);

  // Log the complete query params being sent for debugging
  useEffect(() => {
    if (drawnArea.center) {
      console.log("🚨 Current geographical search params:", {
        centerX: drawnArea.center.lng(),
        centerY: drawnArea.center.lat(),
        radiusMeters: drawnArea.radius,
        radiusKm: drawnArea.radius ? Math.max(drawnArea.radius / 1000, 0.1) : 1,
        bounds: drawnArea.bounds
          ? {
              minX: drawnArea.bounds.getSouthWest().lng(),
              minY: drawnArea.bounds.getSouthWest().lat(),
              maxX: drawnArea.bounds.getNorthEast().lng(),
              maxY: drawnArea.bounds.getNorthEast().lat(),
            }
          : "none",
      });
    }
  }, [drawnArea]);

  const resetBoundary = useCallback(() => {
    setDrawnArea({
      bounds: null,
      center: null,
      radius: null,
    });
    setHasBoundary(false);
  }, []);

  // Log the results from the v1 API for testing
  useEffect(() => {
    if (propertiesDataV1) {
      console.log("V1 API Properties Data:", propertiesDataV1);

      // Log count of properties
      const propertyCount = propertiesDataV1.pages.reduce((total, page) => {
        return total + (page.data?.results.length || 0);
      }, 0);

      console.log("V1 API Properties Count:", propertyCount);
      console.log(
        "V1 API Total Available:",
        propertiesDataV1.pages[0]?.data?.pagination.total || 0
      );

      // Log current page and pagination info
      if (propertiesDataV1.pages[0]?.data?.pagination) {
        const pagination = propertiesDataV1.pages[0].data.pagination;
        console.log("Current page:", pagination.page);
        console.log("Total pages:", pagination.total_pages);
        console.log("Next page:", pagination.next_page);
      }
    }

    if (errorV1) {
      console.error("V1 API Error:", errorV1);
    }
  }, [propertiesDataV1, errorV1]);

  // Log API requests and responses
  useEffect(() => {
    if (errorV1) {
      console.error("🔴 V1 API Error:", errorV1);
    }

    // Log query key for debugging
    const activeQueryKey = ["properties", filters.propertyType];
    const existingQueries = queryClient.getQueriesData({ queryKey: activeQueryKey });
    console.log("🔍 Active queries:", existingQueries);
  }, [errorV1, filters.propertyType, queryClient]);

  // Effect to detect mobile devices and set initial view mode
  useEffect(() => {
    const checkDeviceSize = () => {
      const width = window.innerWidth;

      // Set initial view mode based on screen size
      if (width <= 1180 && viewMode === "split") {
        setViewMode("list");
      } else if (width > 1180 && viewMode !== "split") {
        setViewMode("split");
      }
    };

    // Check initially
    checkDeviceSize();

    // Add resize listener
    window.addEventListener("resize", checkDeviceSize);

    // Clean up listener
    return () => {
      window.removeEventListener("resize", checkDeviceSize);
    };
  }, [viewMode]);

  // Log filter changes specifically for property type
  useEffect(() => {
    console.log(`🏢 PROPERTY TYPE CHANGED: ${filters.propertyType}`);
    console.log("Query parameters will be:", {
      listingType: filters.listingType,
      propertyType: filters.propertyType,
    });
  }, [filters.propertyType, filters.listingType]);

  // Handle applying filters
  const handleApplyFilters = (newFilters: PropertyListingsFilter) => {
    setIsSubmitting(true);

    // Use our updateFilters function to update both context and URL
    // Add proper type assertions for the filter properties
    updateFilters({
      ...newFilters,
      listingType: newFilters.listingType as "buy" | "rent",
      propertyType: newFilters.propertyType as PropertyType,
      activePriceType: newFilters.activePriceType as "total" | "sqm",
    })
      .then(() => {
        setIsSubmitting(false);
      })
      .catch((error) => {
        console.error("Error updating filters:", error);
        setIsSubmitting(false);
      });
  };

  // Toggle drawing mode with smoother transition
  const toggleDrawingMode = useCallback(() => {
    if (!isDrawingMode) {
      // Simply set drawing mode after a short delay
      setTimeout(() => {
        setIsDrawingMode(true);
      }, 300);
    } else {
      // When exiting drawing mode, no delay needed
      setIsDrawingMode(false);
    }
  }, [isDrawingMode]);

  // Toggle view mode between map and list
  const toggleViewMode = (mode: "map" | "list") => {
    setViewMode(mode);
  };

  // Handle draw complete
  const handleDrawComplete = (data: {
    polygon: google.maps.Polygon;
    bounds: google.maps.LatLngBounds;
    center: google.maps.LatLng;
    radius: number;
  }) => {
    console.log("Draw completed:", data);
    try {
      // Update local state
      setDrawnArea({
        bounds: data.bounds,
        center: data.center,
        radius: data.radius,
      });
      setHasBoundary(true);

      // Refetch properties with new boundary
      refetchPropertiesV1();
    } catch (error) {
      console.error("Error processing boundary data:", error);
    }
  };

  // Handle boundary change
  const handleBoundaryChange = (boundaryExists: boolean) => {
    console.log("Boundary changed:", boundaryExists ? "exists" : "cleared");
    setHasBoundary(boundaryExists);

    // If boundary is cleared, we need to clear the drawn area and refetch
    if (!boundaryExists) {
      try {
        console.log("Clearing boundary and resetting search area");

        // Clear drawn area state
        setDrawnArea({
          bounds: null,
          center: null,
          radius: null,
        });

        // Reset boundary in local state
        resetBoundary();

        // Invalidate the properties query to trigger automatic refetch
        console.log("Invalidating properties query without geo params");
        queryClient.invalidateQueries({
          queryKey: ["properties", filters.propertyType],
        });
      } catch (error) {
        console.error("Error clearing boundary:", error);
      }
    }
    // If a boundary is created, it's handled by handleDrawComplete
  };

  // Display the property listings
  const renderPropertyListings = () => {
    return (
      <PropertyListingGrid
        filters={filters}
        displayStyle="vertical"
        mobileColumns={1}
        tabletColumns={1}
        desktopColumns={1}
        properties={propertiesDataV1?.pages.flatMap((page) => page.data?.results || []) || []}
        isLoading={isLoadingV1}
        error={errorV1}
      />
    );
  };

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Filters Bar - Fixed right below the navbar */}
      <div className="w-full bg-background border-b px-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto">
          {/* Filters for mobile and 13-inch tablets */}
          <div className="xl:hidden">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 w-full">
                <div className="w-full overflow-x-auto py-3 px-1 sm:px-2 no-scrollbar touch-horizontal">
                  <PropertyFilters
                    onApplyFilters={handleApplyFilters}
                    initialFilters={filters}
                    isLoading={isSubmitting}
                    className="border-0 p-0 shadow-none"
                    displayStyle="compact"
                  />
                </div>
                <div className="flex gap-2 items-center justify-end px-2">
                  {/* Map/List Toggle for Smaller Screens */}
                  <div className="flex rounded-md overflow-hidden border shrink-0">
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      className="rounded-none px-2"
                      onClick={() => toggleViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-2">List</span>
                    </Button>
                    <Button
                      variant={viewMode === "map" ? "default" : "outline"}
                      size="sm"
                      className="rounded-none px-2"
                      onClick={() => toggleViewMode("map")}
                    >
                      <MapIcon className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-2">Map</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters for Desktop */}
          <div className="hidden xl:block py-3 px-4">
            <PropertyFilters
              onApplyFilters={handleApplyFilters}
              initialFilters={filters}
              isLoading={isSubmitting}
              className="border-0 p-0 shadow-none"
              displayStyle="horizontal"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={cn("flex min-h-0 flex-1", viewMode === "split" ? "xl:flex-row" : "flex-col")}>
        {/* Property Listings */}
        {(viewMode === "list" || viewMode === "split") && (
          <div
            className={cn(
              "bg-background flex flex-col min-h-0",
              viewMode === "split" ? "w-full xl:w-1/2" : "w-full"
            )}
          >
            <div className="p-4 pb-2 md:py-4 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">Real Estate & Homes For Sale</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    {isLoadingV1 ? (
                      "Loading..."
                    ) : (
                      <>
                        {propertiesDataV1 ? (
                          <>
                            {propertiesDataV1.pages[0]?.data?.pagination.total}
                            properties found
                            {isFetchingV1 && " • Updating..."}
                          </>
                        ) : errorV1 ? (
                          <span className="text-red-500">Error loading properties</span>
                        ) : (
                          "Loading properties..."
                        )}
                      </>
                    )}
                    {drawnArea.center && <span> within the drawn area</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Listings Container */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 min-h-0">
              <div className="pb-6">{renderPropertyListings()}</div>
            </div>
          </div>
        )}

        {/* Map Area - Lazy Loaded */}
        {(viewMode === "map" || viewMode === "split") && (
          <div
            className={cn(
              "relative bg-muted border-r",
              viewMode === "split" ? "w-full xl:w-1/2" : "w-full h-full"
            )}
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full w-full bg-muted">
                  <div className="text-center">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              }
            >
              <PropertyMap
                className="z-0"
                properties={allProperties}
                onMarkerClick={(propertyId) => {
                  console.log(`Clicked on property marker ${propertyId}`);
                }}
                onDrawComplete={handleDrawComplete}
                isDrawingMode={isDrawingMode}
                toggleDrawingMode={toggleDrawingMode}
                preserveView={true}
                onBoundaryChange={handleBoundaryChange}
              />
            </Suspense>

            {/* Map Controls */}
            <div className="absolute top-4 left-4 space-y-2 z-10">
              {isDrawingMode ? (
                <Button
                  size="sm"
                  variant="default"
                  className="flex items-center justify-center w-8 h-8 rounded-full shadow-md"
                  onClick={toggleDrawingMode}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cancel</span>
                </Button>
              ) : !hasBoundary ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2 bg-background/80 backdrop-blur-sm transition-all duration-200 ease-in-out"
                  onClick={toggleDrawingMode}
                >
                  <MousePointer className="h-4 w-4" />
                  <span>Draw area</span>
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
