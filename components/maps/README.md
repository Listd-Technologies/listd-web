# Maps Components

This directory contains enhanced map components built on the `@vis.gl/react-google-maps` library with significant stability improvements and better user experience.

## Key Features

- **Position Stability:** Maps maintain position across all interactions, mode changes, and component re-renders
- **Advanced Drawing Tools:** Smooth, flicker-free freehand polygon drawing with enhanced touch support
- **Comprehensive Boundary Visualization:** Clear visual feedback for search boundaries with center markers and bounding boxes
- **Optimized for All Devices:** Fully responsive with specific optimizations for both mobile and desktop
- **Complete Dark Mode Support:** Seamless theme integration with custom Google Maps styling
- **Modern Property Markers:** Interactive property markers with rich information cards
- **Performance Optimized:** Uses requestAnimationFrame and efficient rendering techniques for smooth interactions

## Main Components

### `PropertyMap`

The main map component that serves as the entry point for all map functionality:

```tsx
<PropertyMap
  properties={properties}
  onMarkerClick={handleMarkerClick}
  onDrawComplete={handleDrawComplete}
  isDrawingMode={isDrawingMode}
  toggleDrawingMode={() => setIsDrawingMode(!isDrawingMode)}
  onBoundaryChange={handleBoundaryChange}
  darkMode={isDarkMode}
/>
```

### `DrawingCanvas`

Provides freehand polygon drawing capabilities for geographic searches:

```tsx
<DrawingCanvas
  mapRef={mapRef}
  onDrawingFinish={handleDrawingFinish}
  onCancel={handleCancel}
/>
```

### `PropertyMarker`

Displays property information on the map with interactive info windows:

```tsx
<PropertyMarker
  property={property}
  position={{ lat: property.mapLocation.lat, lng: property.mapLocation.lng }}
  onMarkerClick={handleMarkerClick}
  selected={selectedPropertyId === property.id}
/>
```

## Utility Components

- **BoundaryVisualization:** Shows the active search boundary with visual indicators
- **DrawingInstructions:** Provides context-aware user guidance for drawing mode
- **CancelDrawingButton:** Allows users to exit drawing mode without applying changes
- **ClearBoundaryButton:** Enables users to remove an existing search boundary
- **DrawingModeIndicator:** Visual feedback about the current drawing state

## Theme Integration

The map components automatically integrate with your application's theme system:

### Automatic Theme Detection

```tsx
// The map will automatically detect theme changes from your ThemeProvider
<PropertyMap properties={properties} />
```

### Manual Theme Control

```tsx
// Explicitly control theme when needed
<PropertyMap
  properties={properties}
  darkMode={isDarkMode}
/>
```

## API Reference

### PropertyMap Props

| Prop | Type | Description |
|------|------|-------------|
| `properties` | `MapProperty[]` | Array of properties to display on the map |
| `onMarkerClick` | `(propertyId: string) => void` | Called when a property marker is clicked |
| `onBoundsChange` | `(bounds: google.maps.LatLngBounds \| null) => void` | Called when map bounds change |
| `onDrawComplete` | `(data: BoundaryData) => void` | Called when drawing is completed |
| `isDrawingMode` | `boolean` | Whether the map is in drawing mode |
| `toggleDrawingMode` | `() => void` | Function to toggle drawing mode on/off |
| `className` | `string` | Additional CSS class for the map container |
| `preserveView` | `boolean` | Preserve current view when re-rendering |
| `onBoundaryChange` | `(hasBoundary: boolean) => void` | Called when boundary status changes |
| `darkMode` | `boolean` | Explicitly set dark mode (overrides theme context) |
| `renderControls` | `object` | Custom control components |
| `initialBoundary` | `object` | Initial boundary configuration |

## Sample Usage

```tsx
import { PropertyMap, MapProperty } from '@/components/maps';
import { useState } from 'react';

export default function PropertyMapPage() {
  const [properties, setProperties] = useState<MapProperty[]>([/* ... */]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const handleMarkerClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
  };

  const handleDrawComplete = (data) => {
    console.log('Drawn boundary:', data);
    // Use boundary data for filtering properties
  };

  return (
    <div className="h-screen">
      <PropertyMap
        properties={properties}
        onMarkerClick={handleMarkerClick}
        onDrawComplete={handleDrawComplete}
        isDrawingMode={isDrawingMode}
        toggleDrawingMode={() => setIsDrawingMode(!isDrawingMode)}
      />
    </div>
  );
}
```
