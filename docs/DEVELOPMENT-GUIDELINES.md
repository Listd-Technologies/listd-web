# AI Rules for Listd Web Application

This document outlines the guidelines, best practices, and rules that AI assistants should follow when contributing to the Listd web application project. These rules ensure consistency, maintainability, and alignment with the project's architecture and design principles.

## General Guidelines

1. **Understand the Architecture**: Thoroughly analyze the existing codebase before making contributions. The application is built with Next.js 15 (App Router), React 19, and TypeScript.

2. **Focus on Frontend Only**: Remember that this project does not include API development within Next.js. The frontend integrates with an existing backend service.

3. **Follow the Project Structure**: Maintain the established directory structure when creating new files or modifying existing ones.

4. **Code Style**: Use Biome's formatting rules. If in doubt, format code using `pnpm format`.

## Project Structure

The project follows this general structure:

```
listd-web/
├── app/              # Next.js App Router pages and layouts
├── components/       # React components organized by type/feature
├── docs/             # Project documentation
├── hooks/            # Custom React hooks
├── lib/              # Utilities and stores
│   ├── stores/       # Zustand stores
│   └── utils/        # Utility functions
├── public/           # Static assets
├── schemas/          # Zod validation schemas
├── tests/            # Test files
└── types/            # TypeScript type definitions
```

## Component Development

1. **Use shadcn/ui Components**: Leverage the existing shadcn/ui components. Don't reinvent what's already available.

2. **Component Hierarchy**:
   - Create atomic UI components in `components/ui/`
   - Create layout components in `components/layout/`
   - Create form components in `components/forms/` (note: currently minimally used)
   - Feature-specific components are organized in their respective directories:
     - `components/listings/`: Legacy property listing components
     - `components/properties/`: Refactored property listing components (preferred)
       - `filters/`: Filter components
       - `layouts/`: Layout components
       - `grid/`: Grid and property card components
     - `components/maps/`: Map visualization components
     - `components/providers/`: Context providers
     - `components/homepage/`: Homepage-specific components
     - `components/valuation/`: Property valuation components

3. **Component Styling**:
   - Use Tailwind CSS for styling
   - Follow the established color scheme to align with the mobile app
   - Use the `cn` utility for conditional class names

4. **Animations**:
   - Use Framer Motion for animations and transitions
   - Keep animations subtle and purposeful
   - Ensure animations work well on all devices (responsive)

## State Management

1. **Zustand Stores**:
   - Use Zustand for all global and shared UI state management
   - Create store files in the `lib/stores/` directory
   - Keep stores focused and specific to certain features
   - Follow the established patterns in existing stores
   - Use TypeScript for type safety in store definitions
   - Leverage Zustand's middleware capabilities (devtools, persist, etc.)

2. **Zustand Best Practices**:
   - Use selective store subscriptions to prevent unnecessary re-renders
   - Create granular selectors that only access needed state
   - Implement actions within the store for state updates
   - Use middleware for side-effects like URL synchronization
   - Combine with React.memo for optimal performance
   - Prefer multiple small, focused stores over large monolithic ones

3. **React Query**:
   - Use TanStack React Query for all server state
   - Implement custom hooks in `hooks/api/` for API interactions
   - Follow proper caching and invalidation patterns
   - Use Zustand for UI state, React Query for server state

4. **Form State**:
   - Use React Hook Form with Zod validation
   - Implement form schemas in the `schemas/` directory

## API Integration

1. **API Version Strategy**:
   - The application supports multiple API versions (v1, v2)
   - Always use the adapter pattern when interacting with APIs
   - New features should use the latest API version (v2) when possible
   - Existing features may continue using v1 until migration is complete

2. **Adapter Pattern**:
   - Use the property adapter factory from `hooks/api/adapters/property-adapter-factory.ts`
   - Do not directly call API endpoints in components
   - All API interactions should go through appropriate adapter methods
   - When adapting API responses, follow the established patterns in existing adapters
   - Understand the difference between v1 and v2 property adapters

3. **API Hook Organization**:
   - Place API hooks in appropriate version directories (`hooks/api/v1/` or `hooks/api/v2/`)
   - Use the constants files in each version directory for endpoint URLs and query keys
   - Follow the hook patterns established in each version

4. **Backend Communication**:
   - Use Axios for HTTP requests
   - Implement API-related functions directly in the version-specific API hooks
   - Use React Query's mutation and query hooks

5. **Error Handling**:
   - Implement proper error handling for all API calls
   - Provide user-friendly error messages

## App Router Structure

1. **Page Organization**:
   - Follow Next.js App Router conventions
   - Create route folders in the `app/` directory
   - Use `page.tsx` for route components
   - Use `layout.tsx` for shared layouts
   - Use `loading.tsx` for loading states
   - Place server components directly in the app directory
   - Keep client components in the components directory and import them into pages

2. **Client vs Server Components**:
   - Understand the distinction between client and server components
   - Use "use client" directive only when necessary
   - Keep data fetching in server components when possible
   - Pass data to client components as props

## TypeScript Usage

1. **Type Definitions**:
   - Place shared types in the `types/` directory
   - Use proper typing for all variables, functions, and components
   - Avoid using `any` - use `unknown` if type is truly unknown
   - For store types, define them within the store file or in a separate types file

2. **Type Safety**:
   - Ensure all Props interfaces are properly defined
   - Use proper return types for functions and hooks
   - Leverage TypeScript's utility types for transformations

## Performance Considerations

1. **Optimizations**:
   - Use selective Zustand store subscriptions to prevent unnecessary re-renders
   - Apply React's memo, useMemo, and useCallback appropriately
   - Implement virtualization for long lists
   - Optimize images and assets
   - Use proper debouncing for input fields that trigger API calls

2. **Code Splitting**:
   - Utilize Next.js's built-in code splitting
   - Use dynamic imports for heavy components

## Feature-Specific Guidelines

### Property Listing Search
- Implement efficient filters with debounce techniques
- Use the property filters Zustand store for filter state
- Implement proper URL synchronization with the store
- Use React Query for caching search results

### Property Filters Architecture
The property filters follow a specific component architecture pattern for maintainability:

1. **Directory Structure**:
   ```
   components/properties/
   ├── filters/             # Filter components
   │   ├── index.tsx        # Main export file
   │   ├── filter-container.tsx # Reusable container
   │   ├── filter-item.tsx  # Generic wrapper
   │   └── [filter-type]/   # Each filter in its own directory
   │       ├── index.tsx    # Main component
   │       ├── use-[filter-type]-filter.ts  # Custom hook
   │       └── [filter-type]-filter-content.tsx # Content UI
   ├── layouts/            # Layout components
   └── grid/               # Property grid components
   ```

2. **Component Pattern**:
   - **Custom Hook**: Each filter has a dedicated hook (e.g., `usePriceFilter`) that:
     - Selectively accesses Zustand store state to prevent unnecessary re-renders
     - Provides actions to update state (with useCallback)
     - Returns formatted display text and utility functions
     - Handles filter-specific logic
   
   - **Content Component**: Pure presentational component that:
     - Receives all required data and callbacks as props
     - Displays the filter's UI elements
     - Handles user interactions by calling passed callbacks
   
   - **Main Component**: Connects the hook and content with a memoized component that:
     - Uses our standard FilterItem wrapper for consistent styling
     - Passes state and callbacks from the hook to the content component
     - Adds visual indicators for active filters

3. **Best Practices**:
   - Use selective store access with granular selectors
   - Memoize components with React.memo to prevent unnecessary re-renders
   - Organize state logic in hooks, UI in content components
   - Use consistent naming conventions across all filter components
   - Apply responsive design patterns

### Property Layout Components
The property pages use specialized layout components for different screen sizes and view modes:

1. **Directory Structure**:
   ```
   components/properties/
   ├── layouts/
   │   ├── index.tsx        # Export file
   │   ├── split-layout.tsx # Map + list side by side (desktop)
   │   ├── vertical-layout.tsx # List-only view (mobile/tablet)
   │   └── horizontal-layout.tsx # Map-only view (mobile/tablet)
   ```

2. **Responsive Approach**:
   - Use CSS-based responsive design instead of JavaScript window resize detection
   - Apply mobile-first approach with progressive enhancement for larger screens
   - Use Tailwind's built-in breakpoint system consistently
   - Hide/show components based on screen size using responsive utility classes:

   ```tsx
   {/* Desktop view (split layout) - hidden on mobile */}
   <div className="hidden xl:block h-full">
     <SplitLayout
       listSection={listSection}
       mapSection={mapSection}
     />
   </div>

   {/* Mobile view - shown only on screens < xl breakpoint */}
   <div className="block xl:hidden h-full">
     {mobileViewMode === "list" ? (
       <VerticalLayout>{listSection}</VerticalLayout>
     ) : (
       <HorizontalLayout>{mapSection}</HorizontalLayout>
     )}
   </div>
   ```

3. **Layout Constants**:
   - Define standard breakpoint values in `lib/constants/responsive.ts`
   - Use JavaScript constants for responsive logic ONLY when CSS isn't sufficient
   - Maintain consistency with Tailwind's default breakpoints

### Property Grid Components
The property listing grid uses responsive components that adapt to different screen sizes:

1. **Directory Structure**:
   ```
   components/properties/
   ├── grid/
   │   ├── index.tsx              # Export file
   │   ├── responsive-grid.tsx    # Responsive grid layout
   │   └── grid-skeleton.tsx      # Loading skeleton components
   ```

2. **Grid Design**:
   - Use CSS Grid with Tailwind's responsive modifiers
   - Adapt column count based on screen size
   - Handle loading states with skeleton components
   - Default to a mobile-first single column layout

   ```tsx
   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
     {items.map(item => <PropertyCard key={item.id} property={item} />)}
   </div>
   ```

3. **Loading States**:
   - Provide skeleton loaders that match the shape of actual content
   - Match the responsive grid layout in loading state
   - Use appropriate animations for loading states

### Property Valuation
- Create reusable chart components
- Implement proper loading states for valuation data

### User Onboarding
- Follow established authentication flow with Clerk
- Create step-by-step forms with proper validation

### Messaging System
- Implement real-time updates where necessary
- Create efficient message thread components

### Listing Management
- Implement proper form validation for listing creation
- Create reusable upload components for images and documents

## Documentation

1. **Code Comments**:
   - Add comments for complex logic
   - Document component props with JSDoc

2. **README Updates**:
   - Update README.md when adding major features
   - Document any changes to the build process

3. **Documentation Files**:
   - Keep documentation files in the `docs/` directory
   - Update documentation when implementation details change

## Testing Considerations

1. **Component Testing**:
   - Ensure components are testable
   - Consider test coverage when designing components

2. **Accessibility**:
   - Ensure all components meet WCAG standards
   - Use proper aria attributes

## Implementation Process

1. **Feature Planning**:
   - Break down features into manageable components
   - Start with data structures and type definitions

2. **Implementation Order**:
   - Create API hooks and adapters first
   - Develop Zustand stores for UI state
   - Develop UI components
   - Implement business logic
   - Add animations and polish

3. **Final Checks**:
   - Ensure code is properly formatted with Biome
   - Review for type safety
   - Verify mobile responsiveness

## Debugging Guidelines

1. **Browser Tools**:
   - Always use the MCP browser tools when debugging application issues
   - Utilize browser console logs, network errors, and screenshots to diagnose problems
   - Run accessibility, performance, and SEO audits to identify potential improvements
   - Use Redux DevTools to inspect Zustand store state (enabled with middleware)

2. **Troubleshooting Process**:
   - Start with browser console logs to identify JavaScript errors
   - Check network requests for API communication issues
   - Inspect Zustand store state using Redux DevTools
   - Take screenshots to document UI inconsistencies
   - Run appropriate audits based on the issue type (performance, accessibility, etc.)
   - Use debugger mode for complex interactive problems