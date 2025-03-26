# Listd Modern API Integration (v2)

This directory contains API hooks for the modern, updated Listd backend API. These hooks provide a cleaner, more efficient interface for working with the new API endpoints while maintaining compatibility with the application architecture.

## API Documentation

Detailed API documentation will be added here when the new v2 API specification is finalized. This will include:

- RESTful endpoint specifications
- GraphQL schema (if applicable)
- Request/response formats
- Authentication flows
- Error codes and handling
- Rate limiting details
- Pagination strategies
- Sample usage examples

## Modern API Design Principles

The v2 API hooks follow these principles:

1. **RESTful Design**: Follows REST architectural principles for predictable resource-oriented endpoints
2. **Performance Optimization**: Optimized for frontend performance with efficient data patterns
3. **Strong Type Safety**: Comprehensive TypeScript definitions for all API contracts
4. **Real-time Capabilities**: Support for WebSockets and real-time data where applicable
5. **Advanced Caching**: Leverages React Query's sophisticated caching and invalidation strategies
6. **Error Consistency**: Standardized error responses with detailed error codes

## Parameter Mapping and Type Compatibility

**Critical Requirement:** These hooks must maintain strict compatibility with existing type definitions in the project, particularly those in `listing-provider.tsx` and other global type definitions. The v2 API uses more sophisticated parameter naming and structures, requiring careful mapping between frontend and API representations.

### Advanced Parameter Transformation

All API hooks in this directory must implement bidirectional transformation between the frontend's type system and the API's expected format. This ensures that consumers of these hooks can continue using the application's existing types without modification.

```typescript
// Example of advanced parameter mapping
export function usePropertySearch() {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async ({ queryKey }) => {
      const [_, filters] = queryKey;
      
      // Transform application types to API format
      const apiParams = transformToApiFormat(filters);
      
      const response = await apiClient.get(ENDPOINTS.PROPERTY.SEARCH, { params: apiParams });
      
      // Transform API response back to application types
      return transformFromApiFormat(response.data);
    }
  });
}
```

### Mapping Utilities

The `utils/mappers.ts` file contains transformation functions for converting between application and API formats:

- `mapPropertyTypeToApi`: Converts frontend property types (`house-and-lot`) to API format
- `mapPropertyTypeFromApi`: Converts API property types back to frontend format
- `transformFiltersToApiFormat`: Converts application filter objects to API parameter format
- `transformResponseToAppFormat`: Converts API responses to application-compatible formats

### Type Guards and Validation

The v2 API implementation includes runtime type validation to ensure that data flowing between the application and API maintains integrity:

```typescript
// Example type guard
function isValidPropertyType(type: unknown): type is PropertyType {
  return typeof type === 'string' && 
    ['condominium', 'house-and-lot', 'vacant-lot', 'warehouse'].includes(type);
}
```

## Usage Examples

Usage examples will be added as the v2 API is implemented.

## Folder Structure

```
hooks/api/v2/
├── README.md                 # This documentation file
├── types/                    # TypeScript interfaces for the v2 API
├── constants.ts              # API URLs and other constants
├── useAuth.ts                # Authentication hooks
├── useProperties.ts          # Property-related API hooks
├── useUsers.ts               # User management hooks
├── useValuation.ts           # Property valuation hooks
├── utils/                    # Utility functions
│   ├── client.ts             # API client configuration
│   ├── mappers.ts            # Type transformation functions
│   └── validators.ts         # Runtime type validation
└── ...                       # Other API-specific hooks
```

## Migration from v1

The v2 API offers several advantages over the v1 API:

- Improved performance and efficiency
- More consistent error handling
- Better typing and documentation
- Enhanced security features
- Support for newer application features

Existing application code should migrate from v1 to v2 API hooks as they become available. The v2 hooks are designed to be drop-in replacements in most cases, with minimal changes required to consuming components, as all necessary type conversions are handled internally. 