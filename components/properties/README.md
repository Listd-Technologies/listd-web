# Property Listing Components

This directory contains the refactored property listing components for the Listd web application. The refactoring aims to improve maintainability, organization, and responsiveness across different screen sizes.

## Component Structure

```
components/properties/
├── page-client.tsx       # Main client component for the properties page
├── filters/              # Filter components
│   ├── index.tsx         # Exports and main filters container
│   ├── filter-container.tsx # Reusable filter container
│   ├── filter-item.tsx   # Generic filter item wrapper
│   └── [filter-type]/    # Individual filter components (to be implemented)
├── grid/                 # Property grid components
│   ├── index.tsx         # Exports and main grid component
│   ├── responsive-grid.tsx # Responsive grid layout
│   └── grid-skeleton.tsx # Skeleton loaders for property cards
└── layouts/              # Layout components
    ├── index.tsx         # Exports all layouts
    ├── horizontal-layout.tsx # Map-only layout
    ├── vertical-layout.tsx   # List-only layout
    └── split-layout.tsx      # Split view layout for map and list
```

## Design Principles

1. **Component Separation**: Each component has a single responsibility
2. **Responsive Design**: Mobile-first approach with Tailwind's responsive breakpoints
3. **Reusable Components**: Generic components for common patterns
4. **Consistent Styling**: Uniform styling applied across all components
5. **Clear API**: Well-defined props interfaces with JSDoc comments

## Usage

### Filter Components

The filter components provide a consistent UI for all property filters. Each filter uses the same container but with different content:

```tsx
// Basic usage
<FilterItem label="Price">
  <PriceFilterContent />
</FilterItem>

// Compact mode
<FilterItem label="Bedrooms" compact>
  <BedroomsFilterContent />
</FilterItem>

// With badge
<FilterItem 
  label="Property Type" 
  badge={<Badge variant="outline">3</Badge>}
>
  <PropertyTypeFilterContent />
</FilterItem>
```

### Layout Components

Three layout components for different view modes:

```tsx
// Split view (map + list)
<SplitLayout
  listSection={<PropertyList properties={properties} />}
  mapSection={<PropertyMap properties={properties} />}
/>

// List-only view
<VerticalLayout>
  <PropertyList properties={properties} />
</VerticalLayout>

// Map-only view
<HorizontalLayout>
  <PropertyMap properties={properties} />
</HorizontalLayout>
```

### Responsive Grid

Grid component with responsive columns:

```tsx
<ResponsiveGrid isLoading={isLoading} loadingSkeleton={<PropertyCardSkeleton />}>
  {properties.map(property => (
    <PropertyCard key={property.id} property={property} />
  ))}
</ResponsiveGrid>
```

## Breakpoints

The components use standardized breakpoints defined in `lib/constants/responsive.ts`:

| Breakpoint | Width       | Use Case                                 |
|------------|-------------|------------------------------------------|
| Default    | 0px+        | Mobile phones (portrait)                 |
| `sm`       | 640px+      | Mobile phones (landscape), small tablets |
| `md`       | 768px+      | Tablets (portrait)                       |
| `lg`       | 1024px+     | Tablets (landscape), small laptops       |
| `xl`       | 1280px+     | Laptops, desktops                        |
| `2xl`      | 1536px+     | Large screens                            |

## Responsive Design Best Practices

When building and modifying these components, follow these responsive design principles:

1. **Mobile-first approach**: Always start with mobile design and use responsive modifiers to enhance for larger screens.

```tsx
// Good - Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">...</div>

// Avoid - Desktop first
<div className="grid grid-cols-3 xl:grid-cols-2 md:grid-cols-1">...</div>
```

2. **Prefer CSS over JavaScript** for handling responsive behavior:

```tsx
// Good - Using CSS for responsive behavior
<div className="block md:hidden">Mobile content</div>
<div className="hidden md:block">Desktop content</div>

// Avoid - Using JavaScript to check window size
useEffect(() => {
  const checkWidth = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener('resize', checkWidth);
  return () => window.removeEventListener('resize', checkWidth);
}, []);
```

3. **Use the constants file selectively**:
   - For CSS/UI: Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, etc.)
   - For JavaScript logic only: Use the `BREAKPOINTS` or `LAYOUT_BREAKPOINTS` from `responsive.ts`

4. **Maintain consistent breakpoints** across the application by using Tailwind's default breakpoints.

## Implementation Plan

The components are being implemented in phases according to the refactoring plan:

1. ✅ **Phase 1**: Code organization and component separation 
2. ⬜ **Phase 2**: Responsive design improvements
3. ⬜ **Phase 3**: State management optimizations
4. ⬜ **Phase 4**: Performance improvements
5. ⬜ **Phase 5**: Map integration refinement

## Map Components Integration

The existing map components (`components/maps/*`) remain unchanged. This refactoring improves the integration points between the map components and the rest of the application through cleaner interfaces and dedicated hooks. 