/**
 * Type definitions for the Listd v2 API integration
 * Enhanced models and more detailed types compared to v1 API
 */

/**
 * API response wrapper type - standardized across all endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status: number;
  timestamp: string;
  path?: string;
}

export interface ResponseMeta {
  requestId?: string;
  timestamp: string;
  pagination?: PaginationMeta;
  version?: string;
}

export interface PaginationMeta {
  total: number;
  count: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
  nextPage?: number;
  prevPage?: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Common type definitions
 */
export type PropertyType = "condominium" | "house-and-lot" | "vacant-lot" | "warehouse";
export type ListingType = "rent" | "buy";
export type SortOrder = "asc" | "desc";
export type Status = "active" | "pending" | "sold" | "rented" | "inactive" | "draft";
export type UserRole = "user" | "agent" | "admin";
export type NotificationType = "message" | "property_update" | "price_alert" | "system";

/**
 * Authentication types
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Seconds until token expiration
  tokenType: string; // Usually "Bearer"
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  acceptTerms: boolean;
  referralCode?: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
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
  role: UserRole;
  isVerified: boolean;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingCommunications: boolean;
  preferredCurrency: string;
  preferredLanguage: string;
  savedSearches: SavedSearch[];
  savedProperties: string[]; // Array of property IDs
  theme?: "light" | "dark" | "system";
}

export interface SavedSearch {
  id: string;
  name: string;
  criteria: PropertySearchParams;
  createdAt: string;
  notificationsEnabled: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Property types
 */
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  pricePerSqm?: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  propertyType: PropertyType;
  listingType: ListingType;
  status: Status;
  address: Address;
  location: GeoLocation;
  images: PropertyImage[];
  floorPlan?: string;
  virtualTour?: string;
  features: PropertyFeature[];
  amenities: string[];
  ownership: Ownership;
  yearBuilt?: number;
  taxInformation?: TaxInformation;
  viewCount: number;
  favoriteCount: number;
  statistics: PropertyStatistics;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Address {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  neighborhood?: string;
  formattedAddress: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface PropertyImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface PropertyFeature {
  category: string;
  name: string;
  value?: string;
  icon?: string;
}

export interface Ownership {
  ownerId: string;
  ownerType: "user" | "agency";
  ownerName: string;
  contactEmail: string;
  contactPhone: string;
  contactPreference?: "email" | "phone" | "both";
}

export interface TaxInformation {
  yearlyTax?: number;
  assessedValue?: number;
  taxYear?: number;
}

export interface PropertyStatistics {
  daysListed: number;
  viewsLast30Days: number;
  inquiriesCount: number;
  priceChanges: PriceChange[];
}

export interface PriceChange {
  date: string;
  oldPrice: number;
  newPrice: number;
  percentage: number;
}

export interface PropertySearchParams {
  listingType?: ListingType;
  propertyType?: PropertyType | PropertyType[];
  status?: Status | Status[];
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  minPrice?: number;
  maxPrice?: number;
  minPricePerSqm?: number;
  maxPricePerSqm?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  minYearBuilt?: number;
  features?: string[];
  amenities?: string[];
  includeVirtualTour?: boolean;
  includeFloorPlan?: boolean;
  sort?: {
    field: "price" | "createdAt" | "area" | "viewCount" | "daysListed";
    order: SortOrder;
  };
  page?: number;
  limit?: number;
}

/**
 * Valuation types
 */
export interface ValuationRequest {
  propertyType: PropertyType;
  address: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  yearBuilt?: number;
  condition?: "excellent" | "good" | "fair" | "poor";
  features?: string[];
  recentRenovation?: boolean;
  buildingSize?: number;
  ceilingHeight?: number;
  floorArea?: number;
  additionalDetails?: string;
}

export interface ValuationResponse {
  estimatedValue: number;
  confidence: "high" | "medium" | "low";
  priceRange: {
    min: number;
    max: number;
  };
  pricePerSqm: number;
  comparableProperties: number;
  similarProperties: PropertySummary[];
  historicalTrend: PriceHistoryPoint[];
  metadata: {
    valuationDate: string;
    dataPoints: number;
    algorithm: string;
    version: string;
  };
}

export interface PropertySummary {
  id: string;
  title: string;
  address: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType: PropertyType;
  imageUrl?: string;
  distanceKm?: number;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  event?: "listed" | "sold" | "estimated" | "priceChange";
}

/**
 * Analytics types
 */
export interface MarketTrend {
  location: string;
  propertyType: PropertyType;
  timeframe: string;
  data: {
    date: string;
    averagePrice: number;
    medianPrice: number;
    volume: number;
    percentageChange: number;
  }[];
}

/**
 * Messaging types
 */
export interface Conversation {
  id: string;
  participants: User[];
  propertyId?: string;
  property?: PropertySummary;
  lastMessage: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments?: Attachment[];
  read: boolean;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}
