# LayerTogglePanel Component

A reusable, accessible layer toggle panel component for disaster response mapping applications. This component provides an intuitive interface for users to toggle map layers on and off with full keyboard navigation support.

## Features

- ✅ **Full Keyboard Navigation**: Tab, Space, Enter, and Arrow key support
- ✅ **Accessibility**: ARIA labels, screen reader support, and proper focus management
- ✅ **Design Token Compliance**: Uses iOS design system tokens for consistent styling
- ✅ **Icon Support**: Lucide React icons with customizable colors
- ✅ **Flexible Configuration**: Optional title, customizable layers, and callback handling
- ✅ **Touch Optimized**: Responsive design with proper touch targets
- ✅ **Dark Mode Support**: Automatic adaptation to system color schemes
- ✅ **High Contrast Support**: Enhanced visibility for accessibility

## Props

### LayerTogglePanelProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `layers` | `LayerToggle[]` | ✅ | - | Array of layer configurations |
| `onLayerToggle` | `(layerId: string, checked: boolean) => void` | ✅ | - | Callback when layers are toggled |
| `title` | `string` | ❌ | - | Optional title for the panel |
| `className` | `string` | ❌ | `''` | Additional CSS classes |

### LayerToggle

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier for the layer |
| `label` | `string` | ✅ | Human-readable layer name |
| `icon` | `'Mountain' \| 'Building2' \| 'AlertTriangle' \| 'Shield' \| 'MapPin'` | ✅ | Icon to display for the layer |
| `color` | `string` | ✅ | CSS color value for the icon |
| `checked` | `boolean` | ❌ | `false` | Initial checked state |

## Usage

### Basic Example

```tsx
import { LayerTogglePanel, LayerToggle } from './LayerTogglePanel';

const MyComponent = () => {
  const layers: LayerToggle[] = [
    { id: 'terrain', label: 'Terrain', icon: 'Mountain', color: 'var(--ios-brown)', checked: true },
    { id: 'buildings', label: 'Buildings', icon: 'Building2', color: 'var(--ios-purple)', checked: false },
    { id: 'hazards', label: 'Hazards', icon: 'AlertTriangle', color: 'var(--ios-red)', checked: true },
  ];

  const handleLayerToggle = (layerId: string, checked: boolean) => {
    console.log(`Layer ${layerId} toggled to ${checked}`);
    // Update your map state here
  };

  return (
    <LayerTogglePanel
      layers={layers}
      onLayerToggle={handleLayerToggle}
      title="Map Layers"
    />
  );
};
```

### Without Title

```tsx
<LayerTogglePanel
  layers={layers}
  onLayerToggle={handleLayerToggle}
/>
```

### Dynamic Layer Updates

```tsx
const [layers, setLayers] = useState<LayerToggle[]>([
  { id: 'terrain', label: 'Terrain', icon: 'Mountain', color: 'var(--ios-brown)', checked: true },
]);

const addLayer = () => {
  setLayers(prev => [...prev, {
    id: 'new-layer',
    label: 'New Layer',
    icon: 'Shield',
    color: 'var(--ios-green)',
    checked: false
  }]);
};

const toggleLayer = (layerId: string, checked: boolean) => {
  setLayers(prev => prev.map(layer =>
    layer.id === layerId ? { ...layer, checked } : layer
  ));
};
```

## Keyboard Navigation

The component supports comprehensive keyboard navigation:

- **Tab**: Navigate between layer toggles
- **Space/Enter**: Toggle the focused layer
- **Arrow Up/Down**: Navigate between layers
- **Focus Management**: Maintains focus during rapid interactions

## Accessibility Features

- **ARIA Labels**: Each checkbox has descriptive `aria-label`
- **Role Attributes**: Proper `role="checkbox"` and `aria-checked` states
- **Screen Reader Support**: Semantic HTML structure with proper labeling
- **Focus Indicators**: Clear visual focus indicators for keyboard users
- **Touch Targets**: Minimum 44px touch targets for mobile devices

## Styling

The component uses CSS custom properties for theming:

```css
.layer-toggle {
  --layer-color: var(--ios-brown); /* Set by component */
}
```

### Design Tokens Used

- **Spacing**: `--ios-spacing-xs`, `--ios-spacing-sm`, `--ios-spacing-md`, `--ios-spacing-lg`
- **Colors**: `--ios-blue`, `--ios-green`, `--ios-red`, `--ios-purple`, `--ios-brown`, `--ios-gray`
- **Typography**: `--ios-heading`, `--ios-caption`
- **Borders**: `--ios-border-radius-small`
- **Transitions**: `--ios-transition-fast`

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Accessibility**: Screen readers, keyboard navigation, high contrast modes

## Performance Considerations

- **Memoized Callbacks**: Uses `useCallback` for event handlers
- **Ref Management**: Efficient ref array management for focus control
- **Minimal Re-renders**: Only re-renders when necessary props change

## Testing

The component includes comprehensive test coverage:

- **Unit Tests**: 18 test cases covering all functionality
- **Accessibility Tests**: ARIA attributes, keyboard navigation, screen reader support
- **Edge Cases**: Empty arrays, missing props, error handling
- **Integration Tests**: E2E tests for map route integration

### Running Tests

```bash
# Run unit tests
npm run test src/components/LayerTogglePanel.test.tsx

# Run all tests
npm run test:unit
```

## Integration Examples

### With Mapbox GL JS

```tsx
const handleLayerToggle = (layerId: string, checked: boolean) => {
  if (checked) {
    map.addLayer(layerConfigs[layerId]);
  } else {
    map.removeLayer(layerConfigs[layerId]);
  }
};
```

### With React State Management

```tsx
const [activeLayers, setActiveLayers] = useState(new Set(['terrain', 'hazards']));

const handleLayerToggle = (layerId: string, checked: boolean) => {
  setActiveLayers(prev => {
    const newSet = new Set(prev);
    if (checked) {
      newSet.add(layerId);
    } else {
      newSet.delete(layerId);
    }
    return newSet;
  });
};
```

## Troubleshooting

### Common Issues

1. **Icons not displaying**: Ensure Lucide React is installed and icons are properly imported
2. **Styling issues**: Verify CSS custom properties are defined in your design system
3. **Keyboard navigation not working**: Check that no parent elements are preventing focus

### Debug Mode

Enable console logging to debug layer toggle events:

```tsx
const handleLayerToggle = (layerId: string, checked: boolean) => {
  console.log(`Layer toggle: ${layerId} -> ${checked}`);
  // Your logic here
};
```

## Contributing

When contributing to this component:

1. **Maintain Accessibility**: All changes must preserve keyboard navigation and screen reader support
2. **Follow Design Tokens**: Use existing design tokens for spacing, colors, and typography
3. **Add Tests**: New features require corresponding test coverage
4. **Update Documentation**: Keep this README current with any changes

## License

This component is part of the Disaster Response Dashboard project.
