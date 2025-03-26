/**
 * Constants for the Listd v1 API integration
 * This file contains configuration values for connecting to the legacy API endpoints
 */

/**
 * Base URL for the v1 API
 * This will be configured based on the environment
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_V1_URL || "https://api-staging.listd.ph/api";

/**
 * API version path - Must be included for correct API path structure
 * The warehouse endpoints expect /v1/ in the URL path
 */
export const API_VERSION = "/v1";

/**
 * API endpoint paths
 * These are the actively used endpoints in the application
 */
export const ENDPOINTS = {
  // Property endpoints - these are the only ones currently used in the app
  PROPERTY: {
    // Main endpoints for property listings
    CONDOMINIUMS: "/properties/condominiums/public",
    HOUSES: "/properties/house-and-lots/public",
    VACANT_LOTS: "/properties/vacant-lots/public",
    WAREHOUSES: "/properties/warehouses/public",

    // Property details endpoints
    CONDOMINIUM_DETAILS: (id: string) => `/properties/condominiums/public/${id}`,
    HOUSE_DETAILS: (id: string) => `/properties/house-and-lots/public/${id}`,
    VACANT_LOT_DETAILS: (id: string) => `/properties/vacant-lots/public/${id}`,
    WAREHOUSE_DETAILS: (id: string) => `/properties/warehouses/public/${id}`,

    // Map property endpoint handlers
    getPublicEndpoint: (propertyType: string) => {
      switch (propertyType) {
        case "condominium":
          return ENDPOINTS.PROPERTY.CONDOMINIUMS;
        case "house-and-lot":
          return ENDPOINTS.PROPERTY.HOUSES;
        case "vacant-lot":
          return ENDPOINTS.PROPERTY.VACANT_LOTS;
        case "warehouse":
          return ENDPOINTS.PROPERTY.WAREHOUSES;
        default:
          return ENDPOINTS.PROPERTY.CONDOMINIUMS;
      }
    },

    getDetailsEndpoint: (propertyType: string, id: string) => {
      switch (propertyType) {
        case "condominium":
          return ENDPOINTS.PROPERTY.CONDOMINIUM_DETAILS(id);
        case "house-and-lot":
          return ENDPOINTS.PROPERTY.HOUSE_DETAILS(id);
        case "vacant-lot":
          return ENDPOINTS.PROPERTY.VACANT_LOT_DETAILS(id);
        case "warehouse":
          return ENDPOINTS.PROPERTY.WAREHOUSE_DETAILS(id);
        default:
          return ENDPOINTS.PROPERTY.CONDOMINIUM_DETAILS(id);
      }
    },
  },
};

/**
 * Default request headers
 */
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 30000; // 30 seconds
