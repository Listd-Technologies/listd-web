# Property Listing Components Refactoring Plan

This document outlines a comprehensive plan for refactoring the property listing components in the Listd web application. The focus is on improving maintainability, organization, and responsiveness across different screen sizes.

## Current Issues

After reviewing the current implementation, we've identified several areas for improvement:

1. **Complex and lengthy components**: The current `client.tsx` and `property-filters.tsx` files are too large, making them difficult to understand and maintain.
2. **Responsiveness challenges**: The current implementation has specific logic for different screen sizes that's scattered throughout the code.
3. **Redundant state management**: Some state is duplicated across components and could be simplified.
4. **Map and filter integration**: The connection between map functionality and filter controls is complex and tightly coupled.
5. **Performance concerns**: Heavy re-renders due to state changes and insufficient memoization.
6. **Code organization**: Layout and styling logic are mixed with business logic.

## Important Notes

- **Map Components**: The existing map implementation (`components/maps/*`) is already working as expected and should be preserved as-is. The refactoring will focus on improving the integration points between the map components and the rest of the application.

## Tailwind CSS Breakpoints

To ensure consistent responsive design, all components should follow these Tailwind CSS breakpoints:

| Breakpoint | Width       | Use Case                                 |
|------------|-------------|------------------------------------------|
| Default    | 0px+        | Mobile phones (portrait)                 |
| `sm`       | 640px+      | Mobile phones (landscape), small tablets |
| `md`       | 768px+      | Tablets (portrait)                       |
| `lg`       | 1024px+     | Tablets (landscape), small laptops       |
| `xl`       | 1280px+     | Laptops, desktops                        |
| `2xl`      | 1536px+     | Large screens                            |

Guidelines for using breakpoints:

1. **Mobile-first approach**: Start with mobile design and progressively enhance for larger screens.
2. **Consistent breakpoint usage**: Use the same breakpoints throughout the application.
3. **Avoid custom breakpoints**: Stick to Tailwind's default breakpoints whenever possible.
4. **Use appropriate classes**:
   ```jsx
   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">...</div>
   ```
5. **Replace manual JavaScript breakpoint detection** with CSS-based responsive design when possible.

## Refactoring Goals

### 1. Component Structure Reorganization

The property listing page should be split into smaller, more focused components:

```
components/
├── properties/
│   ├── page-client.tsx       # Main client component (smaller, focused on layout)
│   ├── filters/
│   │   ├── index.tsx         # Filters container component
│   │   ├── filter-item.tsx   # Generic filter item wrapper
│   │   ├── location-filter/  # Each filter in its own folder
│   │   ├── price-filter/
│   │   ├── property-type-filter/
│   │   ├── listing-type-filter/
│   │   ├── bedrooms-filter/
│   │   ├── bathrooms-filter/
│   │   └── area-filter/
│   ├── grid/                 # Property grid components
│   └── layouts/              # Layout components for different views
│       ├── horizontal-layout.tsx
│       ├── vertical-layout.tsx
│       └── split-layout.tsx
```

Note: The existing map components in `components/maps/` will be kept as-is.

### 1.1 Parallel Component Strategy

Instead of replacing existing components immediately, we will:

1. Create new improved versions of key components like PropertyCard and PropertyListingGrid
2. Implement these in the new `/properties-v2` route for testing
3. Run both implementations in parallel until the new versions are fully validated
4. Gradually migrate features and fix any issues in the new implementations
5. Only remove the original components after a full transition period

Benefits of this approach:
- Reduces risk during refactoring
- Allows for proper A/B testing of user experience
- Provides a rollback option if issues arise
- Creates a cleaner migration path for dependent components

### 2. Responsive Design Improvements

Rather than manually handling screen size changes and maintaining different layouts:

- Use CSS Grid and Flexbox with Tailwind's responsive breakpoints
- Create view-specific layout components
- Use CSS variables for consistent spacing and sizing
- Implement a mobile-first approach with progressive enhancement
- Replace JavaScript-based breakpoint detection with CSS breakpoints whenever possible

Example approach:

```tsx
// responsive-grid.tsx
export function ResponsiveGrid({ children }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}

// In usage:
<ResponsiveGrid>
  {properties.map(property => (
    <PropertyCard key={property.id} property={property} />
  ))}
</ResponsiveGrid>
```

Example of replacing JS with CSS for layout switching:

```tsx
// Before: Using JavaScript to switch layouts
useEffect(() => {
  const checkDeviceSize = () => {
    const width = window.innerWidth;
    if (width <= 1180 && viewMode === "split") {
      setViewMode("list");
    } else if (width > 1180 && viewMode !== "split") {
      setViewMode("split");
    }
  };
  window.addEventListener("resize", checkDeviceSize);
  return () => window.removeEventListener("resize", checkDeviceSize);
}, [viewMode]);

// After: Using CSS-based responsive design
<div className="block xl:hidden">
  {/* Mobile/tablet view (list only) */}
  <ListOnlyView properties={properties} />
</div>
<div className="hidden xl:flex">
  {/* Desktop view (split view) */}
  <SplitView properties={properties} />
</div>
```

### 3. State Management Refinement

#### Zustand Store Optimization

- Create more specific selectors to prevent unnecessary rerenders
- Split store into smaller slices for different concerns

```tsx
// Current approach leads to rerenders when any part of filters change
const filters = usePropertyFiltersStore((state) => state.filters);

// Better approach with specific selectors
const propertyType = usePropertyFiltersStore((state) => state.filters.propertyType);
const listingType = usePropertyFiltersStore((state) => state.filters.listingType);
```

#### Filter Management

- Create a dedicated hook for each filter type that handles:
  - Local state
  - Store updates
  - Validation
  - Formatting

Example:

```tsx
// hooks/filters/usePropertyTypeFilter.ts
export function usePropertyTypeFilter() {
  const propertyType = usePropertyFiltersStore((state) => state.filters.propertyType);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);
  
  const setPropertyType = useCallback((type: PropertyType) => {
    updateFilters({ propertyType: type });
  }, [updateFilters]);
  
  return {
    propertyType,
    setPropertyType,
    options: PROPERTY_TYPES,
    isDisabled: (type: PropertyType) => DISABLED_PROPERTY_TYPES.includes(type)
  };
}
```

### 4. Map Integration Improvements

While keeping the existing map components intact, we should improve how they integrate with the rest of the application:

- Create cleaner interfaces for communicating with map components
- Simplify the data flow between filters and map
- Use a dedicated hook for the map drawing and boundary state

```tsx
// hooks/useMapBoundary.ts
export function useMapBoundary() {
  const [boundary, setBoundary] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  
  // Toggle drawing mode
  const toggleDrawingMode = useCallback(() => {
    setIsDrawingMode(prev => !prev);
  }, []);
  
  // Process boundary data from map
  const processBoundaryData = useCallback((data) => {
    setBoundary(data);
    // Additional processing if needed
  }, []);
  
  // Clear boundary
  const clearBoundary = useCallback(() => {
    setBoundary(null);
  }, []);
  
  return {
    boundary,
    isDrawingMode,
    toggleDrawingMode,
    processBoundaryData,
    clearBoundary
  };
}
```

### 5. Performance Optimizations

- Use `React.memo` for filter components to avoid unnecessary rerenders
- Implement proper memoization with `useMemo` and `useCallback`
- Use virtualization for property listings (react-window or react-virtualized)
- Lazy load non-critical components
- Optimize data flow to reduce unnecessary renders

Example for virtualized list:

```tsx
import { FixedSizeList } from 'react-window';

export function VirtualizedPropertyList({ properties, rowHeight = 200 }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <PropertyCard property={properties[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={800}
      width="100%"
      itemCount={properties.length}
      itemSize={rowHeight}
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 6. Layout and Design System Integration

- Create reusable layout components for different views
- Better integrate with design system components
- Use CSS Grid for complex layouts
- Create responsive container components based on Tailwind breakpoints

```tsx
// layout components for different view modes
export function SplitView({ mapSection, listSection }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 h-full">
      <div className="h-full overflow-auto">{listSection}</div>
      <div className="h-full">{mapSection}</div>
    </div>
  );
}

export function ListOnlyView({ listSection }) {
  return <div className="w-full h-full overflow-auto">{listSection}</div>;
}

export function MapOnlyView({ mapSection }) {
  return <div className="w-full h-full">{mapSection}</div>;
}
```

## Filter Components Architecture

Each filter component should follow a consistent pattern:

1. **Filter Container**: Generic wrapper that handles popover and styling
2. **Filter Content**: The specific UI for each filter type
3. **Filter Logic**: Custom hook for state and business logic

Example structure:

```tsx
// components/properties/filters/price-filter/index.tsx
import { FilterContainer } from '../filter-container';
import { PriceFilterContent } from './price-filter-content';
import { usePriceFilter } from './use-price-filter';

export function PriceFilter({ compact = false }) {
  const {
    minPrice,
    maxPrice,
    minSqmPrice,
    maxSqmPrice,
    activePriceType,
    setMinPrice,
    setMaxPrice,
    setMinSqmPrice,
    setMaxSqmPrice,
    setActivePriceType,
    getDisplayText,
    reset
  } = usePriceFilter();
  
  return (
    <FilterContainer 
      label={getDisplayText()}
      compact={compact}
    >
      <PriceFilterContent 
        minPrice={minPrice}
        maxPrice={maxPrice}
        minSqmPrice={minSqmPrice}
        maxSqmPrice={maxSqmPrice}
        activePriceType={activePriceType}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        onMinSqmPriceChange={setMinSqmPrice}
        onMaxSqmPriceChange={setMaxSqmPrice}
        onPriceTypeChange={setActivePriceType}
        onReset={reset}
      />
    </FilterContainer>
  );
}
```

## Reusable Filter Container

Create a reusable filter container component that all filters can use:

```tsx
// components/properties/filters/filter-container.tsx
export function FilterContainer({ 
  label,
  compact = false,
  disabled = false,
  children,
  onClose
}) {
  const [open, setOpen] = useState(false);
  
  const handleClose = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [onClose]);
  
  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : undefined}
          className={cn(
            "flex items-center gap-1 text-foreground justify-between font-normal",
            compact ? "h-9" : "h-10"
          )}
          disabled={disabled}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 z-50" 
        align={compact ? "center" : "start"}
      >
        {typeof children === 'function' ? children(handleClose) : children}
      </PopoverContent>
    </Popover>
  );
}
```

## Responsive Behavior Constants

To ensure consistency across the application, define and export key breakpoint values:

```tsx
// lib/constants/responsive.ts
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export const LAYOUT_BREAKPOINTS = {
  // App-specific breakpoints that determine layout changes
  MOBILE: BREAKPOINTS.sm,
  TABLET: BREAKPOINTS.md,
  DESKTOP_SMALL: BREAKPOINTS.lg,
  DESKTOP: BREAKPOINTS.xl,
  DESKTOP_LARGE: BREAKPOINTS["2xl"],
  
  // Layout-specific breakpoints
  SPLIT_VIEW: 1180, // Switch between split and single view
};
```

## Progressive Implementation

The refactoring should be implemented in phases:

1. **Phase 1**: Code organization and component separation
2. **Phase 2**: Responsive design improvements
3. **Phase 3**: State management optimizations
4. **Phase 4**: Performance improvements
5. **Phase 5**: Map integration refinement (preserving existing map implementation)

## Testing Plan

Each component should have appropriate tests:

- Unit tests for hooks and utilities
- Component tests for UI functionality
- Integration tests for component combinations
- E2E tests for critical user flows

## Accessibility Considerations

- Ensure proper keyboard navigation for filters
- Add appropriate ARIA attributes
- Test with screen readers
- Support reduced motion preferences
- Ensure sufficient color contrast ratios

## Conclusion

This refactoring will result in components that are:

1. **More maintainable**: Smaller, focused components with clear responsibilities
2. **Easier to understand**: Consistent patterns and organization
3. **Responsive**: Better adaptability to different screen sizes
4. **Performant**: Optimized rendering and efficient state management
5. **Accessible**: Compliant with WCAG standards

The incremental approach ensures that we can improve the codebase while maintaining functionality throughout the process, and the existing map components will be preserved as they already work as expected.
