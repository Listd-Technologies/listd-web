import simplify from "simplify-js";
import { LatLng, Point } from "../types/map-types";

/**
 * Convert pixel coordinates to map coordinates
 */
export function pixelToLatLng(
  point: Point,
  mapRef: React.RefObject<google.maps.Map>
): LatLng | null {
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
}

/**
 * Reduce point complexity while preserving shape
 */
export function simplifyPoints(points: LatLng[]): LatLng[] {
  if (points.length < 3) return points;

  // Format for simplify.js library
  const formattedPoints = points.map((p) => ({ x: p.lng, y: p.lat }));

  // Simplify with appropriate tolerance (adjust as needed)
  const simplified = simplify(formattedPoints, 0.00001, true);

  // Convert back to LatLng format
  return simplified.map((p) => ({ lat: p.y, lng: p.x }));
}

/**
 * Detect if device is mobile
 */
export function detectMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );
}
