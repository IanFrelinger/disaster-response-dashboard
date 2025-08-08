# Terrain3DViewer Component

A reusable, configurable, and extensible 3D terrain visualization component with Johnny Ive-inspired design.

## Overview

The `Terrain3DViewer` component provides a complete 3D terrain visualization experience with built-in controls, location presets, and interactive features. It's designed to be highly configurable and can be used across multiple pages in the project.

## Features

- **🎨 Johnny Ive Design**: Minimalist, elegant interface with smooth animations
- **⚙️ Fully Configurable**: Toggle any UI element on/off
- **📍 Location Presets**: Customizable location presets with categories
- **🏗️ Terrain Features**: Configurable feature lists with icons and descriptions
- **🎮 Interactive Controls**: Elevation control, location selection, and instructions
- **📱 Responsive**: Mobile-friendly with touch-optimized interactions
- **♿ Accessible**: WCAG AA compliant with keyboard navigation
- **🎯 Reusable**: Works in any container with flexible sizing
- **🔧 Extensible**: Custom components and callbacks for advanced use cases

## Basic Usage

```tsx
import { Terrain3DViewer } from './components/tacmap/Terrain3DViewer';

function MyPage() {
  return (
    <Terrain3DViewer
      title="My 3D Terrain View"
      subtitle="Custom terrain visualization"
      onTerrainLoad={() => console.log('Terrain loaded')}
    />
  );
}
```

## Advanced Usage

```tsx
import { Terrain3DViewer, LocationPreset, TerrainFeature } from './components/tacmap/Terrain3DViewer';

function CustomTerrainPage() {
  const customLocations: LocationPreset[] = [
    {
      id: 'my-location',
      name: 'My Location',
      coords: [-122.4194, 37.7749],
      description: 'Custom location description',
      category: 'custom'
    }
  ];

  const customFeatures: TerrainFeature[] = [
    {
      id: 'custom-feature',
      icon: '🏢',
      title: 'Custom Feature',
      description: 'Custom feature description',
      color: 'text-accent-blue',
      category: 'custom'
    }
  ];

  return (
    <Terrain3DViewer
      title="Custom Terrain View"
      subtitle="Highly customized visualization"
      locationPresets={customLocations}
      terrainFeatures={customFeatures}
      defaultLocationPresets={false}
      defaultFeatures={false}
      showHeader={true}
      showControls={true}
      showInfoPanel={true}
      onLocationChange={(coords, preset) => {
        console.log('Location changed:', preset.name);
      }}
      onElevationChange={(elevation) => {
        console.log('Elevation changed:', elevation);
      }}
    />
  );
}
```

## Props Reference

### Core Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'3D Terrain Visualization'` | Main title displayed in header |
| `subtitle` | `string` | `'Real-time heightmap rendering...'` | Subtitle displayed in header |
| `initialLocation` | `[number, number]` | `[-122.4194, 37.7749]` | Initial map center coordinates |
| `initialElevation` | `number` | `1.5` | Initial elevation multiplier |
| `initialZoom` | `number` | `12` | Initial zoom level |

### Location Presets

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `locationPresets` | `LocationPreset[]` | `DEFAULT_LOCATION_PRESETS` | Custom location presets |
| `defaultLocationPresets` | `boolean` | `true` | Use default location presets |

### Features and Instructions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `terrainFeatures` | `TerrainFeature[]` | `DEFAULT_TERRAIN_FEATURES` | Custom terrain features |
| `controlInstructions` | `ControlInstruction[]` | `DEFAULT_CONTROL_INSTRUCTIONS` | Custom control instructions |
| `defaultFeatures` | `boolean` | `true` | Use default terrain features |
| `defaultInstructions` | `boolean` | `true` | Use default control instructions |

### UI Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showHeader` | `boolean` | `true` | Show/hide the header |
| `showControls` | `boolean` | `true` | Show/hide the controls panel |
| `showInfoPanel` | `boolean` | `true` | Show/hide the info panel |
| `showLocationPresets` | `boolean` | `true` | Show/hide location presets |
| `showElevationControl` | `boolean` | `true` | Show/hide elevation control |
| `showFeaturesList` | `boolean` | `true` | Show/hide features list |
| `showInstructions` | `boolean` | `true` | Show/hide control instructions |

### Styling and Layout

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes for main container |
| `headerClassName` | `string` | `''` | Additional CSS classes for header |
| `controlsClassName` | `string` | `''` | Additional CSS classes for controls |
| `infoPanelClassName` | `string` | `''` | Additional CSS classes for info panel |
| `terrainClassName` | `string` | `''` | Additional CSS classes for terrain container |

### Callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onLocationChange` | `(coords: [number, number], preset: LocationPreset) => void` | Called when location changes |
| `onElevationChange` | `(elevation: number) => void` | Called when elevation changes |
| `onTerrainLoad` | `() => void` | Called when terrain finishes loading |
| `onReset` | `() => void` | Called when view is reset |

### Custom Components

| Prop | Type | Description |
|------|------|-------------|
| `customHeader` | `ReactNode` | Custom header component |
| `customControls` | `ReactNode` | Custom controls component |
| `customInfoPanel` | `ReactNode` | Custom info panel component |

### Advanced Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableAnimations` | `boolean` | `true` | Enable/disable animations |
| `enableHoverEffects` | `boolean` | `true` | Enable/disable hover effects |
| `enableKeyboardControls` | `boolean` | `true` | Enable/disable keyboard controls |
| `enableTouchControls` | `boolean` | `true` | Enable/disable touch controls |

### Accessibility

| Prop | Type | Description |
|------|------|-------------|
| `ariaLabel` | `string` | Custom ARIA label |
| `ariaDescription` | `string` | Custom ARIA description |

## Type Definitions

### LocationPreset

```tsx
interface LocationPreset {
  id: string;
  name: string;
  coords: [number, number];
  description: string;
  category?: string;
}
```

### TerrainFeature

```tsx
interface TerrainFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  category?: string;
}
```

### ControlInstruction

```tsx
interface ControlInstruction {
  id: string;
  text: string;
  category?: string;
}
```

## Usage Examples

### Minimal Configuration

```tsx
<Terrain3DViewer
  showControls={false}
  showInfoPanel={false}
  showHeader={false}
/>
```

### Custom Location Presets

```tsx
const myLocations: LocationPreset[] = [
  {
    id: 'home',
    name: 'Home',
    coords: [-122.4194, 37.7749],
    description: 'My home location',
    category: 'personal'
  }
];

<Terrain3DViewer
  locationPresets={myLocations}
  defaultLocationPresets={false}
/>
```

### Embedded in Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    <Terrain3DViewer
      showHeader={false}
      className="h-96"
      terrainClassName="h-full"
    />
  </div>
  <div className="lg:col-span-1">
    {/* Sidebar content */}
  </div>
</div>
```

### Custom Callbacks

```tsx
<Terrain3DViewer
  onLocationChange={(coords, preset) => {
    // Update external state
    setCurrentLocation(preset);
    // Send analytics
    analytics.track('location_changed', { location: preset.name });
  }}
  onElevationChange={(elevation) => {
    // Update external state
    setCurrentElevation(elevation);
    // Trigger external actions
    updateBuildingHeights(elevation);
  }}
  onTerrainLoad={() => {
    // Show loading complete
    setLoading(false);
    // Initialize additional features
    initializeCustomFeatures();
  }}
/>
```

## Best Practices

### 1. Performance Optimization

- Use `enableAnimations={false}` for embedded views in lists
- Disable unused UI elements to reduce render overhead
- Use `useCallback` for custom event handlers

### 2. Accessibility

- Always provide meaningful `ariaLabel` and `ariaDescription`
- Test keyboard navigation thoroughly
- Ensure sufficient color contrast for custom themes

### 3. Mobile Optimization

- Test touch interactions on various devices
- Consider disabling hover effects on mobile (`enableHoverEffects={false}`)
- Use appropriate touch targets for custom controls

### 4. Customization

- Extend the component through props rather than modifying the source
- Use custom components for complex UI requirements
- Leverage the callback system for external state management

### 5. Error Handling

- Implement error boundaries around the component
- Handle terrain loading failures gracefully
- Provide fallback content for unsupported browsers

## Examples Directory

See the `examples/` directory for complete usage examples:

- `MinimalTerrainViewer.tsx` - Minimal configuration
- `CustomTerrainViewer.tsx` - Custom location presets and features
- `EmbeddedTerrainViewer.tsx` - Embedded in larger layouts

## Migration from Terrain3DTest

The original `Terrain3DTest` component has been refactored to use `Terrain3DViewer`:

```tsx
// Old way (Terrain3DTest.tsx)
export const Terrain3DTest: React.FC = () => {
  // Complex component with hardcoded values
};

// New way (using Terrain3DViewer)
export const Terrain3DTest: React.FC = () => {
  return (
    <Terrain3DViewer
      title="3D Terrain Visualization"
      subtitle="Real-time heightmap rendering with building footprints and vegetation"
      onTerrainLoad={() => console.log('3D Terrain loaded')}
    />
  );
};
```

## Contributing

When extending the component:

1. Add new props to the `Terrain3DViewerProps` interface
2. Provide sensible defaults
3. Update the documentation
4. Add examples for new features
5. Ensure backward compatibility

## Dependencies

- React 18+
- Framer Motion (for animations)
- Lucide React (for icons)
- Johnny Ive design system CSS
