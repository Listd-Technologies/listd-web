# Listd Legacy API Integration (v1)

This directory contains API hooks for integrating with the legacy backend APIs of the Listd application. These hooks provide a consistent interface for working with the older API endpoints while maintaining compatibility with the frontend architecture.

## Current Status and Usage

Currently, this module is only used for property listing and detail features. All other API routes have been removed to minimize code duplication and simplify maintenance. Only the Property endpoints are actively used in the application.

> **TEMPORARY NOTE**: House and Lot and Vacant Lot property types are temporarily disabled in the UI, but the API endpoints remain available for future use.

## API Documentation

This section contains information about the property-related API endpoints currently in use.

### Base URL```

<https://api-staging.listd.ph/api>

```

### Endpoints

#### Property Endpoints (Currently Used)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/properties/condominiums/public` | GET | Get list of condominiums |
| `/v1/properties/house-and-lots/public` | GET | Get list of houses and lots |
| `/v1/properties/vacant-lots/public` | GET | Get list of vacant lots |
| `/v1/properties/warehouses/public` | GET | Get list of warehouses |
| `/v1/properties/condominiums/public/{id}` | GET | Get condominium details |
| `/v1/properties/house-and-lots/public/{id}` | GET | Get house and lot details |
| `/v1/properties/vacant-lots/public/{id}` | GET | Get vacant lot details |
| `/v1/properties/warehouses/public/{id}` | GET | Get warehouse details |

## Integration Approach

The v1 API hooks follow these principles:

1. **Consistent Interface**: Provides a uniform API interface that allows the frontend to work with the legacy API
2. **Type Safety**: Includes TypeScript definitions for all API requests and responses
3. **Error Handling**: Implements standardized error handling patterns
4. **Caching Strategy**: Uses React Query for efficient data fetching and caching
5. **Backward Compatibility**: Ensures the new frontend can communicate with legacy backend services

## Parameter Mapping

**Important:** These hooks maintain compatibility with existing type definitions in the project, particularly those in `listing-provider.tsx` and other global types. The v1 API often uses different parameter formats than our frontend, requiring mapping in each hook.

### API to Frontend Type Mapping

| Frontend Format | API Format | Notes |
|-----------------|------------|-------|
| `minPrice` | `min_price` | API uses snake_case |
| `maxPrice` | `max_price` | API uses snake_case |
| `listingType` | `listing_type` | API uses snake_case |
| `propertyType` | `property_type` | API uses different format for property types |

## Current Use in Application

These hooks are currently used in:

- Properties page (`app/properties/client.tsx`) to fetch and display property listings
- The geographical search feature to search properties within a drawn area on the map

## Folder Structure

```

hooks/api/v1/
├── README.md                 # This documentation file
├── index.ts                  # Exports for the v1 API
├── constants.ts              # API URLs and other constants
├── useProperties.ts          # Property-related API hooks (currently used)
├── types/                    # TypeScript interfaces for the v1 API
│   └── property.types.ts     # Property type definitions
└── utils/                    # Utility functions
    ├── client.ts             # API client configuration
    ├── property-mappers.ts   # Property type transformation functions
    └── error-handlers.ts     # API error handling utilities

```

## Example Usage

```typescript
// In client components - Fetching property listings
import { useProperties } from "@/hooks/api/v1";

// Using the hooks for property listings
const {
  data: propertiesData,
  isLoading,
  error,
} = useProperties(
  {
    listingType: "buy",
    minPrice: 1000000,
    maxPrice: 5000000,
  },
  {
    propertyType: "condominium",
    limit: 20,
  }
);

// Fetching a single property by ID
import { useProperty } from "@/hooks/api/v1";

// Using the hook for a single property
const {
  data: propertyData,
  isLoading: isLoadingProperty,
  error: propertyError,
} = useProperty("property-id-here", "warehouse");

// For server-side or programmatic fetching
import { fetchProperty } from "@/hooks/api/v1";

// Inside an async function
const fetchPropertyDetails = async (id: string) => {
  try {
    const propertyData = await fetchProperty(id, "condominium");
    return propertyData;
  } catch (error) {
    console.error("Failed to fetch property:", error);
  }
};
```

## Error Handling

All API hooks must implement consistent error handling:

1. API errors should be transformed into application-friendly formats
2. Network errors should be handled gracefully
3. Rate limiting errors should provide appropriate feedback
4. Authentication errors should trigger re-authentication flows

```typescript
try {
  const result = await apiClient.get('/endpoint');
  return transformResponseToAppFormat(result.data);
} catch (error) {
  throw handleApiError(error);
}
```
