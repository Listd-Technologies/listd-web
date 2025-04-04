# Property Refactoring TODO List

This document outlines the specific tasks needed to implement the refactoring plan described in `PROPERTY-REFACTOR.md`. Tasks are organized by implementation phase and component area.

## Phase 1: Code Organization and Component Separation

### Setup and Structure
- [x] Create new folder structure for properties components
- [x] Set up responsive constants file (`lib/constants/responsive.ts`)
- [x] Add documentation for new component architecture

### Parallel Component Strategy
- [x] Create `/properties-v2` route for testing new implementations
- [x] Implement improved versions of PropertyCard and PropertyListingGrid
- [x] Ensure interoperability between old and new component versions
- [x] Document migration strategy
- [x] Create feature parity matrix between old and new implementations

### Filter Components
- [x] Create reusable `FilterContainer` component
- [x] Implement `filter-item.tsx` generic wrapper
- [x] Extract each filter to its dedicated folder:
  - [x] `location-filter`
  - [x] `price-filter`
  - [x] `property-type-filter`
  - [x] `listing-type-filter`
  - [x] `bedrooms-filter`
  - [x] `bathrooms-filter`
  - [x] `area-filter`
- [x] Create the filters index file with proper exports

### Layout Components
- [x] Implement view-specific layout components:
  - [x] `horizontal-layout.tsx`
  - [x] `vertical-layout.tsx`
  - [x] `split-layout.tsx`
- [x] Create responsive layout utilities

### Property Grid Components
- [x] Extract property grid components to their own directory
- [x] Implement base grid component with responsive support
- [x] Create skeleton loaders for grid items
- [x] Implement improved PropertyCard (v2) with better event handling
- [x] Create enhanced PropertyListingGrid (v2) with better carousel support

### Client Page Refactor
- [x] Create base structure for `page-client.tsx`
- [x] Create new properties-v2 route with new implementations
- [x] Implement seamless transition between views
- [x] Add proper carousel event handling in listing components

## Phase 2: Responsive Design Improvements

### CSS Implementation
- [x] Replace manual JS breakpoint detection with CSS-based solutions
- [x] Implement mobile-first responsive classes throughout components
- [x] Create responsive container components
- [ ] Ensure consistent spacing and sizing with CSS variables

### Layout Refinement
- [x] Optimize `SplitView` for different screen sizes
- [x] Implement proper ListOnlyView and MapOnlyView components
- [x] Create smooth transitions between views
- [ ] Test and optimize touch interactions for mobile

### Property Grid Responsiveness
- [x] Implement proper grid column handling for different screen sizes
- [ ] Optimize property card sizing and layout for mobile
- [x] Ensure filter bar is usable on small screens (ResponsiveFilters component)

## Phase 3: State Management Optimizations

### Zustand Store Refinement
- [x] Update selector usage to be more specific and prevent unnecessary rerenders:
  - [x] Create specific selectors for each filter type
  - [x] Use shallow equality checks for complex state
  - [x] Apply memoization to derived values
- [x] Create dedicated hook for filters to manage state (`usePriceFilter`)
- [ ] Add devtools middleware for better debugging
- [ ] Optimize store updates by:
  - [ ] Batching related changes
  - [ ] Using immer for immutable updates
  - [ ] Implementing selective state updates

### Filter Hooks
- [ ] Create dedicated hook for each filter type:
  - [x] `useLocationFilter`
  - [x] `usePriceFilter`
  - [x] `usePropertyTypeFilter`
  - [x] `useListingTypeFilter`
  - [x] `useBedroomsFilter`
  - [x] `useBathroomsFilter`
  - [x] `useAreaFilter`
- [x] Ensure hooks handle local state, validation and formatting

### URL Synchronization
- [x] Review and optimize URL sync with filter state
- [x] Ensure filter resets properly update URL
- [x] Handle direct URL access with filter parameters

## Phase 4: Performance Improvements

### Component Optimization
- [x] Apply `React.memo` to filter components
- [x] Implement proper `useMemo` and `useCallback` usage
- [ ] Review and fix component re-render issues
- [ ] Add type optimization and safety improvements

### List Virtualization
- [x] Research and select appropriate virtualization library
- [x] Implement `VirtualizedPropertyList` component
- [x] Optimize for dynamic heights if needed
- [x] Test performance with large property datasets
- [x] Integrate with property-v2 route for testing
- [ ] Compare performance between virtualized and non-virtualized versions

### Loading Optimization
- [x] Implement better loading states and skeletons
- [x] Add progressive loading for property images
- [x] Optimize initial load time
- [x] Consider implementing pagination or infinite scroll

## Phase 5: Map Integration Refinement

### Map Component Integration
- [x] Create clean interfaces for existing map components
- [x] Implement `useMapBoundary` hook (via DrawingModeContext)
- [x] Simplify data flow between filters and map
- [ ] Test boundary drawing functionality

### Map State Management
- [x] Update toggle drawing mode implementation
- [x] Improve boundary data processing
- [ ] Optimize map marker rendering
- [x] Ensure proper cleanup of map resources

### Map UI Improvements
- [x] Refine map controls positioning and styling
- [x] Improve mobile map experience
- [x] Ensure map maintains state properly across view changes
- [x] Streamline location filter integration with map drawing controls

## Cross-cutting Concerns

### Accessibility
- [ ] Add proper keyboard navigation to filters:
  - [ ] Support Tab navigation through filter options
  - [ ] Add Enter/Space key support for selection
  - [ ] Implement Escape key to close dialogs
- [ ] Implement appropriate ARIA attributes:
  - [ ] aria-label for interactive elements
  - [ ] aria-expanded for expandable sections
  - [ ] aria-selected for selectable items
  - [ ] aria-controls for related elements
- [ ] Test with screen readers (VoiceOver, NVDA)
- [ ] Add support for reduced motion
- [ ] Verify color contrast ratios

### Testing
- [ ] Write unit tests for hooks and utilities
- [ ] Add component tests for filter UI
- [ ] Implement integration tests for component combinations
- [ ] Set up E2E tests for critical flows

### Documentation
- [ ] Document new component architecture
- [ ] Add inline code documentation
- [ ] Create usage examples for new components
- [ ] Update README with refactoring details

## Final Steps

- [ ] Perform thorough cross-browser testing
- [ ] Verify mobile functionality
- [ ] Check edge cases (empty results, error states, etc.)
- [ ] Get code review from team
- [ ] Compare A/B metrics between original and v2 implementations
- [ ] Deploy to staging environment for testing
- [ ] Monitor performance metrics after deployment
- [ ] Create transition plan for fully replacing original components
