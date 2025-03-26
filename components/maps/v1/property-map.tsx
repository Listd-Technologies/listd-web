"use client";

import { type PropertyListingsFilter } from "@/hooks/api/usePropertyListings";
import { APIProvider, AdvancedMarker, InfoWindow, Map, useMap } from "@vis.gl/react-google-maps";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { type PropertyCardProps } from "../../listings/property-cards/property-card";
import { useMapContext } from "../../providers/map-context-provider";
import { Button } from "../../ui/button";
import { PropertyMarker } from "../PropertyMarker";
import DrawingCanvas from "./drawing-canvas";

// Default center coordinates (can be overridden by properties)
const defaultCenter = {
  lat: 14.5995, // Manila, Philippines as default
  lng: 120.9842,
};

// Global variable to store map position - this persists between component renders
let globalMapState = {
  center: defaultCenter,
  zoom: 14,
  hasInitialized: false,
};

// Add a cancellationState to preserve position specifically for cancellation
let cancellationState = {
  center: defaultCenter,
  zoom: 14,
  hasInitialized: false,
};

// Expose global variables to window for cross-component access
if (typeof window !== "undefined") {
  // @ts-ignore
  window.globalMapState = globalMapState;
  // @ts-ignore
  window.cancellationState = cancellationState;
}

// Define a map property interface that includes coordinates
interface MapProperty extends PropertyCardProps {
  mapLocation?: {
    lat: number;
    lng: number;
  };
}

interface PropertyMapProps {
  properties: MapProperty[];
  filters?: Partial<PropertyListingsFilter>;
  onMarkerClick?: (propertyId: string) => void;
  onBoundsChange?: (bounds: google.maps.LatLngBounds | null) => void;
  onDrawComplete?: (data: {
    polygon: google.maps.Polygon;
    bounds: google.maps.LatLngBounds;
    center: google.maps.LatLng;
    radius: number;
  }) => void;
  isDrawingMode?: boolean;
  toggleDrawingMode?: () => void;
  className?: string;
  preserveView?: boolean; // Flag to preserve the current map view instead of auto-fitting to markers
  onBoundaryChange?: (hasBoundary: boolean) => void; // Callback for boundary state changes
}

// Helper functions for calculating polygon statistics
const calculateDistances = (center: google.maps.LatLng, points: google.maps.LatLng[]): number[] => {
  return points.map((point) =>
    google.maps.geometry.spherical.computeDistanceBetween(center, point)
  );
};

const calculateDistanceStatistics = (distances: number[]) => {
  const max = Math.max(...distances);
  const min = Math.min(...distances);
  const avg = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;

  return { max, min, avg };
};

// Inner component to access Map context
function MapContent({
  properties,
  onMarkerClick,
  onBoundsChange,
  onDrawComplete,
  isDrawingMode,
  toggleDrawingMode,
  preserveView,
  onBoundaryChange,
}: Pick<
  PropertyMapProps,
  | "properties"
  | "onMarkerClick"
  | "onBoundsChange"
  | "onDrawComplete"
  | "isDrawingMode"
  | "toggleDrawingMode"
  | "preserveView"
  | "onBoundaryChange"
>) {
  const map = useMap();
  const mapRef = useRef<google.maps.Map | null>(null);

  // Add state for selected property
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const drawnPolygonRef = useRef<google.maps.Polygon | null>(null);
  const centerMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const boundingBoxRef = useRef<google.maps.Rectangle | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [drawingInitialized, setDrawingInitialized] = useState(false);
  const [useDrawingCanvas, setUseDrawingCanvas] = useState(false);
  const [hasBoundary, setHasBoundary] = useState(false);
  const [clearingBoundary, setClearingBoundary] = useState(false);
  const [drawingModeTransition, setDrawingModeTransition] = useState<"entering" | "exiting" | null>(
    null
  );

  // Use the map context
  const mapContext = useMapContext();

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development";

  // Track if properties have been loaded before
  const initialLoadRef = useRef<boolean>(false);
  const initialPositionRef = useRef<{ center: google.maps.LatLng; zoom: number } | null>(null);

  // Store map reference and track map movements
  useEffect(() => {
    if (map) {
      mapRef.current = map;

      // Start tracking the map's position to ensure we can restore it
      const positionTracker = map.addListener("idle", () => {
        // Only track position when not in drawing mode
        if (!isDrawingMode && map.getCenter() && map.getZoom()) {
          // Update both context and global state variables

          // 1. Update the map context with current position
          mapContext.dispatch({
            type: "UPDATE_POSITION",
            payload: {
              center: {
                lat: map.getCenter()!.lat(),
                lng: map.getCenter()!.lng(),
              },
              zoom: map.getZoom()!,
            },
          });

          // 2. Also save this position as the drawing position
          // This is critical - it ensures when we start drawing we use the latest position
          mapContext.dispatch({
            type: "SAVE_DRAWING_POSITION",
            payload: {
              center: {
                lat: map.getCenter()!.lat(),
                lng: map.getCenter()!.lng(),
              },
              zoom: map.getZoom()!,
            },
          });

          // 3. Update the global map state for backward compatibility
          globalMapState = {
            center: {
              lat: map.getCenter()!.lat(),
              lng: map.getCenter()!.lng(),
            },
            zoom: map.getZoom()!,
            hasInitialized: true,
          };

          // 4. Update cancellation state too for backward compatibility
          cancellationState = {
            center: {
              lat: map.getCenter()!.lat(),
              lng: map.getCenter()!.lng(),
            },
            zoom: map.getZoom()!,
            hasInitialized: true,
          };

          console.log("Updated position in all stores:", {
            lat: map.getCenter()!.lat(),
            lng: map.getCenter()!.lng(),
            zoom: map.getZoom()!,
          });
        }
      });

      return () => {
        google.maps.event.removeListener(positionTracker);
      };
    }
  }, [map, isDrawingMode, mapContext]);

  // Force the map to restore position when drawing canvas is mounted
  useEffect(() => {
    if (isDrawingMode && map) {
      // Get the saved drawing position from context
      const savedPosition = mapContext.getDrawingPosition();

      // Only restore if we have a saved position
      if (savedPosition && mapContext.state.drawingModePosition.hasInitialized) {
        console.log("Restoring drawing position from context:", savedPosition);

        // Create a more reliable position restoration system using multiple events
        let restorationComplete = false;
        let restorationAttempts = 0;
        const MAX_RESTORATION_ATTEMPTS = 3;

        // Set up listeners before changing position

        // 1. Center changed listener - checks if the center position matches what we expect
        const centerChangedListener = map.addListener("center_changed", () => {
          if (!restorationComplete && restorationAttempts < MAX_RESTORATION_ATTEMPTS) {
            const newCenter = map.getCenter();
            if (newCenter) {
              const targetLat = savedPosition.center.lat;
              const targetLng = savedPosition.center.lng;
              const currentLat = newCenter.lat();
              const currentLng = newCenter.lng();

              // Check if position is significantly different
              const positionDifference =
                Math.abs(currentLat - targetLat) > 0.001 ||
                Math.abs(currentLng - targetLng) > 0.001;

              if (positionDifference) {
                console.log("Position changed unexpectedly during restoration, correcting");
                map.setCenter(savedPosition.center);
                restorationAttempts++;
              }
            }
          }
        });

        // 2. Zoom changed listener - checks if zoom level matches what we expect
        const zoomChangedListener = map.addListener("zoom_changed", () => {
          if (!restorationComplete && restorationAttempts < MAX_RESTORATION_ATTEMPTS) {
            const currentZoom = map.getZoom();
            if (currentZoom !== savedPosition.zoom) {
              console.log("Zoom level changed unexpectedly during restoration, correcting");
              map.setZoom(savedPosition.zoom);
              restorationAttempts++;
            }
          }
        });

        // 3. Idle listener - once the map is idle, check final position and mark as complete
        const idleListener = map.addListener("idle", () => {
          if (!restorationComplete) {
            const currentCenter = map.getCenter();
            const currentZoom = map.getZoom();

            if (currentCenter) {
              const targetLat = savedPosition.center.lat;
              const targetLng = savedPosition.center.lng;
              const currentLat = currentCenter.lat();
              const currentLng = currentCenter.lng();

              // Check if position needs correction
              const needsCorrection =
                Math.abs(currentLat - targetLat) > 0.001 ||
                Math.abs(currentLng - targetLng) > 0.001 ||
                currentZoom !== savedPosition.zoom;

              if (needsCorrection && restorationAttempts < MAX_RESTORATION_ATTEMPTS) {
                // Try once more
                console.log("Final position check failed, correcting position");
                map.setCenter(savedPosition.center);
                map.setZoom(savedPosition.zoom);
                restorationAttempts++;
              } else {
                // Either position is good or we've tried enough times
                console.log("Position restoration complete");
                restorationComplete = true;

                // Clean up all listeners once complete
                google.maps.event.removeListener(centerChangedListener);
                google.maps.event.removeListener(zoomChangedListener);
                google.maps.event.removeListener(idleListener);
              }
            }
          }
        });

        // Set position immediately after setting up listeners
        map.setCenter(savedPosition.center);
        map.setZoom(savedPosition.zoom);

        // Safety cleanup after a reasonable amount of time
        const cleanupTimeout = setTimeout(() => {
          if (!restorationComplete) {
            // If not complete by timeout, clean up anyway
            google.maps.event.removeListener(centerChangedListener);
            google.maps.event.removeListener(zoomChangedListener);
            google.maps.event.removeListener(idleListener);
            console.log("Position restoration timed out, cleaning up listeners");
          }
        }, 2000);

        // Cleanup on effect cleanup
        return () => {
          clearTimeout(cleanupTimeout);
          if (!restorationComplete) {
            google.maps.event.removeListener(centerChangedListener);
            google.maps.event.removeListener(zoomChangedListener);
            google.maps.event.removeListener(idleListener);
          }
        };
      }
    }
  }, [isDrawingMode, map, mapContext]);

  // Create markers from properties
  useEffect(() => {
    if (!properties || properties.length === 0 || !map) return;

    // Save the current map position before creating markers on first load
    if (!initialLoadRef.current && map) {
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();

      if (currentCenter && currentZoom) {
        initialPositionRef.current = {
          center: currentCenter,
          zoom: currentZoom,
        };
        console.log("Saved initial position before property load:", initialPositionRef.current);

        // Also update cancellation state to ensure we have a good fallback position
        cancellationState = {
          center: {
            lat: currentCenter.lat(),
            lng: currentCenter.lng(),
          },
          zoom: currentZoom,
          hasInitialized: true,
        };
      }
    }

    // Create bounds object to fit markers
    const bounds = new google.maps.LatLngBounds();
    let hasRealCoordinates = false;

    // Process each property to determine if we have real coordinates
    properties.forEach((property) => {
      // Check if the property has real coordinates in mapLocation
      if (property.mapLocation?.lat && property.mapLocation?.lng) {
        bounds.extend(new google.maps.LatLng(property.mapLocation.lat, property.mapLocation.lng));
        hasRealCoordinates = true;
      }
    });

    // If we have real coordinates, fit the map to those bounds
    if (hasRealCoordinates && !preserveView && !initialLoadRef.current) {
      // Only fit bounds if we have real coordinates and aren't preserving the view
      map.fitBounds(bounds);

      if (onBoundsChange) {
        onBoundsChange(bounds);
      }
    } else if (preserveView && initialPositionRef.current) {
      // If preserving view and we have initial position, restore it
      setTimeout(() => {
        if (map && initialPositionRef.current) {
          map.setCenter(initialPositionRef.current.center);
          map.setZoom(initialPositionRef.current.zoom);
          console.log("Preserved map view as requested");
        }
      }, 100);
    }

    // Mark as loaded for future reference
    initialLoadRef.current = true;
  }, [properties, map, onBoundsChange, isDrawingMode, preserveView]);

  // Monitor bounds changes
  useEffect(() => {
    if (!map) return;

    const boundsChangedListener = map.addListener("bounds_changed", () => {
      const bounds = map.getBounds();
      if (bounds && onBoundsChange) {
        onBoundsChange(bounds);
      }
    });

    return () => {
      // Remove listener when component unmounts
      google.maps.event.removeListener(boundsChangedListener);
    };
  }, [map, onBoundsChange]);

  // Initialize drawing manager - this is the most critical part for drawing functionality
  useEffect(() => {
    if (!map) {
      console.log("Map not available for drawing initialization");
      return;
    }

    // Ensure both the drawing and geometry libraries are loaded
    if (!window.google?.maps?.drawing || !window.google?.maps?.geometry) {
      console.error(
        "Google Maps Drawing or Geometry library not loaded. Libraries: ",
        window.google?.maps ? Object.keys(window.google.maps).join(", ") : "Google Maps not loaded"
      );

      // Add error recovery - we'll retry after a short delay
      const retryTimeout = setTimeout(() => {
        console.log("Retrying drawing manager initialization...");
        if (window.google?.maps?.drawing && window.google?.maps?.geometry) {
          console.log("Libraries now available, proceeding with initialization");
          initializeDrawingManager();
        } else {
          console.error("Still missing required libraries after retry, giving up");
        }
      }, 2000);

      return () => {
        clearTimeout(retryTimeout);
      };
    }

    // Move initialization logic to a separate function for better organization
    // and easier retry handling
    function initializeDrawingManager() {
      console.log("Initializing drawing manager");

      // We'll display distance info in development mode
      const showDistanceInfo = (center: google.maps.LatLng, radius: number) => {
        if (!isDevelopment || !map) return;

        try {
          // Create a new info window if needed
          if (!infoWindowRef.current) {
            infoWindowRef.current = new google.maps.InfoWindow();
          }

          // Format radius in a readable way
          let formattedDistance = radius.toFixed(2) + " m";
          if (radius > 1000) {
            formattedDistance = (radius / 1000).toFixed(2) + " km";
          }

          // Set content and position
          infoWindowRef.current.setContent(`
            <div class="p-2 text-sm">
              <div class="font-semibold">Search Area Radius</div>
              <div>${formattedDistance}</div>
              <div class="text-xs text-muted-foreground mt-1">(Debug Info - Dev Only)</div>
            </div>
          `);
          infoWindowRef.current.setPosition(center);
          infoWindowRef.current.open(map);
        } catch (error) {
          console.error("Error showing distance info:", error);
        }
      };

      try {
        // Cleanup any existing drawing manager to prevent duplicates
        if (drawingManagerRef.current) {
          drawingManagerRef.current.setMap(null);
        }

        // Create a new drawing manager
        const drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: false, // We use our own UI controls
          polygonOptions: {
            fillColor: "#6B21A8",
            fillOpacity: 0.2,
            strokeWeight: 2,
            strokeColor: "#6B21A8",
            clickable: true,
            editable: false,
            zIndex: 1,
          },
        });

        // Set the drawing manager to the map
        drawingManager.setMap(map);
        drawingManagerRef.current = drawingManager;
        setDrawingInitialized(true);
        console.log("Drawing manager initialized successfully");

        // Add listener for when a polygon is completed
        google.maps.event.addListener(
          drawingManager,
          "polygoncomplete",
          (polygon: google.maps.Polygon) => {
            console.log("Polygon drawing completed");

            try {
              // Remove any existing polygons
              if (drawnPolygonRef.current) {
                drawnPolygonRef.current.setMap(null);
              }

              drawnPolygonRef.current = polygon;
              setHasBoundary(true);

              // Exit drawing mode
              drawingManager.setDrawingMode(null);
              if (toggleDrawingMode) {
                toggleDrawingMode();
              }

              // Calculate bounding box and center
              const bounds = new google.maps.LatLngBounds();
              const path = polygon.getPath();
              const pathPoints: google.maps.LatLng[] = [];

              // Convert polygon path to array of LatLng points
              path.forEach((point) => {
                bounds.extend(point);
                pathPoints.push(point);
              });

              const center = bounds.getCenter();

              // Calculate distances from center to all points
              const distances = calculateDistances(center, pathPoints);
              const distanceStats = calculateDistanceStatistics(distances);

              // Use maximum distance as radius (similar to React Native example)
              const radius = distanceStats.max;

              console.log("Polygon data calculated", {
                center: center.toJSON(),
                bounds: {
                  ne: bounds.getNorthEast().toJSON(),
                  sw: bounds.getSouthWest().toJSON(),
                },
                radius,
                points: pathPoints.length,
              });

              // Add center marker with custom icon
              if (map) {
                try {
                  // Clear any existing markers and visualizations
                  if (centerMarkerRef.current) {
                    centerMarkerRef.current.map = null;
                  }
                  if (boundingBoxRef.current) {
                    boundingBoxRef.current.setMap(null);
                  }
                  if (infoWindowRef.current) {
                    infoWindowRef.current.close();
                  }

                  // Create new center marker using AdvancedMarkerElement
                  showCenterMarker(center);

                  // Create new bounding box visualization
                  const boundingBoxRect = new google.maps.Rectangle({
                    bounds: bounds,
                    strokeColor: "#6B21A8",
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                    fillColor: "transparent",
                    fillOpacity: 0,
                    map: map,
                    zIndex: 50,
                  });
                  boundingBoxRef.current = boundingBoxRect;

                  // Display distance info if in development mode
                  showDistanceInfo(center, radius);
                } catch (markerError) {
                  console.error("Error creating markers or visualizations:", markerError);
                  // Not critical, can continue without markers
                }
              }

              // Save boundary data to context
              mapContext.setBoundaryData({
                bounds,
                center,
                radius,
              });

              // Call the onDrawComplete callback with the polygon data
              // But wrap it in a setTimeout to delay execution
              setTimeout(() => {
                if (onDrawComplete) {
                  try {
                    // IMPORTANT: Only pass the standard parameters to onDrawComplete
                    onDrawComplete({
                      polygon,
                      bounds,
                      center,
                      radius,
                    });
                  } catch (callbackError) {
                    console.error("Error in onDrawComplete callback:", callbackError);
                  }
                }

                // Save final position to global state before exiting drawing mode
                if (map) {
                  const finalCenter = map.getCenter();
                  const finalZoom = map.getZoom();

                  if (finalCenter && finalZoom) {
                    // Update both global position tracking variables to ensure consistency
                    globalMapState = {
                      center: {
                        lat: finalCenter.lat(),
                        lng: finalCenter.lng(),
                      },
                      zoom: finalZoom,
                      hasInitialized: true,
                    };

                    cancellationState = {
                      center: {
                        lat: finalCenter.lat(),
                        lng: finalCenter.lng(),
                      },
                      zoom: finalZoom,
                      hasInitialized: true,
                    };

                    console.log(
                      "Saved final position before exiting drawing mode:",
                      globalMapState
                    );
                  }
                }

                // Exit drawing mode AFTER a delay
                if (toggleDrawingMode) {
                  toggleDrawingMode();
                }
              }, 500); // Delay execution to prevent map movement
            } catch (polygonError) {
              console.error("Error processing polygon:", polygonError);

              // Clean up any partial drawing state and recover
              if (polygon) {
                polygon.setMap(null);
              }

              if (drawnPolygonRef.current) {
                drawnPolygonRef.current.setMap(null);
                drawnPolygonRef.current = null;
              }

              setHasBoundary(false);

              // Exit drawing mode on error
              drawingManager.setDrawingMode(null);
              if (toggleDrawingMode) {
                toggleDrawingMode();
              }
            }
          }
        );
      } catch (error) {
        console.error("Error initializing drawing manager:", error);
        setDrawingInitialized(false);

        // Try to recover with a delayed retry
        setTimeout(() => {
          console.log("Attempting to recover from drawing manager initialization error");
          initializeDrawingManager();
        }, 3000);
      }
    }

    // Initial call to initialize the drawing manager
    initializeDrawingManager();

    return () => {
      // Cleanup drawing manager when component unmounts
      if (drawingManagerRef.current) {
        console.log("Cleaning up drawing manager");
        drawingManagerRef.current.setMap(null);
        drawingManagerRef.current = null;
      }
    };
  }, [map, onDrawComplete, toggleDrawingMode, isDevelopment, mapContext]);

  // Watch for drawing mode changes and manage map draggability and position
  // biome-ignore lint/correctness/useExhaustiveDependencies: Dependencies are intentionally limited to prevent unnecessary re-renders. The function uses refs that don't need to be in the dependency array.
  useEffect(() => {
    console.log("Drawing mode changed:", isDrawingMode, "Drawing initialized:", drawingInitialized);

    if (!map) return;

    // If entering drawing mode
    if (isDrawingMode) {
      // Signal the transition start
      setDrawingModeTransition("entering");

      // ENABLE DRAWING CANVAS - this was missing in the refactor
      setUseDrawingCanvas(true);

      // First, capture the current map position even before making any changes
      // This ensures we can restore to exactly the right place
      let savedPosition: { center: google.maps.LatLng; zoom: number } | null = null;

      // Method 1: Try to get position from current map state
      if (map && map.getCenter() && map.getZoom()) {
        savedPosition = {
          center: map.getCenter()!,
          zoom: map.getZoom()!,
        };
        console.log("Position saved directly from map before drawing mode:", savedPosition);
      }

      // Method 2: Fall back to global state if map center not accessible
      if (!savedPosition && window.cancellationState?.hasInitialized) {
        // Create a LatLng object from the stored position
        const center = new google.maps.LatLng(
          window.cancellationState.center.lat,
          window.cancellationState.center.lng
        );
        savedPosition = {
          center,
          zoom: window.cancellationState.zoom,
        };
        console.log("Position restored from cancellationState:", savedPosition);
      }

      // Method 3: Fall back to the mapContext's drawing position
      if (!savedPosition && mapContext.state.drawingModePosition.hasInitialized) {
        const center = new google.maps.LatLng(
          mapContext.state.drawingModePosition.center.lat,
          mapContext.state.drawingModePosition.center.lng
        );
        savedPosition = {
          center,
          zoom: mapContext.state.drawingModePosition.zoom,
        };
        console.log("Position restored from mapContext:", savedPosition);
      }

      // If we found a position to restore to, force set it immediately
      if (savedPosition) {
        // Apply the position immediately
        map.setCenter(savedPosition.center);
        map.setZoom(savedPosition.zoom);

        // Set up a short interval to aggressively maintain this position
        // for the first few moments of drawing mode
        const positionLockInterval = setInterval(() => {
          map.setCenter(savedPosition!.center);
          map.setZoom(savedPosition!.zoom);
        }, 50);

        // Clear the aggressive interval after 1 second
        setTimeout(() => {
          clearInterval(positionLockInterval);
        }, 1000);
      }

      // After transition completes, reset transition state
      const transitionTimeout = setTimeout(() => {
        setDrawingModeTransition(null);
      }, 500);

      // Wait for the drawing canvas to be fully mounted before changing map options
      requestAnimationFrame(() => {
        if (map) {
          // Apply only the minimum necessary changes
          map.setOptions({
            draggable: false,
          });
        }
      });

      return () => {
        clearTimeout(transitionTimeout);
      };
    } else if (drawingModeTransition === "entering" || drawingInitialized) {
      // Only run exit animation if we were previously in drawing mode
      setDrawingModeTransition("exiting");

      // Re-enable map dragging immediately
      map.setOptions({
        draggable: true,
      });

      // Reset drawing mode transition after the animation completes
      const transitionTimeout = setTimeout(() => {
        setDrawingModeTransition(null);
        setUseDrawingCanvas(false);
      }, 500);

      return () => {
        clearTimeout(transitionTimeout);
      };
    }
  }, [isDrawingMode, drawingInitialized, map, mapContext.state.drawingModePosition]);

  // Sync map state with context on mount and unmount for better cleanup
  // But use a ref to track if we've already synced to prevent update loops
  const hasSyncedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // On mount, sync state if map is available and we haven't synced yet
    if (map && !hasSyncedRef.current) {
      console.log("Initial sync of map state with context");
      mapContext.syncStateWithMap(map);
      hasSyncedRef.current = true;

      // Set up periodic sync to ensure state consistency, but less frequently
      const syncInterval = setInterval(() => {
        if (map && isMountedRef.current) {
          mapContext.syncStateWithMap(map);
        }
      }, 60000); // Sync every 60 seconds to reduce update frequency

      return () => {
        // Mark as unmounted to prevent any post-unmount state updates
        isMountedRef.current = false;

        // Clear interval on unmount
        clearInterval(syncInterval);

        // Final state sync before unmount
        if (map) {
          mapContext.syncStateWithMap(map);
        }
      };
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [map, mapContext]);

  // More robust cleanup function that tries multiple approaches to remove markers
  const forceCleanupMarkers = useCallback(() => {
    try {
      // 1. Try cleaning up using our ref
      if (centerMarkerRef.current) {
        centerMarkerRef.current.map = null;
        if (centerMarkerRef.current.element) {
          centerMarkerRef.current.element.remove();
        }
        centerMarkerRef.current = null;
      }

      // 2. Try global map cleanup - find all markers on the map and remove them
      if (map) {
        // Try to access any AdvancedMarkerElements that might be on the map
        try {
          // Use JavaScript's ability to inspect the map object for marker collections
          const mapObj = map as unknown;
          // Using type assertion for internal properties
          const mapInternal = mapObj as {
            markers?: Array<{ setMap?: (map: google.maps.Map | null) => void }>;
            __gm?: { overlayLayer?: HTMLElement };
          };

          // Clean marker collections that might exist (implementation dependent)
          if (mapInternal.markers && Array.isArray(mapInternal.markers)) {
            mapInternal.markers.forEach((marker) => {
              if (marker && typeof marker.setMap === "function") {
                marker.setMap(null);
              }
            });
          }

          // Try to access internal Map data
          if (mapInternal.__gm?.overlayLayer) {
            // Force DOM update - sometimes helps with cleanup
            mapInternal.__gm.overlayLayer.innerHTML = "";
          }
        } catch (e) {
          console.log("Map cleanup attempt error:", e);
        }
      }

      // 3. Find markers by DOM selection (last resort)
      if (typeof document !== "undefined") {
        try {
          // Try to find marker elements in the DOM
          const markerElements = document.querySelectorAll('[title="Center of Search Area"]');
          markerElements.forEach((el) => {
            if (el && el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });

          // Also try to find markers by their visual appearance (specific to our marker)
          const purpleCircles = document.querySelectorAll(
            'div[style*="background-color: #6B21A8"]'
          );
          purpleCircles.forEach((el) => {
            // Find the parent marker container and remove it
            let parent: Node | ParentNode | null = el.parentNode;
            // Type guard to check if parent has getAttribute method
            while (
              parent &&
              parent instanceof Element &&
              !parent.getAttribute("aria-roledescription")?.includes("marker")
            ) {
              parent = parent.parentNode;
            }
            if (parent && parent instanceof Element && parent.parentNode) {
              parent.parentNode.removeChild(parent);
            }
          });
        } catch (e) {
          console.log("DOM cleanup attempt error:", e);
        }
      }

      console.log("Forced cleanup of all markers completed");
    } catch (error) {
      console.error("Error in forced marker cleanup:", error);
    }
  }, [map]);

  // Create a circle SVG for the center marker icon
  const createCenterMarkerElement = () => {
    const element = document.createElement("div");
    element.innerHTML = `
      <div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #6B21A8;
        border: 2px solid #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      "></div>
    `;
    return element;
  };

  // Clear drawn polygon and associated visuals
  // biome-ignore lint/correctness/useExhaustiveDependencies: Dependencies are intentionally limited to prevent unnecessary re-renders. The function uses refs that don't need to be in the dependency array.
  const clearDrawing = useCallback(() => {
    console.log("!!!! CLEARING AREA - PRESERVING CURRENT VIEW POSITION !!!!");

    try {
      // Check if map is available
      if (!map) {
        console.error("Map not available when clearing drawing");
        return;
      }

      // CRITICAL: Force-capture the EXACT current map position BEFORE doing ANYTHING else
      const mapCenter = map.getCenter();
      const mapZoom = map.getZoom();

      if (!mapCenter || !mapZoom) {
        console.error("Failed to capture current map position before clearing!");
        return;
      }

      // Create exact copies of the position that we can apply later
      const exactCenter = new google.maps.LatLng(mapCenter.lat(), mapCenter.lng());
      const exactZoom = mapZoom;

      console.log("EXACT POSITION CAPTURED:", {
        lat: exactCenter.lat(),
        lng: exactCenter.lng(),
        zoom: exactZoom,
      });

      // Immediately disable any animations that could interfere with position
      setClearingBoundary(true);

      // IMMEDIATELY clear all visual elements (no timeouts!)
      // 1. Remove polygon
      if (drawnPolygonRef.current) {
        drawnPolygonRef.current.setMap(null);
        drawnPolygonRef.current = null;
      }

      // 2. Clear markers
      if (centerMarkerRef.current) {
        centerMarkerRef.current.map = null;
        centerMarkerRef.current = null;
      }

      // 3. Run aggressive cleanup
      forceCleanupMarkers();

      // 4. Clear bounding box
      if (boundingBoxRef.current) {
        boundingBoxRef.current.setMap(null);
        boundingBoxRef.current = null;
      }

      // 5. Clear info window
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }

      // Reset boundary state
      setHasBoundary(false);

      // Reset boundary in context
      if (mapContext && typeof mapContext.resetBoundary === "function") {
        mapContext.resetBoundary();
      }

      // Call the boundary change callback
      if (onBoundaryChange) {
        onBoundaryChange(false);
      }

      // CRITICAL PART: Immediately and forcefully reset the map to the exact position
      // we captured before clearing the boundary
      map.setCenter(exactCenter);
      map.setZoom(exactZoom);

      // Also update global state variables to ensure consistency
      if (typeof globalMapState !== "undefined") {
        globalMapState = {
          center: {
            lat: exactCenter.lat(),
            lng: exactCenter.lng(),
          },
          zoom: exactZoom,
          hasInitialized: true,
        };
      }

      // Also update cancellation state for redundancy
      if (typeof cancellationState !== "undefined") {
        cancellationState = {
          center: {
            lat: exactCenter.lat(),
            lng: exactCenter.lng(),
          },
          zoom: exactZoom,
          hasInitialized: true,
        };
      }

      // Double-check position was applied correctly
      const newCenter = map.getCenter();
      const newZoom = map.getZoom();

      if (newCenter && newZoom) {
        const posDrift =
          Math.abs(newCenter.lat() - exactCenter.lat()) > 0.0001 ||
          Math.abs(newCenter.lng() - exactCenter.lng()) > 0.0001 ||
          newZoom !== exactZoom;

        if (posDrift) {
          console.error("Position drifted after clearing boundary! Forcing reset...");
          map.setCenter(exactCenter);
          map.setZoom(exactZoom);
        } else {
          console.log("✓ Position verified: map stayed in the same position");
        }
      }

      // Reset animation state after everything is done
      setClearingBoundary(false);
    } catch (error) {
      console.error("Error during boundary clearing:", error);

      // Clean up critical state even if errors occurred
      setHasBoundary(false);
      setClearingBoundary(false);
    }
  }, [mapContext, onBoundaryChange, setClearingBoundary, forceCleanupMarkers, map]);

  // Add animation for polygon creation
  const [polygonFadeIn, setPolygonFadeIn] = useState(false);

  // Handle drawing completion from DrawingCanvas - enhanced with animations
  const handleDrawingFinish = useCallback(
    (points: { lat: number; lng: number }[]) => {
      console.log("Free-hand drawing completed with points:", points);

      if (points.length < 3) {
        console.warn("Not enough points to create a polygon");
        return;
      }

      // CRITICAL: Save the current map position BEFORE changing anything
      // This will be used to restore after polygon creation
      const currentCenter = map?.getCenter();
      const currentZoom = map?.getZoom();
      let savedPosition: { center: google.maps.LatLng; zoom: number } | null = null;

      if (currentCenter && currentZoom) {
        savedPosition = {
          center: currentCenter,
          zoom: currentZoom,
        };
        console.log("Saved position before polygon creation:", savedPosition);

        // Update the global state for future drawing sessions
        globalMapState = {
          center: {
            lat: currentCenter.lat(),
            lng: currentCenter.lng(),
          },
          zoom: currentZoom,
          hasInitialized: true,
        };
        // Also update cancellation state
        cancellationState = {
          center: {
            lat: currentCenter.lat(),
            lng: currentCenter.lng(),
          },
          zoom: currentZoom,
          hasInitialized: true,
        };

        // Update map context state for consistent state management
        mapContext.dispatch({
          type: "UPDATE_POSITION",
          payload: {
            center: {
              lat: currentCenter.lat(),
              lng: currentCenter.lng(),
            },
            zoom: currentZoom,
          },
        });

        // IMPORTANT: Add a bounds_changed listener to prevent any auto zooming
        const boundsListener = map?.addListener("bounds_changed", () => {
          // Only act if we still have the saved position
          if (savedPosition) {
            map?.setCenter(savedPosition.center);
            map?.setZoom(savedPosition.zoom);
          }
        });

        // Remove the listener after a short delay
        setTimeout(() => {
          if (boundsListener) {
            google.maps.event.removeListener(boundsListener);
          }
        }, 2000);
      }

      // Clear any existing visuals directly without using clearDrawing()
      // First clear the existing polygon
      if (drawnPolygonRef.current) {
        drawnPolygonRef.current.setMap(null);
        drawnPolygonRef.current = null;
      }

      // Run the aggressive cleanup to remove any existing markers
      forceCleanupMarkers();

      if (boundingBoxRef.current) {
        boundingBoxRef.current.setMap(null);
        boundingBoxRef.current = null;
      }

      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }

      // Reset polygon animation state
      setPolygonFadeIn(false);

      try {
        // Create a new polygon from the drawn points WITHOUT triggering a bounds fit
        const polygon = new google.maps.Polygon({
          paths: points,
          fillColor: "#6B21A8",
          fillOpacity: 0, // Start with no opacity for fade-in effect
          strokeWeight: 2,
          strokeColor: "#6B21A8",
          strokeOpacity: 0, // Start with no opacity for fade-in effect
          clickable: true,
          editable: false,
          zIndex: 1,
          map: map,
        });

        drawnPolygonRef.current = polygon;

        // Important: Set boundary existence AFTER polygon is created and assigned
        setHasBoundary(true);

        // Trigger polygon fade-in
        setPolygonFadeIn(true);

        // Animate polygon appearance
        setTimeout(() => {
          if (polygon) {
            polygon.setOptions({
              fillOpacity: 0.2,
              strokeOpacity: 1,
            });
          }
        }, 50);

        // Calculate bounding box and center
        const bounds = new google.maps.LatLngBounds();
        points.forEach((point) => {
          bounds.extend(new google.maps.LatLng(point.lat, point.lng));
        });

        const center = bounds.getCenter();

        // Convert points to LatLng for distance calculation
        const latLngPoints = points.map((p) => new google.maps.LatLng(p.lat, p.lng));

        // Calculate distances from center to all points
        const distances = calculateDistances(center, latLngPoints);
        const distanceStats = calculateDistanceStatistics(distances);

        // Use maximum distance as radius
        const radius = distanceStats.max;

        console.log("Polygon data calculated", {
          center: center.toJSON(),
          bounds: {
            ne: bounds.getNorthEast().toJSON(),
            sw: bounds.getSouthWest().toJSON(),
          },
          radius,
          points: points.length,
        });

        // Add center marker and visualizations
        if (map) {
          // Create new center marker using AdvancedMarkerElement
          showCenterMarker(center);

          // Add bounding box visualization WITHOUT auto-fitting the bounds
          const boundingBoxRect = new google.maps.Rectangle({
            bounds: bounds,
            strokeColor: "#6B21A8",
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: "transparent",
            fillOpacity: 0,
            map: map,
            zIndex: 50,
          });
          boundingBoxRef.current = boundingBoxRect;

          // AGGRESSIVELY restore the exact position that was saved
          if (savedPosition) {
            // Immediately restore position
            map.setCenter(savedPosition.center);
            map.setZoom(savedPosition.zoom);

            // Set up a loop that continues to restore the position
            // This ensures no external events can change it
            const positionLock = () => {
              if (savedPosition) {
                map.setCenter(savedPosition.center);
                map.setZoom(savedPosition.zoom);
              }
            };

            // Run the position lock several times
            const lockInterval = setInterval(positionLock, 50);

            // Stop the aggressive locking after a short period
            setTimeout(() => {
              clearInterval(lockInterval);
            }, 1000);
          }

          // After a delay, update the global state to track this position
          setTimeout(() => {
            if (savedPosition) {
              // Update the global map state to this position
              globalMapState = {
                center: {
                  lat: savedPosition.center.lat(),
                  lng: savedPosition.center.lng(),
                },
                zoom: savedPosition.zoom,
                hasInitialized: true,
              };
            }
          }, 1500);
        }

        // Save boundary data to context for better state management
        mapContext.setBoundaryData({
          bounds,
          center,
          radius: radius || 0,
        });

        // Call the onBoundaryChange callback to update parent components
        if (onBoundaryChange) {
          onBoundaryChange(true);
        }

        // Call the onDrawComplete callback with the polygon data
        // But wrap it in a setTimeout to delay execution
        setTimeout(() => {
          if (onDrawComplete) {
            // IMPORTANT: Only pass the standard parameters to onDrawComplete
            onDrawComplete({
              polygon,
              bounds,
              center,
              radius,
            });
          }

          // Exit drawing mode AFTER a delay
          if (toggleDrawingMode) {
            toggleDrawingMode();
          }
        }, 500); // Delay execution to prevent map movement
      } catch (error) {
        console.error("Error creating polygon:", error);
        // Handle error - clear any partial drawing and recover
        clearDrawing();

        // Exit drawing mode on error
        if (toggleDrawingMode) {
          toggleDrawingMode();
        }
      }
    },
    [
      map,
      onDrawComplete,
      toggleDrawingMode,
      clearDrawing,
      mapContext,
      onBoundaryChange,
      forceCleanupMarkers,
    ]
  );

  // Create new center marker (using the new AdvancedMarkerElement)
  const showCenterMarker = async (center: google.maps.LatLng) => {
    try {
      // Run the aggressive cleanup first to ensure all existing markers are gone
      forceCleanupMarkers();

      // Short delay to ensure cleanup is complete before creating a new marker
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Dynamically import the marker library
      const { AdvancedMarkerElement } = (await google.maps.importLibrary("marker")) as {
        AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
      };

      // Create the advanced marker for the center
      const centerMarker = new AdvancedMarkerElement({
        position: center,
        map: map,
        content: createCenterMarkerElement(),
        title: "Center of Search Area",
        zIndex: 1000,
      });

      // Store reference for later cleanup
      centerMarkerRef.current = centerMarker;

      // Add a data attribute to help with DOM selection for cleanup
      if (centerMarker.element) {
        centerMarker.element.setAttribute("data-marker-type", "center-marker");
      }

      console.log("Center marker created successfully");
    } catch (error) {
      console.error("Error creating advanced marker:", error);
      // Fallback to regular marker if needed
    }
  };

  // Add back a simple effect to update the UI when boundary state changes
  useEffect(() => {
    if (onBoundaryChange) {
      onBoundaryChange(hasBoundary);
    }
  }, [hasBoundary, onBoundaryChange]);

  return (
    <>
      {/* Property markers - only displayed when boundary is active */}
      {hasBoundary &&
        properties.map((property) =>
          property.mapLocation?.lat && property.mapLocation?.lng ? (
            <PropertyMarker
              key={property.id}
              property={property}
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

      {/* Enhanced Drawing Mode Indicator - with transition animations */}
      {(isDrawingMode || drawingModeTransition === "exiting") && (
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
            drawingModeTransition === "entering"
              ? "opacity-0 scale-105"
              : drawingModeTransition === "exiting"
                ? "opacity-0 scale-95"
                : "opacity-100 scale-100"
          }`}
        >
          <div className="absolute inset-0 border-4 border-purple-600 animate-pulse opacity-50"></div>
        </div>
      )}

      {/* Drawing Status Debug - Remove in production */}
      {isDevelopment && (
        <div className="absolute top-1 right-1 z-10 text-xs bg-black/50 text-white px-2 py-1 rounded">
          Drawing {drawingInitialized ? "Ready" : "Not Ready"} | Mode:{" "}
          {isDrawingMode ? "Active" : "Inactive"}
        </div>
      )}

      {/* Enhanced Clear Boundary Button - with animations */}
      {hasBoundary && !isDrawingMode && (
        <div
          className={`absolute top-4 right-4 z-20 transition-all duration-300 ${
            clearingBoundary
              ? "opacity-0 scale-90"
              : polygonFadeIn
                ? "opacity-100 scale-100 animate-fadeIn"
                : "opacity-100 scale-100"
          }`}
        >
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-2 bg-background/90 backdrop-blur-sm shadow-md hover:bg-background/100 border border-purple-100 transition-all duration-200"
            onClick={clearDrawing}
          >
            <X className="h-4 w-4 text-purple-600" />
            <span>Clear area</span>
          </Button>
        </div>
      )}

      {/* Drawing Canvas with transition animations */}
      {useDrawingCanvas && mapRef.current && (
        <div
          className={`transition-all duration-500 ${
            drawingModeTransition === "entering" ? "opacity-0" : "opacity-100"
          }`}
        >
          <DrawingCanvas
            isDrawingMode={useDrawingCanvas}
            onDrawingFinish={handleDrawingFinish}
            onCancel={() => {
              if (toggleDrawingMode) {
                toggleDrawingMode();
              }
            }}
            mapRef={mapRef as React.RefObject<google.maps.Map>}
          />
        </div>
      )}
    </>
  );
}

export function PropertyMap({
  properties,
  onMarkerClick,
  onBoundsChange,
  onDrawComplete,
  isDrawingMode = false,
  toggleDrawingMode,
  className,
  preserveView = false,
  onBoundaryChange,
}: PropertyMapProps) {
  // Store a ref to the map instance
  const mapRef = useRef<google.maps.Map | null>(null);

  // Track when the map is initialized
  const [mapInitialized, setMapInitialized] = useState(false);

  // Handle map initialization
  const handleMapIdle = useCallback(
    (event: { map: google.maps.Map }) => {
      // Get map from event
      const map = event.map;
      if (!map) return;

      // Store map reference
      if (!mapRef.current) {
        mapRef.current = map;
        console.log("Map initialized and stored in ref");

        // Set up bounds change listener for parent component
        map.addListener("bounds_changed", () => {
          const bounds = map.getBounds();
          if (bounds && onBoundsChange) {
            onBoundsChange(bounds);
          }
        });

        setMapInitialized(true);
      }

      // Skip position updates during drawing mode
      if (isDrawingMode) return;

      // Update position tracking
      const center = map.getCenter();
      const zoom = map.getZoom();

      if (center && zoom) {
        // Update global state
        globalMapState = {
          center: { lat: center.lat(), lng: center.lng() },
          zoom: zoom,
          hasInitialized: true,
        };

        // Also update cancellation state for backup
        cancellationState = {
          center: { lat: center.lat(), lng: center.lng() },
          zoom: zoom,
          hasInitialized: true,
        };

        console.log("Updated global position:", globalMapState);
      }
    },
    [onBoundsChange, isDrawingMode]
  );

  return (
    <div className={`w-full h-full relative ${className}`}>
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || ""}
        libraries={["drawing", "geometry"]}
      >
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={14}
          mapId="property-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          streetViewControl={false}
          mapTypeControl={false}
          zoomControl
          className="w-full h-full"
          onIdle={handleMapIdle}
        >
          {mapInitialized && (
            <MapContent
              properties={properties}
              onMarkerClick={onMarkerClick}
              onBoundsChange={onBoundsChange}
              onDrawComplete={onDrawComplete}
              isDrawingMode={isDrawingMode}
              toggleDrawingMode={toggleDrawingMode}
              preserveView={preserveView}
              onBoundaryChange={onBoundaryChange}
            />
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
