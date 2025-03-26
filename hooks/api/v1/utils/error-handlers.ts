/**
 * Error handling utilities for v1 API
 * Provides standardized error handling functions for API responses
 */

// Error types for categorizing API errors
export enum ErrorType {
  NETWORK = "network_error",
  VALIDATION = "validation_error",
  AUTHENTICATION = "authentication_error",
  AUTHORIZATION = "authorization_error",
  NOT_FOUND = "not_found",
  SERVER = "server_error",
  UNKNOWN = "unknown_error",
  TIMEOUT = "timeout_error",
  RATE_LIMIT = "rate_limit_error",
}

// Custom API error class with additional fields
export class ApiError extends Error {
  code: string;
  status: number;
  type: ErrorType;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    status = 500,
    type = ErrorType.UNKNOWN,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.type = type;
    this.details = details;
  }

  // Static factory method for creating error from a generic error
  static fromError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      return new ApiError(error.message, "unknown_error", 500, ErrorType.UNKNOWN);
    }

    return new ApiError("An unknown error occurred", "unknown_error", 500, ErrorType.UNKNOWN);
  }

  // Get user-friendly error message for display
  getUserMessage(): string {
    // Default user-friendly messages based on error type
    const defaultMessages: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: "Network connection error. Please check your internet connection.",
      [ErrorType.VALIDATION]: "The form contains invalid data. Please review your inputs.",
      [ErrorType.AUTHENTICATION]: "Authentication error. Please sign in again.",
      [ErrorType.AUTHORIZATION]: "You do not have permission to perform this action.",
      [ErrorType.NOT_FOUND]: "The requested resource was not found.",
      [ErrorType.SERVER]: "Server error. Please try again later.",
      [ErrorType.UNKNOWN]: "An unexpected error occurred. Please try again.",
      [ErrorType.TIMEOUT]: "Request timed out. Please try again.",
      [ErrorType.RATE_LIMIT]: "Too many requests. Please try again later.",
    };

    // Use custom message if available, otherwise use default message for the error type
    return this.message || defaultMessages[this.type];
  }
}

/**
 * Categorize HTTP status code into error type
 */
export function getErrorTypeFromStatus(status: number): ErrorType {
  if (status >= 400 && status < 500) {
    switch (status) {
      case 400:
        return ErrorType.VALIDATION;
      case 401:
        return ErrorType.AUTHENTICATION;
      case 403:
        return ErrorType.AUTHORIZATION;
      case 404:
        return ErrorType.NOT_FOUND;
      case 429:
        return ErrorType.RATE_LIMIT;
      default:
        return ErrorType.UNKNOWN;
    }
  }

  if (status >= 500) {
    return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Parse API error response into ApiError
 */
export function parseApiError(error: unknown): ApiError {
  // If it's already an ApiError, return it directly
  if (error instanceof ApiError) {
    return error;
  }

  // Default error values
  let message = "An unknown error occurred";
  let status = 500;
  let code = "unknown_error";
  let type = ErrorType.UNKNOWN;
  let details: Record<string, unknown> | undefined = undefined;

  // Handle axios errors or similar network request errors
  if (error && typeof error === "object" && "response" in error) {
    const responseError = error as {
      response?: {
        status?: number;
        data?: unknown;
      };
      message?: string;
    };

    // Set status from response if available
    status = responseError.response?.status || 500;

    // Set error type based on status
    type = getErrorTypeFromStatus(status);

    // Extract error details from response data
    if (responseError.response?.data && typeof responseError.response.data === "object") {
      const data = responseError.response.data as Record<string, unknown>;

      // Extract error information from API response formats
      if (data.error && typeof data.error === "object") {
        const errorData = data.error as Record<string, unknown>;
        message = (errorData.message as string) || responseError.message || message;
        code = (errorData.code as string) || `error_${status}`;
        details = errorData.details as Record<string, unknown> | undefined;
      } else if (data.message && typeof data.message === "string") {
        message = data.message;
        code = `error_${status}`;
      }
    } else {
      // Use error message if no response data
      message = responseError.message || message;
    }
  } else if (error instanceof Error) {
    // Handle standard JavaScript errors
    message = error.message;
  }

  return new ApiError(message, code, status, type, details);
}

/**
 * Format validation errors into a user-friendly format
 */
export function formatValidationErrors(errors: Record<string, unknown>): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const [field, errorInfo] of Object.entries(errors)) {
    if (typeof errorInfo === "string") {
      formatted[field] = errorInfo;
    } else if (errorInfo && typeof errorInfo === "object" && "message" in errorInfo) {
      formatted[field] = String(errorInfo.message);
    } else {
      formatted[field] = "Invalid value";
    }
  }

  return formatted;
}

/**
 * Handle common error scenarios and return appropriate ApiError
 */
export function handleApiError(error: unknown): ApiError {
  const apiError = parseApiError(error);

  // Handle special error cases
  if (apiError.status === 401) {
    // Authentication error - could trigger logout or refresh token
    console.log("Authentication error detected, consider redirecting to login");
  }

  if (apiError.status === 403) {
    // Authorization error - could update UI to show permissions issue
    console.log("Authorization error detected, user lacks permissions");
  }

  return apiError;
}
