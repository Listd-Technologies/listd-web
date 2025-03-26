/**
 * v1 API hooks index file
 * Provides easy access to all v1 API hooks that are currently used in the application
 */

// Export property hooks - this is the only hook currently in use
export * from "./useProperties";

// Re-export utility functions needed for the properties hook
export { apiClient } from "./utils/client";
export { handleApiError } from "./utils/error-handlers";
