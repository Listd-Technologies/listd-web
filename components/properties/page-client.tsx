"use client";

import { PropertyListingGrid } from "@/components/listings/property-listing-grid";
import { Button } from "@/components/ui/button";
import { useProperties as usePropertiesV1 } from "@/hooks/api/v1";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";
import { cn } from "@/lib/utils";
import { PropertyType } from "@/types/property";
import { List, Map as MapIcon, Pencil, X } from "lucide-react";
import { useTheme } from "next-themes";
import React, {
  useState,
  useCallback,
  Suspense,
  lazy,
  createContext,
  useContext,
  useMemo,
  useEffect,
} from "react";
import { ResponsiveFilters } from "./filters/responsive-filters";
import { PropertyGrid, VirtualizedVerticalList } from "./grid";
import { HorizontalLayout, SplitLayout, VerticalLayout } from "./layouts";

// Add type declaration for Google Maps on window object
declare global {
  interface Window {
    google?: {
      maps?: typeof google.maps;
    };
  }
}

// Lazy load the PropertyMap component - it's only needed when map view is active
const PropertyMap = lazy(() =>
  import("@/components/maps").then((module) => ({
    default: module.PropertyMap,
  }))
);

// Context for sharing drawing mode state between components
interface DrawingModeContextType {
  isDrawingMode: boolean;
  toggleDrawingMode: () => void;
  drawnArea: {
    bounds: google.maps.LatLngBounds | null;
    center: google.maps.LatLng | null;
    radius: number | null;
  };
  handleBoundaryChange: (
    newBounds: google.maps.LatLngBounds | null,
    newCenter: google.maps.LatLng | null,
    newRadius: number | null
  ) => void;
}

const DrawingModeContext = createContext<DrawingModeContextType | null>(null);

// Hook to access the drawing mode context
export function useDrawingMode() {
  const context = useContext(DrawingModeContext);
  if (!context) {
    throw new Error("useDrawingMode must be used within a DrawingModeProvider");
  }
  return context;
}

// Interface for API property data - simplified version for Phase 2
// This will be properly defined in Phase 3
interface APIProperty {
  id: string | number;
  title?: string;
  description?: string;
  price?: number;
  formatted_price?: string;
  listing_type?: string;
  property_type?: string;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  media?: Array<{
    id?: string;
    url?: string;
    alt?: string;
  }>;
}

// Interface for the map property data expected by PropertyMap
interface PropertyMapItem {
  id: string;
  title: string;
  price: number;
  formattedPrice?: string;
  listingType: string;
  mapLocation?: {
    lat: number;
    lng: number;
  };
}

/**
 * Client component for the Properties page
 * This is a refactored version with improved organization and separation of concerns
 * Using CSS-based responsive layout instead of JavaScript
 */
export default function PropertiesPageClient() {
  // Use our property filters hook to ensure state persists across page reloads
  const { filters, updateFilters } = usePropertyFilters();
  const { resolvedTheme } = useTheme();

  // View mode controls which view is active on mobile (map or list)
  // On desktop, both are visible in split view
  const [mobileViewMode, setMobileViewMode] = useState<"map" | "list">("list");

  // State for drawing mode
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Flag to track if Google Maps API is loaded
  const [isMapsApiLoaded, setIsMapsApiLoaded] = useState(false);

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

  // Track boundary existence state
  const [hasBoundary, setHasBoundary] = useState(false);

  // Effect to detect when Google Maps API is ready
  useEffect(() => {
    // Check if Google Maps API is already available
    if (typeof window !== "undefined" && window.google?.maps) {
      setIsMapsApiLoaded(true);
    } else {
      // Set up a listener for when the API becomes available
      const checkGoogleMapsLoaded = setInterval(() => {
        if (typeof window !== "undefined" && window.google?.maps) {
          setIsMapsApiLoaded(true);
          clearInterval(checkGoogleMapsLoaded);
        }
      }, 100);

      // Cleanup the interval
      return () => clearInterval(checkGoogleMapsLoaded);
    }
  }, []);

  // Initialize drawn area from URL parameters if they exist
  useEffect(() => {
    // Only initialize from URL if we don't already have a boundary
    if (drawnArea.bounds === null && drawnArea.center === null && isMapsApiLoaded) {
      try {
        // Check for center coordinates in URL
        if (filters.centerLat !== undefined && filters.centerLng !== undefined) {
          // Try to safely use Google Maps objects with error handling
          let center;
          try {
            center = new google.maps.LatLng(filters.centerLat, filters.centerLng);
          } catch (error) {
            console.error("Error creating LatLng object:", error);
            // Simplified mock with just the essential methods that are actually used
            center = {
              lat: () => filters.centerLat,
              lng: () => filters.centerLng,
            } as unknown as google.maps.LatLng; // Type assertion to satisfy TypeScript
          }

          // Update drawn area with circle data
          setDrawnArea({
            bounds: null,
            center,
            radius: filters.radius || 1000, // Default to 1km if radius is missing
          });
        }
        // Check for bounds in URL
        else if (
          filters.boundMinX !== undefined &&
          filters.boundMinY !== undefined &&
          filters.boundMaxX !== undefined &&
          filters.boundMaxY !== undefined
        ) {
          // Try to safely use Google Maps objects with error handling
          let bounds: google.maps.LatLngBounds | null = null;
          try {
            const sw = new google.maps.LatLng(filters.boundMinY, filters.boundMinX);
            const ne = new google.maps.LatLng(filters.boundMaxY, filters.boundMaxX);
            bounds = new google.maps.LatLngBounds(sw, ne);
          } catch (error) {
            console.error("Error creating LatLngBounds object:", error);
            // Simplified mockBounds with just the essential methods that are actually used
            const mockBounds = {
              // Only implement the methods that are actually used in our code
              getSouthWest: () => ({
                lat: () => filters.boundMinY,
                lng: () => filters.boundMinX,
              }),
              getNorthEast: () => ({
                lat: () => filters.boundMaxY,
                lng: () => filters.boundMaxX,
              }),
              getCenter: () => ({
                lat: () => (filters.boundMinY! + filters.boundMaxY!) / 2,
                lng: () => (filters.boundMinX! + filters.boundMaxX!) / 2,
              }),
            };

            bounds = mockBounds as unknown as google.maps.LatLngBounds;
          }

          // Update drawn area with bounds data
          setDrawnArea({
            bounds,
            center: null,
            radius: null,
          });
        }
      } catch (error) {
        console.error("Error initializing map boundaries:", error);
      }
    }
  }, [filters, drawnArea.bounds, drawnArea.center, isMapsApiLoaded]);

  // Fetch properties using our v1 API
  const { data: propertiesDataV1 } = usePropertiesV1(
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

  // Toggle drawing mode
  const toggleDrawingMode = useCallback(() => {
    setIsDrawingMode((prev) => !prev);
  }, []);

  // Handle boundary changes from map
  const handleBoundaryChange = useCallback(
    (
      newBounds: google.maps.LatLngBounds | null,
      newCenter: google.maps.LatLng | null,
      newRadius: number | null
    ) => {
      // Update local state
      setDrawnArea({
        bounds: newBounds,
        center: newCenter,
        radius: newRadius,
      });

      // Update hasBoundary state
      setHasBoundary(!!newBounds || !!newCenter);

      // Sync with URL parameters
      if (newCenter && newRadius) {
        // Center + radius (circle)
        updateFilters({
          centerLat: newCenter.lat(),
          centerLng: newCenter.lng(),
          radius: newRadius,
          // Clear bounds data
          boundMinX: undefined,
          boundMinY: undefined,
          boundMaxX: undefined,
          boundMaxY: undefined,
        });
      } else if (newBounds) {
        // Bounds (polygon)
        updateFilters({
          boundMinX: newBounds.getSouthWest().lng(),
          boundMinY: newBounds.getSouthWest().lat(),
          boundMaxX: newBounds.getNorthEast().lng(),
          boundMaxY: newBounds.getNorthEast().lat(),
          // Clear center data
          centerLat: undefined,
          centerLng: undefined,
          radius: undefined,
        });
      } else {
        // Clear all location parameters if no boundary
        updateFilters({
          centerLat: undefined,
          centerLng: undefined,
          radius: undefined,
          boundMinX: undefined,
          boundMinY: undefined,
          boundMaxX: undefined,
          boundMaxY: undefined,
        });
      }

      // Turn off drawing mode when boundary is set
      if (isDrawingMode) {
        setIsDrawingMode(false);
      }
    },
    [isDrawingMode, updateFilters]
  );

  // Create context value for drawing mode
  const drawingModeContextValue = {
    isDrawingMode,
    toggleDrawingMode,
    drawnArea,
    handleBoundaryChange,
  };

  // Convert API properties to map properties
  const mapProperties = useMemo(() => {
    if (!propertiesDataV1?.pages?.[0]?.data?.results) {
      return [];
    }

    return propertiesDataV1.pages[0].data.results.map(
      (property: APIProperty): PropertyMapItem => ({
        id: property.id.toString(),
        title: property.title || "Unnamed Property",
        price: property.price || 0,
        formattedPrice: property.formatted_price,
        listingType: property.listing_type || "buy",
        mapLocation: property.coordinates
          ? {
              lat: property.coordinates.lat,
              lng: property.coordinates.lng,
            }
          : undefined,
      })
    );
  }, [propertiesDataV1]);

  // Create map section content
  const mapSection = (
    <Suspense
      fallback={
        <div className="h-full w-full bg-muted flex items-center justify-center">
          Loading map...
        </div>
      }
    >
      <div className="relative h-full w-full overflow-hidden">
        <PropertyMap
          isDrawingMode={isDrawingMode}
          toggleDrawingMode={toggleDrawingMode}
          onDrawComplete={(data) => {
            // Handle the drawn area data from the map
            if (data) {
              handleBoundaryChange(data.bounds || null, data.center || null, data.radius || null);
            }
          }}
          onBoundaryChange={(hasBoundary) => {
            // Update local boundary state
            setHasBoundary(hasBoundary);
            console.log(`Map has boundary: ${hasBoundary}`);
          }}
          // @ts-ignore - Use type assertion until Phase 3 when we properly fix types
          properties={mapProperties}
          initialBoundary={drawnArea}
          preserveView={true} // Preserve the view when the component re-renders
          renderControls={{
            clearBoundaryButton: (
              <Button
                variant="secondary"
                size="sm"
                className={`flex items-center gap-2 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800/90 hover:bg-gray-700/100 border border-purple-400 text-purple-300"
                    : "bg-background/90 hover:bg-background/100 border border-purple-100 text-purple-800"
                } backdrop-blur-sm shadow-md transition-all duration-200`}
              >
                <X
                  className={`h-4 w-4 ${resolvedTheme === "dark" ? "text-purple-300" : "text-purple-600"}`}
                />
                <span>Clear area</span>
              </Button>
            ),
            cancelDrawingButton: (
              <Button
                variant="outline"
                className="flex items-center gap-2 shadow-md transition-all duration-200 backdrop-blur-sm py-2 px-4 font-medium"
                style={{
                  backgroundColor:
                    resolvedTheme === "dark" ? "rgba(31, 41, 55, 0.9)" : "rgba(255, 255, 255, 0.9)",
                  borderColor: resolvedTheme === "dark" ? "#4c1d95" : "#6B21A8",
                  borderWidth: "2px",
                  color: resolvedTheme === "dark" ? "#e5e7eb" : "#6B21A8",
                  boxShadow: `0 4px 6px ${resolvedTheme === "dark" ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)"}`,
                }}
              >
                <X
                  className="w-4 h-4 mr-1"
                  style={{ color: resolvedTheme === "dark" ? "#e5e7eb" : "#6B21A8" }}
                />
                Cancel Drawing
              </Button>
            ),
          }}
        />

        {/* Draw area button - shown when no boundary exists and not in drawing mode */}
        {!isDrawingMode && !hasBoundary && (
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleDrawingMode}
              className={`flex items-center gap-2 ${
                resolvedTheme === "dark"
                  ? "bg-gray-800/90 hover:bg-gray-700/100 border border-purple-400 text-purple-300"
                  : "bg-background/90 hover:bg-background/100 border border-purple-100 text-purple-800"
              } backdrop-blur-sm shadow-md transition-all duration-200`}
            >
              <Pencil
                className={`h-4 w-4 ${resolvedTheme === "dark" ? "text-purple-300" : "text-purple-600"}`}
              />
              <span>Draw Area</span>
            </Button>
          </div>
        )}
      </div>
    </Suspense>
  );

  // Create list section content
  const listSection = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-2 sm:p-3 md:p-4">
        <ResponsiveFilters className="max-w-[1200px] mx-auto" />
      </div>
      <div className="flex-1 overflow-auto px-2 sm:px-3 md:px-4">
        {/* Use virtualized list for better performance with large datasets */}
        {propertiesDataV1?.pages?.[0]?.data?.results &&
        propertiesDataV1.pages[0].data.results.length > 0 ? (
          <VirtualizedVerticalList
            properties={propertiesDataV1.pages[0].data.results}
            className="pb-4"
            onPropertyClick={(id) => {
              window.location.href = `/properties/showcase/${id}`;
            }}
          />
        ) : (
          // Fallback to regular PropertyListingGrid if no properties or during initial load
          <PropertyListingGrid
            filters={{
              listingType: filters.listingType,
              propertyType: filters.propertyType as PropertyType,
              minPrice: filters.minPrice,
              maxPrice: filters.maxPrice,
              minArea: filters.minArea,
              maxArea: filters.maxArea,
              minBedrooms: filters.minBedrooms,
              minBathrooms: filters.minBathrooms,
              // Location params for filtering
              ...(drawnArea.center && {
                centerLat: drawnArea.center.lat(),
                centerLng: drawnArea.center.lng(),
                radius: drawnArea.radius || undefined,
              }),
              // Bounds params for filtering
              ...(drawnArea.bounds && {
                boundMinX: drawnArea.bounds.getSouthWest().lng(),
                boundMinY: drawnArea.bounds.getSouthWest().lat(),
                boundMaxX: drawnArea.bounds.getNorthEast().lng(),
                boundMaxY: drawnArea.bounds.getNorthEast().lat(),
              }),
            }}
            mobileColumns={1}
            tabletColumns={1}
            desktopColumns={1}
            displayStyle="vertical"
            className="space-y-4 pb-4"
            properties={propertiesDataV1?.pages?.[0]?.data?.results || []}
            error={null}
          />
        )}
      </div>
    </div>
  );

  // Mobile view controls with better accessibility
  const mobileViewControls = (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-background border rounded-full shadow-lg p-1 z-10 xl:hidden">
      <Button
        variant={mobileViewMode === "list" ? "default" : "outline"}
        size="icon"
        onClick={() => setMobileViewMode("list")}
        title="Show list view"
        aria-label="Show property list"
        aria-pressed={mobileViewMode === "list"}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List View</span>
      </Button>
      <Button
        variant={mobileViewMode === "map" ? "default" : "outline"}
        size="icon"
        onClick={() => setMobileViewMode("map")}
        title="Show map view"
        aria-label="Show property map"
        aria-pressed={mobileViewMode === "map"}
      >
        <MapIcon className="h-4 w-4" />
        <span className="sr-only">Map View</span>
      </Button>
    </div>
  );

  // Map/list toggle for top of mobile view
  const mobileViewHeader =
    mobileViewMode === "map" ? (
      <div className="p-2 bg-background/80 backdrop-blur-sm border-b flex justify-between items-center fixed top-0 left-0 right-0 z-10 xl:hidden">
        <h2 className="text-sm font-medium">Map View</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileViewMode("list")}
          className="text-xs"
        >
          Switch to List
        </Button>
      </div>
    ) : null;

  // Effect for cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup logic
      console.log("Cleaning up map resources");
      // Additional cleanup if needed
    };
  }, []);

  // Render using CSS-based responsive layouts
  return (
    <DrawingModeContext.Provider value={drawingModeContextValue}>
      <div className="flex h-[calc(100vh-64px)] sm:h-[calc(100vh-64px)] flex-col overflow-hidden">
        {/* Mobile view header - only shown when in map view */}
        {mobileViewHeader}

        {/* Desktop view (split layout) - hidden on mobile */}
        <div className="hidden xl:flex h-full w-full">
          <SplitLayout
            listSection={listSection}
            mapSection={mapSection}
            listWidth={5}
            orientation="list-left"
          />
        </div>

        {/* Mobile view (either list or map) - shown only on screens < xl breakpoint */}
        <div className="block xl:hidden h-full">
          {mobileViewMode === "list" ? (
            <VerticalLayout className="h-full max-h-full">{listSection}</VerticalLayout>
          ) : (
            <HorizontalLayout>{mapSection}</HorizontalLayout>
          )}
        </div>

        {/* Mobile view controls - only shown on screens < xl breakpoint */}
        {mobileViewControls}
      </div>
    </DrawingModeContext.Provider>
  );
}
