"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import simplify from "simplify-js";

// ========================================================================
// SHARED STATE & TYPES
// ========================================================================

// Persistent position tracking state at module level to prevent position loss
// during component unmounts/remounts
const v2CancellationState = {
  center: { lat: 0, lng: 0 },
  zoom: 0,
  hasInitialized: false,
};

interface Point {
  x: number;
  y: number;
}

interface LatLng {
  lat: number;
  lng: number;
}

interface DrawingCanvasProps {
  mapRef: React.RefObject<google.maps.Map>;
  onDrawingFinish: (points: LatLng[]) => void;
  onCancel: () => void;
}

/**
 * Drawing canvas component that overlays Google Maps
 * Allows users to draw custom polygons for geographic searches
 */
export default function DrawingCanvas({ mapRef, onDrawingFinish, onCancel }: DrawingCanvasProps) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  // Theme management
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  // Theme-aware colors
  const themeColors = {
    primary: isDarkMode ? "#a78bfa" : "#6B21A8", // Light purple in dark mode, darker purple in light mode
    secondary: isDarkMode ? "#8b5cf6" : "#7928CA", // Secondary purple
    stroke: isDarkMode ? "#a78bfa" : "#6B21A8", // Line stroke color
    fill: isDarkMode ? "rgba(167, 139, 250, 0.3)" : "rgba(107, 33, 168, 0.2)", // Semi-transparent fill
    background: isDarkMode ? "#1f2937" : "#ffffff", // Background for UI elements
    backgroundTransparent: isDarkMode ? "rgba(31, 41, 55, 0.9)" : "rgba(255, 255, 255, 0.9)", // Transparent background
    border: isDarkMode ? "#4c1d95" : "#f3e8ff", // Border color
    text: isDarkMode ? "#e5e7eb" : "#1e293b", // Main text color
    textMuted: isDarkMode ? "#9ca3af" : "#64748b", // Secondary text color
    textHighlight: isDarkMode ? "#c4b5fd" : "#6B21A8", // Highlighted text
    indicator: isDarkMode ? "#a78bfa" : "#6B21A8", // Indicators and bullets
    shadow: isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)", // Shadow color
  };

  // DOM and drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<Point[]>([]);
  const [fadingOut, setFadingOut] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);

  // UI state
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showTips, setShowTips] = useState(true);

  // ========================================================================
  // CANVAS & MAP UTILITIES
  // ========================================================================

  // Clear canvas content
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Convert pixel coordinates to map coordinates
  const pixelToLatLng = useCallback(
    (point: Point): LatLng | null => {
      if (!mapRef.current) return null;

      try {
        const map = mapRef.current;
        const bounds = map.getBounds();
        if (!bounds) {
          console.warn("Map bounds not available for coordinate conversion");
          return null;
        }

        // Get map dimensions
        const mapDiv = map.getDiv();
        if (!mapDiv) return null;

        const width = mapDiv.offsetWidth;
        const height = mapDiv.offsetHeight;
        if (width === 0 || height === 0) return null;

        // Calculate conversion factors based on map bounds
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const lngPerPx = (ne.lng() - sw.lng()) / width;
        const latPerPx = (ne.lat() - sw.lat()) / height;

        // Convert screen position to geographic coordinates
        const lng = sw.lng() + point.x * lngPerPx;
        const lat = ne.lat() - point.y * latPerPx; // Y is inverted in screen coordinates

        return { lat, lng };
      } catch (error) {
        console.error("Error converting pixel to LatLng:", error);
        return null;
      }
    },
    [mapRef]
  );

  // Reduce point complexity while preserving shape
  const simplifyPoints = useCallback((points: LatLng[]): LatLng[] => {
    if (points.length < 3) return points;

    // Format for simplify.js library
    const formattedPoints = points.map((p) => ({ x: p.lng, y: p.lat }));

    // Simplify with appropriate tolerance (adjust as needed)
    const simplified = simplify(formattedPoints, 0.00001, true);

    // Convert back to LatLng format
    return simplified.map((p) => ({ lat: p.y, lng: p.x }));
  }, []);

  // ========================================================================
  // LIFECYCLE HOOKS
  // ========================================================================

  // Device detection
  useEffect(() => {
    // Detect mobile devices by user agent or screen size
    setIsMobileDevice(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768
    );

    // Auto-hide drawing tips on very small screens
    if (window.innerWidth < 360) {
      setShowTips(false);
    }
  }, []);

  // Canvas initialization and position stabilization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapRef.current) return;

    const map = mapRef.current;

    // 1. Temporarily disable map interactions during setup to prevent jitter
    map.setOptions({
      draggable: false,
      scrollwheel: false,
      disableDoubleClickZoom: true,
    });

    // 2. Capture the current map position (highest priority source of truth)
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();

    // 3. Determine initial position from current map state or fallback
    let initialPosition = null;

    if (currentCenter && currentZoom) {
      // Use current map position (preferred)
      initialPosition = { center: currentCenter, zoom: currentZoom };

      // Update shared state with current position
      v2CancellationState.center = {
        lat: currentCenter.lat(),
        lng: currentCenter.lng(),
      };
      v2CancellationState.zoom = currentZoom;
      v2CancellationState.hasInitialized = true;

      console.log("DrawingCanvas: Using current map position", {
        lat: currentCenter.lat(),
        lng: currentCenter.lng(),
        zoom: currentZoom,
      });
    } else if (v2CancellationState.hasInitialized) {
      // Fallback to saved position if available
      initialPosition = {
        center: new google.maps.LatLng(
          v2CancellationState.center.lat,
          v2CancellationState.center.lng
        ),
        zoom: v2CancellationState.zoom,
      };
      console.log("DrawingCanvas: Using saved position");
    }

    // 4. Apply position immediately for smoother user experience
    if (initialPosition) {
      requestAnimationFrame(() => {
        map.setCenter(initialPosition.center);
        map.setZoom(initialPosition.zoom);
      });
    }

    // 5. Set up canvas dimensions
    const resizeCanvas = () => {
      if (canvas && mapRef.current) {
        const mapDiv = mapRef.current.getDiv();
        const mapRect = mapDiv.getBoundingClientRect();

        canvas.width = mapRect.width;
        canvas.height = mapRect.height;
        clearCanvas();
      }
    };

    // Initial setup and resize listener
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 6. Position stability monitoring with gentle correction
    let positionCheckCount = 0;
    const MAX_POSITION_CHECKS = 3;

    const checkPositionStability = () => {
      if (positionCheckCount >= MAX_POSITION_CHECKS || !initialPosition || !mapRef.current) return;

      const map = mapRef.current;
      const currentPos = map.getCenter();
      const currentZm = map.getZoom();

      if (currentPos && currentZm && initialPosition) {
        // Check for significant position drift
        const hasDrifted =
          Math.abs(currentPos.lat() - initialPosition.center.lat()) > 0.0001 ||
          Math.abs(currentPos.lng() - initialPosition.center.lng()) > 0.0001 ||
          currentZm !== initialPosition.zoom;

        if (hasDrifted) {
          console.log("DrawingCanvas: Correcting position drift");
          map.setCenter(initialPosition.center);
          map.setZoom(initialPosition.zoom);
          positionCheckCount++;
        }
      }
    };

    // Check position with smooth timing
    checkPositionStability();
    const stabilityCheck = setInterval(checkPositionStability, 150);

    // 7. Re-enable necessary map controls after stabilization
    setTimeout(() => {
      clearInterval(stabilityCheck);

      // Keep dragging disabled but restore other controls
      map.setOptions({
        scrollwheel: true,
        disableDoubleClickZoom: false,
      });
    }, 400);

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      clearInterval(stabilityCheck);

      // Restore all map controls if component unmounts
      if (mapRef.current) {
        mapRef.current.setOptions({
          draggable: true,
          scrollwheel: true,
          disableDoubleClickZoom: false,
        });
      }
    };
  }, [mapRef, clearCanvas]);

  // ========================================================================
  // DRAWING HANDLERS
  // ========================================================================

  // Complete drawing and convert to map polygon
  const finishDrawing = useCallback(() => {
    if (drawnPoints.length < 3) {
      console.warn("Not enough points to create a valid polygon");
      clearCanvas();
      setDrawnPoints([]);
      setIsDrawing(false);
      return;
    }

    // Get map and capture position
    const map = mapRef.current;
    if (!map) {
      setIsDrawing(false);
      return;
    }

    // Save exact position for restoration
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    let savedPosition = null;

    if (currentCenter && currentZoom) {
      savedPosition = { center: currentCenter, zoom: currentZoom };

      // Update shared state
      v2CancellationState.center = {
        lat: currentCenter.lat(),
        lng: currentCenter.lng(),
      };
      v2CancellationState.zoom = currentZoom;
      v2CancellationState.hasInitialized = true;

      console.log("Saved position before finishing drawing");
    }

    // Disable map interactions temporarily
    map.setOptions({
      draggable: false,
      scrollwheel: false,
      zoomControl: false,
      disableDoubleClickZoom: true,
    });

    // Convert screen points to geographic coordinates
    const latLngPoints: LatLng[] = [];
    drawnPoints.forEach((point) => {
      const latLng = pixelToLatLng(point);
      if (latLng) {
        latLngPoints.push(latLng);
      }
    });

    // Close the polygon
    if (latLngPoints.length > 0) {
      latLngPoints.push(latLngPoints[0]);
    }

    // Optimize point count
    const simplifiedPoints = simplifyPoints(latLngPoints);

    // Reset drawing state
    setIsDrawing(false);

    // Use animation frames for smooth visual transitions
    requestAnimationFrame(() => {
      // Clear canvas in first frame
      clearCanvas();
      setDrawnPoints([]);

      // Process and notify parent in next frame
      requestAnimationFrame(() => {
        if (simplifiedPoints.length >= 3) {
          console.log(`Drawing completed with ${simplifiedPoints.length} points`);

          // Restore position for stability
          if (savedPosition && map) {
            map.setCenter(savedPosition.center);
            map.setZoom(savedPosition.zoom);
          }

          // Notify parent component
          onDrawingFinish(simplifiedPoints);

          // Re-enable map controls after a short delay
          setTimeout(() => {
            if (map) {
              map.setOptions({
                draggable: true,
                scrollwheel: true,
                zoomControl: true,
                disableDoubleClickZoom: false,
              });
            }
          }, 50);
        } else {
          console.warn("Not enough points after simplification");

          // Re-enable map controls
          if (map) {
            map.setOptions({
              draggable: true,
              scrollwheel: true,
              zoomControl: true,
              disableDoubleClickZoom: false,
            });
          }
        }
      });
    });
  }, [drawnPoints, pixelToLatLng, clearCanvas, onDrawingFinish, mapRef, simplifyPoints]);

  // Start drawing on pointer down
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      e.preventDefault(); // Prevent map panning

      // Begin new drawing path
      setIsDrawing(true);

      // Calculate position relative to canvas
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Setup drawing style
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = isMobileDevice ? 3 : 2;
      ctx.strokeStyle = themeColors.stroke; // Use theme-aware color
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Store first point
      setDrawnPoints([{ x, y }]);
    },
    [isMobileDevice, themeColors]
  );

  // Continue drawing on pointer move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // Always update cursor position for indicator
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCursorPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }

      // Only draw if actively drawing
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      // Prevent map interactions during drawing
      e.preventDefault();
      e.stopPropagation();

      // Calculate position
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Draw line segment
      ctx.lineTo(x, y);
      ctx.stroke();

      // Add point to drawing
      setDrawnPoints((prev) => [...prev, { x, y }]);
    },
    [isDrawing]
  );

  // Complete drawing on pointer up
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing) return;
      e.preventDefault();

      // Capture current points
      const points = [...drawnPoints];

      // Only process if we have enough points for a valid shape
      if (points.length > 2) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");

        // Close the visual path by connecting to first point
        if (ctx && canvas) {
          const firstPoint = points[0];
          ctx.lineTo(firstPoint.x, firstPoint.y);
          ctx.stroke();
          ctx.closePath();
        }

        // Small delay for visual feedback before processing
        setTimeout(() => {
          finishDrawing();
        }, 50);
      } else {
        // Not enough points for valid shape
        clearCanvas();
        setDrawnPoints([]);
        setIsDrawing(false);
      }
    },
    [isDrawing, drawnPoints, clearCanvas, finishDrawing]
  );

  // Cancel drawing with animation
  const handleCancel = useCallback(() => {
    // First capture the exact map position before any state changes
    const map = mapRef.current;
    if (!map) {
      onCancel();
      return;
    }

    // Get current position exactly
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();

    // Store position for restoration both locally and in the global state
    if (currentCenter && currentZoom) {
      // Update the global cancellation state that persists across unmounts
      v2CancellationState.center = {
        lat: currentCenter.lat(),
        lng: currentCenter.lng(),
      };
      v2CancellationState.zoom = currentZoom;
      v2CancellationState.hasInitialized = true;

      console.log("Cancel Drawing: Captured position before cancel", {
        lat: currentCenter.lat(),
        lng: currentCenter.lng(),
        zoom: currentZoom,
      });
    }

    // IMPORTANT: Disable map movements during the transition to prevent shaking
    if (map) {
      map.setOptions({
        draggable: false,
        scrollwheel: false,
        zoomControl: false,
        disableDoubleClickZoom: true,
      });
    }

    // Set fading out state for animation
    setFadingOut(true);

    // Clean up canvas immediately
    setIsDrawing(false);

    // Use requestAnimationFrame for smoother visual transitions
    requestAnimationFrame(() => {
      // Clear the canvas
      clearCanvas();
      setDrawnPoints([]);

      // Call onCancel in the next animation frame to ensure visual changes complete first
      requestAnimationFrame(() => {
        // Call onCancel to trigger parent state updates
        onCancel();

        // Use a final animation frame to restore position after parent updates
        requestAnimationFrame(() => {
          if (map && currentCenter && currentZoom) {
            // Force position restoration with exact values - critical for stability
            map.setCenter(currentCenter);
            map.setZoom(currentZoom);

            // Re-enable map controls after position is restored
            map.setOptions({
              draggable: true,
              scrollwheel: true,
              zoomControl: true,
              disableDoubleClickZoom: false,
            });

            console.log("Cancel Drawing: Position restored without shaking");
          }
        });
      });
    });
  }, [clearCanvas, onCancel, mapRef]);

  // Toggle tips visibility
  const toggleTips = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTips((prev) => !prev);
  }, []);

  return (
    <div
      className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ${fadingOut ? "opacity-0" : "opacity-100"}`}
    >
      {/* Drawing canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none pointer-events-auto"
        style={{
          cursor: "crosshair",
          boxShadow: `inset 0 0 0 4px ${themeColors.fill}`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Custom cursor indicator (desktop only) */}
      {cursorPosition && !isDrawing && !isMobileDevice && (
        <div
          className="absolute w-8 h-8 flex items-center justify-center pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
          }}
        >
          <div
            className="w-4 h-4 rounded-full opacity-30"
            style={{ backgroundColor: themeColors.primary }}
          />
          <div
            className="absolute w-6 h-6 rounded-full border-2"
            style={{ borderColor: themeColors.primary }}
          />
        </div>
      )}

      {/* Drawing instructions */}
      {isMobileDevice ? (
        // Mobile instructions
        <div className="absolute bottom-20 left-4 z-20 pointer-events-auto">
          {showTips ? (
            <div
              className="backdrop-blur-sm p-3 rounded-md shadow-md max-w-[180px]"
              style={{
                backgroundColor: themeColors.backgroundTransparent,
                borderColor: themeColors.border,
                borderWidth: "1px",
                color: themeColors.text,
                boxShadow: `0 4px 6px ${themeColors.shadow}`,
              }}
            >
              <div className="flex justify-between mb-1">
                <div className="font-medium text-xs" style={{ color: themeColors.textHighlight }}>
                  Drawing Tips:
                </div>
                <button
                  onClick={toggleTips}
                  className="hover:opacity-80"
                  style={{ color: themeColors.textMuted }}
                  aria-label="Close tips"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="text-xs space-y-1" style={{ color: themeColors.text }}>
                <li className="flex items-start gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1"
                    style={{ backgroundColor: themeColors.indicator }}
                  />
                  <span>Use finger to draw</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1"
                    style={{ backgroundColor: themeColors.indicator }}
                  />
                  <span>Draw slowly for accuracy</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1"
                    style={{ backgroundColor: themeColors.indicator }}
                  />
                  <span>Simple shapes work best</span>
                </li>
              </ul>
            </div>
          ) : (
            <button
              onClick={toggleTips}
              className="rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: themeColors.primary,
                color: isDarkMode ? "#1f2937" : "#ffffff",
                boxShadow: `0 4px 6px ${themeColors.shadow}`,
              }}
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
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        // Desktop instructions
        <div
          className="absolute top-1/2 left-8 transform -translate-y-1/2 backdrop-blur-sm p-3 rounded-md shadow-md z-20 max-w-xs"
          style={{
            backgroundColor: themeColors.backgroundTransparent,
            borderColor: themeColors.border,
            borderWidth: "1px",
            color: themeColors.text,
            boxShadow: `0 4px 6px ${themeColors.shadow}`,
          }}
        >
          <div className="font-medium mb-2" style={{ color: themeColors.textHighlight }}>
            Drawing Tips:
          </div>
          <ul className="text-sm space-y-1" style={{ color: themeColors.text }}>
            <li className="flex items-center gap-1">
              <div
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: themeColors.indicator }}
              />
              <span>Click and drag to draw a shape</span>
            </li>
            <li className="flex items-center gap-1">
              <div
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: themeColors.indicator }}
              />
              <span>Release to complete drawing</span>
            </li>
            <li className="flex items-center gap-1">
              <div
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: themeColors.indicator }}
              />
              <span>Simple shapes work best</span>
            </li>
          </ul>
        </div>
      )}

      {/* Cancel button */}
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="flex items-center gap-2 shadow-md transition-all duration-200 backdrop-blur-sm py-2 px-4 font-medium"
          style={{
            backgroundColor: themeColors.backgroundTransparent,
            borderColor: themeColors.primary,
            borderWidth: "2px",
            color: themeColors.textHighlight,
            boxShadow: `0 4px 6px ${themeColors.shadow}`,
          }}
        >
          <X className="w-4 h-4 mr-1" style={{ color: themeColors.textHighlight }} />
          Cancel Drawing
        </Button>
      </div>
    </div>
  );
}
