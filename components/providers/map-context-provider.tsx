"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from "react";

// Add type declarations for the global variables on window
declare global {
  interface Window {
    globalMapState?: {
      center: { lat: number; lng: number };
      zoom: number;
      hasInitialized: boolean;
    };
    cancellationState?: {
      center: { lat: number; lng: number };
      zoom: number;
      hasInitialized: boolean;
    };
  }
}

// Define the MapState interface
interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  hasInitialized: boolean;
  drawingModePosition: {
    center: { lat: number; lng: number };
    zoom: number;
    hasInitialized: boolean;
  };
  hasBoundary: boolean;
  boundaryData: {
    bounds: google.maps.LatLngBounds | null;
    center: google.maps.LatLng | null;
    radius: number | null;
    hasInitialized: boolean;
  };
  lastSyncTimestamp: number;
}

// Define the possible action types
type MapAction =
  | { type: "UPDATE_POSITION"; payload: { center: { lat: number; lng: number }; zoom: number } }
  | {
      type: "SAVE_DRAWING_POSITION";
      payload: { center: { lat: number; lng: number }; zoom: number };
    }
  | { type: "SET_HAS_BOUNDARY"; payload: boolean }
  | {
      type: "SET_BOUNDARY_DATA";
      payload: {
        bounds: google.maps.LatLngBounds | null;
        center: google.maps.LatLng | null;
        radius: number | null;
      };
    }
  | { type: "SYNC_STATE_COMPLETED"; payload: number }
  | { type: "RESET_POSITION" }
  | { type: "RESET_BOUNDARY" };

// Initial state with Manila, Philippines as default center
const initialState: MapState = {
  center: { lat: 14.5995, lng: 120.9842 },
  zoom: 14,
  hasInitialized: false,
  drawingModePosition: {
    center: { lat: 14.5995, lng: 120.9842 },
    zoom: 14,
    hasInitialized: false,
  },
  hasBoundary: false,
  boundaryData: {
    bounds: null,
    center: null,
    radius: null,
    hasInitialized: false,
  },
  lastSyncTimestamp: 0,
};

// Create context
const MapContext = createContext<{
  state: MapState;
  dispatch: React.Dispatch<MapAction>;
  saveCurrentPosition: () => void;
  getCurrentPosition: () => { center: { lat: number; lng: number }; zoom: number };
  saveDrawingPosition: () => void;
  getDrawingPosition: () => { center: { lat: number; lng: number }; zoom: number };
  setBoundaryData: (data: {
    bounds: google.maps.LatLngBounds | null;
    center: google.maps.LatLng | null;
    radius: number | null;
  }) => void;
  resetBoundary: () => void;
  syncStateWithMap: (map: google.maps.Map) => void;
}>({
  state: initialState,
  dispatch: () => null,
  saveCurrentPosition: () => {},
  getCurrentPosition: () => ({ center: initialState.center, zoom: initialState.zoom }),
  saveDrawingPosition: () => {},
  getDrawingPosition: () => ({
    center: initialState.drawingModePosition.center,
    zoom: initialState.drawingModePosition.zoom,
  }),
  setBoundaryData: () => {},
  resetBoundary: () => {},
  syncStateWithMap: () => {},
});

// Reducer function
function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case "UPDATE_POSITION":
      return {
        ...state,
        center: action.payload.center,
        zoom: action.payload.zoom,
        hasInitialized: true,
      };
    case "SAVE_DRAWING_POSITION":
      return {
        ...state,
        drawingModePosition: {
          center: action.payload.center,
          zoom: action.payload.zoom,
          hasInitialized: true,
        },
      };
    case "SET_HAS_BOUNDARY":
      return {
        ...state,
        hasBoundary: action.payload,
      };
    case "SET_BOUNDARY_DATA":
      return {
        ...state,
        boundaryData: {
          bounds: action.payload.bounds,
          center: action.payload.center,
          radius: action.payload.radius,
          hasInitialized: true,
        },
        hasBoundary: !!action.payload.bounds,
      };
    case "SYNC_STATE_COMPLETED":
      return {
        ...state,
        lastSyncTimestamp: action.payload,
      };
    case "RESET_POSITION":
      return {
        ...state,
        center: initialState.center,
        zoom: initialState.zoom,
        hasInitialized: false,
        drawingModePosition: initialState.drawingModePosition,
      };
    case "RESET_BOUNDARY":
      return {
        ...state,
        hasBoundary: false,
        boundaryData: {
          bounds: null,
          center: null,
          radius: null,
          hasInitialized: false,
        },
      };
    default:
      return state;
  }
}

// Provider component
export function MapContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  // Function to save current map position
  const saveCurrentPosition = () => {
    if (typeof window === "undefined" || !window.google?.maps) return;

    try {
      // Try to find all Google Map instances
      const mapInstances = window.google.maps.__SECRET_MAP_INSTANCES?.values();
      if (mapInstances) {
        const instances = Array.from(mapInstances);
        if (instances.length > 0) {
          const map = instances[0];
          const center = map.getCenter();
          const zoom = map.getZoom();

          if (center && zoom) {
            dispatch({
              type: "UPDATE_POSITION",
              payload: {
                center: { lat: center.lat(), lng: center.lng() },
                zoom: zoom,
              },
            });
            console.log("MapContext: Saved current position");
          }
        }
      }
    } catch (err) {
      console.error("Error saving map position:", err);
    }
  };

  // Function to get current position
  const getCurrentPosition = () => {
    return {
      center: state.center,
      zoom: state.zoom,
    };
  };

  // Function to save position specifically for drawing mode
  const saveDrawingPosition = () => {
    if (typeof window === "undefined" || !window.google?.maps) return;

    try {
      // Try to find all Google Map instances
      const mapInstances = window.google.maps.__SECRET_MAP_INSTANCES?.values();
      if (mapInstances) {
        const instances = Array.from(mapInstances);
        if (instances.length > 0) {
          const map = instances[0];
          const center = map.getCenter();
          const zoom = map.getZoom();

          if (center && zoom) {
            dispatch({
              type: "SAVE_DRAWING_POSITION",
              payload: {
                center: { lat: center.lat(), lng: center.lng() },
                zoom: zoom,
              },
            });
            console.log("MapContext: Saved drawing position");
          }
        }
      }
    } catch (err) {
      console.error("Error saving drawing position:", err);
    }
  };

  // Function to get drawing position
  const getDrawingPosition = () => {
    return {
      center: state.drawingModePosition.center,
      zoom: state.drawingModePosition.zoom,
    };
  };

  // Add function to set boundary data
  const setBoundaryData = (data: {
    bounds: google.maps.LatLngBounds | null;
    center: google.maps.LatLng | null;
    radius: number | null;
  }) => {
    dispatch({
      type: "SET_BOUNDARY_DATA",
      payload: data,
    });
    console.log("MapContext: Updated boundary data");
  };

  // Add function to reset boundary
  const resetBoundary = () => {
    dispatch({ type: "RESET_BOUNDARY" });
    console.log("MapContext: Reset boundary");
  };

  // Add function to sync state with map
  const syncStateWithMap = (map: google.maps.Map) => {
    if (!map) return;

    try {
      // Sync current position
      const center = map.getCenter();
      const zoom = map.getZoom();

      if (center && zoom) {
        // Check if the center and zoom have actually changed before updating
        // to prevent unnecessary state updates that could cause circular dependencies
        const currentLat = center.lat();
        const currentLng = center.lng();
        const currentZoom = zoom;

        // Only update if the position has changed significantly to avoid minor changes
        // causing state updates and re-renders
        const hasPositionChanged =
          Math.abs(currentLat - state.center.lat) > 0.0001 ||
          Math.abs(currentLng - state.center.lng) > 0.0001 ||
          currentZoom !== state.zoom;

        if (hasPositionChanged) {
          console.log("MapContext: Position has changed, updating state");
          dispatch({
            type: "UPDATE_POSITION",
            payload: {
              center: { lat: currentLat, lng: currentLng },
              zoom: currentZoom,
            },
          });
        } else {
          console.log("MapContext: Position unchanged, skipping update");
        }

        // Update global state variables for compatibility, but only if different
        if (typeof window !== "undefined" && hasPositionChanged) {
          // @ts-ignore
          window.globalMapState = {
            center: { lat: currentLat, lng: currentLng },
            zoom: currentZoom,
            hasInitialized: true,
          };
        }

        // Mark sync as completed with timestamp, even if no change
        dispatch({
          type: "SYNC_STATE_COMPLETED",
          payload: Date.now(),
        });
      }
    } catch (err) {
      console.error("Error syncing state with map:", err);
    }
  };

  // Add throttling mechanism to prevent excessive state updates
  const lastSyncRef = useRef<number>(0);

  // Sync with global variables on state changes (for backward compatibility)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if we've had a recent sync to prevent circular updates
      const now = Date.now();
      if (now - lastSyncRef.current < 1000) {
        console.log("MapContext: Skipping global sync, too soon after last sync");
        return;
      }

      lastSyncRef.current = now;

      // Only update global variables if they're different from current state
      // to prevent unnecessary updates and potential loops
      const shouldUpdateGlobalState =
        !window.globalMapState ||
        Math.abs(window.globalMapState.center.lat - state.center.lat) > 0.0001 ||
        Math.abs(window.globalMapState.center.lng - state.center.lng) > 0.0001 ||
        window.globalMapState.zoom !== state.zoom;

      const shouldUpdateCancellationState =
        !window.cancellationState ||
        Math.abs(window.cancellationState.center.lat - state.drawingModePosition.center.lat) >
          0.0001 ||
        Math.abs(window.cancellationState.center.lng - state.drawingModePosition.center.lng) >
          0.0001 ||
        window.cancellationState.zoom !== state.drawingModePosition.zoom;

      if (shouldUpdateGlobalState) {
        // @ts-ignore
        window.globalMapState = {
          center: state.center,
          zoom: state.zoom,
          hasInitialized: state.hasInitialized,
        };
        console.log("MapContext: Updated global state variables");
      }

      if (shouldUpdateCancellationState) {
        // @ts-ignore
        window.cancellationState = {
          center: state.drawingModePosition.center,
          zoom: state.drawingModePosition.zoom,
          hasInitialized: state.drawingModePosition.hasInitialized,
        };
        console.log("MapContext: Updated cancellation state variables");
      }
    }
  }, [state]);

  return (
    <MapContext.Provider
      value={{
        state,
        dispatch,
        saveCurrentPosition,
        getCurrentPosition,
        saveDrawingPosition,
        getDrawingPosition,
        setBoundaryData,
        resetBoundary,
        syncStateWithMap,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

// Custom hook to use the map context
export function useMapContext() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMapContext must be used within a MapContextProvider");
  }
  return context;
}
