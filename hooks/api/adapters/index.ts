/**
 * Property API Adapters - Index Exports
 *
 * This file provides a convenient way to import the property API adapter interfaces,
 * implementations, and factory functions.
 */

// Export the adapter interface
export * from "./property-adapter";

// Export the adapter implementations
export { V1PropertyAdapter } from "./v1-property-adapter";
export { V2PropertyAdapter } from "./v2-property-adapter";

// Export the factory
export {
  getPropertyAdapter,
  defaultPropertyAdapter,
  type ApiVersion,
  type PropertyAdapterConfig,
} from "./property-adapter-factory";
