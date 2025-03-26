"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import simplify from "simplify-js";

interface Point {
  x: number;
  y: number;
}

interface LatLng {
  lat: number;
  lng: number;
}

interface DrawingCanvasProps {
  isDrawingMode: boolean;
  onDrawingFinish: (points: LatLng[]) => void;
  onCancel: () => void;
  mapRef: React.RefObject<google.maps.Map>;
}

// Get reference to the global map state from property-map.tsx
declare const globalMapState: {
  center: { lat: number; lng: number };
  zoom: number;
  hasInitialized: boolean;
};

// External reference to cancellation state for preserving position
declare const cancellationState: {
  center: { lat: number; lng: number };
  zoom: number;
  hasInitialized: boolean;
};

// Define a proper interface for the saved map position to avoid using 'any'
interface SavedMapPosition {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  timestamp: number;
}

// Add a simplified type declaration that avoids TypeScript errors
declare global {
  interface Window {
    google?: {
      // Use index signature for maps namespace without specifying each property
      // This avoids type errors while still providing some type safety
      maps: {
        [key: string]: unknown;
      } & {
        __SECRET_MAP_INSTANCES?: Map<HTMLElement, google.maps.Map>;
      };
    };
    __savedMapPosition?: SavedMapPosition;
  }
}

// Save the map position before entering drawing mode
const saveMapPosition = (map: google.maps.Map): { lat: number; lng: number; zoom: number } => {
  const center = map.getCenter();
  const zoom = map.getZoom() || 14;

  return {
    lat: center ? center.lat() : 0,
    lng: center ? center.lng() : 0,
    zoom,
  };
};

// Restore the map position after canvas is mounted
const restoreMapPosition = (
  map: google.maps.Map,
  position: { lat: number; lng: number; zoom: number }
) => {
  if (!position.lat || !position.lng) return;

  // Create a new LatLng object
  const latlng = new google.maps.LatLng(position.lat, position.lng);

  // Restore position
  map.setCenter(latlng);
  map.setZoom(position.zoom);
};

/**
 * Canvas component for freehand drawing on Google Maps
 * Converts screen coordinates to latitude/longitude for geographic queries
 */
export default function DrawingCanvas({
  isDrawingMode,
  onDrawingFinish,
  onCancel,
  mapRef,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<Point[]>([]);
  const savedPositionRef = useRef<{ lat: number; lng: number; zoom: number } | null>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [lastTouchPosition, setLastTouchPosition] = useState<Point | null>(null);
  const [showTips, setShowTips] = useState(true);

  // Detect mobile device on mount
  useEffect(() => {
    const detectDeviceType = () => {
      const isMobileOrTablet =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 1024; // Increase to 1024px (lg breakpoint)

      const isTabletSize = window.innerWidth >= 768 && window.innerWidth < 1024;

      setIsMobileDevice(isMobileOrTablet);
      setIsTablet(isTabletSize);

      // Auto-collapse tips on very small screens
      if (window.innerWidth < 360) {
        setShowTips(false);
      }
    };

    detectDeviceType();

    // Update on resize to handle orientation changes
    window.addEventListener("resize", detectDeviceType);
    return () => window.removeEventListener("resize", detectDeviceType);
  }, []);

  // Save map position on mount
  useEffect(() => {
    if (mapRef.current && isDrawingMode) {
      // Best approach: use the shared cancellation state when available
      if (typeof cancellationState !== "undefined" && cancellationState.hasInitialized) {
        savedPositionRef.current = {
          lat: cancellationState.center.lat,
          lng: cancellationState.center.lng,
          zoom: cancellationState.zoom,
        };
        console.log("DrawingCanvas: Using shared cancellation state");

        // Create a more robust position stabilization approach
        const map = mapRef.current;

        // Set position immediately to prevent any flicker
        if (savedPositionRef.current) {
          const position = savedPositionRef.current;
          restoreMapPosition(map, position);
        }

        // Track successful position monitoring
        let stabilizationComplete = false;

        // Count position corrections to avoid infinite correction loops
        let correctionCount = 0;
        const MAX_CORRECTIONS = 5;

        // Set up a listener to prevent any position changes during initialization
        const preventMoveListener = map.addListener("bounds_changed", () => {
          if (
            savedPositionRef.current &&
            !stabilizationComplete &&
            correctionCount < MAX_CORRECTIONS
          ) {
            const position = savedPositionRef.current;
            const currentCenter = map.getCenter();

            if (currentCenter) {
              // Check if position has drifted significantly
              const drift =
                Math.abs(currentCenter.lat() - position.lat) > 0.0005 ||
                Math.abs(currentCenter.lng() - position.lng) > 0.0005;

              if (drift) {
                console.log("Position drifted during drawing canvas mount, restoring");
                restoreMapPosition(map, position);
                correctionCount++;

                // If we've reached max corrections, consider it stable to avoid fighting with the map
                if (correctionCount >= MAX_CORRECTIONS) {
                  console.log("Max position corrections reached, accepting current position");
                  stabilizationComplete = true;
                  google.maps.event.removeListener(preventMoveListener);
                }
              }
            }
          }
        });

        // Create a safer stabilization complete detector
        const idleListener = map.addListener("idle", () => {
          if (!stabilizationComplete) {
            // After the map is idle, check position one more time
            const currentCenter = map.getCenter();
            const position = savedPositionRef.current;

            if (currentCenter && position) {
              const drift =
                Math.abs(currentCenter.lat() - position.lat) > 0.0005 ||
                Math.abs(currentCenter.lng() - position.lng) > 0.0005 ||
                map.getZoom() !== position.zoom;

              if (drift) {
                // One final correction attempt
                restoreMapPosition(map, position);
              } else {
                // Position is stable and correct, we're done
                console.log("Drawing canvas position stabilized successfully");
                stabilizationComplete = true;
                google.maps.event.removeListener(preventMoveListener);
                google.maps.event.removeListener(idleListener);
              }
            }
          }
        });

        // Safety cleanup - using a much shorter timeout now that we have event-based monitoring
        const cleanupTimeout = setTimeout(() => {
          if (!stabilizationComplete) {
            google.maps.event.removeListener(preventMoveListener);
            google.maps.event.removeListener(idleListener);
            stabilizationComplete = true;
          }
        }, 2000);

        // Cleanup on unmount
        return () => {
          clearTimeout(cleanupTimeout);
          if (!stabilizationComplete) {
            google.maps.event.removeListener(preventMoveListener);
            google.maps.event.removeListener(idleListener);
          }
        };
      }
      // Fallback: use other available sources
      else if (
        window.__savedMapPosition &&
        Date.now() - window.__savedMapPosition.timestamp < 10000
      ) {
        // Use window saved position
        console.log("DrawingCanvas: Using window saved position");
      } else if (typeof globalMapState !== "undefined" && globalMapState.hasInitialized) {
        // Use global map state
        console.log("DrawingCanvas: Using global map state");
      } else {
        // Last resort: save current position
        const position = saveMapPosition(mapRef.current);
        savedPositionRef.current = position;
        console.log("SavedPosition on DrawingCanvas mount (fallback):", position);
      }
    }
  }, [mapRef, isDrawingMode]);

  // Clear the canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Initialize canvas when drawing mode changes
  useEffect(() => {
    if (!isDrawingMode) {
      clearCanvas();
      setDrawnPoints([]);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || !mapRef.current) return;

    // Set canvas dimensions to match the map container exactly
    const resizeCanvas = () => {
      if (canvas && mapRef.current) {
        const mapDiv = mapRef.current.getDiv();
        const mapRect = mapDiv.getBoundingClientRect();

        // Set canvas size to match map size
        canvas.width = mapRect.width;
        canvas.height = mapRect.height;

        // Position canvas exactly over the map
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";

        clearCanvas();
      }
    };

    // Initial setup
    resizeCanvas();

    // Reposition on resize
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isDrawingMode, clearCanvas, mapRef]);

  // Convert pixel coordinates to LatLng
  const pixelToLatLng = useCallback(
    (point: Point): LatLng | null => {
      if (!mapRef.current) return null;

      const map = mapRef.current;

      try {
        // Get the current map bounds
        const bounds = map.getBounds();
        if (!bounds) return null;

        // Get the map container dimensions
        const mapDiv = map.getDiv();
        const width = mapDiv.offsetWidth;
        const height = mapDiv.offsetHeight;

        // Get the northeast and southwest corners
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        // Calculate the lat/lng per pixel
        const lngPerPx = (ne.lng() - sw.lng()) / width;
        const latPerPx = (ne.lat() - sw.lat()) / height;

        // Convert point to lat/lng
        // Note: Y is inverted (0 is top, height is bottom)
        const lng = sw.lng() + point.x * lngPerPx;
        const lat = ne.lat() - point.y * latPerPx;

        return { lat, lng };
      } catch (error) {
        console.error("Error converting pixel to LatLng:", error);
        return null;
      }
    },
    [mapRef]
  );

  // Process drawing completion
  const finishDrawing = useCallback(() => {
    if (drawnPoints.length < 3) {
      console.warn("Not enough points to create a valid polygon");
      clearCanvas();
      setDrawnPoints([]);
      setIsDrawing(false);
      return;
    }

    // Convert pixel points to LatLng
    const latLngPoints: LatLng[] = [];

    // Convert all drawn points to LatLng
    drawnPoints.forEach((point) => {
      const latLng = pixelToLatLng(point);
      if (latLng) {
        latLngPoints.push(latLng);
      }
    });

    // Add the first point at the end to close the polygon
    if (latLngPoints.length > 0) {
      latLngPoints.push(latLngPoints[0]);
    }

    // Simplify points to reduce number while preserving shape
    const simplifiedLatLngPoints = simplifyPoints(latLngPoints);

    // Finish drawing if we have enough points
    if (simplifiedLatLngPoints.length >= 3) {
      console.log("Drawing completed with", simplifiedLatLngPoints.length, "points");
      onDrawingFinish(simplifiedLatLngPoints);
    } else {
      console.warn("Not enough points after simplification");
    }

    // Reset drawing state
    setIsDrawing(false);
    setDrawnPoints([]);
    clearCanvas();
  }, [drawnPoints, pixelToLatLng, clearCanvas, onDrawingFinish]);

  // Simplify points to reduce complexity while maintaining shape
  const simplifyPoints = (points: LatLng[]): LatLng[] => {
    if (points.length < 3) return points;

    // Convert to format expected by simplify library
    const formattedPoints = points.map((p) => ({ x: p.lng, y: p.lat }));

    // Simplify the points - adjust tolerance as needed
    const simplified = simplify(formattedPoints, 0.00001, true);

    // Convert back to LatLng format
    return simplified.map((p) => ({ lat: p.y, lng: p.x }));
  };

  // Enhanced pointer/touch event handlers for better mobile experience
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingMode) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      // Prevent default to avoid map panning during drawing
      e.preventDefault();

      // Start a new path
      setIsDrawing(true);

      // Calculate position relative to canvas
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Save touch position for mobile devices to help with tracking
      if (e.pointerType === "touch") {
        setLastTouchPosition({ x, y });
      }

      // Adjust line width based on device type and pressure
      const lineWidth = isMobileDevice ? 3 : 3; // Reduced from 5 to 3 for mobile
      const pressure = e.pressure > 0 ? e.pressure : 1;

      // Start drawing path
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = lineWidth * (isMobileDevice ? 1 : 1) * pressure; // Removed the 1.5 multiplier for mobile
      ctx.strokeStyle = "#6B21A8"; // Primary color
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Save the first point
      setDrawnPoints([{ x, y }]);
    },
    [isDrawingMode, isMobileDevice]
  );

  // Handle pointer movement to track cursor position for custom cursor indicator
  const handlePointerMovement = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCursorPosition({ x, y });
  }, []);

  // Update the handlePointerMove function to also handle cursor position tracking
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing || !isDrawingMode) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      // Prevent default to avoid map panning during drawing
      e.preventDefault();
      e.stopPropagation();

      // Calculate position relative to canvas
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // For touch events, check if this is a significant movement
      // This helps prevent tiny accidental movements on touch devices
      if (e.pointerType === "touch" && lastTouchPosition) {
        const distance = Math.sqrt(
          Math.pow(x - lastTouchPosition.x, 2) + Math.pow(y - lastTouchPosition.y, 2)
        );

        // Skip if movement is too small - reduces jitter on mobile
        if (distance < 2) return;

        // Update last touch position
        setLastTouchPosition({ x, y });
      }

      // Continue the drawing path with pressure sensitivity for devices that support it
      ctx.lineTo(x, y);

      // Adjust line width for mobile and pressure if available
      if (e.pressure > 0 && e.pointerType !== "mouse") {
        ctx.lineWidth = (isMobileDevice ? 3 : 3) * e.pressure; // Reduced from 5 to 3 for mobile
      }

      ctx.stroke();

      // Update cursor position
      setCursorPosition({ x, y });

      // Save point
      setDrawnPoints((prev) => [...prev, { x, y }]);
    },
    [isDrawing, isDrawingMode, lastTouchPosition, isMobileDevice]
  );

  // Handle touch-specific events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isDrawingMode || e.touches.length !== 1) return;

      // For single touch drawing - already handled by pointer events
      // But could add additional logic for multi-touch in the future
    },
    [isDrawingMode]
  );

  // Add pinch detection for zooming
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDrawingMode) return;

      // Prevent default touch behavior, especially important on iOS
      e.preventDefault();

      // Handle multi-touch gestures if needed in the future
      if (e.touches.length >= 2) {
        // For future implementation: pinch-to-zoom could be added here
      }
    },
    [isDrawingMode]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing) return;
      e.preventDefault();

      // Only process if we have enough points
      if (drawnPoints.length > 2) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && canvas) {
          // Close the path visually by connecting to the first point
          const firstPoint = drawnPoints[0];
          ctx.lineTo(firstPoint.x, firstPoint.y);
          ctx.stroke();
          ctx.closePath();
        }

        // Small delay to ensure UI updates before processing
        setTimeout(() => {
          finishDrawing();
        }, 50);
      } else {
        // Not enough points to form a valid shape
        clearCanvas();
        setDrawnPoints([]);
        setIsDrawing(false);
      }
    },
    [isDrawing, drawnPoints, clearCanvas, finishDrawing]
  );

  // Cancel drawing with smooth transition
  const handleCancel = useCallback(() => {
    // First set fading out state to trigger smooth transition
    setFadingOut(true);

    // Capture current map position exactly before doing anything else
    const map = mapRef.current;
    if (!map) {
      onCancel();
      return;
    }

    // Get exact position
    const position = {
      center: map.getCenter(),
      zoom: map.getZoom(),
    };

    // Wait for fade transition to complete
    setTimeout(() => {
      // Update cancellation state for stability across components
      try {
        if (typeof cancellationState !== "undefined" && position.center && position.zoom) {
          cancellationState.center = {
            lat: position.center.lat(),
            lng: position.center.lng(),
          };
          cancellationState.zoom = position.zoom;
          cancellationState.hasInitialized = true;
          console.log("Canvas: Set cancellation state", cancellationState);
        }
      } catch (error) {
        console.error("Error updating cancellation state:", error);
      }

      // Reset canvas state
      clearCanvas();
      setDrawnPoints([]);
      setIsDrawing(false);

      // Very important: call onCancel BEFORE applying any position changes
      // This prevents race conditions with other component lifecycle events
      onCancel();

      // Apply position after a short delay (gives map time to process onCancel)
      setTimeout(() => {
        if (map && position.center && position.zoom) {
          // Set position back exactly to avoid jumps
          map.setCenter(position.center);
          map.setZoom(position.zoom);
          console.log("Position restored after cancel", {
            lat: position.center.lat(),
            lng: position.center.lng(),
            zoom: position.zoom,
          });
        }
      }, 50);
    }, 150); // Matches transition duration
  }, [clearCanvas, onCancel, mapRef]);

  // Toggle drawing tips visibility
  const toggleTips = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTips((prev) => !prev);
  }, []);

  if (!isDrawingMode) return null;

  return (
    <div
      className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ease-in-out ${fadingOut ? "opacity-0" : "opacity-100"}`}
    >
      {/* Canvas for drawing with touch enhancements */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none pointer-events-auto"
        style={{
          cursor: "crosshair",
          // Apply a subtle highlight effect to indicate drawing area
          boxShadow: "inset 0 0 0 4px rgba(126, 34, 206, 0.3)",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerOut={handlePointerUp}
        onMouseMove={handlePointerMovement}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      />

      {/* Custom cursor indicator - only show on desktop */}
      {cursorPosition && !isDrawing && !isMobileDevice && (
        <div
          className="absolute w-8 h-8 flex items-center justify-center pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
          }}
        >
          <div className="w-4 h-4 bg-purple-600 rounded-full opacity-30"></div>
          <div className="absolute w-6 h-6 border-2 border-purple-600 rounded-full"></div>
        </div>
      )}

      {/* Collapsible Drawing Tips for Mobile - moved to bottom left */}
      {isMobileDevice ? (
        <div className="absolute bottom-24 left-4 z-20 pointer-events-auto">
          {showTips ? (
            <div className="bg-white/95 backdrop-blur-sm p-3 rounded-md shadow-md border border-purple-100 max-w-[180px]">
              <div className="flex justify-between mb-1">
                <div className="font-medium text-purple-800 text-xs">Drawing Tips:</div>
                <button
                  onClick={toggleTips}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close tips"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="text-xs space-y-1 text-gray-700">
                <li className="flex items-start gap-1.5">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1"></div>
                  <span>Use finger to draw</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1"></div>
                  <span>Draw slowly for accuracy</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1"></div>
                  <span>Simple shapes work best</span>
                </li>
              </ul>
            </div>
          ) : (
            <button
              onClick={toggleTips}
              className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white shadow-lg cursor-pointer"
              aria-label="Show drawing tips"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div className="absolute top-1/2 left-8 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-md shadow-md border border-purple-100 z-20 max-w-xs">
          <div className="font-medium text-purple-800 mb-2">Drawing Tips:</div>
          <ul className="text-sm space-y-1 text-gray-700">
            <li className="flex items-center gap-1">
              <div className="w-1 h-1 bg-purple-600 rounded-full"></div>
              <span>Click and drag to draw a shape</span>
            </li>
            <li className="flex items-center gap-1">
              <div className="w-1 h-1 bg-purple-600 rounded-full"></div>
              <span>Release to complete drawing</span>
            </li>
            <li className="flex items-center gap-1">
              <div className="w-1 h-1 bg-purple-600 rounded-full"></div>
              <span>Simple shapes work best</span>
            </li>
          </ul>
        </div>
      )}

      {/* Control buttons with consistent positioning across all devices */}
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="flex items-center gap-2 shadow-md transition-all duration-200 bg-white/90 backdrop-blur-sm border-2 border-purple-600 py-2 px-4 text-purple-800 font-medium"
        >
          <X className={`${isTablet ? "w-5 h-5" : "w-4 h-4"} mr-1`} />
          Cancel Drawing
        </Button>
      </div>
    </div>
  );
}
