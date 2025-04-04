import { type PropertyCardProps } from "@/components/listings/property-cards/property-card";

/**
 * Represents a property to be displayed on the map
 * Extends PropertyCardProps with necessary map-specific properties
 */
export interface MapProperty extends Partial<PropertyCardProps> {
  /**
   * Unique identifier for the property
   */
  id: string;

  /**
   * Display title of the property
   */
  title: string;

  /**
   * Geographic coordinates for the property's position on the map
   * If not provided, the property won't be displayed on the map
   */
  mapLocation?: {
    /** Latitude coordinate */
    lat: number;
    /** Longitude coordinate */
    lng: number;
  };

  // Allow additional properties with string indexing
  [key: string]: unknown;
}

/**
 * Data structure for boundary information created by the drawing tools
 * Contains all the necessary geographic data to represent a search area
 */
export interface BoundaryData {
  /**
   * Google Maps Polygon object that visually represents the boundary
   * Can be used for checking if points are contained within the polygon
   */
  polygon: google.maps.Polygon;

  /**
   * Rectangular bounds that contain the entire polygon
   * Useful for map positioning and rough filtering
   */
  bounds: google.maps.LatLngBounds;

  /**
   * Center point of the boundary, calculated from the bounds
   * Used for radius-based searches and visualization
   */
  center: google.maps.LatLng;

  /**
   * Maximum distance from center to any point in the polygon
   * Measured in meters, useful for radius-based filtering
   */
  radius: number;
}

/**
 * Props for the PropertyMap component
 */
export interface PropertyMapProps {
  /**
   * Array of properties to display on the map
   * Only properties with valid mapLocation coordinates will be shown
   */
  properties: MapProperty[];

  /**
   * Callback fired when a property marker is clicked
   * @param propertyId - ID of the clicked property
   */
  onMarkerClick?: (propertyId: string) => void;

  /**
   * Callback fired when the map viewport bounds change
   * @param bounds - Current bounds of the map view, or null if not available
   */
  onBoundsChange?: (bounds: google.maps.LatLngBounds | null) => void;

  /**
   * Callback fired when a drawing is completed
   * @param data - Boundary data containing polygon, bounds, center, and radius
   */
  onDrawComplete?: (data: BoundaryData) => void;

  /**
   * Controls whether the map is in drawing mode
   * When true, displays the drawing canvas and disables map interactions
   * Default is false
   */
  isDrawingMode?: boolean;

  /**
   * Function to toggle drawing mode on or off
   * Called automatically when drawing is completed or cancelled
   */
  toggleDrawingMode?: () => void;

  /**
   * Additional CSS class names to apply to the map container
   * Default is an empty string
   */
  className?: string;

  /**
   * Whether to preserve the current map view when properties change
   * When false, the map will auto-fit to show all markers
   * Default is false
   */
  preserveView?: boolean;

  /**
   * Callback fired when boundary status changes
   * @param hasBoundary - Boolean indicating if a boundary is active
   */
  onBoundaryChange?: (hasBoundary: boolean) => void;

  /**
   * Explicitly controls dark mode for the map
   * When undefined, uses theme from context
   * When provided, overrides the theme context value
   */
  darkMode?: boolean; // Optional prop - if not provided, will use theme context

  /**
   * Custom control components to render within the map
   * Allows overriding default UI with custom components
   */
  renderControls?: {
    /** Custom component to replace the default clear boundary button */
    clearBoundaryButton?: React.ReactNode;
    /** Custom component to replace the default cancel drawing button */
    cancelDrawingButton?: React.ReactNode;
  };

  /**
   * Initial boundary configuration to display on mount
   * Can specify either bounds or center/radius for the initial boundary
   */
  initialBoundary?: {
    /** Bounds for the initial boundary, takes precedence if provided */
    bounds: google.maps.LatLngBounds | null;
    /** Center point for the initial boundary */
    center: google.maps.LatLng | null;
    /** Radius in meters for the initial boundary */
    radius: number | null;
  };
}

/**
 * Represents a point in pixel coordinates
 * Used for drawing operations on the canvas
 */
export interface Point {
  /** X coordinate in pixels */
  x: number;
  /** Y coordinate in pixels */
  y: number;
}

/**
 * Represents a geographic coordinate
 * Used for mapping between canvas points and map locations
 */
export interface LatLng {
  /** Latitude coordinate */
  lat: number;
  /** Longitude coordinate */
  lng: number;
}

/**
 * Props for the DrawingCanvas component
 */
export interface DrawingCanvasProps {
  /**
   * Reference to the Google Maps instance
   * Used to access map methods and convert between pixel and geo coordinates
   */
  mapRef: React.RefObject<google.maps.Map>;

  /**
   * Callback fired when drawing is completed
   * @param points - Array of geographic coordinates defining the drawn shape
   */
  onDrawingFinish: (points: LatLng[]) => void;

  /**
   * Callback fired when drawing is cancelled
   * Should typically exit drawing mode
   */
  onCancel: () => void;

  /**
   * Custom control components to render within the drawing canvas
   */
  renderControls?: {
    /** Custom component to replace the default cancel button */
    cancelDrawingButton?: React.ReactNode;
    /** Custom component to replace the drawing tips toggle button */
    drawingTipsToggleButton?: React.ReactNode;
  };
}
