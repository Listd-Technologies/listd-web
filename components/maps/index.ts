/**
 * Maps v2 Components
 *
 * This module provides improved components for map functionality:
 * - Better state management
 * - More reliable drawing tools
 * - Cleaner code structure
 */

// Main components
export { PropertyMap } from "./property-map";
export { PropertyMarker } from "./property-marker";
export { default as DrawingCanvas } from "./drawing-canvas";

// Constants
export { DEFAULT_CENTER, DEFAULT_ZOOM, DARK_MODE_STYLES } from "./constants/map-styles";

// Utility hooks
export { useBoundaryVisualization } from "./components/boundary-visualization";
export { useThemeColors } from "./utils/theme-utils";

// Helper functions
export {
  pixelToLatLng,
  simplifyPoints,
  detectMobileDevice,
} from "./utils/drawing-utils";
export { v2CancellationState } from "./utils/drawing-state";

// Types
export type {
  BoundaryData,
  DrawingCanvasProps,
  LatLng,
  MapProperty,
  Point,
  PropertyMapProps,
} from "./types/map-types";

// UI components
export { CancelDrawingButton } from "./components/cancel-drawing-button";
export { ClearBoundaryButton } from "./components/clear-boundary-button";
export { DrawingInstructions } from "./components/drawing-instructions";
export { DrawingModeIndicator } from "./components/drawing-mode-indicator";

// This is a default export for lazy loading
export { PropertyMap as default } from "./property-map";
