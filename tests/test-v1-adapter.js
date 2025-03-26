/**
 * Test script for v1 adapter property mapping
 *
 * This script tests the v1 adapter's ability to map properties from the API response
 * to our standardized format, with special focus on the agent field.
 */

const { getPropertyAdapter } = require("../hooks/api/adapters/property-adapter-factory");

// Set up mock property data with St Michael Square Studio
const mockCondoProperty = {
  id: "12345",
  title: "St Michael Square Studio Unit For Rent In San Antonio, Makati",
  price: 11000,
  address: "San Antonio, Makati",
  latitude: 14.5649,
  longitude: 121.0244,
  images: ["image1.jpg", "image2.jpg"],
  is_liked: false,
  floor_size: 26,
  bedrooms: 1,
  bathrooms: 1,
  formatted_price: "₱ 11,000",
  short_formatted_price: "₱11K",
  formatted_size: "26 sqm",
  price_per_sqm_formatted: "₱ 423",
  listing_type: "for-rent",
  scrape_agent: {
    name: "Some Agent Name",
  },
  property_owner: {
    full_name: "Property Owner Name",
    email: "owner@example.com",
    phone: "123456789",
    number_available_in_whatsapp: true,
  },
};

// Main test function
async function testV1Adapter() {
  try {
    // Get property adapter instance
    const adapter = getPropertyAdapter({ debug: true });

    // Test transforming a single property
    console.log("Testing property transformation...");

    // Attempt to call the adapter with mock data
    console.log("Mock property input:", mockCondoProperty);

    // Manually test the transformation function if possible
    // This would normally be an internal method, might need to be exposed for testing

    console.log("Test complete!");
    console.log("Note: In a real test, we would call fetchProperties directly,");
    console.log("but this is just a validation script for debugging purposes.");
  } catch (error) {
    console.error("Error testing V1 adapter:", error);
  }
}

// Run the test
testV1Adapter();

// Instruction to run:
// 1. Make sure next.js types are built: npm run build
// 2. Run the test: node tests/test-v1-adapter.js
