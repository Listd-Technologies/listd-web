/**
 * Constants for the Listd v2 API integration
 * This file contains configuration values for connecting to the modern API endpoints
 */

/**
 * Base URL for the v2 API
 * This will be configured based on the environment
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_V2_URL || "https://api.listd.com";

/**
 * API version path
 */
export const API_VERSION = "/api/v2";

/**
 * API endpoint paths
 * These will be populated when the v2 API is finalized
 */
export const ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    VERIFY_EMAIL: "/auth/verify-email",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // User endpoints
  USER: {
    PROFILE: "/users/me",
    UPDATE: "/users/me",
    PREFERENCES: "/users/me/preferences",
    NOTIFICATIONS: "/users/me/notifications",
    SAVED_SEARCHES: "/users/me/saved-searches",
    SAVED_PROPERTIES: "/users/me/saved-properties",
  },

  // Property endpoints
  PROPERTY: {
    LIST: "/properties",
    DETAILS: (id: string) => `/properties/${id}`,
    CREATE: "/properties",
    UPDATE: (id: string) => `/properties/${id}`,
    DELETE: (id: string) => `/properties/${id}`,
    SEARCH: "/properties/search",
    FEATURED: "/properties/featured",
    RECOMMENDED: "/properties/recommended",
    SIMILAR: (id: string) => `/properties/${id}/similar`,
  },

  // Valuation endpoints
  VALUATION: {
    ESTIMATE: "/valuation/estimate",
    COMPARABLE: "/valuation/comparable",
    HISTORY: (address: string) => `/valuation/history?address=${encodeURIComponent(address)}`,
    TRENDS: "/valuation/trends",
  },

  // Analytics endpoints
  ANALYTICS: {
    MARKET_TRENDS: "/analytics/market-trends",
    PRICE_INSIGHTS: "/analytics/price-insights",
    POPULARITY: "/analytics/popularity",
  },

  // Messaging endpoints
  MESSAGING: {
    CONVERSATIONS: "/messaging/conversations",
    MESSAGES: (conversationId: string) => `/messaging/conversations/${conversationId}/messages`,
    SEND: "/messaging/send",
  },
};

/**
 * Default request headers
 */
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-API-Version": "2",
};

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 20000; // 20 seconds

/**
 * Maximum number of retries for failed requests
 */
export const MAX_RETRIES = 3;

/**
 * WebSocket connection URL (if applicable)
 */
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://realtime.listd.com";
