/**
 * Types for property data from the v1 API
 */
import { PropertyType } from "@/components/providers/listing-provider";

// Property type mapping
export const PropertyTypeMap = {
  condominiums: "condominium" as PropertyType,
  "house-and-lots": "house-and-lot" as PropertyType,
  "vacant-lots": "vacant-lot" as PropertyType,
  warehouses: "warehouse" as PropertyType,
} as const;

// Pagination type in response
export interface Pagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  next_page?: number;
  previous_page?: number;
}

// Base property fields common to all property types
export interface BaseProperty {
  id: string;
  title: string;
  price: number;
  formatted_price: string;
  short_formatted_price: string;
  formatted_size: string;
  parking_spaces: number | null;
  price_per_sqm_formatted: string;
  address: string;
  city: string;
  state: string;
  longitude: number;
  latitude: number;
  images: string[];
  property_owner?: {
    full_name: string;
    email: string;
    phone: string;
    number_available_in_whatsapp: boolean;
  };
  has_property_owner: boolean;
  map_selected: boolean;
  map_tapped: boolean;
  is_liked: boolean;
  scrape_agent?: Record<string, unknown>;
}

// Condominium-specific properties
export interface CondominiumProperty extends BaseProperty {
  floor_size: number;
  bedrooms: number;
  bathrooms: number;
}

// Condominium detail properties (for single property view)
export interface CondominiumDetail extends CondominiumProperty {
  property_id?: string;
  markdown_content?: string;
  amenities?: string[];
  features?: string[];
}

// House and lot specific properties
export interface HouseAndLotProperty extends BaseProperty {
  floor_size: number;
  lot_size: number;
  bedrooms: number;
  bathrooms: number;
}

// Vacant lot specific properties
export interface VacantLotProperty extends BaseProperty {
  lot_size: number;
}

// Warehouse specific properties
export interface WarehouseProperty extends BaseProperty {
  building_size: number;
  lot_size: number;
  ceiling_height: number;
  loading_docks: number;
}

// Warehouse detail properties (for single property view)
export interface WarehouseDetail extends WarehouseProperty {
  property_id?: string;
  year_built?: number;
  zoning?: string;
  suitable_for?: string[];
  has_office_space?: boolean;
  has_fire_sprinklers?: boolean;
  has_alarm_system?: boolean;
  has_cctv?: boolean;
  markdown_content?: string;
  amenities?: string[];
  features?: string[];
}

// Generic type for property responses
export interface PropertyResponse<T extends PropertyType> {
  success: boolean;
  data?: {
    results: PropertyTypeToInterface<T>[];
    pagination: Pagination;
  };
  error?: {
    message: string;
    code: string;
  };
}

// Query parameters for property search
export interface PropertyQueryParams {
  page?: number;
  limit?: number;
  listingType?: "buy" | "rent";
  priceType?: "total-price" | "price-per-sqm";
  sortField?: string;
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;

  // House and lot / Warehouse specific
  minLotSize?: number;
  maxLotSize?: number;

  // Condo and house specific
  bedrooms?: number;
  bathrooms?: number;

  // Warehouse specific
  minCeilingHeight?: number;
  maxCeilingHeight?: number;
  loadingDocks?: number;

  // Common filters
  parkingSpaces?: number;
  features?: string;
  amenities?: string;

  // Location filters
  "location.bounds.minX"?: number;
  "location.bounds.maxX"?: number;
  "location.bounds.minY"?: number;
  "location.bounds.maxY"?: number;
  "location.centerX"?: number;
  "location.centerY"?: number;
  "location.radius"?: number;
  landmark?: string;
  listingCityId?: string;

  // Auth required filter
  showMyCreatedProperty?: boolean;

  // For original parameters
  [key: string]: unknown;
}

// Helper type to map property types to their respective interfaces
export type PropertyTypeToInterface<T extends PropertyType> = T extends "condominium"
  ? CondominiumProperty
  : T extends "house-and-lot"
    ? HouseAndLotProperty
    : T extends "vacant-lot"
      ? VacantLotProperty
      : T extends "warehouse"
        ? WarehouseProperty
        : never;
