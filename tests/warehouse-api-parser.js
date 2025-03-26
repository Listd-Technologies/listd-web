/**
 * Test for parsing the actual warehouse API data that was causing issues
 * Run with: node tests/warehouse-api-parser.js
 */

// Real warehouse data from API that had issues
const sampleWarehouseData = {
  id: "ad7e0cc3-35ef-4c1a-8993-41c505f009bb",
  title: "5,769 Sqm Warehouse For Sale In Pagsabungan, Mandaue City, Cebu",
  price: "173070000.00",
  formatted_price: "₱ 173,070,000",
  short_formatted_price: "₱173.1M",
  formatted_size: "5,769 sqm", // Note: This is correct, but building_size is wrong
  parking_spaces: null,
  price_per_sqm_formatted: "₱ 173,070,000",
  building_size: "1.00", // This is the incorrect value we need to fix
  ceiling_height: "1.00",
  loading_docks: 1,
  address: "Pagsabungan, Mandaue",
  city: "Mandaue",
  state: "Cebu",
  longitude: 123.939851,
  latitude: 10.359705,
  images: [
    "https://static-ph.lamudi.com/static/media/bm9uZS9ub25l/2x2x6x1200x900/c5c7eef13564d0.webp",
    "https://static-ph.lamudi.com/static/media/bm9uZS9ub25l/2x2x6x800x600/ca3ffba74c1de4.webp",
  ],
  listing_type: "for-sale",
};

// Simulate our parsing function
function parseWarehouseArea(property) {
  let areaValue = 0;

  // Try to get the building_size first
  if (typeof property.building_size === "number") {
    areaValue = property.building_size;
  } else if (typeof property.building_size === "string") {
    areaValue = parseFloat(property.building_size) || 0;
  }

  // If area is too small (likely 1.00), try to get a better value from formatted_size
  if (areaValue <= 1 && property.formatted_size) {
    try {
      // Extract numeric value from formatted size (e.g., "5,769 sqm" -> 5769)
      const sizeMatch = property.formatted_size.match(/([0-9,]+)/);
      if (sizeMatch && sizeMatch[1]) {
        const parsedSize = parseFloat(sizeMatch[1].replace(/,/g, ""));
        if (!isNaN(parsedSize) && parsedSize > 1) {
          console.log(
            `Corrected warehouse size from ${areaValue} to ${parsedSize} using formatted_size`
          );
          areaValue = parsedSize;
        }
      }
    } catch (e) {
      console.warn(`Failed to parse formatted_size: ${property.formatted_size}`, e);
    }
  }

  return areaValue;
}

// Test our parser
function testParseWarehouseArea() {
  console.log("===== WAREHOUSE AREA PARSER TEST =====");
  console.log("Original warehouse data:");
  console.log(`- building_size: ${sampleWarehouseData.building_size}`);
  console.log(`- formatted_size: ${sampleWarehouseData.formatted_size}`);

  const parsedArea = parseWarehouseArea(sampleWarehouseData);

  console.log("\nParsing result:");
  console.log(`- Parsed area: ${parsedArea} sqm`);
  console.log(`- Success: ${parsedArea > 1}`);
  console.log(`- Expected: 5,769 sqm`);

  if (parsedArea === 5769) {
    console.log("\n✅ TEST PASSED: Successfully extracted the correct area from formatted_size");
  } else {
    console.log("\n❌ TEST FAILED: Could not extract the correct area");
  }
}

// Run the test
testParseWarehouseArea();
