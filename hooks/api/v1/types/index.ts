/**
 * Type definitions for the Listd v1 API integration
 * These types will be updated when the complete API documentation is provided
 */

/**
 * API response wrapper type
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    pagination?: {
      total: number;
      count: number;
      perPage: number;
      currentPage: number;
      totalPages: number;
    };
  };
}

/**
 * Authentication types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

/**
 * User types
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Property types
 */
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType: "condominium" | "house-and-lot" | "vacant-lot" | "warehouse";
  listingType: "rent" | "buy";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
  features: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertySearchParams {
  listingType?: "rent" | "buy";
  propertyType?: "condominium" | "house-and-lot" | "vacant-lot" | "warehouse";
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  page?: number;
  limit?: number;
  sortBy?: "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}

/**
 * Valuation types
 */
export interface ValuationRequest {
  propertyType: "condominium" | "house-and-lot" | "vacant-lot" | "warehouse";
  address: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingLots?: number;
  buildingSize?: number;
  ceilingHeight?: number;
  floorArea?: number;
  additionalDetails?: string;
}

export interface ValuationResponse {
  estimatedValue: number;
  priceRange: {
    min: number;
    max: number;
  };
  pricePerSqm: number;
  comparableProperties: number;
}
