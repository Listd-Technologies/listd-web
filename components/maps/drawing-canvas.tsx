"use client";

import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Import extracted components and utilities
import { CancelDrawingButton } from "./components/cancel-drawing-button";
import { DrawingInstructions } from "./components/drawing-instructions";
import { DrawingCanvasProps, Point } from "./types/map-types";
import { v2CancellationState } from "./utils/drawing-state";
import { detectMobileDevice, pixelToLatLng, simplifyPoints } from "./utils/drawing-utils";
import { useThemeColors } from "./utils/theme-utils";

/**
 * DrawingCanvas - Freehand polygon drawing overlay for Google Maps
 *
 * This component renders a canvas over the Google Maps instance that allows users
 * to draw custom polygons for geographic searches. It handles all drawing interactions,
 * coordinates conversion between screen and map coordinates, and maintains map position
 * stability during the entire drawing process.
 *
 * Key features:
 * - Touch and mouse drawing support with device-specific optimizations
 * - Position stability that eliminates map jumps and flickers
 * - Theme awareness with dark/light mode support
 * - Visual guidance for users through drawing instructions
 * - Point simplification to optimize polygon performance
 *
 * @component
 * @example
 * ```tsx
 * // Within a parent component that manages drawing state:
 * const mapRef = useRef<google.maps.Map | null>(null);
 * const [isDrawingMode, setIsDrawingMode] = useState(false);
 *
 * // Conditional rendering based on drawing mode
 * {isDrawingMode && (
 *   <DrawingCanvas
 *     mapRef={mapRef}
 *     onDrawingFinish={handleDrawComplete}
 *     onCancel={() => setIsDrawingMode(false)}
 *   />
 * )}
 * ```
 */

// ========================================================================
// PROPS DOCUMENTATION
// ========================================================================

/**
 * @typedef {Object} DrawingCanvasProps Properties for the DrawingCanvas component
 *
 * @property {React.RefObject<google.maps.Map>} mapRef - Reference to the Google Maps instance.
 * This reference is used to access map methods, retrieve the current view position,
 * and convert between screen coordinates and geographic coordinates.
 * Example: useRef<google.maps.Map>(null)
 *
 * @property {function} onDrawingFinish - Callback fired when a drawing is completed.
 * Receives an array of geographic coordinates (lat/lng) defining the drawn polygon.
 * This function is typically used to create a boundary polygon on the map.
 * Example: (points) => { createMapPolygon(points); }
 *
 * @property {function} onCancel - Callback fired when drawing is cancelled.
 * Called when the user clicks the cancel button or when drawing should be aborted.
 * This function typically exits drawing mode in the parent component.
 * Example: () => { setIsDrawingMode(false); }
 *
 * @property {Object} [renderControls] - Custom control components to render within the drawing canvas.
 * Allows overriding default UI elements with custom components.
 * Example: { cancelDrawingButton: <CustomCancelButton />, drawingTipsToggleButton: <CustomTipsButton /> }
 * @property {React.ReactNode} [renderControls.cancelDrawingButton] - Custom component to replace the default cancel button
 * @property {React.ReactNode} [renderControls.drawingTipsToggleButton] - Custom component to replace the drawing tips toggle button
 */
export default function DrawingCanvas({
  mapRef,
  onDrawingFinish,
  onCancel,
  renderControls,
}: DrawingCanvasProps) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  /**
   * Theme management - automatically detects and adapts to dark/light mode
   * Used for styling the drawing interface appropriately for each theme
   */
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  // Get theme-aware colors
  const getThemeColors = useThemeColors(isDarkMode);
  const themeColors = getThemeColors();

  /**
   * Drawing state - tracks the current drawing status and collected points
   */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<Point[]>([]);
  const [fadingOut, setFadingOut] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);

  /**
   * UI state - controls device-specific behaviors and user guidance
   */
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showTips, setShowTips] = useState(true);

  // ========================================================================
  // CANVAS & MAP UTILITIES
  // ========================================================================

  /**
   * Clears all content from the drawing canvas
   * Used when resetting drawing state or cancelling the operation
   */
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // ========================================================================
  // LIFECYCLE HOOKS
  // ========================================================================

  /**
   * Device detection on component mount
   * Determines whether to use touch-optimized interactions and UI
   */
  useEffect(() => {
    // Detect mobile devices by user agent or screen size
    setIsMobileDevice(detectMobileDevice());

    // Auto-hide drawing tips on very small screens
    if (window.innerWidth < 360) {
      setShowTips(false);
    }
  }, []);

  /**
   * Canvas initialization and position stabilization
   * Critical for maintaining map position during drawing mode transitions
   *
   * This effect:
   * 1. Captures the exact map position to maintain consistency
   * 2. Configures canvas dimensions to match the map
   * 3. Sets up position stability monitoring
   * 4. Manages map interaction modes for drawing
   */
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

  /**
   * Completes the drawing process and converts screen points to a map polygon
   *
   * This function:
   * 1. Preserves the map position for stability
   * 2. Converts pixel coordinates to geographic coordinates
   * 3. Simplifies points for better performance (reduces point count)
   * 4. Notifies the parent component with the final polygon coordinates
   * 5. Manages canvas cleanup and map control restoration
   *
   * @returns {void}
   */
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
    const latLngPoints = [];
    for (const point of drawnPoints) {
      const latLng = pixelToLatLng(point, mapRef);
      if (latLng) {
        latLngPoints.push(latLng);
      }
    }

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

  /**
   * Initiates drawing when the user presses down on the canvas
   * Sets up the drawing context and starts tracking points
   *
   * @param {React.PointerEvent} e - Pointer event containing coordinate information
   */
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
      ctx.strokeStyle = themeColors.primary; // Use primary color instead of stroke
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Store first point
      setDrawnPoints([{ x, y }]);
    },
    [isMobileDevice, themeColors]
  );

  /**
   * Continues drawing as the user moves across the canvas
   * Tracks the cursor position and adds points to the drawing path
   *
   * @param {React.PointerEvent} e - Pointer event containing coordinate information
   */
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

  /**
   * Completes the drawing when the user releases the pointer
   * Finalizes the shape by connecting to the starting point
   *
   * @param {React.PointerEvent} e - Pointer event
   */
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

  /**
   * Cancels the drawing operation with a smooth transition
   * Preserves map position and restores controls without visual jumps
   *
   * This function uses precise position tracking and requestAnimationFrame
   * to ensure a flicker-free transition when cancelling
   */
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

  /**
   * Toggles the visibility of drawing instructions
   * Allows users to hide/show guidance tips while drawing
   *
   * @param {React.MouseEvent} e - Mouse event
   */
  const toggleTips = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTips((prev) => !prev);
  }, []);

  // ========================================================================
  // COMPONENT RENDERING
  // ========================================================================

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
      <DrawingInstructions
        isMobileDevice={isMobileDevice}
        showTips={showTips}
        toggleTips={toggleTips}
        themeColors={themeColors}
        isDarkMode={isDarkMode}
        renderControls={renderControls}
      />

      {/* Cancel button */}
      <CancelDrawingButton
        themeColors={themeColors}
        onCancel={handleCancel}
        renderControls={renderControls}
      />
    </div>
  );
}
