/**
 * Property and listing type definitions
 */

/**
 * Property types available in the application
 */
export type PropertyType = "condominium" | "house-and-lot" | "vacant-lot" | "warehouse";

/**
 * Property types that are not yet enabled
 * Only condominium and warehouse are available
 */
export const DISABLED_PROPERTY_TYPES: PropertyType[] = ["house-and-lot", "vacant-lot"];

/**
 * Listing types (buy or rent)
 */
export type ListingType = "buy" | "rent";

/**
 * API listing type format (sale or rent)
 */
export type ApiListingType = "sale" | "rent";

/**
 * Maps listing type to API format
 */
export function mapListingTypeToApi(listingType: ListingType): string {
  return listingType === "buy" ? "sale" : "rent";
}

/**
 * Maps API listing type to application format
 */
export function mapApiToListingType(apiListingType: string): ListingType {
  return apiListingType === "sale" ? "buy" : "rent";
}

/**
 * Attempts to infer the listing type from a property title
 * @param title The property title text
 * @returns The inferred listing type or undefined if can't be determined
 */
export function inferListingTypeFromTitle(title: string): ListingType | undefined {
  if (!title) return undefined;

  const lowerTitle = title.toLowerCase();

  // Check for rent keywords
  if (
    lowerTitle.includes("for rent") ||
    lowerTitle.includes("to rent") ||
    lowerTitle.includes("rental") ||
    lowerTitle.includes("lease") ||
    lowerTitle.includes("leasing")
  ) {
    return "rent";
  }

  // Check for buy/sale keywords
  if (
    lowerTitle.includes("for sale") ||
    lowerTitle.includes("to buy") ||
    lowerTitle.includes("purchase") ||
    lowerTitle.includes("selling")
  ) {
    return "buy";
  }

  return undefined;
}
