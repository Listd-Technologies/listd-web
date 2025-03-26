/**
 * API Client for the v1 Listd API
 * Handles request configuration, authentication, and error standardization
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { API_BASE_URL, API_VERSION, DEFAULT_HEADERS, REQUEST_TIMEOUT } from "../constants";

// Error response structure
interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Create and configure the Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  timeout: REQUEST_TIMEOUT,
  headers: DEFAULT_HEADERS,
});

// Debug logging for requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // General logging for all requests - with condensed output
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

    // Debug logging for warehouse endpoints
    if (config.url?.includes("warehouses")) {
      console.log("🔍 WAREHOUSE API REQUEST:", {
        url: config.baseURL + config.url,
        method: config.method?.toUpperCase(),
        params: config.params,
        headers: config.headers,
      });
    }

    // Get token from storage (implement your own token storage solution)
    const token = localStorage.getItem("auth_token");

    // Add token to headers if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Debug logging for warehouse responses
    if (response.config.url?.includes("warehouses")) {
      console.log("✅ WAREHOUSE API RESPONSE:", {
        status: response.status,
        headers: response.headers,
        data: response.data,
        url: response.config.url,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    // Debug logging for warehouse errors
    if (error.config?.url?.includes("warehouses")) {
      console.error("❌ WAREHOUSE API ERROR:", {
        url: error.config.url,
        status: error.response?.status,
        message: error.message,
        response: error.response?.data,
      });
    }

    const originalRequest = error.config;

    // Handle 401 Unauthorized errors - token expired
    if (error.response?.status === 401 && originalRequest) {
      try {
        // Attempt to refresh the token (implement your own token refresh logic)
        const refreshToken = localStorage.getItem("refresh_token");

        if (refreshToken) {
          // Call refresh token endpoint
          const response = await axios.post(`${API_BASE_URL}${API_VERSION}/auth/refresh-token`, {
            refreshToken,
          });

          // Store new tokens
          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem("auth_token", token);
          localStorage.setItem("refresh_token", newRefreshToken);

          // Update the failed request with the new token and retry
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If token refresh fails, clear tokens and redirect to login
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");

        // Optionally log the refresh error but don't expose it to the user
        console.error("Token refresh failed:", refreshError);

        // You might want to redirect to login or dispatch an event
        // window.location.href = '/login';
      }
    }

    // Standardize error response format
    const errorResponse: ErrorResponse = {
      code: "unknown_error",
      message: "An unknown error occurred",
    };

    // Extract error details from response if available
    if (error.response?.data) {
      const responseData = error.response.data as Record<string, unknown>;

      if (responseData.error && typeof responseData.error === "object") {
        const errorData = responseData.error as Record<string, unknown>;
        errorResponse.code = (errorData.code as string) || `error_${error.response.status}`;
        errorResponse.message = (errorData.message as string) || error.message;
        errorResponse.details = errorData.details as Record<string, unknown> | undefined;
      } else if (responseData.message && typeof responseData.message === "string") {
        errorResponse.message = responseData.message;
        errorResponse.code = `error_${error.response.status}`;
      }
    }

    // Add HTTP status to error object for easier handling
    const enhancedError = new Error() as Error & {
      response: typeof error.response;
      status: number;
      code: string;
      details?: Record<string, unknown>;
    };

    enhancedError.message = errorResponse.message;
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status || 500;
    enhancedError.code = errorResponse.code;
    enhancedError.details = errorResponse.details;

    return Promise.reject(enhancedError);
  }
);

export { apiClient };

/**
 * Utility function to handle API errors consistently
 */
export function handleApiError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error("An unknown error occurred");
}
