"use client";

import { type PropertyCardProps } from "@/components/listings/property-cards/property-card";
import { APIProvider, ColorScheme, Map } from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { PropertyMarker } from "./property-marker";

import { useBoundaryVisualization } from "./components/boundary-visualization";
// Import extracted components and utilities
import { ClearBoundaryButton } from "./components/clear-boundary-button";
import { DrawingModeIndicator } from "./components/drawing-mode-indicator";
import { DARK_MODE_STYLES, DEFAULT_CENTER, DEFAULT_ZOOM } from "./constants/map-styles";
import { BoundaryData, PropertyMapProps } from "./types/map-types";
import { v2CancellationState } from "./utils/drawing-state";

// Import DrawingCanvas dynamically as it's conditionally rendered
import dynamic from "next/dynamic";
const DrawingCanvas = dynamic(() => import("./drawing-canvas"), { ssr: false });

/**
 * Enhanced property map component with drawing and search capabilities
 * - Maintains position during mode changes and interactions
 * - Supports freehand polygon drawing for geographic searches
 * - Optimized for both desktop and mobile experiences
 * - Dark mode support for better visibility in low-light conditions
 *
 * @component
 * @example
 * ```tsx
 * <PropertyMap
 *   properties={properties}
 *   onMarkerClick={handlePropertySelect}
 *   onDrawComplete={handleBoundaryDraw}
 *   isDrawingMode={drawingMode}
 *   toggleDrawingMode={() => setDrawingMode(!drawingMode)}
 *   onBoundaryChange={handleBoundaryStatusChange}
 * />
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
  renderControls,
  initialBoundary,
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

  // Position tracking - crucial for maintaining view during mode changes
  const lastPositionRef = useRef<{ center: google.maps.LatLng; zoom: number } | null>(null);

  // UI state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [clearingBoundary, setClearingBoundary] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hasBoundary, setHasBoundary] = useState(false);

  // Use boundary visualization hook
  const { clearVisualizations, showCenterMarker, showBoundingBox } = useBoundaryVisualization(
    mapRef,
    darkMode
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

      // Initialize boundary from props if available
      if (initialBoundary) {
        if (initialBoundary.bounds) {
          showBoundingBox(initialBoundary.bounds);
          setHasBoundary(true);
          if (onBoundaryChange) {
            onBoundaryChange(true);
          }
        } else if (initialBoundary.center && initialBoundary.radius) {
          showCenterMarker(initialBoundary.center);
          setHasBoundary(true);
          if (onBoundaryChange) {
            onBoundaryChange(true);
          }
        }
      }
    },
    [onBoundsChange, initialBoundary, showBoundingBox, showCenterMarker, onBoundaryChange]
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

      // 2. Clear existing visualizations
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
      clearVisualizations();

      // 3. Create new polygon
      const polygon = new google.maps.Polygon({
        paths: latLngPoints,
        fillColor: darkMode ? "#a78bfa" : "#6B21A8",
        fillOpacity: darkMode ? 0.3 : 0.2, // Slightly more opaque in dark mode for visibility
        strokeWeight: 2,
        strokeColor: darkMode ? "#a78bfa" : "#6B21A8",
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
      darkMode,
    ]
  );

  // ========================================================================
  // PROPS DOCUMENTATION
  // ========================================================================

  /**
   * @typedef {Object} PropertyMapProps Properties for the PropertyMap component
   *
   * @property {MapProperty[]} properties - Array of property objects to display on the map.
   * Each property must have an id, title, and optional mapLocation with lat/lng coordinates.
   * When a property has valid coordinates, it will be displayed as a marker on the map.
   * Example: [{ id: "1", title: "Beach House", mapLocation: { lat: 14.123, lng: 120.456 } }]
   *
   * @property {function} [onMarkerClick] - Callback fired when a property marker is clicked.
   * Receives the property ID as a parameter.
   * Use this to handle property selection in the parent component.
   * Example: (propertyId) => { setSelectedProperty(propertyId); }
   *
   * @property {function} [onBoundsChange] - Callback fired when the map's viewport bounds change.
   * Receives the current bounds object or null if bounds aren't available.
   * Useful for tracking the visible area of the map.
   * Example: (bounds) => { console.log("Current bounds:", bounds); }
   *
   * @property {function} [onDrawComplete] - Callback fired when a boundary drawing is completed.
   * Receives a BoundaryData object with polygon, bounds, center, and radius properties.
   * Use this to capture the drawn area for filtering properties.
   * Example: (data) => { setSearchBoundary(data); filterProperties(data); }
   *
   * @property {boolean} [isDrawingMode=false] - Controls whether the map is in drawing mode.
   * When true, a drawing canvas is displayed and map interactions are adjusted.
   * Default is false.
   * Example: true
   *
   * @property {function} [toggleDrawingMode] - Function to toggle drawing mode on/off.
   * This function is called after a drawing is completed or cancelled.
   * Should update the isDrawingMode state in the parent component.
   * Example: () => setIsDrawingMode(!isDrawingMode)
   *
   * @property {string} [className=""] - Additional CSS class names to apply to the map container.
   * Useful for custom styling or layout integration.
   * Default is an empty string.
   * Example: "h-[500px] rounded-lg shadow-md"
   *
   * @property {boolean} [preserveView=false] - Whether to preserve the current map view when properties change.
   * When false, the map will automatically fit to show all property markers.
   * When true, the map won't change position when properties are updated.
   * Default is false.
   * Example: true
   *
   * @property {function} [onBoundaryChange] - Callback fired when boundary status changes.
   * Receives a boolean indicating whether a boundary is currently active.
   * Useful for updating UI elements based on boundary status.
   * Example: (hasBoundary) => { setShowClearButton(hasBoundary); }
   *
   * @property {boolean} [darkMode] - Explicitly controls dark mode for the map.
   * When undefined, automatically uses the theme from context.
   * When provided, overrides the theme context value.
   * Example: true
   *
   * @property {Object} [renderControls] - Custom control components to render within the map.
   * Allows overriding default control UI with custom components.
   * Example: { clearBoundaryButton: <CustomClearButton />, cancelDrawingButton: <CustomCancelButton /> }
   *
   * @property {Object} [initialBoundary] - Initial boundary configuration to display on mount.
   * Can specify either bounds or center/radius for the initial boundary.
   * Useful for restoring a previous search area.
   * Example: { bounds: myBounds, center: null, radius: null }
   */

  // ========================================================================
  // REMAINING COMPONENT IMPLEMENTATION
  // ========================================================================

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

    // 4. Clear visualizations
    clearVisualizations();

    // 5. Update boundary state before removing elements to prevent visual jumps
    setHasBoundary(false);
    if (onBoundaryChange) {
      onBoundaryChange(false);
    }

    // 6. Ensure position is maintained throughout the transition
    if (currentCenter && currentZoom) {
      // Force position restoration in next frame
      requestAnimationFrame(() => {
        map.setCenter(currentCenter);
        map.setZoom(currentZoom);
      });
    }

    // 7. Reset animation state after transition completes
    setTimeout(() => {
      setClearingBoundary(false);
    }, 300);
  }, [onBoundaryChange, clearVisualizations]);

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
              renderControls={{
                cancelDrawingButton: renderControls?.cancelDrawingButton,
              }}
            />
          )}

          {/* Clear boundary button */}
          {hasBoundary && !isDrawingMode && (
            <ClearBoundaryButton
              darkMode={darkMode}
              onClear={handleClearBoundary}
              clearingBoundary={clearingBoundary}
              renderControls={renderControls}
            />
          )}

          {/* Drawing mode indicator */}
          {isDrawingMode && <DrawingModeIndicator darkMode={darkMode} />}
        </Map>
      </APIProvider>
    </div>
  );
}
