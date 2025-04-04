// Persistent position tracking state at module level to prevent position loss
// during component unmounts/remounts
export const v2CancellationState = {
  center: { lat: 0, lng: 0 },
  zoom: 0,
  hasInitialized: false,
};
