/**
 * Property API Adapter Factory
 *
 * This factory provides a way to get the appropriate property adapter based on the
 * desired API version. Currently only v1 is fully implemented, with v2 as a placeholder.
 */

import { PropertyApiAdapter } from "./property-adapter";
import { V1PropertyAdapter } from "./v1-property-adapter";
import { V2PropertyAdapter } from "./v2-property-adapter";

/**
 * API version options
 */
export type ApiVersion = "v1" | "v2";

/**
 * Configuration options for the property adapter
 */
export interface PropertyAdapterConfig {
  /**
   * API version to use
   * @default "v1"
   */
  apiVersion?: ApiVersion;

  /**
   * Whether to enable caching
   * @default true
   */
  enableCaching?: boolean;

  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean;
}

/**
 * Get a property adapter implementation based on the specified API version.
 *
 * @param config Configuration options for the adapter
 * @returns An instance of the appropriate PropertyApiAdapter
 */
export function getPropertyAdapter(config: PropertyAdapterConfig = {}): PropertyApiAdapter {
  // The enableCaching parameter is not used yet but will be implemented
  // when request caching for v2 API is added in the future
  const { apiVersion = "v1", debug = false } = config;

  // Log if debug mode is enabled
  if (debug) {
    console.log(`Creating property adapter for API version: ${apiVersion}`);
  }

  // Return the appropriate adapter
  switch (apiVersion) {
    case "v1":
      return new V1PropertyAdapter();
    case "v2":
      // v2 is currently a placeholder that will throw errors if used
      return new V2PropertyAdapter();
    default:
      // TypeScript should catch this, but just in case
      throw new Error(`Unsupported API version: ${apiVersion}`);
  }
}

/**
 * Default property adapter instance using v1 API
 */
export const defaultPropertyAdapter = getPropertyAdapter();
