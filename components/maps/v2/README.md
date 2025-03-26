# Maps Components v2

This directory contains enhanced versions of the map components with significant stability improvements and better user experience.

## Key Improvements

- **Rock-Solid Position Preservation:** Map maintains position across all interactions and mode changes.
- **Optimized Drawing Experience:** Smooth, flicker-free drawing with enhanced touch support.
- **Clean, Modular Architecture:** Well-organized code with logical sections and clear responsibilities.
- **Reduced Visual Glitches:** Eliminated position jumps and flickering during transitions.
- **Mobile-Optimized:** Fully responsive with device-specific optimizations for mobile and desktop.
- **Better Performance:** Efficient rendering with requestAnimationFrame for smooth animations.
- **Dark Mode Support:** Complete theme integration with Google Maps night styling.

## Components

### `PropertyMap`

The main map component that handles:

- Displaying the map with Google Maps integration
- Property markers with click interaction
- Boundary visualization with center marker and bounding box
- Position tracking with cross-component synchronization
- Dark mode with optimized colors and Google Maps styling

```tsx
<PropertyMap
  properties={properties}
  onMarkerClick={handleMarkerClick}
  onDrawComplete={handleDrawComplete}
  isDrawingMode={isDrawingMode}
  toggleDrawingMode={() => setIsDrawingMode(!isDrawingMode)}
  onBoundaryChange={handleBoundaryChange}
  darkMode={true} // Enable dark mode
/>
```

## Dark Mode Integration

The map component fully supports dark mode with custom styling for all UI elements and Google Maps tiles:

1. **Manual Toggle:** Pass the `darkMode` prop explicitly to control theme
2. **System Preference:** Automatic theme detection without any additional code
3. **Custom Themes:** Dark mode creates a cohesive experience with theme-adaptive colors

### Automatic Theme Detection

The map component automatically syncs with your app's theme without requiring any additional code:

```tsx
import { PropertyMap } from '@/components/maps/v2';

// The map will automatically detect theme changes from your ThemeProvider
export default function AutoThemeMap() {
  return (
    <div className="h-screen">
      <PropertyMap properties={properties} />
    </div>
  );
}
```

### Manual Theme Control

For cases where you need explicit control:

```tsx
import { PropertyMap } from '@/components/maps/v2';
import { useTheme } from 'next-themes';

export default function ThemeAwareMap() {
  // Get theme info from next-themes
  const { resolvedTheme } = useTheme();
  
  // Automatically apply dark mode based on system preference
  const isDarkMode = resolvedTheme === 'dark';
  
  return (
    <div className="h-screen">
      <PropertyMap
        properties={properties}
        darkMode={isDarkMode} // Explicit control overrides automatic detection
      />
    </div>
  );
}
```

The dark mode implementation includes:

- Custom Google Maps styling based on Night Mode palette
- Theme-adaptive UI elements (markers, polygons, buttons)
- Improved contrast ratios for better readability in dark environments
- Smooth transitions when theme changes
