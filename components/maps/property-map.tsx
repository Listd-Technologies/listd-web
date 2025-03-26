"use client";

import { type PropertyCardProps } from "@/components/listings/property-cards/property-card";
import { Button } from "@/components/ui/button";
import { APIProvider, ColorScheme, Map } from "@vis.gl/react-google-maps";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import DrawingCanvas from "./drawing-canvas";
import { PropertyMarker } from "./property-marker";

// ========================================================================
// CONSTANTS & SHARED STATE
// ========================================================================

// Default center coordinates for map initialization
const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 }; // Manila, Philippines
const DEFAULT_ZOOM = 14;

// Map styles for dark mode - based on Google's Night Mode styling
const DARK_MODE_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

// Reference to the shared cancellation state from drawing-canvas.tsx
// This ensures position synchronization between components
declare const v2CancellationState: {
  center: { lat: number; lng: number };
  zoom: number;
  hasInitialized: boolean;
};

// ========================================================================
// TYPE DEFINITIONS
// ========================================================================

// Property interfaces - extend from PropertyCardProps to ensure compatibility
interface MapProperty extends Partial<PropertyCardProps> {
  id: string;
  title: string;
  mapLocation?: {
    lat: number;
    lng: number;
  };
  // Allow additional properties with string indexing
  [key: string]: unknown;
}

// Boundary data interface
interface BoundaryData {
  polygon: google.maps.Polygon;
  bounds: google.maps.LatLngBounds;
  center: google.maps.LatLng;
  radius: number;
}

interface PropertyMapProps {
  properties: MapProperty[];
  onMarkerClick?: (propertyId: string) => void;
  onBoundsChange?: (bounds: google.maps.LatLngBounds | null) => void;
  onDrawComplete?: (data: BoundaryData) => void;
  isDrawingMode?: boolean;
  toggleDrawingMode?: () => void;
  className?: string;
  preserveView?: boolean;
  onBoundaryChange?: (hasBoundary: boolean) => void;
  darkMode?: boolean; // Optional prop - if not provided, will use theme context
}

/**
 * Enhanced property map component with drawing and search capabilities
 * - Maintains position during mode changes and interactions
 * - Supports freehand polygon drawing for geographic searches
 * - Optimized for both desktop and mobile experiences
 * - Dark mode support for better visibility in low-light conditions
 */
export function PropertyMap({
  properties,
  onMarkerClick,
  onBoundsChange,
  onDrawComplete,
  isDrawingMode = false,
  toggleDrawingMode,
  className = "",
  preserveView = false,
  onBoundaryChange,
  darkMode: darkModeProp, // Renamed to darkModeProp to avoid conflict
}: PropertyMapProps) {
  // Get theme from the ThemeProvider
  const { resolvedTheme } = useTheme();

  // Use prop if explicitly provided, otherwise use theme context
  // This allows both manual control and automatic theme system integration
  const darkMode = darkModeProp !== undefined ? darkModeProp : resolvedTheme === "dark";

  // ========================================================================
  // REFS & STATE
  // ========================================================================

  // Map and visualization refs
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const centerMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const boundingBoxRef = useRef<google.maps.Rectangle | null>(null);

  // Position tracking - crucial for maintaining view during mode changes
  const lastPositionRef = useRef<{ center: google.maps.LatLng; zoom: number } | null>(null);

  // UI state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [clearingBoundary, setClearingBoundary] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hasBoundary, setHasBoundary] = useState(false);

  // ========================================================================
  // VISUALIZATION UTILITIES
  // ========================================================================

  // Color constants based on theme
  const getThemeColors = useCallback(() => {
    return darkMode
      ? {
          primary: "#a78bfa", // Light purple for dark mode
          secondary: "#8b5cf6", // Brighter purple
          stroke: "#ffffff", // White stroke
          fill: "rgba(167, 139, 250, 0.3)", // Semi-transparent purple
          background: "#1f2937", // Dark background
          text: "#e5e7eb", // Light text
          shadow: "rgba(0, 0, 0, 0.5)", // Dark shadow
        }
      : {
          primary: "#6B21A8", // Default purple
          secondary: "#7928CA", // Darker purple
          stroke: "#FFFFFF", // White stroke
          fill: "rgba(107, 33, 168, 0.2)", // Semi-transparent purple
          background: "#ffffff", // White background
          text: "#334155", // Dark text
          shadow: "rgba(0, 0, 0, 0.2)", // Light shadow
        };
  }, [darkMode]);

  // Clear all boundary visualizations
  const clearVisualizations = useCallback(() => {
    // Clean up center marker
    if (centerMarkerRef.current) {
      centerMarkerRef.current.map = null;
      centerMarkerRef.current = null;
    }

    // Clean up bounding box
    if (boundingBoxRef.current) {
      boundingBoxRef.current.setMap(null);
      boundingBoxRef.current = null;
    }
  }, []);

  // Display center marker at search area center
  const showCenterMarker = useCallback(
    (center: google.maps.LatLng) => {
      if (!mapRef.current) return;

      const colors = getThemeColors();

      // Create marker HTML element
      const createMarkerElement = () => {
        const element = document.createElement("div");
        element.innerHTML = `
          <div style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: ${colors.primary};
            border: 2px solid ${colors.stroke};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px ${colors.shadow};
          "></div>
        `;
        return element;
      };

      // Create advanced marker with modern API
      const createAdvancedMarker = async () => {
        try {
          const { AdvancedMarkerElement } = (await google.maps.importLibrary("marker")) as {
            AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
          };

          const centerMarker = new AdvancedMarkerElement({
            position: center,
            map: mapRef.current,
            content: createMarkerElement(),
            title: "Center of Search Area",
            zIndex: 1000,
          });

          centerMarkerRef.current = centerMarker;
        } catch (error) {
          console.error("Error creating advanced marker:", error);
        }
      };

      createAdvancedMarker();
    },
    [mapRef, getThemeColors]
  );

  // Display rectangle around search area bounds
  const showBoundingBox = useCallback(
    (bounds: google.maps.LatLngBounds) => {
      if (!mapRef.current) return;

      const colors = getThemeColors();

      const boundingBox = new google.maps.Rectangle({
        bounds: bounds,
        strokeColor: colors.primary,
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: "transparent",
        fillOpacity: 0,
        map: mapRef.current,
        zIndex: 50,
      });

      boundingBoxRef.current = boundingBox;
    },
    [mapRef, getThemeColors]
  );

  // ========================================================================
  // MAP EVENT HANDLERS
  // ========================================================================

  // Handle map initialization
  const onMapLoad = useCallback(
    (event: { map: google.maps.Map }) => {
      const map = event.map;
      mapRef.current = map;
      setMapLoaded(true);

      // Set up position tracking on all idle events
      map.addListener("idle", () => {
        const center = map.getCenter();
        const zoom = map.getZoom();

        if (center && zoom) {
          lastPositionRef.current = { center, zoom };
          console.log("Position tracked on idle");
        }
      });

      // Track bounds changes for parent components
      map.addListener("bounds_changed", () => {
        const bounds = map.getBounds();
        if (bounds && onBoundsChange) {
          onBoundsChange(bounds);
        }
      });
    },
    [onBoundsChange]
  );

  // ========================================================================
  // DRAWING & BOUNDARY FUNCTIONS
  // ========================================================================

  // Create polygon from drawn points
  const createPolygon = useCallback(
    (latLngPoints: { lat: number; lng: number }[]) => {
      if (!mapRef.current) return;

      // 1. Capture position before any changes
      const map = mapRef.current;
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      const positionBeforeDrawing =
        currentCenter && currentZoom ? { center: currentCenter, zoom: currentZoom } : null;

      // Get theme-specific colors
      const colors = getThemeColors();

      // 2. Clear existing visualizations
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
      clearVisualizations();

      // 3. Create new polygon
      const polygon = new google.maps.Polygon({
        paths: latLngPoints,
        fillColor: colors.primary,
        fillOpacity: darkMode ? 0.3 : 0.2, // Slightly more opaque in dark mode for visibility
        strokeWeight: 2,
        strokeColor: colors.primary,
        strokeOpacity: 1,
        clickable: true,
        editable: false,
        zIndex: 1,
        map: mapRef.current,
      });
      polygonRef.current = polygon;

      // 4. Calculate bounds and center
      const bounds = new google.maps.LatLngBounds();
      latLngPoints.forEach((point) => {
        bounds.extend(new google.maps.LatLng(point.lat, point.lng));
      });
      const center = bounds.getCenter();

      // 5. Calculate radius (maximum distance from center to any point)
      const pathPoints = latLngPoints.map((point) => new google.maps.LatLng(point.lat, point.lng));
      const distances = pathPoints.map((point) =>
        google.maps.geometry.spherical.computeDistanceBetween(center, point)
      );
      const radius = Math.max(...distances);

      // 6. Add visualizations
      showCenterMarker(center);
      showBoundingBox(bounds);

      // 7. Update state and restore position
      setHasBoundary(true);
      if (positionBeforeDrawing) {
        map.setCenter(positionBeforeDrawing.center);
        map.setZoom(positionBeforeDrawing.zoom);
      }

      // 8. Notify parent components
      if (onBoundaryChange) {
        onBoundaryChange(true);
      }
      if (onDrawComplete) {
        onDrawComplete({ polygon, bounds, center, radius });
      }

      // 9. Exit drawing mode if needed
      if (toggleDrawingMode && isDrawingMode) {
        setTimeout(() => {
          toggleDrawingMode();
        }, 10);
      }
    },
    [
      clearVisualizations,
      showCenterMarker,
      showBoundingBox,
      onBoundaryChange,
      onDrawComplete,
      isDrawingMode,
      toggleDrawingMode,
      getThemeColors,
      darkMode,
    ]
  );

  // Clear drawn boundary with smooth transition
  const handleClearBoundary = useCallback(() => {
    if (!mapRef.current) return;
    console.log("Clearing boundary with no-flicker method");

    // 1. Start clearing animation
    setClearingBoundary(true);

    // 2. Capture the exact current position
    const map = mapRef.current;
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();

    // 3. Hide elements with opacity transitions before removing them
    //    This prevents the visual flicker that causes position jumps
    if (polygonRef.current) {
      // First hide polygon with opacity
      polygonRef.current.setOptions({
        fillOpacity: 0,
        strokeOpacity: 0,
      });

      // Then remove it after it's hidden
      requestAnimationFrame(() => {
        if (polygonRef.current) {
          polygonRef.current.setMap(null);
          polygonRef.current = null;
        }
      });
    }

    // Hide and remove center marker with opacity transition
    if (centerMarkerRef.current && centerMarkerRef.current.element) {
      centerMarkerRef.current.element.style.opacity = "0";
      requestAnimationFrame(() => {
        if (centerMarkerRef.current) {
          centerMarkerRef.current.map = null;
          centerMarkerRef.current = null;
        }
      });
    }

    // Hide and remove bounding box with opacity transition
    if (boundingBoxRef.current) {
      boundingBoxRef.current.setOptions({
        strokeOpacity: 0,
        fillOpacity: 0,
      });
      requestAnimationFrame(() => {
        if (boundingBoxRef.current) {
          boundingBoxRef.current.setMap(null);
          boundingBoxRef.current = null;
        }
      });
    }

    // 4. Update boundary state before removing elements to prevent visual jumps
    setHasBoundary(false);
    if (onBoundaryChange) {
      onBoundaryChange(false);
    }

    // 5. Ensure position is maintained throughout the transition
    if (currentCenter && currentZoom) {
      // Force position restoration in next frame
      requestAnimationFrame(() => {
        map.setCenter(currentCenter);
        map.setZoom(currentZoom);
      });
    }

    // 6. Reset animation state after transition completes
    setTimeout(() => {
      setClearingBoundary(false);
    }, 300);
  }, [onBoundaryChange]);

  // Process drawn boundary
  const handleDrawingFinish = useCallback(
    (points: { lat: number; lng: number }[]) => {
      if (points.length < 3) return;
      createPolygon(points);
    },
    [createPolygon]
  );

  // ========================================================================
  // LIFECYCLE EFFECTS
  // ========================================================================

  // Enhanced position tracking
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Track position on all map movement events
    const updatePositionTracking = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();

      if (center && zoom) {
        lastPositionRef.current = { center, zoom };
        console.log("Position tracked:", {
          lat: center.lat(),
          lng: center.lng(),
          zoom,
        });
      }
    };

    // Register multiple event listeners for comprehensive tracking
    const listeners = [
      map.addListener("dragend", updatePositionTracking),
      map.addListener("zoom_changed", updatePositionTracking),
      map.addListener("idle", updatePositionTracking),
      map.addListener("bounds_changed", updatePositionTracking),
    ];

    // Capture position immediately
    updatePositionTracking();

    // Clean up listeners on unmount
    return () => {
      listeners.forEach((listener) => {
        google.maps.event.removeListener(listener);
      });
    };
  }, [mapRef]);

  // Drawing mode management
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Adjust map interactivity based on drawing mode
    map.setOptions({
      draggable: !isDrawingMode,
    });

    // On drawing mode entry, capture and preserve current position
    if (isDrawingMode) {
      console.log("Entering drawing mode");
      const center = map.getCenter();
      const zoom = map.getZoom();

      if (center && zoom) {
        // Store position in local ref
        lastPositionRef.current = { center, zoom };

        // Sync with shared state for cross-component consistency
        if (typeof v2CancellationState !== "undefined") {
          v2CancellationState.center = {
            lat: center.lat(),
            lng: center.lng(),
          };
          v2CancellationState.zoom = zoom;
          v2CancellationState.hasInitialized = true;
        }

        console.log("Saved position before drawing mode");
      }
    } else {
      console.log("Exiting drawing mode");
      // Position handling managed by the DrawingCanvas component
    }
  }, [isDrawingMode]);

  // Auto-fit map to property bounds
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || properties.length === 0 || preserveView) return;
    if (hasBoundary || isDrawingMode) return; // Skip if boundary exists or in drawing mode

    // Build bounds from all property locations
    const bounds = new google.maps.LatLngBounds();
    let hasValidCoordinates = false;

    properties.forEach((property) => {
      if (property.mapLocation?.lat && property.mapLocation?.lng) {
        bounds.extend(new google.maps.LatLng(property.mapLocation.lat, property.mapLocation.lng));
        hasValidCoordinates = true;
      }
    });

    // Apply bounds if we have valid properties
    if (hasValidCoordinates && mapRef.current) {
      mapRef.current.fitBounds(bounds);
    }
  }, [properties, mapLoaded, preserveView, hasBoundary, isDrawingMode]);

  // ========================================================================
  // COMPONENT RENDERING
  // ========================================================================

  return (
    <div ref={mapContainerRef} className={`w-full h-full relative ${className}`}>
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || ""}
        libraries={["drawing", "geometry"]}
      >
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          mapId="property-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          streetViewControl={false}
          mapTypeControl={false}
          zoomControl
          className="w-full h-full"
          onIdle={onMapLoad}
          styles={darkMode ? DARK_MODE_STYLES : undefined}
          backgroundColor={darkMode ? "#242f3e" : "#ffffff"}
          colorScheme={darkMode ? ColorScheme.DARK : ColorScheme.LIGHT}
        >
          {/* Property markers - only shown when boundary is defined */}
          {hasBoundary &&
            properties.map((property) =>
              property.mapLocation?.lat && property.mapLocation?.lng ? (
                <PropertyMarker
                  key={property.id}
                  property={property as PropertyCardProps}
                  position={{
                    lat: property.mapLocation.lat,
                    lng: property.mapLocation.lng,
                  }}
                  onMarkerClick={(id) => {
                    setSelectedPropertyId(id);
                    if (onMarkerClick) onMarkerClick(id);
                  }}
                  selected={selectedPropertyId === property.id}
                  onInfoClose={() => setSelectedPropertyId(null)}
                />
              ) : null
            )}

          {/* Drawing canvas overlay - only shown in drawing mode */}
          {mapLoaded && isDrawingMode && (
            <DrawingCanvas
              mapRef={mapRef as React.RefObject<google.maps.Map>}
              onDrawingFinish={handleDrawingFinish}
              onCancel={() => {
                if (toggleDrawingMode) toggleDrawingMode();
              }}
            />
          )}

          {/* Clear boundary button */}
          {hasBoundary && !isDrawingMode && (
            <div
              className={`absolute top-4 right-4 z-20 transition-all duration-300 ${
                clearingBoundary ? "opacity-0 scale-90" : "opacity-100 scale-100"
              }`}
            >
              <Button
                variant="secondary"
                size="sm"
                className={`flex items-center gap-2 ${
                  darkMode
                    ? "bg-gray-800/90 hover:bg-gray-700/100 border border-purple-400 text-purple-300"
                    : "bg-background/90 hover:bg-background/100 border border-purple-100 text-purple-800"
                } backdrop-blur-sm shadow-md transition-all duration-200`}
                onClick={handleClearBoundary}
              >
                <X className={`h-4 w-4 ${darkMode ? "text-purple-300" : "text-purple-600"}`} />
                <span>Clear area</span>
              </Button>
            </div>
          )}

          {/* Drawing mode indicator */}
          {isDrawingMode && (
            <div className="absolute inset-0 pointer-events-none">
              <div
                className={`absolute inset-0 border-4 ${
                  darkMode ? "border-purple-400" : "border-purple-600"
                } animate-pulse opacity-50`}
              />
            </div>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
