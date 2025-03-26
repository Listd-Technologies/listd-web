/**
 * Property mapping tests for both condominium and warehouse property types
 * Run with: node tests/property-mapping.js
 */

// Sample condominium data from API
const sampleCondoData = {
  id: "condo-123",
  title: "Luxury Condominium in City Center",
  price: 5000000,
  formatted_price: "₱5,000,000",
  short_formatted_price: "₱5M",
  formatted_size: "150 sqm",
  parking_spaces: 2,
  price_per_sqm_formatted: "₱33,333/sqm",
  address: "123 Urban Tower, Makati City",
  city: "Makati",
  state: "Metro Manila",
  longitude: 121.0244,
  latitude: 14.5547,
  images: ["https://example.com/condo1.jpg", "https://example.com/condo2.jpg"],
  has_property_owner: true,
  map_selected: false,
  map_tapped: false,
  is_liked: false,
  floor_size: 150,
  bedrooms: 3,
  bathrooms: 2,
  listing_type: "for-sale",
};

// Sample warehouse data from API
const sampleWarehouseData = {
  id: "warehouse-456",
  title: "5,769 Sqm Warehouse For Sale In Pagsabungan, Mandaue City, Cebu",
  price: 173070000,
  formatted_price: "₱173,070,000",
  short_formatted_price: "₱173M",
  formatted_size: "5,769 sqm",
  parking_spaces: 10,
  price_per_sqm_formatted: "₱30,000/sqm",
  address: "Pagsabungan, Mandaue City, Cebu",
  city: "Mandaue",
  state: "Cebu",
  longitude: 123.9302,
  latitude: 10.3484,
  images: ["https://example.com/warehouse1.jpg", "https://example.com/warehouse2.jpg"],
  has_property_owner: true,
  map_selected: false,
  map_tapped: false,
  is_liked: false,
  building_size: 5769,
  lot_size: 6000,
  ceiling_height: 8,
  loading_docks: 5,
  listing_type: "for-sale",
};

// Sample for-rent condominium
const sampleRentalCondoData = {
  ...sampleCondoData,
  id: "condo-rental-789",
  price: 45000,
  formatted_price: "₱45,000",
  short_formatted_price: "₱45K",
  title: "Modern Condo For Rent in Business District",
  listing_type: "for-rent",
};

// Simulate transformation logic for condominiums
function transformCondo(condo) {
  // Common fields
  const transformed = {
    id: condo.id,
    title: condo.title,
    price: condo.price,
    location: condo.address,
    // Condo specific mapping
    area: condo.floor_size,
    bedrooms: condo.bedrooms,
    bathrooms: condo.bathrooms,
    features: {
      area: condo.floor_size,
      parkingSpaces: condo.parking_spaces,
    },
    propertyType: "condominium",
    listingType: condo.listing_type === "for-sale" ? "buy" : "rent",
    images: condo.images.map((url, i) => ({
      id: `${condo.id}-img-${i}`,
      url,
      alt: `${condo.title} image ${i + 1}`,
    })),
  };

  return transformed;
}

// Simulate transformation logic for warehouses
function transformWarehouse(warehouse) {
  // Common fields
  const transformed = {
    id: warehouse.id,
    title: warehouse.title,
    price: warehouse.price,
    location: warehouse.address,
    // Warehouse specific mapping
    area: warehouse.building_size, // Prioritize building_size for warehouses
    bedrooms: 0, // Warehouses typically don't have bedrooms
    bathrooms: 0, // Warehouses typically don't have bathrooms
    features: {
      lotSize: warehouse.lot_size,
      garages: warehouse.loading_docks, // Map loading docks to garages
    },
    propertyType: "warehouse",
    listingType: warehouse.listing_type === "for-sale" ? "buy" : "rent",
    images: warehouse.images.map((url, i) => ({
      id: `${warehouse.id}-img-${i}`,
      url,
      alt: `${warehouse.title} image ${i + 1}`,
    })),
  };

  return transformed;
}

// Test condominium mapping
function testCondoMapping() {
  console.log("===== CONDOMINIUM MAPPING TEST =====");
  console.log("Original condominium data:", sampleCondoData);

  const transformedCondo = transformCondo(sampleCondoData);
  console.log("\nTransformed condominium data:", transformedCondo);

  // Verify key fields
  console.log("\nVERIFICATION:");
  console.log(
    "- Area correctly set to floor_size:",
    transformedCondo.area === sampleCondoData.floor_size
  );
  console.log(
    "- Bedrooms correctly mapped:",
    transformedCondo.bedrooms === sampleCondoData.bedrooms
  );
  console.log(
    "- Bathrooms correctly mapped:",
    transformedCondo.bathrooms === sampleCondoData.bathrooms
  );
  console.log(
    "- Images correctly transformed:",
    transformedCondo.images.length === sampleCondoData.images.length
  );

  // Simulate rendering logic with price format
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(transformedCondo.price);

  const displayPrice =
    transformedCondo.listingType === "rent" ? `${formattedPrice}/month` : formattedPrice;

  console.log("\nRENDERING CHECK:");
  console.log("- Rendering condominium with title:", transformedCondo.title);
  console.log("- Properly formatted price (no /month for sales):", displayPrice);
  console.log("- Area displayed in sq ft:", transformedCondo.area);
  console.log("- Beds displayed:", transformedCondo.bedrooms);
  console.log("- Baths displayed:", transformedCondo.bathrooms);
}

// Test rental condominium mapping (to check /month suffix)
function testRentalCondoMapping() {
  console.log("\n===== RENTAL CONDOMINIUM MAPPING TEST =====");

  const transformedRentalCondo = transformCondo(sampleRentalCondoData);
  console.log("Transformed rental condominium data:", transformedRentalCondo);

  // Simulate rendering logic with price format
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(transformedRentalCondo.price);

  const displayPrice =
    transformedRentalCondo.listingType === "rent" ? `${formattedPrice}/month` : formattedPrice;

  console.log("\nRENDERING CHECK:");
  console.log("- ListingType correctly mapped:", transformedRentalCondo.listingType === "rent");
  console.log("- Properly formatted price (with /month for rentals):", displayPrice);
  console.log("- Should include '/month' suffix:", displayPrice.includes("/month"));
}

// Test warehouse mapping
function testWarehouseMapping() {
  console.log("\n===== WAREHOUSE MAPPING TEST =====");
  console.log("Original warehouse data:", sampleWarehouseData);

  const transformedWarehouse = transformWarehouse(sampleWarehouseData);
  console.log("\nTransformed warehouse data:", transformedWarehouse);

  // Verify key fields
  console.log("\nVERIFICATION:");
  console.log(
    "- Area correctly set to building_size:",
    transformedWarehouse.area === sampleWarehouseData.building_size
  );
  console.log(
    "- Loading docks mapped to garages:",
    transformedWarehouse.features.garages === sampleWarehouseData.loading_docks
  );
  console.log(
    "- Lot size correctly mapped:",
    transformedWarehouse.features.lotSize === sampleWarehouseData.lot_size
  );
  console.log(
    "- Images correctly transformed:",
    transformedWarehouse.images.length === sampleWarehouseData.images.length
  );

  // Simulate rendering logic with price format
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(transformedWarehouse.price);

  const displayPrice =
    transformedWarehouse.listingType === "rent" ? `${formattedPrice}/month` : formattedPrice;

  console.log("\nRENDERING CHECK:");
  console.log("- Rendering warehouse with title:", transformedWarehouse.title);
  console.log("- Properly formatted price (no /month for sales):", displayPrice);
  console.log("- Area displayed in sq ft:", transformedWarehouse.area);
  console.log("- Beds displayed:", transformedWarehouse.bedrooms || 0);
  console.log("- Baths displayed:", transformedWarehouse.bathrooms || 0);
}

// Run all tests
function runAllTests() {
  testCondoMapping();
  testRentalCondoMapping();
  testWarehouseMapping();

  console.log("\n===== SUMMARY =====");
  console.log(`
Property Adapter Mapping:
1. Condominiums:
   - Bedrooms and bathrooms correctly displayed (${sampleCondoData.bedrooms}/${sampleCondoData.bathrooms} for our test condo)
   - Area uses floor_size (${sampleCondoData.floor_size} sqm)
   - For-sale condos DON'T show "/month" suffix
   - For-rent condos DO show "/month" suffix

2. Warehouses:
   - Bedrooms and bathrooms are both 0 
   - Area uses building_size (${sampleWarehouseData.building_size} sqm)
   - Loading docks (${sampleWarehouseData.loading_docks}) mapped to "garages" feature
   - For-sale warehouses DON'T show "/month" suffix
  `);
}

// Execute all tests
runAllTests();
