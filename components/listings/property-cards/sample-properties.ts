import { type ListingType, type PropertyType } from "@/components/providers/listing-provider";
import { type PropertyImage } from "./property-card";

// Helper function to generate multiple images for a property
function generatePropertyImages(propertyType: string, count: number = 4): PropertyImage[] {
  return Array.from({ length: count }).map((_, index) => ({
    id: `${propertyType.toLowerCase()}-image-${index + 1}`,
    url: `https://via.placeholder.com/800x450/667EEA/FFFFFF?text=${encodeURIComponent(propertyType)}+${index + 1}`,
    alt: `${propertyType} image ${index + 1}`,
  }));
}

// Sample condominiums for sale
export const condominiumsForSale = [
  {
    id: "condo-sale-1",
    title: "Luxury High-Rise Condominium with City Views",
    description:
      "Premium corner unit in prestigious high-rise building with floor-to-ceiling windows, chef's kitchen, and panoramic city and water views.",
    price: 1150000,
    listingType: "buy" as ListingType,
    displayListingType: "for-sale",
    propertyType: "condominium" as PropertyType,
    location: "Downtown, Manila",
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1450,
      yearBuilt: 2017,
    },
    images: generatePropertyImages("LuxuryCondo", 5),
    isFeatured: true,
    isNew: false,
  },
  {
    id: "condo-sale-2",
    title: "Modern Loft-Style Condominium in Historic Building",
    description:
      "Unique loft-style condo in converted historic building featuring soaring ceilings, exposed brick walls, and contemporary industrial finishes.",
    price: 650000,
    listingType: "buy" as ListingType,
    propertyType: "condominium" as PropertyType,
    location: "Makati City",
    features: {
      bedrooms: 1,
      bathrooms: 1.5,
      area: 950,
      yearBuilt: 1906,
    },
    images: generatePropertyImages("Loft", 3),
    isFeatured: false,
    isNew: true,
  },
  {
    id: "condo-sale-3",
    title: "Upscale Condominium with Private Terrace",
    description:
      "Sophisticated condo with premium finishes, open concept living, and a private terrace perfect for outdoor entertaining.",
    price: 825000,
    listingType: "buy" as ListingType,
    propertyType: "condominium" as PropertyType,
    location: "BGC, Taguig",
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1100,
      yearBuilt: 2014,
    },
    images: generatePropertyImages("Condo", 4),
    isFeatured: false,
    isNew: false,
  },
];

// Sample condominiums for rent
export const condominiumsForRent = [
  {
    id: "condo-rent-1",
    title: "Modern Condominium with City and Mountain Views",
    description:
      "Contemporary condo featuring an open floor plan, high-end finishes, and stunning views of both the city skyline and mountains.",
    price: 2800,
    listingType: "rent" as ListingType,
    propertyType: "condominium" as PropertyType,
    location: "Ortigas, Pasig",
    features: {
      bedrooms: 1,
      bathrooms: 1,
      area: 850,
      yearBuilt: 2018,
    },
    images: generatePropertyImages("RentalCondo", 3),
    isFeatured: true,
    isNew: false,
  },
  {
    id: "condo-rent-2",
    title: "Waterfront Luxury Condominium",
    description:
      "Spectacular condo with unobstructed water views, private balcony, and access to building amenities including a pool, spa, and fitness center.",
    price: 3500,
    listingType: "rent" as ListingType,
    propertyType: "condominium" as PropertyType,
    location: "Manila Bay Area",
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1250,
      yearBuilt: 2016,
    },
    images: generatePropertyImages("WaterfrontCondo", 4),
    isFeatured: false,
    isNew: true,
  },
];

// Sample houses and lots for sale
export const housesForSale = [
  {
    id: "house-sale-1",
    title: "Spacious Family Home in Prime Location",
    description:
      "Beautiful modern home with a blend of character and modern updates. Features include a gourmet kitchen, hardwood floors, and a landscaped yard.",
    price: 1250000,
    listingType: "buy" as ListingType,
    propertyType: "house-and-lot" as PropertyType,
    location: "Forbes Park, Makati",
    features: {
      bedrooms: 4,
      bathrooms: 2.5,
      area: 2800,
      yearBuilt: 1924,
      garages: 2,
      lotSize: 5200,
    },
    images: generatePropertyImages("House", 5),
    isFeatured: true,
    isNew: false,
  },
  {
    id: "house-sale-2",
    title: "Modern Smart Home with Mountain Views",
    description:
      "Stunning contemporary home with top-of-the-line smart home technology, energy-efficient design, and breathtaking mountain views from multiple rooms.",
    price: 1950000,
    listingType: "buy" as ListingType,
    propertyType: "house-and-lot" as PropertyType,
    location: "Antipolo, Rizal",
    features: {
      bedrooms: 5,
      bathrooms: 4,
      area: 3800,
      yearBuilt: 2021,
      garages: 3,
      lotSize: 8500,
    },
    images: generatePropertyImages("ModernHome", 4),
    isFeatured: false,
    isNew: true,
  },
  {
    id: "house-sale-3",
    title: "Charming Home with Character",
    description:
      "Lovingly maintained home with period details including leaded glass windows, arched doorways, and a cozy brick fireplace.",
    price: 875000,
    listingType: "buy" as ListingType,
    propertyType: "house-and-lot" as PropertyType,
    location: "San Juan, Metro Manila",
    features: {
      bedrooms: 3,
      bathrooms: 1.75,
      area: 1950,
      yearBuilt: 1931,
      garages: 1,
      lotSize: 4200,
    },
    images: generatePropertyImages("Tudor", 3),
    isFeatured: false,
    isNew: false,
  },
];

// Sample houses for rent
export const housesForRent = [
  {
    id: "house-rent-1",
    title: "Spacious Family Home Near Schools",
    description:
      "Well-maintained 4-bedroom home in family-friendly neighborhood close to top-rated schools, parks, and shopping centers.",
    price: 3900,
    listingType: "rent" as ListingType,
    propertyType: "house-and-lot" as PropertyType,
    location: "Valle Verde, Pasig",
    features: {
      bedrooms: 4,
      bathrooms: 2.5,
      area: 2400,
      yearBuilt: 1998,
      garages: 2,
      lotSize: 5000,
    },
    images: generatePropertyImages("RentalHome", 4),
    isFeatured: true,
    isNew: false,
  },
  {
    id: "house-rent-2",
    title: "Waterfront Home with Private Garden",
    description:
      "Charming waterfront home with private garden, outdoor living space, and stunning sunset views over the water.",
    price: 4500,
    listingType: "rent" as ListingType,
    propertyType: "house-and-lot" as PropertyType,
    location: "Alabang, Muntinlupa",
    features: {
      bedrooms: 2,
      bathrooms: 1,
      area: 1200,
      yearBuilt: 1962,
      lotSize: 7500,
    },
    images: generatePropertyImages("Cottage", 3),
    isFeatured: false,
    isNew: true,
  },
];

// Sample warehouses for sale
export const warehousesForSale = [
  {
    id: "warehouse-sale-1",
    title: "Industrial Warehouse with Office Space",
    description:
      "Modern industrial warehouse featuring high ceilings, loading docks, and additional office space in a prime commercial area with excellent accessibility.",
    price: 2150000,
    listingType: "buy" as ListingType,
    propertyType: "warehouse" as PropertyType,
    location: "Quezon City Industrial Area",
    features: {
      area: 5000,
      yearBuilt: 2010,
      officeArea: 800,
      dockDoors: 4,
    },
    images: generatePropertyImages("Warehouse", 4),
    isFeatured: true,
    isNew: false,
  },
  {
    id: "warehouse-sale-2",
    title: "Distribution Warehouse with Cold Storage",
    description:
      "Strategic distribution warehouse with cold storage facilities, ample parking, and convenient access to major highways and shipping routes.",
    price: 3200000,
    listingType: "buy" as ListingType,
    propertyType: "warehouse" as PropertyType,
    location: "Laguna Technopark",
    features: {
      area: 8500,
      yearBuilt: 2015,
      coldStorage: true,
      clearanceHeight: 24,
      dockDoors: 6,
    },
    images: generatePropertyImages("Distribution", 3),
    isFeatured: false,
    isNew: true,
  },
];

// Sample warehouses for rent
export const warehousesForRent = [
  {
    id: "warehouse-rent-1",
    title: "Flexible Industrial Space with Yard",
    description:
      "Versatile industrial warehouse with secured yard area, suitable for manufacturing, distribution, or storage needs with flexible lease terms.",
    price: 12500,
    listingType: "rent" as ListingType,
    propertyType: "warehouse" as PropertyType,
    location: "Cavite Export Processing Zone",
    features: {
      area: 3800,
      yearBuilt: 2008,
      clearanceHeight: 22,
      dockDoors: 3,
      yardArea: 1500,
    },
    images: generatePropertyImages("IndustrialSpace", 3),
    isFeatured: true,
    isNew: false,
  },
  {
    id: "warehouse-rent-2",
    title: "Modern Logistics Warehouse",
    description:
      "State-of-the-art logistics warehouse with advanced security systems, climate control options, and optimal location for regional distribution.",
    price: 18000,
    listingType: "rent" as ListingType,
    propertyType: "warehouse" as PropertyType,
    location: "Batangas Port Area",
    features: {
      area: 6200,
      yearBuilt: 2019,
      clearanceHeight: 28,
      dockDoors: 5,
      officeArea: 500,
    },
    images: generatePropertyImages("LogisticsWarehouse", 4),
    isFeatured: false,
    isNew: true,
  },
];

// Sample vacant lots for sale
export const vacantLotsForSale = [
  {
    id: "lot-sale-1",
    title: "Prime Residential Lot with Mountain Views",
    description:
      "Build your dream home on this rare piece of land with stunning mountain views, utilities at the street, and close to urban amenities.",
    price: 450000,
    listingType: "buy" as ListingType,
    propertyType: "vacant-lot" as PropertyType,
    location: "Tagaytay, Cavite",
    features: {
      lotSize: 12000,
    },
    images: generatePropertyImages("VacantLot", 3),
    isFeatured: false,
    isNew: true,
  },
  {
    id: "lot-sale-2",
    title: "Waterfront Property with Development Potential",
    description:
      "Rare waterfront property with approved plans for residential development. Features include water access and spectacular views.",
    price: 1250000,
    listingType: "buy" as ListingType,
    propertyType: "vacant-lot" as PropertyType,
    location: "Subic Bay, Zambales",
    features: {
      lotSize: 23000,
    },
    images: generatePropertyImages("WaterfrontLot", 3),
    isFeatured: true,
    isNew: false,
  },
  {
    id: "lot-sale-3",
    title: "Commercial Lot in Business District",
    description:
      "Strategic commercial lot in a rapidly developing business district, ideal for retail, office, or mixed-use development with high ROI potential.",
    price: 3800000,
    listingType: "buy" as ListingType,
    propertyType: "vacant-lot" as PropertyType,
    location: "Bonifacio Global City, Taguig",
    features: {
      lotSize: 15000,
      zoningType: "Commercial",
    },
    images: generatePropertyImages("CommercialLot", 3),
    isFeatured: true,
    isNew: false,
  },
  {
    id: "lot-sale-4",
    title: "Hillside Vacant Lot with Panoramic Views",
    description:
      "Expansive hillside lot offering breathtaking panoramic views of the surrounding landscape. Perfect for a custom luxury residence.",
    price: 765000,
    listingType: "buy" as ListingType,
    propertyType: "vacant-lot" as PropertyType,
    location: "Antipolo, Rizal",
    features: {
      lotSize: 18500,
      slopeGrade: "Moderate",
      utilities: "Available at roadside",
    },
    images: generatePropertyImages("HillsideLot", 4),
    isFeatured: false,
    isNew: true,
  },
  {
    id: "lot-sale-5",
    title: "Agricultural Land with Fruit-Bearing Trees",
    description:
      "Productive agricultural land with established fruit-bearing trees and irrigation system in place. Excellent opportunity for farming or private estate.",
    price: 2100000,
    listingType: "buy" as ListingType,
    propertyType: "vacant-lot" as PropertyType,
    location: "Batangas City",
    features: {
      lotSize: 45000,
      soilType: "Fertile Loam",
      waterSource: "Natural Spring",
    },
    images: generatePropertyImages("FarmLand", 3),
    isFeatured: false,
    isNew: false,
  },
];

// Sample vacant lots for rent
export const vacantLotsForRent = [
  {
    id: "lot-rent-1",
    title: "Vacant Land for Events and Temporary Use",
    description:
      "Well-located vacant land available for rent, perfect for events, temporary structures, or seasonal markets. Flexible terms available.",
    price: 2500,
    listingType: "rent" as ListingType,
    propertyType: "vacant-lot" as PropertyType,
    location: "Makati Commercial District",
    features: {
      lotSize: 8500,
      utilities: true,
      accessRoad: "Paved",
    },
    images: generatePropertyImages("EventSpace", 3),
    isFeatured: true,
    isNew: false,
  },
  {
    id: "lot-rent-2",
    title: "Industrial Yard Space for Storage",
    description:
      "Secure industrial yard space available for rent, suitable for equipment storage, container staging, or material stockpiling.",
    price: 1800,
    listingType: "rent" as ListingType,
    propertyType: "vacant-lot" as PropertyType,
    location: "Cavite Industrial Park",
    features: {
      lotSize: 5000,
      fenced: true,
      securitySystem: true,
    },
    images: generatePropertyImages("IndustrialYard", 3),
    isFeatured: false,
    isNew: true,
  },
  {
    id: "lot-rent-3",
    title: "Agricultural Land for Short-Term Lease",
    description:
      "Fertile agricultural land available for seasonal crops or farming trials. Irrigation system already in place.",
    price: 1200,
    listingType: "rent" as ListingType,
    propertyType: "vacant-lot" as PropertyType,
    location: "Laguna Farming District",
    features: {
      lotSize: 12000,
      soilType: "Rich Loam",
      irrigation: true,
    },
    images: generatePropertyImages("FarmLand", 3),
    isFeatured: false,
    isNew: false,
  },
];

// Combine all properties
export const allProperties = [
  ...condominiumsForSale,
  ...condominiumsForRent,
  ...housesForSale,
  ...housesForRent,
  ...warehousesForSale,
  ...warehousesForRent,
  ...vacantLotsForSale,
  ...vacantLotsForRent,
];

// Properties by type
export const propertiesByType = {
  condominium: [...condominiumsForSale, ...condominiumsForRent],
  "house-and-lot": [...housesForSale, ...housesForRent],
  warehouse: [...warehousesForSale, ...warehousesForRent],
  "vacant-lot": [...vacantLotsForSale, ...vacantLotsForRent],
};

// Properties by listing type
export const propertiesByListingType = {
  buy: [...condominiumsForSale, ...housesForSale, ...warehousesForSale, ...vacantLotsForSale],
  rent: [...condominiumsForRent, ...housesForRent, ...warehousesForRent, ...vacantLotsForRent],
};
